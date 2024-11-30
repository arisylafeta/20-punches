export interface Message {
    content: string;
    role: string;
}

export interface State {
    messages: Message[];
    tickers?: string[];
    financialSummary?: string;
    summarizedDocs?: string;
    routingDecision?: string;
}

export interface SearchResult {
    content: string;
    metadata: Record<string, any>;
}
