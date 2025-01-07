import { cookies } from 'next/headers'
import { generateUUID } from '@/lib/utils'
import { NextResponse } from 'next/server'

const LAST_CHAT_COOKIE = 'last_chat_id'
const CHAT_EXPIRY_HOURS = 3

export async function GET() {
  const cookieStore = cookies()
  const lastChatId = cookieStore.get(LAST_CHAT_COOKIE)

  if (lastChatId?.value) {
    // Refresh existing chat cookie
    const response = NextResponse.json({ chatId: lastChatId.value })
    response.cookies.set(LAST_CHAT_COOKIE, lastChatId.value, {
      expires: new Date(Date.now() + CHAT_EXPIRY_HOURS * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })
    return response
  }

  // Create new chat
  const newChatId = generateUUID()
  const response = NextResponse.json({ chatId: newChatId })
  response.cookies.set(LAST_CHAT_COOKIE, newChatId, {
    expires: new Date(Date.now() + CHAT_EXPIRY_HOURS * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })
  return response
}
