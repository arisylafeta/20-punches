import { StateGraph } from "@langchain/langgraph";
import { Annotation } from "@langchain/langgraph";
import { State } from '../../lib/utils/types';
import { router } from './routing';
import { retrieveDocs } from './retriever';
import { extractTickers } from './ticker_extractor';
import { executeFinancialAnalysis } from './financial_analyst';
import { buffetAgent } from './buffet';

// Define the graph state
const StateAnnotation = Annotation.Root({
    messages: Annotation<State['messages']>({
        reducer: (x, y) => x.concat(y),
    }),
    routingDecision: Annotation<string>(),
    tickers: Annotation<string[]>(),
    financialSummary: Annotation<string>(),
    summarizedDocs: Annotation<string>()
});

// Define routing function
function shouldContinue(state: typeof StateAnnotation.State) {
    const routingDecision = state.routingDecision;
    
    if (routingDecision === "general_knowledge") {
        return "DocRetriever";
    }
    if (routingDecision === "company_specific") {
        return "TickerExtractor";
    }
    return "__end__";
}

// Initialize the graph
const workflow = new StateGraph(StateAnnotation)
    .addNode("Router", router)
    .addNode("DocRetriever", retrieveDocs)
    .addNode("TickerExtractor", extractTickers)
    .addNode("FinancialAnalyst", executeFinancialAnalysis)
    .addNode("BuffetAgent", buffetAgent)
    .addEdge("__start__", "Router")
    .addConditionalEdges("Router", shouldContinue)
    .addEdge("DocRetriever", "BuffetAgent")
    .addEdge("TickerExtractor", "FinancialAnalyst")
    .addEdge("FinancialAnalyst", "DocRetriever")
    .addEdge("BuffetAgent", "__end__");

// Compile the graph
export const buffetGraph = workflow.compile();