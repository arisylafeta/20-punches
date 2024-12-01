import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { getModel } from "@/utils/models";
import { State, FinancialEntry } from "@/utils/types";
import { tools } from "./tools";
import { z } from "zod";
import { RunnableSequence } from "@langchain/core/runnables";

// Schema for parsing financial metrics output
const MetricsOutputSchema = z.array(z.object({
    ticker: z.string(),
    relevantMetrics: z.string().describe(
        "Metrics as a newline-separated string of key-value pairs"
    ),
    timestamp: z.string().describe("Timestamp for the metrics")
}));

// Create the prompt template for the financial analyst
const ANALYST_TEMPLATE = `You are a quantitative financial analyst. Your job is to gather ONLY the relevant financial metrics based on the question asked. Do not provide analysis, commentary, or explanations.

You have access to the following tools:

{tools}

Use the following format:

Question: The question you must gather metrics for
Tickers: The companies to research

Thought: What specific metrics are needed to answer this question?

Action: Choose one of [{tool_names}]
Action Input: ONLY the ticker symbol (e.g., AAPL)

Observation: The result of the action
... (this Thought/Action/Action Input/Observation can be repeated as necessary)

Thought: I now have the metrics needed
Final Answer: ONLY list the relevant metrics in this format for each ticker:
TICKER (timestamp):
- metric1: value1
- metric2: value2

Example output:
AAPL (2024-01-01):
- P/E Ratio: 28.5
- Free Cash Flow: $98B
- Debt/Equity: 2.5

Begin gathering metrics:

Question: {input}
Tickers: {tickers}
Thought:{agent_scratchpad}`;

// Template for metrics parser
const METRICS_PARSER_TEMPLATE = ChatPromptTemplate.fromTemplate(`
You are a financial data parser. Convert the following financial metrics output into a structured format.
Each ticker should have its metrics as a simple string.

Here's the input to parse:
{input}

Return an array of entries, where each entry has:
- ticker: the stock symbol
- relevantMetrics: a string with each metric on a new line (e.g., "P/E Ratio: 28.5\\nFree Cash Flow: $98B")
- timestamp: the date from the input

Example metrics format:
P/E Ratio: 28.5
Free Cash Flow: $98B
Debt/Equity: 2.5
`);

const prompt = ChatPromptTemplate.fromTemplate(ANALYST_TEMPLATE);
const metricsParserPrompt = METRICS_PARSER_TEMPLATE;

// Create the agents with deterministic LLM
const llm = getModel('SMALL', { temperature: 0 });
const structuredLlm = llm.withStructuredOutput(MetricsOutputSchema);

// Create the metrics parser sequence
const metricsParser = RunnableSequence.from([
    {
        input: (output: string) => output
    },
    metricsParserPrompt,
    structuredLlm
]);

// Parse metrics output
async function parseMetricsOutput(output: string) {
    return metricsParser.invoke(output);
}

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
 * @returns Updated state with financial entries
 */
export async function executeFinancialAnalysis(state: State): Promise<Pick<State, 'financialHistory'>> {
    try {
        const lastMessage = state.messages[state.messages.length - 1];
        if (!lastMessage || !state.tickers || state.tickers.length === 0) {
            return { financialHistory: [] };
        }

        // Get existing tickers from history
        const existingTickers = new Set(state.financialHistory?.map(entry => entry.ticker) || []);
        
        // Get the latest group of tickers (last array in state.tickers)
        const latestTickers = state.tickers[state.tickers.length - 1];
        
        // Filter out tickers we already have data for
        const newTickers = latestTickers.filter(ticker => !existingTickers.has(ticker));
        
        if (newTickers.length === 0) {
            return { financialHistory: [] }; // No new tickers to analyze
        }

        // Create the executor
        const executor = await createFinancialAnalysisExecutor();

        // Execute the analysis only for new tickers
        const result = await executor.invoke({
            input: lastMessage.content,
            tickers: newTickers.join(", ")
        });

        // Parse the metrics into structured format
        const parsedMetrics = await parseMetricsOutput(result.output);

        // Create entries with timestamp
        const entries: FinancialEntry[] = parsedMetrics.map(entry => ({
            ticker: entry.ticker,
            relevantMetrics: entry.relevantMetrics,
            timestamp: entry.timestamp
        }));

        return {
            financialHistory: entries
        };
    } catch (error) {
        console.error("Error in financial analysis:", error);
        return {
            financialHistory: []
        };
    }
}
