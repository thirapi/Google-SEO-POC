import { drizzle } from "drizzle-orm/neon-serverless";
import { neon, Pool } from "@neondatabase/serverless";
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!) as unknown as any;

export const db = drizzle(sql, { schema });