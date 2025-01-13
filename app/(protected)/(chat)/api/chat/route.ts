import { type Message } from 'ai';
import { HumanMessage } from '@langchain/core/messages';
import { getUser, getSubscription } from '@/lib/db/users';
import { buffetGraph } from '../agent/graph';
import { LangChainAdapter } from 'ai';
import { getChatById, saveChat, updateChatTimestamp } from '@/lib/db/chats';
import { generateSummaryFromUserMessage } from '../../actions';
import { createClient } from '@/utils/supabase/server';
import { ModelId } from '@/utils/models';

export const maxDuration = 60;
const FREE_MONTHLY_MESSAGE_LIMIT = 30;

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

export async function POST(request: Request) {
  const {
    id,
    messages,
    modelId = 'base' // Default to base model if not specified
  }: { 
    id: string; 
    messages: Array<Message>;
    modelId?: ModelId;
  } = await request.json();

  const supabase = await createClient();
  const user = await getUser(supabase);
  
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Check if user is premium
  const subscription = await getSubscription(supabase);
  const isPremium = subscription?.prices?.products?.name?.toLowerCase().includes('premium') ?? false;

  // If not premium and trying to use premium model, return error
  if (!isPremium && modelId !== 'base') {
    return new Response(
      JSON.stringify({
        error: 'Premium model not available',
        message: 'Please upgrade to Premium to use advanced models!'
      }),
      { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // If not premium, check message count
  if (!isPremium) {
    const { success, count } = await checkAndIncrementMessageCount(supabase, user.id);
    if (!success) {
      return new Response(
        JSON.stringify({
          error: 'Monthly limit reached',
          message: `You've reached your monthly limit of ${FREE_MONTHLY_MESSAGE_LIMIT} messages. You've sent ${count} messages this month. Upgrade to Premium for unlimited messages!`
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
  } else {
    updateChatTimestamp(id, user.id);
  }

  try {
    
    // Update buffetGraph to use the selected model
    const streamingEvents = await buffetGraph.streamEvents(
      message,
      {
        version: "v2" as const,
        configurable: {
          thread_id: id,
          model: modelId // Pass the selected model to the graph
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