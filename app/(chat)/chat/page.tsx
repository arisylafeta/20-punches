'use server';

import { redirect } from 'next/navigation';
import { getChatHistory } from '@/lib/db/chats';
import { generateUUID } from '@/lib/utils';

export default async function ChatPage() {
  const chatHistory = await getChatHistory(1);
  
  // Immediately redirect to latest chat if exists
  if (chatHistory?.[0]?.conversation_id) {
    redirect(`/chat/${chatHistory[0].conversation_id}`);
  }
  
  const id = generateUUID();
  // Otherwise create new chat
  redirect(`/chat/${id}`);
}

//Possible Improvement: If we create new chats on every sidebar click. We remove this page completely.