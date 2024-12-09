'use server';
import { createClient } from '@/utils/supabase/server';

export const saveChat = async (userId: string, conversationId: string, conversationSummary: string) => {
    const supabase = await createClient();
    
    // Insert new conversation entry
    const { error: dbError } = await supabase
        .from('conversation_history')
        .insert([
            {
                user_id: userId,
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

export async function getChatHistory(limit?: number) {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return [];
      }
  
      let query = supabase
        .from('conversation_history')
        .select('conversation_id, conversation_summary, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
        
      // Apply limit if specified
      if (limit && limit > 0) {
        query = query.limit(limit);
      }
  
      const { data, error } = await query;
  
      if (error) throw error;
      return data || [];
      
    } catch (error) {
      console.error('Failed to get all chats from database:', error);
      throw error;
    }
}

export async function updateChatTimestamp(conversationId: string, userId: string) {
  try {
    const supabase = await createClient();


    const { error } = await supabase
      .from('conversation_history')
      .update({ updated_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to update chat timestamp:', error);
    throw error;
  }
}
