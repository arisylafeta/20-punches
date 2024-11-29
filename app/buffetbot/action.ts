"use server";

import { createStreamableValue } from "ai/rsc";
import { router, type State } from './routing';

export async function runAgent(input: string) {
  const stream = createStreamableValue();

  (async () => {
    // Initialize state with user input
    const initialState: State = {
      messages: [{ content: input, role: "user" }],
    };
    
    // Get routing decision
    const routedState = await router(initialState);
    
    // Stream the result
    stream.update(JSON.parse(JSON.stringify({
      event: "routing_decision",
      data: {
        decision: routedState.routing_decision,
        input: input
      }
    }, null, 2)));

    stream.done();
  })();

  return { streamData: stream.value };
}