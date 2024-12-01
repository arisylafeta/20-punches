import { z } from "zod";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { getModel } from "@/utils/models";
import { State } from "@/utils/types";
import { AIMessage, HumanMessage } from "@langchain/core/messages";

// Schema for analyzer's decisions
const AnalyzerSchema = z.object({
    newTickers: z.array(z.string()).describe(
        "New stock tickers mentioned in the current message that weren't in previous messages"
    ),
    needsFinancialAnalysis: z.boolean().describe(
        "Whether we need to run financial analysis (true for new tickers or deep financial questions about existing ones)"
    ),
    needsPhilosophyDocs: z.boolean().describe(
        "Whether we need Buffett's philosophy (true for investment principles, market concepts, or strategy questions)"
    ),
    reason: z.string().describe(
        "Explanation of why these decisions were made"
    )
});

const llm = getModel('SMALL', { temperature: 0 });
const structuredLlm = llm.withStructuredOutput(AnalyzerSchema);

export async function contextAnalyzer(state: State): Promise<Pick<State, 'tickers' | 'routingDecision'>> {
    const messages = state.messages;
    const currentMessage = messages[messages.length - 1];
    const previousHuman = messages.slice(-3, -2).find(m => m instanceof HumanMessage);
    const previousAI = messages.slice(-3, -2).find(m => m instanceof AIMessage);
    
    // Get all previously mentioned tickers as a flat Set for deduplication
    const allPreviousTickers = new Set(
        (state.tickers || []).flat()
    );

    const template = `
    You are an expert at analyzing conversation context and determining what information is needed.
    
    Previous Human Message: {previousHuman}
    Previous AI Response: {previousAI}
    Current Message: {currentMessage}
    Previously Discussed Tickers: {previousTickers}

    Analyze the conversation and determine:
    1. Are there any new company tickers mentioned that weren't discussed before?
    2. Do we need fresh financial analysis? (Consider: new companies, or deep financial questions about existing ones)
    3. Do we need Buffett's investment philosophy in something that wasn't discussed previously?

    Consider these cases:
    - Simple follow-up questions don't need new analysis
    - Questions about previously mentioned companies might still need philosophy
    - New companies always need financial analysis
    - General investment questions might need philosophy but not financial analysis
    `;

    const prompt = ChatPromptTemplate.fromTemplate(template);
    
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
            return {
                tickers: [...(state.tickers || []), newUniqueTickersArray],
                routingDecision: result.reason
            };
        }

        // If no new tickers, just return the routing decision
        return {
            routingDecision: result.reason
        };
    } catch (error) {
        console.error("Error in context analyzer:", error);
        return {};
    }
}