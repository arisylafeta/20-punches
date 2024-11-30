import { State } from '../../lib/utils/types';
import { z } from "zod";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { getModel } from '../../lib/models';
import { StringOutputParser } from "@langchain/core/output_parsers";

// Define the route schema using Zod
const RouteSchema = z.object({
    action: z.enum(["company_specific", "general_knowledge"]).describe(
        "Given a user question, choose whether it's company-specific or general knowledge."
    ),
});

// Get the router LLM
const llm = getModel('SMALL', { temperature: 0 });
const structuredLlm = llm.withStructuredOutput(RouteSchema);

// Router function
export async function router(state: State): Promise<State> {
    const lastMessage = state.messages[state.messages.length - 1];

    const prompt = ChatPromptTemplate.fromTemplate(`
        You are a routing agent that determines whether a user's question is about:
        1. Specific companies or stocks (company_specific)
        2. General investment knowledge or principles (general_knowledge)

        User Question: {input}

        Respond with either "company_specific" or "general_knowledge".
    `);

    const chain = prompt
        .pipe(structuredLlm)

    const result = await chain.invoke({
        input: lastMessage.content,
    });

    return {
        ...state,
        routingDecision: result.action
    };
}