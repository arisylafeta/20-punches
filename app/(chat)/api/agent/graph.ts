import { StateGraph } from "@langchain/langgraph";
import { contextAnalyzer } from './context_analyzer';
import { retrieveDocs } from './retrieve_docs';
import { executeFinancialAnalysis } from './financial_analyst';
import { buffetAgent } from './buffet';
import { StateAnnotation } from "@/utils/types";
import { checkpointer } from "@/lib/db/checkpoints";

checkpointer.setup();

// Define routing function for parallel execution
function getNextSteps(state: typeof StateAnnotation.State): string[] {
    const routingDecision = state.routingDecision;
    
    if (routingDecision === "both") {
        return ["DocRetriever", "FinancialAnalyst"];
    }
    if (routingDecision === "quantitative") {
        return ["FinancialAnalyst"];
    }
    if (routingDecision === "qualitative") {
        return ["DocRetriever"];
    }
    // conversational or undefined
    return ["BuffetAgent"];
}

// Initialize the graph
const workflow = new StateGraph(StateAnnotation)
    .addNode("Analyzer", contextAnalyzer)
    .addNode("DocRetriever", retrieveDocs)
    .addNode("FinancialAnalyst", executeFinancialAnalysis)
    .addNode("BuffetAgent", buffetAgent)

    // Add edges
    .addEdge("__start__", "Analyzer")
    .addConditionalEdges("Analyzer", getNextSteps, ["DocRetriever", "FinancialAnalyst", "BuffetAgent"])
    .addEdge("DocRetriever", "BuffetAgent")
    .addEdge("FinancialAnalyst", "BuffetAgent")
    .addEdge("BuffetAgent", "__end__");

// Compile the graph
export const buffetGraph = workflow.compile({ checkpointer });