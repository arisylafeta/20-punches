'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { cookies } from 'next/headers';

export default async function ChatPage() {
  const cookieStore = cookies();
  const lastChatId = cookieStore.get('last_chat_id');
  
  // If we have a valid chat ID in cookies, use it directly
  if (lastChatId?.value) {
    redirect(`/chat/${lastChatId.value}`);
    return;
  }

  // Otherwise, create a new chat session
  const headersList = headers();
  const host = headersList.get('host');
  const proto = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  
  const response = await fetch(`${proto}://${host}/api/chat-session`, { 
    method: 'GET',
    cache: 'force-cache'
  });
  const { chatId } = await response.json();
  redirect(`/chat/${chatId}`);
}