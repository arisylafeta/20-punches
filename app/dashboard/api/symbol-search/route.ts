import { NextResponse } from 'next/server'
const finnhub = require('finnhub');

const apiClient = new finnhub.ApiClient();
apiClient.timeout = 10000;
const api_key = apiClient.authentications['api_key'];
api_key.apiKey = process.env.FINHUB_API_KEY
const finnhubClient = new finnhub.DefaultApi(apiClient)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
  }

  try {
    const data = await new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('API request timed out'))
      }, 10000)

      finnhubClient.symbolSearch(query, (error: any, data: any, response: any) => {
        clearTimeout(timeoutId)
        if (error) reject(error)
        else resolve(data)
      })
    })

    // Return only the top 5 results
    return NextResponse.json(data.result.slice(0, 5))
  } catch (error) {
    console.error('Error searching symbols:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to search symbols' },
      { status: 500 }
    )
  }
}
