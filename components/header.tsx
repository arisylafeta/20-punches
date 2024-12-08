'use client';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { Button } from '@/components/ui/button';
import { BetterTooltip } from '@/components/ui/tooltip';
import { PlusIcon } from './icons';
import { usePathname } from 'next/navigation';
import { ChatHistory } from './chat-history';
import { createNewChat } from '@/lib/db/chats';

export function Header() {
  const pathname = usePathname();

  return (
    <header className="flex sticky top-0 bg-background p-4 items-center px-2 md:px-2 gap-2">
      <SidebarToggle/>
      { pathname.startsWith('/chat/') && (
        <>
          <BetterTooltip content="New Chat">
          <Button
            variant="outline"
            className="p-4 ml-auto"
            onClick={() => {
              createNewChat()
            }}
          >
            <PlusIcon />
            <span>New Chat</span>
          </Button>
        </BetterTooltip>
        <ChatHistory/>
        </>
      )}
    </header>
  );
}
