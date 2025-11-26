// src/lib/db/index.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// Create the Neon serverless client
const sql = neon(process.env.DATABASE_URL!);

// Pass the schema and the Neon client to Drizzle
export const db = drizzle(sql, { schema });
