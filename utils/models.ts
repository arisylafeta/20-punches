import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";

// Validate required environment variables
if (!process.env.OPENAI_API_KEY) {
    console.warn('Warning: OPENAI_API_KEY is not set');
}
if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('Warning: ANTHROPIC_API_KEY is not set');
}

// Model configuration types
interface ModelConfig {
    temperature?: number;
    maxTokens?: number;
    streaming?: boolean;
}

type ChatModel = ChatOpenAI | ChatAnthropic;
type EmbeddingsModel = OpenAIEmbeddings;

export const MODEL_DETAILS = {
    base: {
        name: "Base",
        id: "base",
        premium: false,
        modelName: "gpt-4o-mini"
    },
    gpt4: {
        name: "GPT-4o",
        id: "gpt4o",
        premium: true,
        modelName: "gpt-4o"
    },
    claude: {
        name: "Claude 3.5 Sonnet",
        id: "claude",
        premium: true,
        modelName: "claude-3-5-sonnet-20241022"
    }
} as const;

export type ModelId = keyof typeof MODEL_DETAILS;

// Model instances with different configurations
const MODEL_INSTANCES = {
    base: (config?: ModelConfig): ChatModel => new ChatOpenAI({
        modelName: MODEL_DETAILS.base.modelName,
        temperature: config?.temperature ?? 0,
        maxTokens: config?.maxTokens ?? 4000,
        streaming: config?.streaming ?? true,
        openAIApiKey: process.env.OPENAI_API_KEY,
    }),
    gpt4: (config?: ModelConfig): ChatModel => new ChatOpenAI({
        modelName: MODEL_DETAILS.gpt4.modelName,
        temperature: config?.temperature ?? 0,
        maxTokens: config?.maxTokens ?? 8000,
        streaming: config?.streaming ?? true,
        openAIApiKey: process.env.OPENAI_API_KEY,
    }),
    claude: (config?: ModelConfig): ChatModel => new ChatAnthropic({
        modelName: MODEL_DETAILS.claude.modelName,
        temperature: config?.temperature ?? 0,
        maxTokens: config?.maxTokens ?? 4000,
        streaming: config?.streaming ?? true,
        anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    }),
} as const;

// Type-safe model instance getter
export function getModel(modelId: ModelId, config?: ModelConfig): ChatModel {
    const modelInstance = MODEL_INSTANCES[modelId];
    if (!modelInstance) {
        console.warn(`Model ${modelId} not found, falling back to base model`);
        return MODEL_INSTANCES.base(config);
    }
    return modelInstance(config);
}

// Separate function for embeddings model
export function getEmbeddingsModel(): OpenAIEmbeddings {
    return new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
    });
}