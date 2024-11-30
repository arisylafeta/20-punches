import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables";
import { formatDocs } from "./tools";
import { State } from "../../lib/utils/types";
import { getModel } from "../../lib/models";

// Initialize models
const llm = getModel('SMALL');
const deterministicLlm = getModel('SMALL', { temperature: 0 });
const embeddings = getModel('EMBEDDINGS');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_PRIVATE_KEY!;
const supabaseClient = new SupabaseClient(supabaseUrl, supabaseKey);



// Initialize vector store
const vectorStore = new SupabaseVectorStore(
    embeddings,
    {
        client: supabaseClient,
        tableName: "documents",
        queryName: "match_documents"
    }
);

// Create retriever with specific search parameters
const retriever = vectorStore.asRetriever({ k: 5 });

// Define prompt templates
const universalTemplate = `Answer the following question based on this context:

{context}

Question: {question}
`;

const universalPrompt = ChatPromptTemplate.fromTemplate<{
    context: string;
    question: string;
}>(universalTemplate);

const hydeTemplate = `You are Warren Buffet. Answer this question with a passage using your principles: {question}
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

// Create HyDE retriever chain
const hydeRetriever = RunnableSequence.from([
    generateHydePassage,
    retriever
]);

// Complete HyDE RAG chain
const hydeRagChain = RunnableSequence.from([
    {
        hydePassage: generateHydePassage,
        question: new RunnablePassthrough()
    },
    {
        context: async (input: { hydePassage: string; question: string }) => {
            const docs = await hydeRetriever.invoke(input.question);
            return formatDocs(docs);
        },
        question: (input: { hydePassage: string; question: string }) => input.question
    },
    universalPrompt,
    deterministicLlm,
    (message) => message.content,
    strOutputParser
]);

// Function to retrieve and summarize documents
export async function retrieveDocs(state: State): Promise<State> {
    const lastMessage = state.messages.length > 0 ? state.messages[state.messages.length - 1].content : "";
    const retrievedDocs = await hydeRagChain.invoke(lastMessage);

    // Create summarization prompt
    const summarizationTemplate = `Given the following information and the user's question, provide a 300 word summary that is relevant to answering the question, refer to the contextual information and reference the excerpt:
     
    User's question: {question}

    Contextual Information:
    {docs}

    Relevant summary:`;

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
        docs: retrievedDocs,
        question: lastMessage
    });

    return {
        ...state,
        summarizedDocs: summary
    };
}
