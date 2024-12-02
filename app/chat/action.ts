"use server";

import { createStreamableValue } from "ai/rsc";
import { buffetGraph } from './agent/graph';
import { CallbackHandlerMethods } from "@langchain/core/callbacks/base";
import { HumanMessage } from "@langchain/core/messages";

const config = { 
  configurable: { 
    thread_id: crypto.randomUUID()
  }
};

// Helper function to strip quotes if they exist
const stripQuotes = (str: string) => {
  if (str.startsWith('"') && str.endsWith('"')) {
    return str.slice(1, -1);
  }
  return str;
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
            if (output?.generations?.[0]?.[0]?.message?.content) {
              stream.update({
                event: "llm",
                data: stripQuotes(output.generations[0][0].message.content)
              });
            }
          },
          handleChainEnd: async (output: any) => {
            if (output?.returnValues?.response) {
              stream.update({
                event: "chain",
                data: stripQuotes(output.returnValues.response)
              });
            }
          },
          handleToolEnd: async (output: any) => {
            if (output?.output) {
              stream.update({
                event: "tool",
                data: stripQuotes(output.output)
              });
            }
          }
        } satisfies Partial<CallbackHandlerMethods>]
      })) {
        // Update stream with the latest message if available
        const messages = state.messages;
        if (messages?.length > 0) {
          const lastMessage = messages[messages.length - 1];
          if (lastMessage.content) {
            stream.update({
              event: "message",
              data: stripQuotes(lastMessage.content)
            });
          }
        }
      }
    } catch (error) {
      console.error("Error in runAgent:", error);
      stream.update({
        event: "error",
        data: { error: "An error occurred during processing" }
      });
    } finally {
      stream.done();
    }
  })();

  return { streamData: stream.value };
}