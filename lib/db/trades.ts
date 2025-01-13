import { createClient } from "@/utils/supabase/client"
import { TradeFormValues } from '@/utils/types'

export async function createTrade(trade: TradeFormValues) {
  const supabase = createClient()
  
  try {
    // Get the current user's ID
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      console.error('Auth error:', userError)
      throw userError
    }
    
    if (!user) {
      console.error('No user found')
      throw new Error('Not authenticated')
    }

    const tradeData = {
      user_id: user.id,
      symbol: trade.symbol,
      type: trade.type,
      shares: trade.shares,
      price_per_share: trade.pricePerShare,
      transaction_date: trade.transactionDate.toISOString(),
    }

    const { data, error } = await supabase
      .from('trades')
      .insert([tradeData])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      throw error
    }
    
    if (!data) {
      console.error('No data returned from insert')
      throw new Error('Trade creation failed - no data returned')
    }
    
    return data
  } catch (error) {
    console.error('Unexpected error in createTrade:', error)
    throw error
  }
}

export async function getUserTrades() {
  const supabase = createClient()
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('Auth error in getUserTrades:', userError)
      throw userError
    }

    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user?.id)
      .order('transaction_date', { ascending: false })

    if (error) {
      console.error('Error fetching trades:', error)
      throw error
    }
    return data || []
  } catch (error) {
    console.error('Unexpected error in getUserTrades:', error)
    throw error
  }
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
  const response = await fetch('/dashboard/api/yfinance-historical', {
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

  // Get real-time quotes for today's prices
  const todayStr = new Date().toISOString().split('T')[0]
  let latestQuotes: Record<string, number> = {}
  
  // Fetch latest quotes if we have any dates from today
  if (portfolioTimeSeries.some(t => new Date(t.timestamp).toISOString().split('T')[0] === todayStr)) {
    const quoteResponse = await fetch('/dashboard/api/finnhub-latest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ symbols })
    })
    
    if (quoteResponse.ok) {
      const { data } = await quoteResponse.json()
      // Create a map of symbol to current price
      Object.entries(data).forEach(([symbol, quote]: [string, any]) => {
        latestQuotes[symbol] = quote.c // current price
      })
    }
  }

  // Get all unique dates from historical data and trades
  const allDates = new Set<string>()
  
  // Add dates from trades
  portfolioTimeSeries.forEach(timepoint => {
    allDates.add(new Date(timepoint.timestamp).toISOString().split('T')[0])
  })
  
  // Add dates from historical data
  Object.values(historicalDataBySymbol).forEach(symbolData => {
    if (!symbolData?.data) return
    symbolData.data.forEach((d: YFinanceHistoricalData) => {
      allDates.add(new Date(d.date).toISOString().split('T')[0])
    })
  })

  // Sort dates chronologically
  const sortedDates = Array.from(allDates).sort()

  // For each date, calculate portfolio value
  const result = sortedDates.map(date => {
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
      let currentPrice: number | undefined

      // If it's today, use real-time quote
      if (date === todayStr && latestQuotes[symbol]) {
        currentPrice = latestQuotes[symbol]
      } else if (historicalData?.length > 0) {
        const priceData = historicalData.find((d: YFinanceHistoricalData) => 
          new Date(d.date).toISOString().split('T')[0] === date
        )
        currentPrice = priceData?.close
      }

      if (!currentPrice) {
        return
      }

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
    let data = {
      timestamp: date,
      totalValue,
      positions
    }
    return data
  })

  // Log the final output
  console.log('Portfolio History Output:', {
    totalDates: sortedDates.length,
    firstDate: sortedDates[0],
    lastDate: sortedDates[sortedDates.length - 1],
    sampleData: result, // Show first 3 days of data
    totalDataPoints: result.length
  })

  return result
}

// Helper function to find shares held at a specific date
function findSharesAtDate(
  timeSeries: PortfolioTimepoint[], 
  targetDate: string, 
  symbol: string
): PortfolioTimepoint | undefined {
  // Convert dates to YYYY-MM-DD format for comparison
  const targetDateStr = new Date(targetDate).toISOString().split('T')[0]
  
  // Find the last timepoint before or equal to the target date
  const relevantTimepoints = timeSeries
    .filter(tp => {
      const tpDateStr = new Date(tp.timestamp).toISOString().split('T')[0]
      return tpDateStr <= targetDateStr
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return relevantTimepoints[0]
}

//Get unique trade symbols 
export async function getUniqueTradeSymbols() {
  try {
    const trades = await getUserTrades()
    
    const uniqueSymbols = Array.from(new Set(trades.map(trade => trade.symbol)))
    
    const sortedSymbols = uniqueSymbols.sort()
    
    
    return sortedSymbols
  } catch (error) {
    console.error('Error in getUniqueTradeSymbols:', error)
    throw error
  }
}

export async function getPosition(symbol: string): Promise<{ shares: number; value: number; currentPrice: number }> {
  const supabase = createClient();
  
  // Get the current user's ID
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) {
    console.error('Auth error in getPosition:', userError);
    throw userError;
  }
  if (!user) {
    console.error('No user found in getPosition');
    throw new Error('Not authenticated');
  }

  // Get all trades for this symbol
  const { data: trades, error } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
    .eq('symbol', symbol);

  if (error) {
    console.error('Database error in getPosition:', error);
    throw error;
  }
  
  if (!trades) return { shares: 0, value: 0, currentPrice: 0 };

  // Calculate net position
  const netShares = trades.reduce((total, trade) => {
    return total + (trade.type === 'buy' ? trade.shares : -trade.shares);
  }, 0);

  // If no shares held, return early
  if (netShares === 0) return { shares: 0, value: 0, currentPrice: 0 };

  // Fetch latest price data
  const response = await fetch('/dashboard/api/finnhub-latest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      symbols: [symbol]
    }),
  });

  if (!response.ok) {
    console.error('Failed to fetch price data:', await response.text());
    throw new Error('Failed to fetch current price data');
  }

  const { data: results } = await response.json();
  
  // Get the latest price from the data for this symbol
  const symbolData = results[symbol];
  if (!symbolData || !symbolData.data) {
    console.error('No price data available for symbol:', symbol);
    throw new Error('No price data available');
  }

  if (symbolData.error) {
    console.error('Error in price data:', symbolData.error);
    throw new Error(`Price data error: ${symbolData.error}`);
  }
  
  const latestPrice = symbolData.data.price;

  const position = {
    shares: netShares,
    value: netShares * latestPrice,
    currentPrice: latestPrice
  };
  return position;
}