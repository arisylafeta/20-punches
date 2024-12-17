import { createClient } from "@/utils/supabase/client"
import { TradeFormValues } from '@/utils/types'

export async function createTrade(trade: TradeFormValues) {
  const supabase = createClient()
  console.log('Creating trade with values:', trade)
  
  // Get the current user's ID
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  console.log('Auth response:', { user, userError })
  
  if (!user) throw new Error('Not authenticated')

  const tradeData = {
    user_id: user.id,
    symbol: trade.symbol,
    type: trade.type,
    shares: trade.shares,
    price_per_share: trade.pricePerShare,
    transaction_date: trade.transactionDate.toISOString(),
  }
  console.log('Inserting trade data:', tradeData)

  const { data, error } = await supabase
    .from('trades')
    .insert([tradeData])
    .select()
    .single()

  if (error) {
    console.error('Database error:', error)
    throw error
  }
  
  console.log('Trade created successfully:', data)
  return data
}

export async function getUserTrades() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .order('transaction_date', { ascending: false })

  if (error) throw error
  return data
}



export async function getTradeErrors() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('trade_errors')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

interface PortfolioTimepoint {
  timestamp: string;
  positions: {
    [symbol: string]: {
      shares: number;
      avgPrice: number;
    }
  }
}

interface PortfolioValueTimepoint {
  timestamp: string;
  totalValue: number;
  positions: {
    [symbol: string]: {
      shares: number;
      avgPrice: number;
      currentPrice: number;
      value: number;
      profitLoss: number;
      profitLossPct: number;
    }
  }
}

interface YFinanceHistoricalData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjClose: number;
}

interface HistoricalDataResponse {
  [symbol: string]: {
    data: YFinanceHistoricalData[];
    error: string | null;
  };
}

export async function getPortfolioTimeSeries(): Promise<PortfolioTimepoint[]> {
  const supabase = createClient()
  
  // Get all trades ordered by date
  const { data: trades, error: tradesError } = await supabase
    .from('trades')
    .select('*')
    .order('transaction_date', { ascending: true })
  
  if (tradesError) throw tradesError
  if (!trades) return []
  
  // Build portfolio state at each trade timestamp
  const portfolioTimeSeries: PortfolioTimepoint[] = []
  let currentPositions: { [symbol: string]: { shares: number, avgPrice: number } } = {}
  
  trades.forEach(trade => {
    const { symbol, type, shares, price_per_share, transaction_date } = trade
    
    // Initialize position if it doesn't exist
    if (!currentPositions[symbol]) {
      currentPositions[symbol] = { shares: 0, avgPrice: 0 }
    }
    
    // Update position based on trade type
    if (type === 'buy') {
      const position = currentPositions[symbol]
      const totalShares = position.shares + shares
      const totalCost = (position.shares * position.avgPrice) + (shares * price_per_share)
      currentPositions[symbol] = {
        shares: totalShares,
        avgPrice: totalCost / totalShares
      }
    } else { // sell
      const position = currentPositions[symbol]
      currentPositions[symbol] = {
        shares: position.shares - shares,
        avgPrice: position.avgPrice
      }
    }
    
    // Create a deep copy of current positions for this timepoint
    const positionsSnapshot = Object.entries(currentPositions)
      .filter(([_, position]) => position.shares > 0) // Only include positions with shares
      .reduce((acc, [sym, pos]) => ({
        ...acc,
        [sym]: { ...pos }
      }), {})
    
    // Add this snapshot to our time series
    portfolioTimeSeries.push({
      timestamp: transaction_date,
      positions: positionsSnapshot
    })
  })
  
  return portfolioTimeSeries
}

// Helper function to get unique symbols from portfolio history
export function getUniqueSymbols(portfolioTimeSeries: PortfolioTimepoint[]): string[] {
  const symbolsSet = new Set<string>()
  
  portfolioTimeSeries.forEach(timepoint => {
    Object.keys(timepoint.positions).forEach(symbol => {
      symbolsSet.add(symbol)
    })
  })
  
  return Array.from(symbolsSet)
}

export async function calculatePortfolioHistory(
  startDate?: Date,
  endDate: Date = new Date(),
  timeRange: "1M" | "6M" | "1Y" = "1M"
): Promise<PortfolioValueTimepoint[]> {
  // Get portfolio positions over time
  const portfolioTimeSeries = await getPortfolioTimeSeries()
  if (portfolioTimeSeries.length === 0) return []

  // Get unique symbols and their date ranges
  const symbols = getUniqueSymbols(portfolioTimeSeries)
  if (symbols.length === 0) return []

  // Calculate start date based on timeRange if not provided
  const today = new Date()
  let effectiveStartDate = startDate || new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
  
  if (!startDate) {
    switch (timeRange) {
      case "1M":
        effectiveStartDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
        break
      case "6M":
        effectiveStartDate = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate())
        break
      case "1Y":
        effectiveStartDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())
        break
    }
  }

  // If calculated start date is before first trade, use first trade date
  const firstTradeDate = new Date(portfolioTimeSeries[0].timestamp)
  effectiveStartDate = new Date(Math.max(firstTradeDate.getTime(), effectiveStartDate.getTime()))

  // Fetch historical data through the API route
  const response = await fetch('/dashboard/api/yfinance', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      symbols,
      startDate: effectiveStartDate.toISOString(),
      endDate: endDate.toISOString(),
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to fetch historical data')
  }

  const { data: historicalDataBySymbol } = await response.json() as { data: HistoricalDataResponse }

  // Get all unique dates from historical data
  const allDates = new Set<string>()
  Object.values(historicalDataBySymbol).forEach(symbolData => {
    if (!symbolData?.data) return
    symbolData.data.forEach((d: YFinanceHistoricalData) => {
      allDates.add(new Date(d.date).toISOString().split('T')[0])
    })
  })

  // Sort dates chronologically
  const sortedDates = Array.from(allDates).sort()

  // For each date, calculate portfolio value
  return sortedDates.map(date => {
    const positions: PortfolioValueTimepoint['positions'] = {}
    let totalValue = 0

    // For each symbol, find shares held on this date and multiply by price
    symbols.forEach(symbol => {
      // Find number of shares held on this date
      const relevantTimepoint = findSharesAtDate(portfolioTimeSeries, date, symbol)
      const shares = relevantTimepoint?.positions[symbol]?.shares || 0
      const avgPrice = relevantTimepoint?.positions[symbol]?.avgPrice || 0

      // Find price data for this date
      const historicalData = historicalDataBySymbol[symbol]?.data
      if (!historicalData || historicalData.length === 0) return

      const priceData = historicalData.find((d: YFinanceHistoricalData) => 
        new Date(d.date).toISOString().split('T')[0] === date
      )

      if (!priceData) return

      const currentPrice = priceData.close
      const value = shares * currentPrice
      const profitLoss = value - (shares * avgPrice)
      const profitLossPct = shares > 0 ? ((currentPrice - avgPrice) / avgPrice) * 100 : 0

      if (shares > 0) {
        positions[symbol] = {
          shares,
          avgPrice,
          currentPrice,
          value,
          profitLoss,
          profitLossPct
        }
        totalValue += value
      }
    })

    return {
      timestamp: date,
      totalValue,
      positions
    }
  })
}

// Helper function to find shares held at a specific date
function findSharesAtDate(
  timeSeries: PortfolioTimepoint[], 
  targetDate: string, 
  symbol: string
): PortfolioTimepoint | undefined {
  // Convert all dates to YYYY-MM-DD format for comparison
  const target = new Date(targetDate)
  
  // Find the last timepoint before or equal to the target date
  return timeSeries
    .filter(tp => new Date(tp.timestamp) <= target)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
}

export async function getUniqueTradeSymbols() {
  const trades = await getUserTrades()
  const uniqueSymbols = Array.from(new Set(trades.map(trade => trade.symbol)))
  return uniqueSymbols.sort()
}

export async function checkPortfolioLimit(symbol: string): Promise<{
  allowed: boolean;
  currentCount: number;
  hasPosition: boolean;
}> {
  const supabase = createClient()
  
  // Check if we already have a position in this symbol
  const { data: existingPosition } = await supabase
    .from('positions')
    .select('symbol')
    .eq('symbol', symbol.toUpperCase())
    .gt('shares', 0)
    .single()

  // If we have a position, we're allowed to trade it
  if (existingPosition) {
    return { allowed: true, currentCount: 0, hasPosition: true }
  }

  // Count unique assets with positive shares
  const { count } = await supabase
    .from('positions')
    .select('symbol', { count: 'exact' })
    .gt('shares', 0)

  const currentCount = count || 0
  return {
    allowed: currentCount < 20,
    currentCount,
    hasPosition: false
  }
}