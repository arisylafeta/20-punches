"use server";

import { buffetGraph } from './agent/graph';
import { HumanMessage, BaseMessage, AIMessage } from "@langchain/core/messages";

const config = { 
  configurable: { 
    thread_id: 111
  }
};

export async function runAgent(input: string) {
  const message = {messages: [new HumanMessage({ content: input })]};
  const res = await buffetGraph.invoke(message, config);
  
  // Transform messages to simple format
  const simplifiedMessages = res.messages.map((msg: BaseMessage) => ({
    role: msg instanceof HumanMessage ? "user" : "assistant",
    content: msg.content
  }));
  
  return {
    response: simplifiedMessages
  };
}