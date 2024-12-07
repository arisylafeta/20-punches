import {
    type Message,
    StreamData,
    convertToCoreMessages,
    streamObject,
    streamText,
  } from 'ai';
  import { z } from 'zod';
  import {
    generateUUID,
    getMostRecentUserMessage,
    sanitizeResponseMessages,
  } from '@/lib/utils';
  import { HumanMessage } from '@langchain/core/messages';
  //import { generateTitleFromUserMessage } from '../../actions';
  import { getUser } from '@/lib/db/user';
  import { buffetGraph } from '../agent/graph';
  import { LangChainAdapter } from 'ai';
  import { convertLangChainMessageToVercelMessage, convertVercelMessageToLangChainMessage } from '@/utils/helper';
  
  export const maxDuration = 1000;

  
  export async function POST(request: Request) {
    const {
      id,
      messages,
    }: { id: string; messages: Array<Message>; } =
      await request.json();
  
    const user = await getUser();
  
    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }
  
    const coreMessages = convertToCoreMessages(messages);
    const userMessage = getMostRecentUserMessage(coreMessages);
  
    if (!userMessage) {
      return new Response('No user message found', { status: 400 });
    }
  

    // TODO: Implement chat history retrieval from chat id. DON'T TOUCH THIS!
    //const chat = await getChatById({ id });
  
    // if (!chat) {
    //   const title = await generateTitleFromUserMessage({ message: userMessage });
    //   await saveChat({ id, userId: session.user.id, title });
  
    const config = {
      configurable: {
        thread_id: id,
      },
      version: "v1" as const,  // Type assertion to make it a literal type
      encoding: "text/event-stream" as const,  // Type assertion to make it a literal type
    };

    const input = messages.findLast(message => message.role === "user")?.content || "";
    const message = {messages: [new HumanMessage({ content: input })]};
    
    const stream = await buffetGraph.streamEvents(message, config);

    const transformStream = new ReadableStream({
        async start(controller) {
            for await (const { event, data, tags = [] } of stream) {
                if (event === 'on_chat_model_stream') {
                    if (!!data.chunk.content && tags.includes("llm_inference")) {
                        const aiMessage = convertLangChainMessageToVercelMessage(data.chunk);
                        controller.enqueue(aiMessage);
                    }
                }
            }
            controller.close();
        }
    });
    return LangChainAdapter.toDataStreamResponse(transformStream);
  }
  