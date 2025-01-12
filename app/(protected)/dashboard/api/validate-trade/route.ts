import { NextResponse } from 'next/server'
import yahooFinance from 'yahoo-finance2'

yahooFinance.setGlobalConfig({
  queue: {
    concurrency: 5,
    timeout: 10000
  }
})

export async function POST(req: Request) {
  try {
    const { symbol, date } = await req.json()
    
    if (!symbol || !date) {
      return NextResponse.json(
        { error: 'Symbol and date are required' },
        { status: 400 }
      )
    }

    const tradeDate = new Date(date)
    // Get the day's data
    const queryOptions = {
      period1: tradeDate,
      period2: new Date(tradeDate.getTime() + 24 * 60 * 60 * 1000), // next day
      interval: '1d' as const
    }
    
    const data = await yahooFinance.historical(symbol, queryOptions)
    
    if (!data || data.length === 0) {
      return NextResponse.json({
        dayData: null,
        error: 'No trading data available for this date'
      })
    }

    const dayData = data[0]
    
    return NextResponse.json({
      dayData: {
        low: dayData.low,
        high: dayData.high,
        open: dayData.open,
        close: dayData.close,
        volume: dayData.volume
      }
    })
    
  } catch (error) {
    console.error('Trade validation error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch price data', dayData: null },
      { status: 500 }
    )
  }
}
