import { type Message } from 'ai';
import { HumanMessage } from '@langchain/core/messages';
import { getUser, getSubscription } from '@/lib/db/users';
import { buffetGraph } from '../agent/graph';
import { LangChainAdapter } from 'ai';
import { getChatById, saveChat, updateChatTimestamp } from '@/lib/db/chats';
import { generateSummaryFromUserMessage } from '../../actions';
import { createClient } from '@/utils/supabase/server';
import { ModelId } from '@/utils/models';
import { checkAndIncrementMessageCount, FREE_MONTHLY_MESSAGE_LIMIT } from '@/lib/db/message-count';

export const maxDuration = 60;

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