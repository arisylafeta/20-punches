require('dotenv').config();


console.log("Loaded OpenAI API Key:", process.env.OPENAI_API_KEY);

import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";

// Base configuration that can be extended for specific agents
interface ModelConfig {
  temperature?: number;
  maxTokens?: number;
  streaming?: boolean;
}

// Define model types for better type safety
type ChatModel = ChatOpenAI;
type EmbeddingsModel = OpenAIEmbeddings;

// Different model configurations for different agent roles
export const MODELS = {
  // For tasks requiring high reasoning and complex decision making
  SMALL: (config?: ModelConfig): ChatModel => new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: config?.temperature ?? 0,
    maxTokens: config?.maxTokens ?? 4000,
    streaming: config?.streaming ?? true,
    openAIApiKey: process.env.OPENAI_API_KEY ?? "",
  }),
  // Embeddings model
  EMBEDDINGS: (): EmbeddingsModel => new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY ?? "",
  })
} as const;

// Type for available model keys
export type ModelKey = keyof typeof MODELS;

// Helper function to get model instance with proper type inference
export function getModel<T extends ModelKey>(
  type: T,
  config?: T extends 'SMALL' ? ModelConfig : never
): T extends 'SMALL' ? ChatModel : EmbeddingsModel {
  return MODELS[type](config) as T extends 'SMALL' ? ChatModel : EmbeddingsModel;
}