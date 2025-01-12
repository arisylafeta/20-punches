import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { createClient } from "@/utils/supabase/server";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableConfig, RunnableSequence } from "@langchain/core/runnables";
import { formatDocs } from "./tools";
import { State } from "@/utils/types";
import { getModel } from "@/utils/models";
import { AIMessage, MessageContent } from "@langchain/core/messages";
import { getEmbeddingsModel } from "@/utils/models";

const summarizationTemplate = `
Given the following information and the user's question, provide a comprehensive 200 word analysis that:
1. Synthesizes the key points from the retrieved documents
2. Applies Warren Buffett's investment principles
3. Provides specific examples and references from the context
4. Maintains a clear focus on answering the user's question

User's question: {question}

Retrieved Information:
{docs}

Analysis:`;


// Function to retrieve and summarize documents
export async function retrieveDocs(state: State, config?: RunnableConfig): Promise<Pick<State, 'summarizedDocs'>> {
    try {
        const lastMessage = state.messages[state.messages.length - 1];
        if (!lastMessage) {
            return { summarizedDocs: "" };
        }
        const getMessageString = (content: MessageContent): string =>
            typeof content === 'string' ? content : content.map(c => c.type === 'text' ? c.text : '').join(' ');
        
        // Initialize models
        const modelName = config?.configurable?.model || 'base';
        const llm = getModel(modelName);
        const deterministicLlm = getModel(modelName, { temperature: 0 });
        const embeddings = getEmbeddingsModel();
        // Create retriever with specific search parameters
        const retriever = (vectorStore: SupabaseVectorStore) => vectorStore.asRetriever({ k: 7 });

        // Define HyDE prompt template
        const hydeTemplate = `You are Warren Buffet. Answer this question with a 100 word passage using your principles: {question}
        Passage:`;

        const promptHyde = ChatPromptTemplate.fromTemplate<{
            question: string;
        }>(hydeTemplate);

        // Create string output parser
        const strOutputParser = new StringOutputParser();

        // Generate hypothetical document
        const generateHydePassage = RunnableSequence.from([
            {
                question: (input: string) => ({ question: input })
            },
            promptHyde,
            deterministicLlm,
            (message) => message.content,
            strOutputParser
        ]);

        // Initialize vector store with async client
        const vectorStore = new SupabaseVectorStore(
            embeddings,
            {
                client: await createClient(),
                tableName: "documents",
                queryName: "match_documents"
            }
        );

        // Create retriever instance
        const currentRetriever = retriever(vectorStore);

        // Create HyDE retriever chain
        const hydeRetriever = RunnableSequence.from([
            generateHydePassage,
            currentRetriever
        ]);

        // Retrieve documents using HyDE
        const docs = await hydeRetriever.invoke(getMessageString(lastMessage.content));
        const formattedDocs = formatDocs(docs);

        const summarizationPrompt = ChatPromptTemplate.fromTemplate<{
            docs: string;
            question: string;
        }>(summarizationTemplate);

        // Create summarization chain
        const summarizationChain = RunnableSequence.from([
            {
                docs: (input: { docs: string; question: string }) => input.docs,
                question: (input: { docs: string; question: string }) => input.question
            },
            summarizationPrompt,
            llm,
            (message) => message.content,
            strOutputParser
        ]);

        // Generate summary
        const summary = await summarizationChain.invoke({
            docs: formattedDocs,
            question: getMessageString(lastMessage.content)
        });

        return {
            summarizedDocs: summary
        };
    } catch (error) {
        console.error("Error in retrieveDocs:", error);
        return {
            summarizedDocs: "Error retrieving relevant documents."
        };
    }
}
