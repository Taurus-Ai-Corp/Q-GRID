import { sql } from "drizzle-orm";
import { pgTable, text, varchar, numeric, timestamp, jsonb, boolean, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
// Reference: blueprint:javascript_log_in_with_replit
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
// Reference: blueprint:javascript_log_in_with_replit
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cbdcWallets = pgTable("cbdc_wallets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  hederaAccountId: text("hedera_account_id").notNull().unique(),
  publicKey: text("public_key").notNull(),
  balance: numeric("balance", { precision: 20, scale: 8 }).notNull().default("0"),
  offlineBalance: numeric("offline_balance", { precision: 20, scale: 8 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cbdcTransactions = pgTable("cbdc_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  transactionId: text("transaction_id").notNull().unique(),
  senderId: varchar("sender_id").notNull(),
  recipientId: varchar("recipient_id").notNull(),
  amount: numeric("amount", { precision: 20, scale: 8 }).notNull(),
  transactionType: text("transaction_type").notNull(), // 'online' | 'offline' | 'batch_settlement'
  status: text("status").notNull().default("pending"), // 'pending' | 'processing' | 'completed' | 'failed'
  hederaTransactionHash: text("hedera_transaction_hash"),
  x402PaymentHash: text("x402_payment_hash"),
  settlementBatchId: varchar("settlement_batch_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const offlineTransactionBatches = pgTable("offline_transaction_batches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  batchHash: text("batch_hash").notNull().unique(),
  stateChannelId: text("state_channel_id").notNull(),
  transactionCount: numeric("transaction_count").notNull(),
  totalAmount: numeric("total_amount", { precision: 20, scale: 8 }).notNull(),
  settlementStatus: text("settlement_status").notNull().default("pending"), // 'pending' | 'processing' | 'settled'
  hederaSettlementHash: text("hedera_settlement_hash"),
  x402PaymentHash: text("x402_payment_hash"),
  createdAt: timestamp("created_at").defaultNow(),
  settledAt: timestamp("settled_at"),
});

export const x402Payments = pgTable("x402_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  paymentId: text("payment_id").notNull().unique(),
  amount: numeric("amount", { precision: 20, scale: 8 }).notNull(),
  currency: text("currency").notNull(), // 'USDC' | 'USDT' | 'INR'
  status: text("status").notNull().default("pending"), // 'pending' | 'processing' | 'completed' | 'failed'
  recipientAddress: text("recipient_address").notNull(),
  transactionHash: text("transaction_hash"),
  processingFee: numeric("processing_fee", { precision: 20, scale: 8 }),
  netAmount: numeric("net_amount", { precision: 20, scale: 8 }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const kycVerifications = pgTable("kyc_verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  verificationStatus: text("verification_status").notNull().default("pending"), // 'pending' | 'verified' | 'failed'
  aadhaarHash: text("aadhaar_hash"),
  credentialId: text("credential_id"),
  x402PaymentHash: text("x402_payment_hash"),
  verificationType: text("verification_type").notNull(), // 'age_check' | 'address_check' | 'full_kyc'
  createdAt: timestamp("created_at").defaultNow(),
  verifiedAt: timestamp("verified_at"),
});

export const fraudAnalyses = pgTable("fraud_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  analysisId: text("analysis_id").notNull().unique(),
  fileHash: text("file_hash").notNull(),
  analysisType: text("analysis_type").notNull(), // 'deepfake' | 'voice_synthesis' | 'behavioral' | 'combined'
  deepfakeScore: numeric("deepfake_score", { precision: 5, scale: 4 }),
  voiceSynthesisScore: numeric("voice_synthesis_score", { precision: 5, scale: 4 }),
  behavioralScore: numeric("behavioral_score", { precision: 5, scale: 4 }),
  overallRisk: text("overall_risk"), // 'LOW' | 'MEDIUM' | 'HIGH'
  confidence: numeric("confidence", { precision: 5, scale: 4 }),
  x402PaymentHash: text("x402_payment_hash"),
  status: text("status").notNull().default("completed"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Agent Execution Tracking Table
export const agentExecutions = pgTable("agent_executions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  executionId: text("execution_id").notNull().unique(),
  agentName: text("agent_name").notNull(),
  sessionId: text("session_id").notNull(),
  userId: varchar("user_id"),
  hederaAccountId: text("hedera_account_id"),
  network: text("network").notNull().default("testnet"), // 'testnet' | 'mainnet'
  input: jsonb("input"),
  output: jsonb("output"),
  status: text("status").notNull().default("pending"), // 'pending' | 'running' | 'completed' | 'error'
  success: boolean("success"),
  executionTime: numeric("execution_time", { precision: 10, scale: 2 }),
  error: text("error"),
  cost: numeric("cost", { precision: 20, scale: 8 }),
  transactionHash: text("transaction_hash"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
}, (table) => [
  index("IDX_agent_executions_user").on(table.userId),
  index("IDX_agent_executions_agent").on(table.agentName),
  index("IDX_agent_executions_session").on(table.sessionId),
  index("IDX_agent_executions_created").on(table.createdAt),
]);

// Agent Workflow Executions
export const workflowExecutions = pgTable("workflow_executions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workflowId: text("workflow_id").notNull().unique(),
  userId: varchar("user_id"),
  sessionId: text("session_id").notNull(),
  hederaAccountId: text("hedera_account_id"),
  network: text("network").notNull().default("testnet"),
  workflow: jsonb("workflow").notNull(), // Array of workflow steps
  executionSteps: jsonb("execution_steps"), // Array of execution results for each step
  status: text("status").notNull().default("pending"), // 'pending' | 'running' | 'completed' | 'error'
  success: boolean("success"),
  executionTime: numeric("execution_time", { precision: 10, scale: 2 }),
  error: text("error"),
  totalCost: numeric("total_cost", { precision: 20, scale: 8 }),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
}, (table) => [
  index("IDX_workflow_executions_user").on(table.userId),
  index("IDX_workflow_executions_session").on(table.sessionId),
  index("IDX_workflow_executions_created").on(table.createdAt),
]);

// Insert schemas
export const upsertUserSchema = createInsertSchema(users);

export const insertCBDCWalletSchema = createInsertSchema(cbdcWallets).omit({
  id: true,
  createdAt: true,
});

export const insertCBDCTransactionSchema = createInsertSchema(cbdcTransactions).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertOfflineBatchSchema = createInsertSchema(offlineTransactionBatches).omit({
  id: true,
  createdAt: true,
  settledAt: true,
});

export const insertX402PaymentSchema = createInsertSchema(x402Payments).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertKYCVerificationSchema = createInsertSchema(kycVerifications).omit({
  id: true,
  createdAt: true,
  verifiedAt: true,
});

export const insertFraudAnalysisSchema = createInsertSchema(fraudAnalyses).omit({
  id: true,
  createdAt: true,
});

export const insertAgentExecutionSchema = createInsertSchema(agentExecutions).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertWorkflowExecutionSchema = createInsertSchema(workflowExecutions).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;

export type CBDCWallet = typeof cbdcWallets.$inferSelect;
export type InsertCBDCWallet = z.infer<typeof insertCBDCWalletSchema>;

export type CBDCTransaction = typeof cbdcTransactions.$inferSelect;
export type InsertCBDCTransaction = z.infer<typeof insertCBDCTransactionSchema>;

export type OfflineTransactionBatch = typeof offlineTransactionBatches.$inferSelect;
export type InsertOfflineTransactionBatch = z.infer<typeof insertOfflineBatchSchema>;

export type X402Payment = typeof x402Payments.$inferSelect;
export type InsertX402Payment = z.infer<typeof insertX402PaymentSchema>;

export type KYCVerification = typeof kycVerifications.$inferSelect;
export type InsertKYCVerification = z.infer<typeof insertKYCVerificationSchema>;

export type FraudAnalysis = typeof fraudAnalyses.$inferSelect;
export type InsertFraudAnalysis = z.infer<typeof insertFraudAnalysisSchema>;

export type AgentExecution = typeof agentExecutions.$inferSelect;
export type InsertAgentExecution = z.infer<typeof insertAgentExecutionSchema>;

export type WorkflowExecution = typeof workflowExecutions.$inferSelect;
export type InsertWorkflowExecution = z.infer<typeof insertWorkflowExecutionSchema>;
