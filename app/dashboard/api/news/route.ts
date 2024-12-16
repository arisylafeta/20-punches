import { NextResponse } from 'next/server'
const finnhub = require('finnhub');

const api_key = finnhub.ApiClient.instance.authentications['api_key'];
api_key.apiKey = "ctg896hr01qn78n3a9k0ctg896hr01qn78n3a9kg"
const finnhubClient = new finnhub.DefaultApi()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tickers = searchParams.get('tickers')
  const page = parseInt(searchParams.get('page') || '1')
  
  if (!tickers) {
    return NextResponse.json({ error: 'Tickers are required' }, { status: 400 })
  }

  if (!process.env.FINHUB_API_KEY) {
    console.error('FINHUB_API_KEY is not set')
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  console.log("FINHUB_API_KEY", process.env.FINHUB_API_KEY)
  try {
    // Calculate date range (last 30 days)
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - 30)

    // Format dates as YYYY-MM-DD
    const from = startDate.toISOString().split('T')[0]
    const to = endDate.toISOString().split('T')[0]

    console.log(`Fetching news for ticker: ${tickers}, from: ${from}, to: ${to}`)

    // Wrap the Finnhub callback-based API in a Promise
    const getCompanyNews = () => new Promise((resolve, reject) => {
      finnhubClient.companyNews(tickers, from, to, (error, data, response) => {
        if (error) reject(error)
        else resolve(data)
      })
    })

    const newsData = await getCompanyNews()
    
    // Implement simple pagination (10 items per page)
    const pageSize = 10
    const start = (page - 1) * pageSize
    const paginatedNews = Array.isArray(newsData) 
      ? newsData.slice(start, start + pageSize)
      : []

    console.log(`Received ${paginatedNews.length} news items for page ${page}`)
    return NextResponse.json(paginatedNews)
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 })
  }
}
