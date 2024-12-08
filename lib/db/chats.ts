'use server';

import { redirect } from 'next/navigation';
import { generateUUID } from '@/lib/utils';
import { createClient } from '@/utils/supabase/server';

export const createNewChat = async () => {
    const conversationId = generateUUID();
    
    saveNewChat(conversationId).catch(error => {
        console.error('Error saving chat:', error);
    });

    redirect(`/chat/${conversationId}`);
}

export const saveNewChat = async (conversationId: string) => {
    const supabase = await createClient();
    
    // Get and verify the user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
        throw new Error('Unauthorized');
    }

    // Insert new conversation entry
    const { error: dbError } = await supabase
        .from('conversation_history')
        .insert([
            {
                user_id: user.id,
                conversation_id: conversationId,
                conversation_summary: 'New conversation' // Initial summary
            }
        ]);

    if (dbError) {
        console.error('Database error:', dbError);
    }
}