'use server';

import { redirect } from 'next/navigation';
import { getChatHistory, createNewChat } from '@/lib/db/chats';

export default async function ChatPage() {
  const chatHistory = await getChatHistory(1);
  
  // Immediately redirect to latest chat if exists
  if (chatHistory?.[0]?.conversation_id) {
    redirect(`/chat/${chatHistory[0].conversation_id}`);
  }
  
  // Otherwise create new chat
  redirect(`/chat/${await createNewChat()}`);
}
