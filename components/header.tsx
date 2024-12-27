'use client';

import { Button } from '@/components/ui/button';
import { BetterTooltip } from '@/components/ui/tooltip';
import { PlusIcon } from './icons';
import { usePathname, useRouter } from 'next/navigation';
import { ChatHistory } from './chats/chat-history';
import { ModelSelector } from './ModelSelector';
import { generateUUID } from '@/lib/utils';
import { SidebarToggle } from './sidebar-toggle';
import { useModel } from '@/contexts/model-context';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { selectedModel, setSelectedModel } = useModel();

  const createNewChat = async () => {
    const chatId = generateUUID();
    router.push(`/chat/${chatId}`);
  };

  // Don't render anything on the home page
  if (pathname === '/') {
    return null;
  }

  return (
    <header className="flex sticky top-0 bg-background p-4 items-center px-2 md:px-2 gap-2 border-b border-gray-200 dark:border-white/20 z-50">
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
          <ModelSelector 
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />
          <ChatHistory/>
        </>
      )}
    </header>
  );
}
