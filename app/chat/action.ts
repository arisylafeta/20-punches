"use server";

import { createStreamableValue } from "ai/rsc";
import { buffetGraph } from './agent/graph';
import { State } from '../lib/utils/types';
import { CallbackHandlerMethods } from "@langchain/core/callbacks/base";

export async function runAgent(input: string) {
  const stream = createStreamableValue();

  (async () => {
    try {
      // Initialize state with user input
      const initialState: State = {
        messages: [{ content: input, role: "user" }],
        routingDecision: "",
        tickers: [],
        financialSummary: "",
        summarizedDocs: ""
      };

      // Execute the graph and get updates
      const finalState = await buffetGraph.invoke(initialState, {
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
          }
        } as CallbackHandlerMethods]
      });

      // Stream final state
      stream.update(JSON.parse(JSON.stringify({
        event: "complete",
        data: finalState
      }, null, 2)));
    } catch (error) {
      // Handle any errors
      stream.update(JSON.parse(JSON.stringify({
        event: "error",
        data: error instanceof Error ? error.message : "An unknown error occurred"
      }, null, 2)));
    } finally {
      stream.done();
    }
  })();

  return { streamData: stream.value };
}