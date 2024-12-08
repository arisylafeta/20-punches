import pg from "pg";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";

const { Pool } = pg;
const connectionString = process.env.POSTGRES_DB_URL;

// Create pool using Supabase credentials
const pool = new Pool({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});
export const checkpointer = new PostgresSaver(pool);
