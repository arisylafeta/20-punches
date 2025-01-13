'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export const FREE_MONTHLY_MESSAGE_LIMIT = 30;

export async function checkAndIncrementMessageCount(
  supabase: any, 
  userId: string,
): Promise<{ success: boolean; count: number }> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // First, delete old records
  const { error: deleteError } = await supabase
    .from('monthly_message_counts')
    .delete()
    .eq('user_id', userId)
    .lt('created_at', thirtyDaysAgo.toISOString());

  if (deleteError) {
    console.error('Error deleting old records:', deleteError);
    // Continue execution as this is not critical
  }

  // Get count of messages in the last 30 days
  const { count: monthlyCount, error: countError } = await supabase
    .from('monthly_message_counts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', thirtyDaysAgo.toISOString());

  if (countError) {
    console.error('Error fetching monthly count:', countError);
    return { success: false, count: 0 };
  }

  const currentCount = monthlyCount || 0;
  
  // Check if adding a new message would exceed the limit
  if (currentCount >= FREE_MONTHLY_MESSAGE_LIMIT) {
    return { 
      success: false, 
      count: currentCount 
    };
  }

  // Only insert if we're under the limit
  const { error: insertError } = await supabase
    .from('monthly_message_counts')
    .insert({ 
      user_id: userId,
      created_at: now.toISOString(),
    });

  if (insertError) {
    console.error('Error inserting message:', insertError);
    return { success: false, count: currentCount };
  }

  return { 
    success: true, 
    count: currentCount + 1
  };
}

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
