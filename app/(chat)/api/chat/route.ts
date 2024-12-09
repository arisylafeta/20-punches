import { type Message } from 'ai';
import { HumanMessage } from '@langchain/core/messages';
import { getUser } from '@/lib/db/users';
import { buffetGraph } from '../agent/graph';
import { LangChainAdapter } from 'ai';
import { getChatById, saveChat, updateChatTimestamp } from '@/lib/db/chats';
import { generateSummaryFromUserMessage } from '../../actions';

export const maxDuration = 60;

export async function POST(request: Request) {
  const {
    id,
    messages,
  }: { id: string; messages: Array<Message>; } = await request.json();

  const user = await getUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
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