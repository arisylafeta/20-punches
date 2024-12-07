import { type Message } from 'ai';
import { HumanMessage } from '@langchain/core/messages';
import { getUser } from '@/lib/db/user';
import { buffetGraph } from '../agent/graph';
import { LangChainAdapter } from 'ai';

export const maxDuration = 1000;

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
            // Send raw events to see what we're getting
           // console.log('Raw event:', JSON.stringify(event, null, 2));
            
            if (event.event === 'on_chat_model_stream') {
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

    // Use LangChainAdapter without experimental_StreamData
    return LangChainAdapter.toDataStreamResponse(stream);
  } catch (error) {
    console.error('Error in chat route:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}