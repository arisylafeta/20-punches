import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getURL } from '@/utils/helpers'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const baseUrl = getURL() // This will handle dev/prod environments
      return NextResponse.redirect(`${baseUrl}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${getURL('/login')}?message=Could not login provider`)
}