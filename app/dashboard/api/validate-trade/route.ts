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
    const { symbol, price, date } = await req.json()
    
    if (!symbol || !price || !date) {
      return NextResponse.json(
        { error: 'Symbol, price, and date are required' },
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
    
    if (data.length === 0) {
      return NextResponse.json({
        valid: false,
        error: 'No trading data available for this date'
      })
    }

    const dayData = data[0]
    const priceNum = Number(price)
    
    // Check if price is within day's range
    const isValid = priceNum >= dayData.low && priceNum <= dayData.high
    
    return NextResponse.json({
      valid: isValid,
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
      { error: 'Failed to validate trade' },
      { status: 500 }
    )
  }
}
