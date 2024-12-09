import Chat from '@/components/chats/chat';
import { getPreviousCheckpoint } from '@/lib/db/checkpoints';

interface PageProps { 
  params: { 
    id: string; 
  } 
}

/**
 * Chat page component that displays the chat interface with previous messages.
 * This is a server component that fetches the chat history before rendering.
 */
export default async function Page({ params }: PageProps) {
  const messages = await getPreviousCheckpoint(params.id) || [];
  return <Chat id={params.id} initialMessages={messages} />;
}
