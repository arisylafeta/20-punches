'use server';

import { cookies } from 'next/headers';

const LAST_CHAT_COOKIE = 'last_chat_id';
const CHAT_EXPIRY_HOURS = 3;

export async function getLastChatId(): Promise<string | undefined> {
  const cookieStore = cookies();
  const lastChatId = cookieStore.get(LAST_CHAT_COOKIE);
  return lastChatId?.value;
}

export async function setLastChatId(chatId: string): Promise<void> {
  const cookieStore = cookies();
  cookieStore.set(LAST_CHAT_COOKIE, chatId, {
    expires: new Date(Date.now() + CHAT_EXPIRY_HOURS * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

export async function clearLastChatId(): Promise<void> {
  const cookieStore = cookies();
  cookieStore.delete(LAST_CHAT_COOKIE);
}
