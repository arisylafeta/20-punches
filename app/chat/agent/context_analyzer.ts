import { z } from "zod";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { getModel } from "@/utils/models";
import { State } from "@/utils/types";
import { AIMessage, HumanMessage } from "@langchain/core/messages";

// Schema for analyzer's decisions
const AnalyzerSchema = z.object({
    newTickers: z.array(z.string()).describe(
        "New stock tickers mentioned in the message in universal format (e.g., 'AAPL' for Apple, 'MSFT' for Microsoft). " +
        "Only include valid stock exchange tickers, not company names or abbreviations."
    ),
    routingDecision: z.enum([
        "both",
        "quantitative",
        "qualitative",
        "conversational"
    ]).describe(
        "The decision on how to route the conversation: " +
        "'both' for questions needing both financial data and philosophy, " +
        "'quantitative' for pure financial analysis, " +
        "'qualitative' for philosophical/strategic questions, " +
        "'conversational' for general chat"
    )
});

const template = `
You are an expert at analyzing conversation context and determining what type of response is needed.

Previous Human Message: {previousHuman}
Previous AI Response: {previousAI}
Current Message: {currentMessage}
Previously Discussed Tickers: {previousTickers}

Your task is to:
1. Identify any new stock tickers mentioned in the current message
   - Only include official stock exchange tickers (e.g., 'AAPL', 'MSFT', 'GOOGL')
   - Do NOT include company names or informal abbreviations
   - Exclude tickers that were previously discussed

2. Determine how to route the conversation:
   - "both": Questions requiring both financial analysis and investment philosophy
   - "quantitative": Pure financial/metric analysis questions
   - "qualitative": Questions about investment philosophy, strategy, or market concepts
   - "conversational": General chat or clarification questions

Consider:
- Questions about specific companies' financials → quantitative
- Questions about investment strategy or wisdom → qualitative
- Questions combining company analysis with strategy → both
- Simple follow-ups, clarifications, or general chat → conversational
`;

const prompt = ChatPromptTemplate.fromTemplate(template);

const llm = getModel('SMALL', { temperature: 0 });
const structuredLlm = llm.withStructuredOutput(AnalyzerSchema);

export async function contextAnalyzer(state: State): Promise<Pick<State, 'tickers' | 'routingDecision'>> {
    const messages = state.messages;
    const currentMessage = messages[messages.length - 1];
    const previousHuman = messages.slice(-3, -2).find(m => m instanceof HumanMessage);
    const previousAI = messages.slice(-3, -2).find(m => m instanceof AIMessage);
    
    // Get last 5 tickers as a flat Set for deduplication
    const recentTickers = (state.tickers || []).slice(-5).flat();
    const allPreviousTickers = new Set(recentTickers);

    try {
        const result = await prompt.pipe(structuredLlm).invoke({
            previousHuman: previousHuman?.content || "No previous message",
            previousAI: previousAI?.content || "No previous response",
            currentMessage: currentMessage.content,
            previousTickers: Array.from(allPreviousTickers).join(", ")
        });

        // Filter out any duplicates from new tickers
        const newUniqueTickersArray = result.newTickers.filter(
            ticker => !allPreviousTickers.has(ticker)
        );

        // Only update tickers if we have new ones
        if (newUniqueTickersArray.length > 0) {
            // Keep only the last 5 ticker arrays
            const updatedTickers = [...(state.tickers || []), newUniqueTickersArray].slice(-5);
            return {
                tickers: updatedTickers,
                routingDecision: result.routingDecision
            };
        }
        // If no new tickers, just return the routing decision
        return {
            routingDecision: result.routingDecision
        };
    } catch (error) {
        console.error("Error in context analyzer:", error);
        return {};
    }
}