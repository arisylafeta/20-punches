import * as dotenv from 'dotenv';
import { join } from 'path';
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";

// Load environment variables
dotenv.config({ path: join(__dirname, '../../.env') });

// Validate required environment variables
if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is required but not set');
}

// Model configuration types
interface ModelConfig {
    temperature?: number;
    maxTokens?: number;
    streaming?: boolean;
}

type ChatModel = ChatOpenAI;
type EmbeddingsModel = OpenAIEmbeddings;

// Model instances with different configurations
export const MODELS = {
    SMALL: (config?: ModelConfig): ChatModel => new ChatOpenAI({
        modelName: "gpt-4o-mini",
        temperature: config?.temperature ?? 0,
        maxTokens: config?.maxTokens ?? 4000,
        streaming: config?.streaming ?? true,
        openAIApiKey: process.env.OPENAI_API_KEY,
    }),
    EMBEDDINGS: (): EmbeddingsModel => new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
    })
} as const;

export type ModelKey = keyof typeof MODELS;

// Type-safe model instance getter
export function getModel<T extends ModelKey>(
    type: T,
    config?: T extends 'SMALL' ? ModelConfig : never
): T extends 'SMALL' ? ChatModel : EmbeddingsModel {
    return MODELS[type](config) as T extends 'SMALL' ? ChatModel : EmbeddingsModel;
}