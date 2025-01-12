import { NextResponse } from 'next/server'
import yahooFinance from 'yahoo-finance2'

// Suppress historical data notices
yahooFinance.setGlobalConfig({
  queue: {
    concurrency: 5, // number of concurrent requests
    timeout: 10000 // timeout in ms
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
    const period1 = startDate ? new Date(startDate) : new Date('2020-01-01') // default to a reasonable start date
    const period2 = endDate ? new Date(endDate) : new Date()

    // Fetch historical data for all symbols concurrently
    const historicalDataPromises = symbols.map(async (symbol) => {
      try {
        const queryOptions = {
          period1,
          period2,
          interval: '1d' as const
        }
        const data = await yahooFinance.historical(symbol, queryOptions)
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

    const results = await Promise.all(historicalDataPromises)
    
    return NextResponse.json({
      success: true,
      data: results.reduce((acc, { symbol, data, error }) => {
        acc[symbol] = { data, error }
        return acc
      }, {} as Record<string, { data: any[], error: string | null }>)
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
