import { useEffect, useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { getChatHistory } from '@/lib/db/chats';
import { Button } from '@/components/ui/button';
import { History } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ChatHistoryItem } from '@/utils/types';

export function ChatHistory() {
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchChatHistory() {
      const data = await getChatHistory();
      setChatHistory(data);
    }
    fetchChatHistory();
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <History className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Choose from Previous Conversations</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" style={{ maxHeight: '200px', overflowY: 'auto' }}>
        {chatHistory.map((chat) => (
          <DropdownMenuItem
            key={chat.conversation_id}
            onClick={() => router.push(`/chat/${chat.conversation_id}`)}
          >
            {chat.conversation_summary}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
