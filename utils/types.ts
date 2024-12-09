import { BaseMessage } from "@langchain/core/messages";
import { Annotation } from "@langchain/langgraph";


// Interface for financial analysis entries
export interface FinancialEntry {
    ticker: string;
    relevantMetrics: string;
    timestamp: string;
}

export interface State {
    messages: BaseMessage[];
    tickers?: string[][];  // List of stock tickers in universal format (e.g., "AAPL", "MSFT")
    financialHistory?: FinancialEntry[];
    summarizedDocs?: string;
    routingDecision?: "both" | "quantitative" | "qualitative" | "conversational";
}

// Define the graph state
export const StateAnnotation = Annotation.Root({
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

export type ChatHistoryItem = {
    conversation_id: string;
    conversation_summary: string;
    updated_at: string;
  };

export type CheckpointMessage = {
    content: string;
    additional_kwargs: Record<string, any>;
    response_metadata: Record<string, any>;
    tool_calls?: any[];
    invalid_tool_calls?: any[];
  } & {
    lc?: number;
    type?: string;
    id?: string[];
    kwargs?: {
      content: string;
      additional_kwargs: Record<string, any>;
      response_metadata: Record<string, any>;
    };
  }
  
 export type Checkpoint = {
    v: number;
    id: string;
    ts: string;
    pending_sends: any[];
    versions_seen: Record<string, any>;
    channel_versions: Record<string, number>;
    channel_values: {
      messages: CheckpointMessage[];
      BuffetAgent?: string;
    };
  }