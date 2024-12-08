'use server';

import { redirect } from 'next/navigation';
import { generateUUID } from '@/lib/utils';
import { createClient } from '@/utils/supabase/server';


export const createNewChat = async () => {
    const conversationId = generateUUID();

    redirect(`/chat/${conversationId}`);
}

export const saveChat = async (id: string, conversationId: string, conversationSummary: string) => {
    const supabase = await createClient();
    
    // Insert new conversation entry
    const { error: dbError } = await supabase
        .from('conversation_history')
        .insert([
            {
                user_id: id,
                conversation_id: conversationId,
                conversation_summary: conversationSummary 
            }
        ]);

    if (dbError) {
        console.error('Database error:', dbError);
    }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('conversation_history')
      .select()
      .eq('conversation_id', id)
      .single();

    return data || undefined;
  } catch (error) {
    console.error('Failed to get chat by id from database:', error);
    throw error;
  }
}