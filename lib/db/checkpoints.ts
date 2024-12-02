import pg from "pg";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";

const { Pool } = pg;

const getDbUrlFromSupabase = (dbPassword: string) => {
    return `postgresql://postgres.xqccwxpxzkcgsruxhheg:${dbPassword}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres` 
}

// Create pool using Supabase credentials
const pool = new Pool({
    connectionString: getDbUrlFromSupabase(
        "xB8XDOVnBpwkH6nJ"
    ),
    ssl: {
        rejectUnauthorized: false
    }
});

// Create PostgresSaver instance
const checkpointer = new PostgresSaver(pool);

export { checkpointer };
