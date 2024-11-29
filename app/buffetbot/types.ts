export interface Message {
    content: string;
    role: string;
}

export interface State {
    messages: Message[];
    tickers?: string[];
    financial_summary?: string;
    summarized_docs?: string;
    routing_decision?: string;
}

export interface SearchResult {
    content: string;
    metadata: Record<string, any>;
}
