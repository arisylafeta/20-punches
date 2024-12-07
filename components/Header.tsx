'use client';
import { useRouter } from 'next/navigation';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { Button } from '@/components/ui/button';
import { BetterTooltip } from '@/components/ui/tooltip';
import { PlusIcon } from './icons';
import { usePathname } from 'next/navigation';
import { ChatHistory } from './chat-history';

export function Header() {
  const router = useRouter();
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
              //TODO: Implement create new chat.
              //createNewChat()
              router.refresh();
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
