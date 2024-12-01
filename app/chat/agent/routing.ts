import { State } from '@/utils/types';
import { z } from "zod";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { getModel } from '@/utils/models';

// Define the route schema using Zod
const RouteSchema = z.object({
    action: z.enum(["company_specific", "investment_knowledge", "conversational"]).describe(
        "Given a user question, choose whether it's company-specific research, general investment knowledge, or a conversational follow-up\chit-chat."
    ),
});

// Get the router LLM
const llm = getModel('SMALL', { temperature: 0 });
const structuredLlm = llm.withStructuredOutput(RouteSchema);

// Router function
export async function router(state: State): Promise<Pick<State, 'routingDecision'>> {
    const lastMessage = state.messages[state.messages.length - 1];
    const previousMessages = state.messages.slice(0, -1);

    const prompt = ChatPromptTemplate.fromTemplate(`
        You are a routing agent that determines whether a user's question falls into one of these categories:

        1. company_specific: Questions about specific companies or stocks that require financial analysis
        2. investment_knowledge: Questions about investment principles, strategies, or market concepts
        3. conversational: Follow-up questions, clarifications, or general chitchat that don't require new research

        Previous conversation context:
        {context}

        Current question: {input}

        Consider these guidelines:
        - If the question mentions specific companies or stock tickers → company_specific
        - If it's about investment concepts without specific companies → general_knowledge
        - If it's a follow-up question, asks for clarification, or is general chitchat → conversational

        Examples of conversational:
        - "Can you explain that in simpler terms?"
        - "What do you mean by that?"
        - "That's interesting, tell me more"
        - "Why do you think that?"
        - "How does that compare to what you said earlier?"
        - General greetings or pleasantries

        Respond with exactly one of: "company_specific", "general_knowledge", or "conversational"
    `);

    const chain = prompt
        .pipe(structuredLlm)

    const result = await chain.invoke({
        input: lastMessage.content,
        context: previousMessages.map(m => m.content).join("\n")
    });

    return {
        routingDecision: result.action
    };
}