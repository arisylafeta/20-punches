import { type EmailOtpType, AuthError } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getMarketNews, getCompanyNews } from '@/utils/finhub'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/chat'

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      try {
        // Fetch initial market and company news data
        const marketNews = await getMarketNews()
        const defaultStocks = ['AAPL', 'GOOGL', 'MSFT'] // Example default stocks
        const companyNewsPromises = defaultStocks.map(ticker => getCompanyNews(ticker))
        const companyNews = await Promise.all(companyNewsPromises)

        // Store the news data in your database or state management system here
        // This is just an example - implement according to your needs
        
        // redirect user to specified redirect URL or root of app
        redirect(next)
      } catch (error) {
        console.error('Error fetching initial news data:', error)
        // Continue with redirect even if news fetch fails
        redirect(next)
      }
    }
  }

  // redirect the user to an error page with some instructions
  redirect('/login?message=Could not verify OTP')
}