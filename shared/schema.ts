import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const emails = pgTable("emails", {
  id: text("id").primaryKey(), // UUID format
  recipient: text("recipient").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  priority: text("priority").default("normal"),
  status: text("status").notNull(), // pending, sent, failed, retry
  provider: text("provider"), // which provider was used
  retryCount: integer("retry_count").default(0),
  maxRetries: integer("max_retries").default(3),
  createdAt: timestamp("created_at").defaultNow(),
  sentAt: timestamp("sent_at"),
  failedAt: timestamp("failed_at"),
  lastError: text("last_error"),
  metadata: jsonb("metadata"), // additional data
});

export const emailLogs = pgTable("email_logs", {
  id: serial("id").primaryKey(),
  emailId: text("email_id").references(() => emails.id),
  level: text("level").notNull(), // info, warn, error, success
  message: text("message").notNull(),
  provider: text("provider"),
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: jsonb("metadata"),
});

export const providerStats = pgTable("provider_stats", {
  id: serial("id").primaryKey(),
  provider: text("provider").notNull(),
  status: text("status").notNull(), // healthy, degraded, down
  successRate: integer("success_rate").default(0), // percentage
  avgLatency: integer("avg_latency").default(0), // milliseconds
  lastChecked: timestamp("last_checked").defaultNow(),
  circuitBreakerState: text("circuit_breaker_state").default("closed"), // closed, open, half-open
});

export const systemStats = pgTable("system_stats", {
  id: serial("id").primaryKey(),
  emailsSentToday: integer("emails_sent_today").default(0),
  successRate: integer("success_rate").default(0), // percentage
  queueSize: integer("queue_size").default(0),
  rateLimitUsage: integer("rate_limit_usage").default(0), // percentage
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Zod schemas
export const insertEmailSchema = createInsertSchema(emails).pick({
  recipient: true,
  subject: true,
  message: true,
  priority: true,
});

export const emailQuerySchema = z.object({
  status: z.string().optional(),
  provider: z.string().optional(),
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0),
});

// Types
export type InsertEmail = z.infer<typeof insertEmailSchema>;
export type Email = typeof emails.$inferSelect;
export type EmailLog = typeof emailLogs.$inferSelect;
export type ProviderStat = typeof providerStats.$inferSelect;
export type SystemStat = typeof systemStats.$inferSelect;
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// API Response types
export type EmailSendResponse = {
  id: string;
  status: string;
  message: string;
};

export type DashboardStats = {
  emailsSentToday: number;
  successRate: number;
  queueSize: number;
  rateLimitUsage: number;
};

export type ProviderStatus = {
  name: string;
  status: string;
  latency: string;
  successRate: string;
  description: string;
};
