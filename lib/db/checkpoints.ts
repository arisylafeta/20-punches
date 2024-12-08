import pg from "pg";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import type { Message } from 'ai';

const { Pool } = pg;
const connectionString = process.env.POSTGRES_DB_URL;

// Initialize PostgreSQL connection pool
const pool = new Pool({
    connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

export const checkpointer = new PostgresSaver(pool);

type CheckpointMessage = {
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

type Checkpoint = {
  v: number;
  id: string;
  ts: string;
  pending_sends: any[];
  versions_seen: Record<string, any>;
  channel_versions: Record<string, number>;
  channel_values: {
    messages: CheckpointMessage[];
    BuffetAgent?: string;
    routingDecision?: string;
  };
}

/**
 * Retrieves previous conversation messages from the checkpoint store.
 * Handles both direct message format and kwargs format from LangChain.
 * 
 * @param conversationId - The ID of the conversation to retrieve
 * @returns An array of messages formatted for the chat UI, or null if not found
 */
export async function getPreviousConversation(conversationId: string): Promise<Message[] | null> {
  const config = {
    configurable: {
      thread_id: conversationId
    }
  };
  
  try {
    const checkpoint = await checkpointer.get(config) as Checkpoint;
    if (!checkpoint) return null;
    
    const messages = (checkpoint.channel_values?.messages || []) as CheckpointMessage[];
    
    return messages.reduce((chatMessages: Array<Message>, message, index) => {
      try {
        // Get content either from direct property or kwargs
        const content = message.content || message.kwargs?.content || '';
        
        // Get message type from constructor name or id
        const type = message.constructor?.name || message.id?.[2] || 'unknown';
        
        chatMessages.push({
          id: `msg_${index}_${Math.random()}`,
          role: type === 'HumanMessage' ? 'user' : 
                type === 'AIMessage' ? 'assistant' : 'system',
          content: String(content)
        });
        
        return chatMessages;
      } catch (err) {
        console.error('Error processing message:', err);
        return chatMessages;
      }
    }, []);
    
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return null;
  }
}
