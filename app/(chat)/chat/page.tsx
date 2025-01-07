'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export default async function ChatPage() {
  const headersList = headers();
  const host = headersList.get('host');
  const proto = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  
  const response = await fetch(`${proto}://${host}/api/chat-session`, { 
    method: 'GET',
    cache: 'no-store'
  });
  const { chatId } = await response.json();
  redirect(`/chat/${chatId}`);
}