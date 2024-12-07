"use server";
import { buffetGraph } from './api/agent/graph';
import { HumanMessage, BaseMessage, AIMessage } from "@langchain/core/messages";
import { getModel } from "@/utils/models";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

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

'use server';

import { type CoreUserMessage } from 'ai';

export async function generateTitleFromUserMessage({
  message,
}: {
  message: CoreUserMessage;
}) {
  const model = getModel('SMALL');
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", `
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`],
    ["human", "{input}"]
  ]);
  
  const chain = prompt.pipe(model).pipe(new StringOutputParser());
  
  const title = await chain.invoke({
    input: JSON.stringify(message),
  });

  return title;
}
