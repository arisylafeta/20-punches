import { StateGraph } from "@langchain/langgraph";
import { Annotation } from "@langchain/langgraph";
import { State, FinancialEntry } from '@/utils/types';
import { contextAnalyzer } from './context_analyzer';
import { retrieveDocs } from './retrieve_docs';
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
    tickers: Annotation<string[][]>({
        reducer: (x, y) => {
            if (!x) return y || [];
            if (!y) return x;
            return [...x, ...y];  // Append new ticker arrays
        }
    }),
    financialHistory: Annotation<FinancialEntry[]>({
        reducer: (x, y) => {
            const xArr = x || [];
            const yArr = y || [];
            return [...xArr, ...yArr];  // Append all entries
        }
    }),
    summarizedDocs: Annotation<string>({
        reducer: (x: string, y: string) => y || x || ""  // Replace with latest
    }),
    routingDecision: Annotation<string>({
        reducer: (x: string, y: string) => y || x || ""  // Replace with latest
    })
});

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
export const buffetGraph = workflow.compile({checkpointer: memory});