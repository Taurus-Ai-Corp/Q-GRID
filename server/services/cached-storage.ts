/**
 * Cached Storage Service
 *
 * Wraps the database storage with caching for high-frequency queries.
 * Provides transparent caching with automatic invalidation.
 *
 * Cached operations:
 * - Transaction history (60s TTL)
 * - Recent transactions (30s TTL)
 * - User transaction stats (120s TTL)
 * - Wallet data (60s TTL)
 * - Fraud analysis results (300s TTL)
 */

import { storage, DatabaseStorage } from '../storage';
import {
  getCache,
  CacheService,
  CACHE_KEYS,
  CACHE_TTLS,
} from './cache';
import type {
  CBDCTransaction,
  CBDCWallet,
  FraudAnalysis,
  InsertCBDCTransaction,
  InsertFraudAnalysis,
} from '@shared/schema';

// ============================================
// CACHED STORAGE CLASS
// ============================================

export class CachedStorage {
  private cache: CacheService;
  private db: DatabaseStorage;

  constructor() {
    this.cache = getCache();
    this.db = storage;
  }

  // ============================================
  // TRANSACTION QUERIES (Cached)
  // ============================================

  /**
   * Get all transactions for a user (cached)
   */
  async getTransactionsByUserId(userId: string): Promise<CBDCTransaction[]> {
    const cacheKey = CacheService.key(CACHE_KEYS.TRANSACTIONS, userId, 'all');

    return this.cache.getOrSet(
      cacheKey,
      () => this.db.getTransactionsByUserId(userId),
      CACHE_TTLS.TRANSACTION_HISTORY,
      [`user:${userId}`, CACHE_KEYS.TRANSACTIONS]
    );
  }

  /**
   * Get recent transactions for a user (cached, shorter TTL)
   */
  async getRecentTransactions(userId: string, hoursAgo: number): Promise<CBDCTransaction[]> {
    const cacheKey = CacheService.key(CACHE_KEYS.RECENT_TX, userId, hoursAgo);

    return this.cache.getOrSet(
      cacheKey,
      () => this.db.getRecentTransactions(userId, hoursAgo),
      CACHE_TTLS.RECENT_TRANSACTIONS,
      [`user:${userId}`, CACHE_KEYS.RECENT_TX]
    );
  }

  /**
   * Get user transaction statistics (cached)
   */
  async getUserTransactionStats(userId: string): Promise<{
    totalTransactions: number;
    avgAmount: string;
    uniqueRecipients: number;
  }> {
    const cacheKey = CacheService.key(CACHE_KEYS.USER_STATS, userId);

    return this.cache.getOrSet(
      cacheKey,
      () => this.db.getUserTransactionStats(userId),
      CACHE_TTLS.USER_STATS,
      [`user:${userId}`, CACHE_KEYS.USER_STATS]
    );
  }

  /**
   * Get transaction by ID (cached)
   */
  async getCBDCTransactionByTxId(txId: string): Promise<CBDCTransaction | undefined> {
    const cacheKey = CacheService.key(CACHE_KEYS.TRANSACTIONS, 'tx', txId);

    const cached = await this.cache.get<CBDCTransaction>(cacheKey);
    if (cached) return cached;

    const transaction = await this.db.getCBDCTransactionByTxId(txId);
    if (transaction) {
      await this.cache.set(
        cacheKey,
        transaction,
        CACHE_TTLS.TRANSACTION_HISTORY,
        [CACHE_KEYS.TRANSACTIONS, `user:${transaction.senderId}`]
      );
    }
    return transaction;
  }

  /**
   * Create a new transaction (invalidates cache)
   */
  async createCBDCTransaction(tx: InsertCBDCTransaction): Promise<CBDCTransaction> {
    const transaction = await this.db.createCBDCTransaction(tx);

    // Invalidate affected caches
    await Promise.all([
      this.cache.invalidateByPattern(`${CACHE_KEYS.TRANSACTIONS}:${tx.senderId}:*`),
      this.cache.invalidateByPattern(`${CACHE_KEYS.RECENT_TX}:${tx.senderId}:*`),
      this.cache.invalidateByPattern(`${CACHE_KEYS.USER_STATS}:${tx.senderId}:*`),
      this.cache.invalidateByPattern(`${CACHE_KEYS.TRANSACTIONS}:${tx.recipientId}:*`),
      this.cache.invalidateByPattern(`${CACHE_KEYS.RECENT_TX}:${tx.recipientId}:*`),
      this.cache.invalidateByPattern(`${CACHE_KEYS.USER_STATS}:${tx.recipientId}:*`),
    ]);

    return transaction;
  }

  /**
   * Update transaction status (invalidates cache)
   */
  async updateTransactionStatus(
    txId: string,
    status: string,
    hederaTxHash?: string
  ): Promise<CBDCTransaction> {
    const transaction = await this.db.updateTransactionStatus(txId, status, hederaTxHash);

    // Invalidate transaction cache
    await this.cache.delete(CacheService.key(CACHE_KEYS.TRANSACTIONS, 'tx', txId));
    await this.cache.invalidateByTag(`user:${transaction.senderId}`);

    return transaction;
  }

  // ============================================
  // WALLET QUERIES (Cached)
  // ============================================

  /**
   * Get wallet by user ID (cached)
   */
  async getCBDCWalletByUserId(userId: string): Promise<CBDCWallet | undefined> {
    const cacheKey = CacheService.key(CACHE_KEYS.WALLET, userId);

    const cached = await this.cache.get<CBDCWallet>(cacheKey);
    if (cached) return cached;

    const wallet = await this.db.getCBDCWalletByUserId(userId);
    if (wallet) {
      await this.cache.set(
        cacheKey,
        wallet,
        CACHE_TTLS.WALLET_DATA,
        [`user:${userId}`, CACHE_KEYS.WALLET]
      );
    }
    return wallet;
  }

  /**
   * Get wallet by ID (cached)
   */
  async getCBDCWallet(id: string): Promise<CBDCWallet | undefined> {
    const cacheKey = CacheService.key(CACHE_KEYS.WALLET, 'id', id);

    const cached = await this.cache.get<CBDCWallet>(cacheKey);
    if (cached) return cached;

    const wallet = await this.db.getCBDCWallet(id);
    if (wallet) {
      await this.cache.set(
        cacheKey,
        wallet,
        CACHE_TTLS.WALLET_DATA,
        [CACHE_KEYS.WALLET, `user:${wallet.userId}`]
      );
    }
    return wallet;
  }

  /**
   * Update wallet balance (invalidates cache)
   */
  async updateWalletBalance(walletId: string, balance: string): Promise<CBDCWallet> {
    const wallet = await this.db.updateWalletBalance(walletId, balance);

    // Invalidate wallet caches
    await Promise.all([
      this.cache.delete(CacheService.key(CACHE_KEYS.WALLET, 'id', walletId)),
      this.cache.delete(CacheService.key(CACHE_KEYS.WALLET, wallet.userId)),
    ]);

    return wallet;
  }

  /**
   * Update wallet offline balance (invalidates cache)
   */
  async updateWalletOfflineBalance(walletId: string, offlineBalance: string): Promise<CBDCWallet> {
    const wallet = await this.db.updateWalletOfflineBalance(walletId, offlineBalance);

    // Invalidate wallet caches
    await Promise.all([
      this.cache.delete(CacheService.key(CACHE_KEYS.WALLET, 'id', walletId)),
      this.cache.delete(CacheService.key(CACHE_KEYS.WALLET, wallet.userId)),
    ]);

    return wallet;
  }

  // ============================================
  // FRAUD ANALYSIS (Cached)
  // ============================================

  /**
   * Get fraud analysis by ID (cached)
   */
  async getFraudAnalysisByAnalysisId(analysisId: string): Promise<FraudAnalysis | undefined> {
    const cacheKey = CacheService.key(CACHE_KEYS.FRAUD, analysisId);

    const cached = await this.cache.get<FraudAnalysis>(cacheKey);
    if (cached) return cached;

    const analysis = await this.db.getFraudAnalysisByAnalysisId(analysisId);
    if (analysis) {
      await this.cache.set(cacheKey, analysis, CACHE_TTLS.FRAUD_ANALYSIS, [CACHE_KEYS.FRAUD]);
    }
    return analysis;
  }

  /**
   * Create fraud analysis (cache the result)
   */
  async createFraudAnalysis(analysis: InsertFraudAnalysis): Promise<FraudAnalysis> {
    const result = await this.db.createFraudAnalysis(analysis);

    // Cache the new analysis
    await this.cache.set(
      CacheService.key(CACHE_KEYS.FRAUD, result.analysisId),
      result,
      CACHE_TTLS.FRAUD_ANALYSIS,
      [CACHE_KEYS.FRAUD]
    );

    return result;
  }

  // ============================================
  // CACHE MANAGEMENT
  // ============================================

  /**
   * Invalidate all caches for a user
   */
  async invalidateUserCache(userId: string): Promise<void> {
    await this.cache.invalidateUser(userId);
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats();
  }

  /**
   * Check if Redis is being used
   */
  isUsingRedis(): boolean {
    return this.cache.isUsingRedis();
  }

  // ============================================
  // PASS-THROUGH METHODS (Non-cached)
  // ============================================

  // These methods are less frequently called or involve writes
  // that need immediate consistency

  getUser(id: string) {
    return this.db.getUser(id);
  }

  upsertUser(userData: Parameters<typeof this.db.upsertUser>[0]) {
    return this.db.upsertUser(userData);
  }

  createCBDCWallet(wallet: Parameters<typeof this.db.createCBDCWallet>[0]) {
    return this.db.createCBDCWallet(wallet);
  }

  getCBDCWalletByHederaId(hederaId: string) {
    return this.db.getCBDCWalletByHederaId(hederaId);
  }

  getCBDCTransaction(id: string) {
    return this.db.getCBDCTransaction(id);
  }

  createOfflineBatch(batch: Parameters<typeof this.db.createOfflineBatch>[0]) {
    return this.db.createOfflineBatch(batch);
  }

  getOfflineBatch(id: string) {
    return this.db.getOfflineBatch(id);
  }

  updateBatchSettlementStatus(
    batchId: string,
    status: string,
    hederaTxHash?: string
  ) {
    return this.db.updateBatchSettlementStatus(batchId, status, hederaTxHash);
  }

  getPendingBatches() {
    return this.db.getPendingBatches();
  }

  createX402Payment(payment: Parameters<typeof this.db.createX402Payment>[0]) {
    return this.db.createX402Payment(payment);
  }

  getX402Payment(id: string) {
    return this.db.getX402Payment(id);
  }

  getX402PaymentByPaymentId(paymentId: string) {
    return this.db.getX402PaymentByPaymentId(paymentId);
  }

  updateX402PaymentStatus(paymentId: string, status: string, txHash?: string) {
    return this.db.updateX402PaymentStatus(paymentId, status, txHash);
  }

  createKYCVerification(kyc: Parameters<typeof this.db.createKYCVerification>[0]) {
    return this.db.createKYCVerification(kyc);
  }

  getKYCVerification(id: string) {
    return this.db.getKYCVerification(id);
  }

  getKYCVerificationByUserId(userId: string) {
    return this.db.getKYCVerificationByUserId(userId);
  }

  updateKYCVerificationStatus(kycId: string, status: string, credentialId?: string) {
    return this.db.updateKYCVerificationStatus(kycId, status, credentialId);
  }

  getFraudAnalysis(id: string) {
    return this.db.getFraudAnalysis(id);
  }
}

// Singleton instance
let cachedStorageInstance: CachedStorage | null = null;

/**
 * Get the cached storage singleton
 */
export function getCachedStorage(): CachedStorage {
  if (!cachedStorageInstance) {
    cachedStorageInstance = new CachedStorage();
  }
  return cachedStorageInstance;
}

// Export for use in routes
export const cachedStorage = getCachedStorage();
