import { type Message } from 'ai';
import { HumanMessage } from '@langchain/core/messages';
import { getUser, getSubscription } from '@/lib/db/users';
import { buffetGraph } from '../agent/graph';
import { LangChainAdapter } from 'ai';
import { getChatById, saveChat, updateChatTimestamp } from '@/lib/db/chats';
import { generateSummaryFromUserMessage } from '../../actions';
import { createClient } from '@/utils/supabase/server';

export const maxDuration = 60;
const FREE_DAILY_MESSAGE_LIMIT = 10;

async function checkAndIncrementMessageCount(supabase: any, userId: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];
  
  console.log('Checking message count for date:', today);
  
  // First check if there's an existing count for today
  const { data: existing, error: fetchError } = await supabase
    .from('daily_message_counts')
    .select('count')
    .eq('user_id', userId)
    .eq('date', today)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found" error
    console.error('Error fetching message count:', fetchError);
    return false;
  }

  console.log('Existing count record:', existing);

  if (existing) {
    // If count exists, increment it
    const newCount = existing.count + 1;
    console.log('Incrementing count from', existing.count, 'to', newCount);
    
    if (newCount > FREE_DAILY_MESSAGE_LIMIT) {
      console.log('Message limit exceeded:', newCount, '>', FREE_DAILY_MESSAGE_LIMIT);
      return false;
    }

    const { error: updateError } = await supabase
      .from('daily_message_counts')
      .update({ count: newCount })
      .eq('user_id', userId)
      .eq('date', today);

    if (updateError) {
      console.error('Error updating message count:', updateError);
      return false;
    }

    console.log('Successfully updated count to:', newCount);
    return true;
  } else {
    console.log('No existing count found, creating new record');
    // If no count exists for today, create new record with count 1
    const { error: insertError } = await supabase
      .from('daily_message_counts')
      .insert({ user_id: userId, date: today, count: 1 });

    if (insertError) {
      console.error('Error inserting message count:', insertError);
      return false;
    }

    console.log('Successfully created new count record with count: 1');
    return true;
  }
}

export async function POST(request: Request) {
  const {
    id,
    messages,
  }: { id: string; messages: Array<Message>; } = await request.json();

  const supabase = await createClient();
  const user = await getUser(supabase);
  
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Check if user is premium
  const subscription = await getSubscription(supabase);
  const isPremium = subscription?.prices?.products?.name?.toLowerCase().includes('premium') ?? false;

  // If not premium, check message count
  if (!isPremium) {
    const canSendMessage = await checkAndIncrementMessageCount(supabase, user.id);
    if (!canSendMessage) {
      return new Response(
        JSON.stringify({
          error: 'Daily message limit reached',
          message: 'You have reached your daily limit of 10 messages. Upgrade to Premium for unlimited messages!'
        }),
        { 
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }

  const input = messages.findLast(message => message.role === "user")?.content || "";
  const message = { messages: [new HumanMessage({ content: input })] };

  const chat = await getChatById({ id });

  if (!chat) {
    const summary = await generateSummaryFromUserMessage({ message: input });
    saveChat(user.id, id, summary);
  }else{
    updateChatTimestamp(id, user.id );
  }

  try {
    const streamingEvents = await buffetGraph.streamEvents(
      message,
      {
        version: "v2" as const,
        configurable: {
          thread_id: id,
        }
      }
    );

    // Create a transform stream that will process the events
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of streamingEvents) {
            //TODO: Add a check for different metadata types and condiitonally render them.
            // maybe even include dropdowns and things like that. we will continue this.
            if (event.event === 'on_chat_model_stream' && 
                event.metadata?.langgraph_node === 'BuffetAgent') {
              const chunk = event.data?.chunk;
              
              if (chunk?.content) {
                controller.enqueue(chunk);
              }
            }
          }
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      }
    });

    return LangChainAdapter.toDataStreamResponse(stream);
  } catch (error) {
    console.error('Error in chat route:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}