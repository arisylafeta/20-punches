"use server";

import { z } from "zod";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { getModel } from './models';

// State interface
export interface State {
  messages: Array<{ content: string; role: string }>;
  routing_decision?: "company_specific" | "general_knowledge";
}

// Define the route schema using Zod
const RouteSchema = z.object({
  action: z.enum(["company_specific", "general_knowledge"]).describe(
    "Given a user question, choose whether it's company-specific or general knowledge."
  ),
});

// Get the router LLM
const llm = getModel('SMALL', { temperature: 0 });
const structured_llm_router = llm.withStructuredOutput(RouteSchema);

// Create the routing prompt
const system = `You are an expert at determining whether a query is about a specific company or financial data, or if it's a general knowledge question.
For queries about specific companies, financial metrics, stock performance, or company-specific data, use 'company_specific'.
For general knowledge questions, including explanations of financial concepts not tied to a specific company, use 'general_knowledge'.`;

const route_prompt = ChatPromptTemplate.fromMessages([
  ["system", system],
  ["human", "{question}"],
]);

// Create the question router chain
const question_router = route_prompt.pipe(structured_llm_router);

// Router function
export async function router(state: State): Promise<State> {
  console.log("Current state:", state);
  
  const last_message = state.messages.length > 0 
    ? state.messages[state.messages.length - 1].content 
    : "";
    
  const result = await question_router.invoke({
    question: last_message,
  });
  
  // Update the state with the routing decision
  return {
    ...state,
    routing_decision: result.action,
  };
}