// Reference: blueprint:javascript_log_in_with_replit
import {
  type User,
  type UpsertUser,
  type CBDCWallet,
  type InsertCBDCWallet,
  type CBDCTransaction,
  type InsertCBDCTransaction,
  type OfflineTransactionBatch,
  type InsertOfflineTransactionBatch,
  type X402Payment,
  type InsertX402Payment,
  type KYCVerification,
  type InsertKYCVerification,
  type FraudAnalysis,
  type InsertFraudAnalysis,
  type AgentExecution,
  type InsertAgentExecution,
  type WorkflowExecution,
  type InsertWorkflowExecution,
  users,
  cbdcWallets,
  cbdcTransactions,
  offlineTransactionBatches,
  x402Payments,
  kycVerifications,
  fraudAnalyses,
  agentExecutions,
  workflowExecutions,
} from "@shared/schema";
import { db } from "./db";
import { eq, or, gt, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // CBDC Wallet operations
  createCBDCWallet(wallet: InsertCBDCWallet): Promise<CBDCWallet>;
  getCBDCWallet(id: string): Promise<CBDCWallet | undefined>;
  getCBDCWalletByUserId(userId: string): Promise<CBDCWallet | undefined>;
  getCBDCWalletByHederaId(hederaId: string): Promise<CBDCWallet | undefined>;
  updateWalletBalance(walletId: string, balance: string): Promise<CBDCWallet>;
  updateWalletOfflineBalance(walletId: string, offlineBalance: string): Promise<CBDCWallet>;

  // CBDC Transaction operations
  createCBDCTransaction(tx: InsertCBDCTransaction): Promise<CBDCTransaction>;
  getCBDCTransaction(id: string): Promise<CBDCTransaction | undefined>;
  getCBDCTransactionByTxId(txId: string): Promise<CBDCTransaction | undefined>;
  updateTransactionStatus(txId: string, status: string, hederaTxHash?: string): Promise<CBDCTransaction>;
  getTransactionsByUserId(userId: string): Promise<CBDCTransaction[]>;

  // Offline Batch Settlement operations
  createOfflineBatch(batch: InsertOfflineTransactionBatch): Promise<OfflineTransactionBatch>;
  getOfflineBatch(id: string): Promise<OfflineTransactionBatch | undefined>;
  updateBatchSettlementStatus(batchId: string, status: string, hederaTxHash?: string): Promise<OfflineTransactionBatch>;
  getPendingBatches(): Promise<OfflineTransactionBatch[]>;

  // X402 Payment operations
  createX402Payment(payment: InsertX402Payment): Promise<X402Payment>;
  getX402Payment(id: string): Promise<X402Payment | undefined>;
  getX402PaymentByPaymentId(paymentId: string): Promise<X402Payment | undefined>;
  updateX402PaymentStatus(paymentId: string, status: string, txHash?: string): Promise<X402Payment>;

  // KYC Verification operations
  createKYCVerification(kyc: InsertKYCVerification): Promise<KYCVerification>;
  getKYCVerification(id: string): Promise<KYCVerification | undefined>;
  getKYCVerificationByUserId(userId: string): Promise<KYCVerification | undefined>;
  updateKYCVerificationStatus(kycId: string, status: string, credentialId?: string): Promise<KYCVerification>;

  // Fraud Analysis operations
  createFraudAnalysis(analysis: InsertFraudAnalysis): Promise<FraudAnalysis>;
  getFraudAnalysis(id: string): Promise<FraudAnalysis | undefined>;
  getFraudAnalysisByAnalysisId(analysisId: string): Promise<FraudAnalysis | undefined>;

  // Agent Execution operations
  createAgentExecution(execution: InsertAgentExecution): Promise<AgentExecution>;
  getAgentExecution(id: string): Promise<AgentExecution | undefined>;
  getAgentExecutionByExecutionId(executionId: string): Promise<AgentExecution | undefined>;
  updateAgentExecutionStatus(executionId: string, status: string, success: boolean, output?: any, error?: string): Promise<AgentExecution>;
  getAgentExecutionsByUserId(userId: string): Promise<AgentExecution[]>;
  getAgentExecutionsByAgent(agentName: string): Promise<AgentExecution[]>;

  // Workflow Execution operations
  createWorkflowExecution(workflow: InsertWorkflowExecution): Promise<WorkflowExecution>;
  getWorkflowExecution(id: string): Promise<WorkflowExecution | undefined>;
  getWorkflowExecutionByWorkflowId(workflowId: string): Promise<WorkflowExecution | undefined>;
  updateWorkflowExecutionStatus(workflowId: string, status: string, success: boolean, steps?: any, error?: string): Promise<WorkflowExecution>;
  getWorkflowExecutionsByUserId(userId: string): Promise<WorkflowExecution[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // CBDC Wallet operations
  async createCBDCWallet(wallet: InsertCBDCWallet): Promise<CBDCWallet> {
    const [newWallet] = await db.insert(cbdcWallets).values(wallet).returning();
    return newWallet;
  }

  async getCBDCWallet(id: string): Promise<CBDCWallet | undefined> {
    const [wallet] = await db.select().from(cbdcWallets).where(eq(cbdcWallets.id, id));
    return wallet;
  }

  async getCBDCWalletByUserId(userId: string): Promise<CBDCWallet | undefined> {
    const [wallet] = await db.select().from(cbdcWallets).where(eq(cbdcWallets.userId, userId));
    return wallet;
  }

  async getCBDCWalletByHederaId(hederaId: string): Promise<CBDCWallet | undefined> {
    const [wallet] = await db.select().from(cbdcWallets).where(eq(cbdcWallets.hederaAccountId, hederaId));
    return wallet;
  }

  async updateWalletBalance(walletId: string, balance: string): Promise<CBDCWallet> {
    const [wallet] = await db
      .update(cbdcWallets)
      .set({ balance })
      .where(eq(cbdcWallets.id, walletId))
      .returning();
    if (!wallet) throw new Error("Wallet not found");
    return wallet;
  }

  async updateWalletOfflineBalance(walletId: string, offlineBalance: string): Promise<CBDCWallet> {
    const [wallet] = await db
      .update(cbdcWallets)
      .set({ offlineBalance })
      .where(eq(cbdcWallets.id, walletId))
      .returning();
    if (!wallet) throw new Error("Wallet not found");
    return wallet;
  }

  // CBDC Transaction operations
  async createCBDCTransaction(tx: InsertCBDCTransaction): Promise<CBDCTransaction> {
    const [transaction] = await db.insert(cbdcTransactions).values(tx).returning();
    return transaction;
  }

  async getCBDCTransaction(id: string): Promise<CBDCTransaction | undefined> {
    const [transaction] = await db.select().from(cbdcTransactions).where(eq(cbdcTransactions.id, id));
    return transaction;
  }

  async getCBDCTransactionByTxId(txId: string): Promise<CBDCTransaction | undefined> {
    const [transaction] = await db.select().from(cbdcTransactions).where(eq(cbdcTransactions.transactionId, txId));
    return transaction;
  }

  async updateTransactionStatus(
    txId: string,
    status: string,
    hederaTxHash?: string
  ): Promise<CBDCTransaction> {
    const updateData: any = { status };
    if (hederaTxHash) updateData.hederaTransactionHash = hederaTxHash;
    if (status === "completed") updateData.completedAt = new Date();

    const [transaction] = await db
      .update(cbdcTransactions)
      .set(updateData)
      .where(eq(cbdcTransactions.transactionId, txId))
      .returning();
    if (!transaction) throw new Error("Transaction not found");
    return transaction;
  }

  async getTransactionsByUserId(userId: string): Promise<CBDCTransaction[]> {
    const transactions = await db
      .select()
      .from(cbdcTransactions)
      .where(or(eq(cbdcTransactions.senderId, userId), eq(cbdcTransactions.recipientId, userId)));
    return transactions;
  }

  // Offline Batch Settlement operations
  async createOfflineBatch(batch: InsertOfflineTransactionBatch): Promise<OfflineTransactionBatch> {
    const [newBatch] = await db.insert(offlineTransactionBatches).values(batch).returning();
    return newBatch;
  }

  async getOfflineBatch(id: string): Promise<OfflineTransactionBatch | undefined> {
    const [batch] = await db.select().from(offlineTransactionBatches).where(eq(offlineTransactionBatches.id, id));
    return batch;
  }

  async updateBatchSettlementStatus(
    batchId: string,
    status: string,
    hederaTxHash?: string
  ): Promise<OfflineTransactionBatch> {
    const updateData: any = { settlementStatus: status };
    if (hederaTxHash) updateData.hederaSettlementHash = hederaTxHash;
    if (status === "settled") updateData.settledAt = new Date();

    const [batch] = await db
      .update(offlineTransactionBatches)
      .set(updateData)
      .where(eq(offlineTransactionBatches.id, batchId))
      .returning();
    if (!batch) throw new Error("Batch not found");
    return batch;
  }

  async getPendingBatches(): Promise<OfflineTransactionBatch[]> {
    const batches = await db
      .select()
      .from(offlineTransactionBatches)
      .where(eq(offlineTransactionBatches.settlementStatus, "pending"));
    return batches;
  }

  // X402 Payment operations
  async createX402Payment(payment: InsertX402Payment): Promise<X402Payment> {
    const [newPayment] = await db.insert(x402Payments).values(payment).returning();
    return newPayment;
  }

  async getX402Payment(id: string): Promise<X402Payment | undefined> {
    const [payment] = await db.select().from(x402Payments).where(eq(x402Payments.id, id));
    return payment;
  }

  async getX402PaymentByPaymentId(paymentId: string): Promise<X402Payment | undefined> {
    const [payment] = await db.select().from(x402Payments).where(eq(x402Payments.paymentId, paymentId));
    return payment;
  }

  async updateX402PaymentStatus(
    paymentId: string,
    status: string,
    txHash?: string
  ): Promise<X402Payment> {
    const updateData: any = { status };
    if (txHash) updateData.transactionHash = txHash;
    if (status === "completed") updateData.completedAt = new Date();

    const [payment] = await db
      .update(x402Payments)
      .set(updateData)
      .where(eq(x402Payments.paymentId, paymentId))
      .returning();
    if (!payment) throw new Error("Payment not found");
    return payment;
  }

  // KYC Verification operations
  async createKYCVerification(kyc: InsertKYCVerification): Promise<KYCVerification> {
    const [verification] = await db.insert(kycVerifications).values(kyc).returning();
    return verification;
  }

  async getKYCVerification(id: string): Promise<KYCVerification | undefined> {
    const [verification] = await db.select().from(kycVerifications).where(eq(kycVerifications.id, id));
    return verification;
  }

  async getKYCVerificationByUserId(userId: string): Promise<KYCVerification | undefined> {
    const [verification] = await db.select().from(kycVerifications).where(eq(kycVerifications.userId, userId));
    return verification;
  }

  async updateKYCVerificationStatus(
    kycId: string,
    status: string,
    credentialId?: string
  ): Promise<KYCVerification> {
    const updateData: any = { verificationStatus: status };
    if (credentialId) updateData.credentialId = credentialId;
    if (status === "verified") updateData.verifiedAt = new Date();

    const [verification] = await db
      .update(kycVerifications)
      .set(updateData)
      .where(eq(kycVerifications.id, kycId))
      .returning();
    if (!verification) throw new Error("KYC verification not found");
    return verification;
  }

  // Fraud Analysis operations
  async createFraudAnalysis(analysis: InsertFraudAnalysis): Promise<FraudAnalysis> {
    const [newAnalysis] = await db.insert(fraudAnalyses).values(analysis).returning();
    return newAnalysis;
  }

  async getFraudAnalysis(id: string): Promise<FraudAnalysis | undefined> {
    const [analysis] = await db.select().from(fraudAnalyses).where(eq(fraudAnalyses.id, id));
    return analysis;
  }

  async getFraudAnalysisByAnalysisId(analysisId: string): Promise<FraudAnalysis | undefined> {
    const [analysis] = await db.select().from(fraudAnalyses).where(eq(fraudAnalyses.analysisId, analysisId));
    return analysis;
  }

  // Additional fraud analysis query methods

  async getRecentTransactions(userId: string, hoursAgo: number): Promise<CBDCTransaction[]> {
    const cutoffTime = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
    return db
      .select()
      .from(cbdcTransactions)
      .where(
        and(
          eq(cbdcTransactions.senderId, userId),
          gt(cbdcTransactions.createdAt, cutoffTime)
        )
      )
      .orderBy(desc(cbdcTransactions.createdAt));
  }

  async getUserTransactionStats(userId: string): Promise<{
    totalTransactions: number;
    avgAmount: string;
    uniqueRecipients: number;
  }> {
    const transactions = await this.getTransactionsByUserId(userId);

    const total = transactions.length;
    const sum = transactions.reduce((acc, tx) => acc + parseFloat(tx.amount), 0);
    const avg = total > 0 ? (sum / total).toFixed(8) : "0";
    const uniqueRecipients = new Set(transactions.map(tx => tx.recipientId)).size;

    return {
      totalTransactions: total,
      avgAmount: avg,
      uniqueRecipients,
    };
  }
}

export const storage = new DatabaseStorage();
