import { NextResponse } from 'next/server'
import { getMarketNews, getCompanyNews, paginateNews } from '@/utils/finhub'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'company'
  const tickers = searchParams.get('tickers')
  const page = parseInt(searchParams.get('page') || '1')
  
  if (type === 'company' && !tickers) {
    return NextResponse.json({ error: 'Tickers are required for company news' }, { status: 400 })
  }

  try {
    const newsData = type === 'market' 
      ? await getMarketNews()
      : await getCompanyNews(tickers!)

    const paginatedNews = paginateNews(newsData, page)
    return NextResponse.json(paginatedNews)
  } catch (error) {
    console.error('Error fetching news:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch news'
    return NextResponse.json(
      { error: errorMessage },
      { status: error instanceof Error && error.message.includes('timeout') ? 504 : 500 }
    )
  }
}
