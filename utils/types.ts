import { BaseMessage } from "@langchain/core/messages";

export interface State {
    messages: BaseMessage[];
    tickers?: string[];
    financialSummary?: string;
    summarizedDocs?: string;
    routingDecision?: string;
}

export interface SearchResult {
    content: string;
    metadata: Record<string, any>;
}
