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

export async function getUserPositions() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('positions')
    .select('*')
    .order('symbol')

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
  endDate: Date = new Date()
): Promise<PortfolioValueTimepoint[]> {
  // Get portfolio positions over time
  const portfolioTimeSeries = await getPortfolioTimeSeries()
  if (portfolioTimeSeries.length === 0) return []

  // Get unique symbols and their date ranges
  const symbols = getUniqueSymbols(portfolioTimeSeries)
  if (symbols.length === 0) return []

  // If no start date provided, use the first trade date
  const firstTradeDate = new Date(portfolioTimeSeries[0].timestamp)
  const effectiveStartDate = startDate || firstTradeDate

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

  // Calculate portfolio value at each timepoint
  return portfolioTimeSeries.map(timepoint => {
    const positions: PortfolioValueTimepoint['positions'] = {}
    let totalValue = 0

    // Calculate value for each position
    Object.entries(timepoint.positions).forEach(([symbol, position]) => {
      const historicalData = historicalDataBySymbol[symbol]?.data
      if (!historicalData || historicalData.length === 0) return

      // Find the closest historical price data point
      const timepointDate = new Date(timepoint.timestamp)
      const priceData = historicalData.find((d: YFinanceHistoricalData) => 
        new Date(d.date).getTime() === timepointDate.getTime()
      ) || historicalData.find((d: YFinanceHistoricalData) => 
        new Date(d.date).getTime() < timepointDate.getTime()
      ) // fallback to the nearest available date

      if (!priceData) return

      const currentPrice = priceData.close
      const value = position.shares * currentPrice
      const profitLoss = value - (position.shares * position.avgPrice)
      const profitLossPct = ((currentPrice - position.avgPrice) / position.avgPrice) * 100

      positions[symbol] = {
        ...position,
        currentPrice,
        value,
        profitLoss,
        profitLossPct
      }

      totalValue += value
    })

    return {
      timestamp: timepoint.timestamp,
      totalValue,
      positions
    }
  })
}