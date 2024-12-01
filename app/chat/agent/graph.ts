import { StateGraph } from "@langchain/langgraph";
import { Annotation } from "@langchain/langgraph";
import { State } from '@/utils/types';
import { router } from './routing';
import { retrieveDocs } from './retrieve_docs';
import { extractTickers } from './ticker_extractor';
import { executeFinancialAnalysis } from './financial_analyst';
import { buffetAgent } from './buffet';
import { MemorySaver } from '@langchain/langgraph';

// Initialize memory with a unique conversation ID
const memory = new MemorySaver();

// Define the graph state
const StateAnnotation = Annotation.Root({
    messages: Annotation<State['messages']>({
        reducer: (x, y) => {
            if (!x) return y || [];
            if (!y) return x;
            return x.concat(y);
        }
    }),
    routingDecision: Annotation<string>({
        reducer: (x: string, y: string) => y || x || ""
    }),
    tickers: Annotation<string[]>({
        reducer: (x, y) => {
            const xArr = x || [];
            const yArr = y || [];
            return Array.from(new Set([...xArr, ...yArr]));
        }
    }),
    financialSummary: Annotation<string>({
        reducer: (x: string, y: string) => y || x || ""
    }),
    summarizedDocs: Annotation<string>({
        reducer: (x: string, y: string) => y || x || ""
    })
});

// Define routing function for parallel execution
function getNextSteps(state: typeof StateAnnotation.State): string[] {
    const routingDecision = state.routingDecision;
    
    if (routingDecision === "investment_knowledge") {
        return ["DocRetriever"];
    }
    if (routingDecision === "company_specific") {
        // Return both nodes for parallel execution
        return ["DocRetriever", "TickerExtractor"];
    }
    if (routingDecision === "conversational") {
        // Skip research and analysis, go straight to Buffet
        return ["BuffetAgent"];
    }
    return ["__end__"];
}

// Initialize the graph
const workflow = new StateGraph(StateAnnotation)
    .addNode("Router", router)
    .addNode("DocRetriever", retrieveDocs)
    .addNode("TickerExtractor", extractTickers)
    .addNode("FinancialAnalyst", executeFinancialAnalysis)
    .addNode("BuffetAgent", buffetAgent)

    // Add edges
    .addEdge("__start__", "Router")
    .addConditionalEdges("Router", getNextSteps, ["DocRetriever", "TickerExtractor", "BuffetAgent"])
    .addEdge("DocRetriever", "BuffetAgent")
    .addEdge("TickerExtractor", "FinancialAnalyst")
    .addEdge("FinancialAnalyst", "BuffetAgent")
    .addEdge("BuffetAgent", "__end__");

// Compile the graph
export const buffetGraph = workflow.compile({checkpointer: memory});