const finnhub = require('finnhub');

// Configure Finnhub client with timeout
const apiClient = new finnhub.ApiClient();
apiClient.timeout = 10000; // 10 seconds timeout
const api_key = apiClient.authentications['api_key'];
api_key.apiKey = process.env.FINHUB_API_KEY
const finnhubClient = new finnhub.DefaultApi(apiClient)

export interface FinnhubError {
  status: number;
  message: string;
}

export interface CompanyNews {
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

export interface Quote {
  price: number;
  time: Date;
}

export interface QuoteResponse {
  data: Quote | null;
  error: string | null;
}

interface FinnhubQuote {
  c: number;    // Current price
  h: number;    // High price of the day
  l: number;    // Low price of the day
  o: number;    // Open price of the day
  pc: number;   // Previous close price
  t: number;    // Timestamp
}

export async function getMarketNews(): Promise<CompanyNews[]> {
  return new Promise<CompanyNews[]>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('API request timed out'))
    }, 10000)

    finnhubClient.marketNews("general", {}, (error: FinnhubError | null, data: CompanyNews[], response: any) => {
      clearTimeout(timeoutId)
      if (error) reject(error)
      else resolve(data)
    })
  })
}

export async function getCompanyNews(tickers: string, days: number = 30): Promise<CompanyNews[]> {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - days)

  const from = startDate.toISOString().split('T')[0]
  const to = endDate.toISOString().split('T')[0]

  return new Promise<CompanyNews[]>((resolve, reject) => {
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

export function paginateNews(newsData: CompanyNews[], page: number, pageSize: number = 5): CompanyNews[] {
  const start = (page - 1) * pageSize
  return Array.isArray(newsData) ? newsData.slice(start, start + pageSize) : []
}

export async function getQuotes(symbols: string[]): Promise<Record<string, QuoteResponse>> {
  const results = await Promise.all(
    symbols.map(async (symbol) => {
      return new Promise<[string, QuoteResponse]>((resolve) => {
        finnhubClient.quote(symbol, (error: any, data: FinnhubQuote) => {
          if (error) {
            console.error(`Error fetching quote for ${symbol}:`, error)
            resolve([symbol, {
              data: null,
              error: error.message || 'Failed to fetch quote'
            }])
          } else {
            resolve([symbol, {
              data: {
                price: data.c,
                time: new Date(data.t * 1000)
              },
              error: null
            }])
          }
        })
      })
    })
  )

  return Object.fromEntries(results)
}