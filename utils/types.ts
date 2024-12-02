import { BaseMessage } from "@langchain/core/messages";

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