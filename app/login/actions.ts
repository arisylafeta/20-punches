'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function emailLogin(formData: FormData) {
  const supabase = await createClient()

  // TODO: add validation with zod
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?message=Could not authenticate user')
  }

  revalidatePath('/', 'layout')
  redirect('/chat') // change this to dashboard once built.
}

export async function signup(formData: FormData) {
  console.log('Starting signup process...');
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }
  
  console.log('Attempting signup with email:', data.email);
  const { error, data: signUpData } = await supabase.auth.signUp(data)

  if (error) {
    console.error('Signup error:', error);
    redirect('/login?message=' + encodeURIComponent(error.message))
  }

  console.log('Signup successful:', signUpData);
  revalidatePath('/', 'layout')
  redirect('/login?message=Check your email for the confirmation link')
}