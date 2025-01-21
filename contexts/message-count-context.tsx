'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { FREE_MONTHLY_MESSAGE_LIMIT } from '@/lib/db/message-count';

export { FREE_MONTHLY_MESSAGE_LIMIT };

type MessageCountContextType = {
  messageCount: number | null;
  refreshCount: () => Promise<void>;
};

const MessageCountContext = createContext<MessageCountContextType | undefined>(undefined);

export function MessageCountProvider({ children }: { children: React.ReactNode }) {
  const [messageCount, setMessageCount] = useState<number | null>(null);
  const supabase = createClient();

  const refreshCount = async () => {
    try {
      const response = await fetch('/api/message-count');
      if (response.ok) {
        const data = await response.json();
        setMessageCount(data.count);
      }
    } catch (error) {
      console.error('Failed to fetch message count:', error);
    }
  };

  useEffect(() => {
    refreshCount();
  }, []);

  return (
    <MessageCountContext.Provider value={{ messageCount, refreshCount }}>
      {children}
    </MessageCountContext.Provider>
  );
}

export function useMessageCount() {
  const context = useContext(MessageCountContext);
  if (context === undefined) {
    throw new Error('useMessageCount must be used within a MessageCountProvider');
  }
  return context;
}
