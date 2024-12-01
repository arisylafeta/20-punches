"use server";

import { createStreamableValue } from "ai/rsc";
import { buffetGraph } from './agent/graph';
import { CallbackHandlerMethods } from "@langchain/core/callbacks/base";
import { HumanMessage } from "@langchain/core/messages";


const config = { 
  configurable: { 
    thread_id: "buffet-conversation" 
  }
};

export async function runAgent(input: string) {
  const stream = createStreamableValue();

  (async () => {
    try {
      // Format input as HumanMessage and create initial state
      const inputs = {
        messages: [new HumanMessage(input)]
      };

      // Stream the graph execution
      for await (const state of await buffetGraph.stream(inputs, {
        ...config,
        streamMode: "values",
        callbacks: [{
          handleLLMEnd: async (output: any) => {
            // Stream step updates
            stream.update(JSON.parse(JSON.stringify({
              event: "llm",
              data: output
            }, null, 2)));
          },
          handleChainEnd: async (output: any) => {
            stream.update(JSON.parse(JSON.stringify({
              event: "chain",
              data: output
            }, null, 2)));
          },
          handleToolEnd: async (output: any) => {
            stream.update(JSON.parse(JSON.stringify({
              event: "tool",
              data: output
            }, null, 2)));
          }
        } satisfies Partial<CallbackHandlerMethods>]
      })) {
        // Update stream with the latest message if available
        const messages = state.messages;
        if (messages && messages.length > 0) {
          const lastMessage = messages[messages.length - 1];
          if (lastMessage.content) {
            stream.update(JSON.parse(JSON.stringify({
              event: "message",
              data: lastMessage
            }, null, 2)));
          }
        }
      }
    } catch (error) {
      console.error("Error in runAgent:", error);
      stream.update(JSON.parse(JSON.stringify({
        event: "error",
        data: { error: "An error occurred during processing" }
      }, null, 2)));
    } finally {
      stream.done();
    }
  })();

  return { streamData: stream.value };
}