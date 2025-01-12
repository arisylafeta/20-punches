"use server";
import { getModel } from "@/utils/models";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

export async function generateSummaryFromUserMessage({
  message,
}: {
  message: string;
}) {
  const model = getModel('base');
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", `
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`],
    ["human", "{input}"]
  ]);
  
  const chain = prompt.pipe(model).pipe(new StringOutputParser());
  
  const summary = await chain.invoke({
    input: message,
  });

  return summary;
}
