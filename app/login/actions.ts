'use server'
import { Provider } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getURL } from '@/utils/helpers'
import { createClient } from '@/utils/supabase/server'

type ActionResult = 
  | { error: string; success?: never }
  | { error?: never; success: string }
  | undefined;

export async function emailLogin(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()

  // TODO: add validation with zod
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: 'Could not authenticate user' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }
  
  const { error } = await supabase.auth.signUp(data)

  if (error) {
    console.error('Signup error:', error);
    return { error: error.message }
  }

  return { success: 'Check your email for the confirmation link' }
}

export async function signOut(): Promise<ActionResult> {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()
    
    if (error) {
        console.error('Error signing out:', error)
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    return redirect('/login')
}

export async function oAuthSignIn(provider: Provider): Promise<ActionResult | Response> {
    if (!provider) {
        return { error: 'No provider selected' }
    }

    const supabase = await createClient();
    const redirectUrl = getURL("/auth/callback")
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: redirectUrl,
        }
    })

    if (error) {
        return { error: 'Could not authenticate user' }
    }

    return redirect(data.url)
}