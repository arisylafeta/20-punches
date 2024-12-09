'use client';

import { Button } from '@/components/ui/button';
import { BetterTooltip } from '@/components/ui/tooltip';
import { PlusIcon } from './icons';
import { usePathname, useRouter } from 'next/navigation';
import { ChatHistory } from './chats/chat-history';
import { generateUUID } from '@/lib/utils';
import { SidebarToggle } from './sidebar-toggle';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();  

  const createNewChat = async () => {
    const chatId = generateUUID();
    router.push(`/chat/${chatId}`);
  };

  return (
    <header className="flex sticky top-0 bg-background p-4 items-center px-2 md:px-2 gap-2 border-b border-gray-200 dark:border-white/20">
      <SidebarToggle/>
      { pathname.startsWith('/chat/') && (
        <>
          <BetterTooltip content="New Chat">
          <Button
            variant="outline"
            className="p-4 ml-auto"
            onClick={createNewChat}
          >
            <PlusIcon />
            <span>New Chat</span>
          </Button>
        </BetterTooltip>
        <ChatHistory/>
        </>
      )}
      { pathname === '/' && (
        <>
          <BetterTooltip content="New Chart">
            <Button
              variant="outline"
              className="p-4 ml-auto"
              onClick={createNewChat}
            >
              <PlusIcon />
              <span>New Chart</span>
            </Button>
          </BetterTooltip>
        </>
      )}
    </header>
  );
}
