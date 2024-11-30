import { z } from "zod";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { getModel } from "../../lib/models";
import { State } from "../../lib/utils/types";

// Data schema for ticker extraction
const TickerExtractionSchema = z.object({
    tickers: z.array(z.string()).describe(
        "The stock tickers mentioned or implied in the query. Use an empty array if no specific companies are mentioned."
    )
});

// Prompt template
const SYSTEM_TEMPLATE = `You are an expert at identifying company stock tickers in financial queries.
Extract ONLY the stock tickers (e.g., AAPL, MSFT, TSLA) from the query.
If specific companies are mentioned or implied, return their stock tickers.
If no specific companies are mentioned, return an empty list.
Be concise and only return the tickers.`;

/**
 * Extracts stock tickers from the latest message in the conversation state
 * @param state The current conversation state
 * @returns Updated state with extracted tickers
 */
export async function extractTickers(state: State): Promise<State> {
    const lastMessage = state.messages.length > 0 ? state.messages[state.messages.length - 1].content : "";
    
    // Create the chain components
    const llm = getModel('SMALL', { 
        temperature: 0,
        maxTokens: 100  // Reduced as we only need tickers
    });
    const structuredLlm = llm.withStructuredOutput(TickerExtractionSchema);
    
    const prompt = ChatPromptTemplate.fromMessages([
        ["system", SYSTEM_TEMPLATE],
        ["human", "{question}"]
    ]);
    
    // Execute the chain
    const result = await prompt
        .pipe(structuredLlm)
        .invoke({ question: lastMessage });
    
    return {
        ...state,
        tickers: result.tickers
    };
}
