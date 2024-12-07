import { type Message } from 'ai';
import { HumanMessage } from '@langchain/core/messages';
import { getUser } from '@/lib/db/user';
import { buffetGraph } from '../agent/graph';
import { LangChainAdapter } from 'ai';
import { writeFileSync, appendFileSync } from 'fs';
import { join } from 'path';

export const maxDuration = 1000;

let chunkCounter = 0;

const logFullChunk = (chunk: any) => {
  const logPath = join(process.cwd(), 'event-structure.txt');
  const timestamp = new Date().toISOString();
  
  const logEntry = `\n=== FULL CHUNK #${chunkCounter} at ${timestamp} ===\n${JSON.stringify(chunk, null, 2)}\n`;
  
  try {
    appendFileSync(logPath, logEntry);
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
};

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
            chunkCounter++;
            if (chunkCounter % 100 === 0) {
              logFullChunk(event);
            }
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

    // Use LangChainAdapter without experimental_StreamData
    return LangChainAdapter.toDataStreamResponse(stream);
  } catch (error) {
    console.error('Error in chat route:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}