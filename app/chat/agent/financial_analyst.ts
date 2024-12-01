import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { getModel } from "@/utils/models";
import { State } from "@/utils/types";
import { tools } from "./tools";

// Create the prompt template for the financial analyst
const ANALYST_TEMPLATE = `You are a financial analysis assistant powered by Warren Buffett's investment philosophy. Your job is to gather data relevant to the question as best as you can and prepare a good summary.
You have access to the following tools:

{tools}

Use the following format:

Question: The question you must provide relevant information on.
Tickers: The companies you should research

Thought: Reflect on what information you need to answer the question and which tool should provide you with the best information. 

Action: Choose one of [{tool_names}]
Action Input: The input to the tool call. This must be ONLY the ticker symbol, with no additional characters, spaces, or formatting. For example: AAPL

Observation: The result of the action
... (this Thought/Action/Action Input/Observation can be repeated as necessary)

Thought: I now have sufficient information to provide a comprehensive summary
Final Answer: Provide a 200 word summary of the relevant financial metrics/ratios and their significance in answering the question, incorporating Warren Buffett's investment philosophy. Then, list all relevant financial metrics as bullet points.

Begin your analysis:

Question: {input}
Tickers: {tickers}
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
        tools
    });
}

/**
 * Executes financial analysis based on the user's question and identified tickers
 * @param state The current conversation state
 * @returns Updated state with financial analysis summary
 */
export async function executeFinancialAnalysis(state: State): Promise<Pick<State, 'financialSummary'>> {
    try {
        const lastMessage = state.messages[state.messages.length - 1];
        if (!lastMessage || !state.tickers || state.tickers.length === 0) {
            return { financialSummary: "" };
        }

        // Create the executor
        const executor = await createFinancialAnalysisExecutor();

        // Execute the analysis
        const result = await executor.invoke({
            input: lastMessage.content,
            tickers: state.tickers.join(", ")
        });

        return {
            financialSummary: result.output
        };
    } catch (error) {
        console.error("Error in financial analysis:", error);
        return {
            financialSummary: "Error performing financial analysis."
        };
    }
}
