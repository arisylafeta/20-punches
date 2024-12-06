import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { getModel } from "@/utils/models";
import { State } from "@/utils/types";
import { tools } from "./tools";
import { formatFinancialHistory, parseFinancialHistory } from "@/utils/helper";

// Create the prompt template for the financial analyst
const ANALYST_TEMPLATE = `You are a quantitative financial analyst. Your job is to gather ONLY the relevant financial metrics based on the question asked and analyze what additional metrics might be needed based on historical context. Do not provide analysis, commentary, or explanations.

You have access to the following tools:

{tools}

Here is the financial history so far:
{financialHistory}

Review the financial history above and consider:
1. Are there metrics from different time periods (e.g., 2023 vs 2024) that would help answer the question?
2. Are there additional metrics needed from the same ticker and time period?
3. Are there related metrics that need to be considered from different tickers?

Use the following format:

Question: The question you must gather metrics for
Tickers: The companies to research

Thought: Consider what metrics are needed and what's missing from the financial history.
1. What specific metrics are needed to answer this question?
2. What additional historical or comparative metrics would be valuable?
3. What metrics from the financial history are still relevant?

Action: Choose one of [{tool_names}]
Action Input: ONLY the ticker symbol (e.g., AAPL)

Observation: The result of the action
... (this Thought/Action/Action Input/Observation can be repeated as necessary)

Thought: I now have all the needed metrics
Final Answer: ONLY list the ADDITIONAL relevant metrics in this format for EACH ticker AND timestamp needed:

==================
TICKER (timestamp):
- metric1: value1
- metric2: value2
==================

ALWAYS INCLUDE THE SEPARATOR "=================="

Example output: 
==================
AAPL (2024-01-01):
- P/E Ratio: 28.5
- Free Cash Flow: $98B
- Debt/Equity: 2.5
==================

Begin gathering metrics:

Question: {input}
Tickers: {tickers}
Thought:{agent_scratchpad}`;

const prompt = ChatPromptTemplate.fromTemplate(ANALYST_TEMPLATE);

// Create the agent with deterministic LLM
const llm = getModel('SMALL', { temperature: 0 });

/**
 * Creates an agent executor for financial analysis
 */
async function createFinancialAnalysisExecutor() {
    const agent = await createReactAgent({
        llm,
        tools,
        prompt
    });

    return AgentExecutor.fromAgentAndTools({
        agent,
        tools
    });
}

/**
 * Executes financial analysis based on the user's question and identified tickers
 * @param state The current conversation state
 * @returns New financial entries
 */
export async function executeFinancialAnalysis(state: State): Promise<Pick<State, 'financialHistory'>> {
    try {
        const lastMessage = state.messages[state.messages.length - 1];
        if (!lastMessage || !state.tickers || state.tickers.length === 0) {
            return { financialHistory: [] };
        }

        // Get the latest group of tickers (last array in state.tickers)
        const latestTickers = state.tickers[state.tickers.length - 1];
        
        // Create the executor
        const executor = await createFinancialAnalysisExecutor();

        // Execute the analysis with the latest tickers
        const result = await executor.invoke({
            input: lastMessage.content,
            tickers: latestTickers.join(", "),
            financialHistory: formatFinancialHistory(state.financialHistory || [])
        });

        // Parse the result into financial entries
        const newEntries = parseFinancialHistory(result.output);

        // Keep only the last 5 entries when combining with existing history
        // This is done to limit the amount of historical data considered
        const updatedHistory = [...(state.financialHistory || []), ...newEntries].slice(-5);

        return {
            financialHistory: updatedHistory
        };
    } catch (error) {
        console.error("Error in financial analysis:", error);
        return { financialHistory: [] };
    }
}

