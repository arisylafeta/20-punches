import { NextResponse } from 'next/server'
import { getQuotes } from '@/utils/finhub'

export async function POST(req: Request) {
  try {
    const { symbols } = await req.json()
    
    if (!Array.isArray(symbols) || symbols.length === 0) {
      return NextResponse.json(
        { error: 'Symbols array is required' },
        { status: 400 }
      )
    }

    try {
      const data = await getQuotes(symbols)

      return NextResponse.json({
        success: true,
        data
      })

    } catch (error) {
      console.error('Error fetching quotes:', error)
      return NextResponse.json(
        { error: 'Failed to fetch quotes' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error processing request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
