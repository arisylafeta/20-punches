import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { getModel } from "./models";
import { State } from "./types";
import { tools } from "./tools";

// Create the prompt template for the financial analyst
const ANALYST_TEMPLATE = `You are a financial analysis assistant powered by Warren Buffett's investment philosophy. Your job is to gather data relevant to the question as best as you can and prepare a good summary.
You have access to the following tools:

{tools}

Use the following format:

Question: The question you must provide relevant information on.
Ticker: The company you should research

Thought: Reflect on what information you need to answer the question and which tool should provide you with the best information. 

Action: Choose one of [{tool_names}]
Action Input: The input to the tool call. This must be ONLY the ticker symbol, with no additional characters, spaces, or formatting. For example: AAPL

Observation: The result of the action
... (this Thought/Action/Action Input/Observation can be repeated as necessary)

Thought: I now have sufficient information to provide a comprehensive summary

Final Answer: Provide a detailed summary of the relevant financial metrics/ratios and their significance in answering the question, incorporating Warren Buffett's investment principles where applicable.

Begin your analysis:

Question: {input}
Ticker: {ticker}
Thought:{agent_scratchpad}`;

const prompt = ChatPromptTemplate.fromTemplate(ANALYST_TEMPLATE);

// Create the agent with a deterministic LLM
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
        tools,
        verbose: true
    });
}

/**
 * Executes financial analysis based on the user's question and identified tickers
 * @param state The current conversation state
 * @returns Updated state with financial analysis summary
 */
export async function executeFinancialAnalysis(state: State): Promise<State> {
    const lastMessage = state.messages[state.messages.length - 1].content;
    const tickers = state.tickers || [];
    
    if (tickers.length === 0) {
        return {
            ...state,
            financial_summary: "No specific companies were identified for analysis. Please mention specific companies or their stock tickers."
        };
    }

    // Create a new executor for each analysis
    const executor = await createFinancialAnalysisExecutor();

    // For now, we'll analyze the first ticker in the list
    // TODO: Add support for multiple tickers
    const result = await executor.invoke({
        input: lastMessage,
        ticker: tickers[0]
    });
    
    return {
        ...state,
        financial_summary: result.output
    };
}
