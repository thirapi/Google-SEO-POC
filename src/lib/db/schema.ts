import { pgTable, varchar, timestamp, uuid, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const domainVerificationTable = pgTable("domain_verification", {
  id: uuid("id").defaultRandom().primaryKey(),
  domain: varchar("domain", { length: 255 }).notNull(),
  token: varchar("token", { length: 255 }).notNull(),
  content: varchar("content", { length: 512 }).notNull(), 
  is_verified: boolean("is_verified").default(false).notNull(),
  created_at: timestamp("created_at").default(sql`now()`).notNull(),
  verified_at: timestamp("verified_at"), 
});
