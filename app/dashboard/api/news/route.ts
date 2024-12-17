import { NextResponse } from 'next/server'
const finnhub = require('finnhub');

// Configure Finnhub client with timeout
const apiClient = new finnhub.ApiClient();
apiClient.timeout = 10000; // 10 seconds timeout
const api_key = apiClient.authentications['api_key'];
api_key.apiKey = process.env.FINHUB_API_KEY
const finnhubClient = new finnhub.DefaultApi(apiClient)

interface FinnhubError {
  status: number;
  message: string;
}

interface CompanyNews {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'company'
  const tickers = searchParams.get('tickers')
  const page = parseInt(searchParams.get('page') || '1')
  
  if (type === 'company' && !tickers) {
    return NextResponse.json({ error: 'Tickers are required for company news' }, { status: 400 })
  }

  try {
    let newsData: CompanyNews[]

    if (type === 'market') {
      newsData = await new Promise<CompanyNews[]>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('API request timed out'))
        }, 10000)

        finnhubClient.marketNews("general", {}, (error: FinnhubError | null, data: CompanyNews[], response: any) => {
          clearTimeout(timeoutId)
          if (error) reject(error)
          else resolve(data)
        })
      })
    } else {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - 30)

      const from = startDate.toISOString().split('T')[0]
      const to = endDate.toISOString().split('T')[0]

      newsData = await new Promise<CompanyNews[]>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('API request timed out'))
        }, 10000)

        finnhubClient.companyNews(tickers, from, to, (error: FinnhubError | null, data: CompanyNews[], response: any) => {
          clearTimeout(timeoutId)
          if (error) reject(error)
          else resolve(data)
        })
      })
    }

    const pageSize = 5
    const start = (page - 1) * pageSize
    const paginatedNews = Array.isArray(newsData) 
      ? newsData.slice(start, start + pageSize)
      : []

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
