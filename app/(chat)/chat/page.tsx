'use server';

import { redirect } from 'next/navigation';
import { generateUUID } from '@/lib/utils';
import { getLastChatId, setLastChatId } from '@/lib/cookies';

export default async function ChatPage() {
  // Try to get the last chat ID from cookie
  const lastChatId = await getLastChatId();
  
  if (lastChatId) {
    // If cookie exists, refresh its expiry and use it
    await setLastChatId(lastChatId);
    redirect(`/chat/${lastChatId}`);
  }
  
  // Create new chat if no cookie or expired
  const newChatId = generateUUID();
  await setLastChatId(newChatId);
  redirect(`/chat/${newChatId}`);
}