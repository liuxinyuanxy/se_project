import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from 'server/schema';

const sql = neon(process.env.DATABASE_URL!);

const dbSingleton = () => {
    return drizzle(sql, { schema });
}

const dbGlobal = global as typeof global & {
    db: ReturnType<typeof dbSingleton> | undefined;
}

export const db = dbGlobal.db ?? dbSingleton();