import { NextResponse } from 'next/server'
import yahooFinance from 'yahoo-finance2'

// Suppress historical data notices
yahooFinance.setGlobalConfig({
  queue: {
    concurrency: 5,
    timeout: 10000
  }
})

export async function POST(req: Request) {
  try {
    const { symbols, startDate, endDate } = await req.json()
    
    if (!Array.isArray(symbols) || symbols.length === 0) {
      return NextResponse.json(
        { error: 'Symbols array is required' },
        { status: 400 }
      )
    }

    // Convert date strings to Date objects
    const period1 = new Date(startDate)
    const period2 = new Date(endDate)
    
    // Check if we're requesting future dates
    const now = new Date()
    if (period1 > now || period2 > now) {
      return NextResponse.json({
        success: true,
        data: symbols.reduce((acc, symbol) => {
          acc[symbol] = { 
            data: [], 
            error: 'Cannot fetch data for future dates' 
          }
          return acc
        }, {} as Record<string, any>)
      })
    }

    // Add one day to endDate to ensure we get the data we want
    const queryEnd = new Date(period2)
    queryEnd.setDate(queryEnd.getDate() + 1)

    // Fetch historical data for all symbols concurrently
    const chartDataPromises = symbols.map(async (symbol) => {
      try {
        const queryOptions = {
          period1,
          period2: queryEnd,
          interval: '1d' as const
        }
        const result = await yahooFinance.chart(symbol, queryOptions)
        
        // Transform the data to match the historical format
        const data = result.quotes.map(quote => ({
          date: new Date(quote.date),
          open: quote.open,
          high: quote.high,
          low: quote.low,
          close: quote.close,
          volume: quote.volume,
          adjClose: quote.adjclose
        }))
        
        return { symbol, data, error: null }
      } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error)
        return { 
          symbol, 
          data: [], 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      }
    })

    const results = await Promise.all(chartDataPromises)
    
    // Convert array of results to object keyed by symbol
    const data = results.reduce((acc, { symbol, data, error }) => {
      acc[symbol] = { data, error }
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Error processing request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
