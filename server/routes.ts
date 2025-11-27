import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";
import { 
  insertCBDCTransactionSchema, 
  insertX402PaymentSchema, 
  insertOfflineBatchSchema,
  insertKYCVerificationSchema,
  insertFraudAnalysisSchema,
  insertCBDCWalletSchema
} from "@shared/schema";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth
  // Reference: blueprint:javascript_log_in_with_replit
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      // Disable caching - always return fresh data
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // CBDC Payment Transfer Endpoint (protected)
  app.post("/api/cbdc/transfer", isAuthenticated, async (req: any, res) => {
    try {
      const { senderId, recipientId, amount, transactionType, hederaAccountId } = req.body;

      // Validation
      if (!senderId || !recipientId || !amount) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Generate transaction ID
      const transactionId = `tx_${randomUUID().slice(0, 12)}`;

      // Create CBDC transaction
      const transaction = await storage.createCBDCTransaction({
        transactionId,
        senderId,
        recipientId,
        amount: amount.toString(),
        transactionType: transactionType || "online",
        status: "pending",
        metadata: { hederaAccountId },
      });

      // For offline transactions, update wallet offline balance
      if (transactionType === "offline") {
        const senderWallet = await storage.getCBDCWalletByUserId(senderId);
        if (senderWallet) {
          const newOfflineBalance = (BigInt(senderWallet.offlineBalance || "0") - BigInt(Math.floor(amount * 100000000))).toString();
          await storage.updateWalletOfflineBalance(senderWallet.id, newOfflineBalance);
        }
      }

      res.status(201).json({
        success: true,
        transaction,
        message: `${transactionType === "offline" ? "Offline" : "Online"} CBDC transfer initiated`,
      });
    } catch (error) {
      console.error("Transfer error:", error);
      res.status(500).json({ error: "Transfer failed" });
    }
  });

  // X402 Payment Processing Endpoint
  app.post("/api/x402/process", async (req, res) => {
    try {
      const { amount, currency, recipientAddress, paymentType, metadata } = req.body;

      if (!amount || !currency || !recipientAddress) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const paymentId = `x402_${randomUUID().slice(0, 12)}`;

      // Calculate processing fee (0.1% for USDC, scaled)
      const feePercentage = currency === "USDC" ? 0.001 : currency === "USDT" ? 0.001 : 0.01;
      const processingFee = parseFloat(amount) * feePercentage;
      const netAmount = parseFloat(amount) - processingFee;

      // Create X402 payment record
      const payment = await storage.createX402Payment({
        paymentId,
        amount: amount.toString(),
        currency,
        status: "processing",
        recipientAddress,
        processingFee: processingFee.toString(),
        netAmount: netAmount.toString(),
        metadata: {
          paymentType, // 'kyc_verification' | 'fraud_analysis' | 'batch_settlement' | 'cbdc_transfer'
          ...metadata,
        },
      });

      // Simulate Hedera settlement (mock transaction hash)
      const mockTxHash = `0x${randomUUID().replace(/-/g, "").slice(0, 64)}`;

      // Update payment status to completed
      const completedPayment = await storage.updateX402PaymentStatus(paymentId, "completed", mockTxHash);

      res.status(201).json({
        success: true,
        payment: completedPayment,
        settlement: {
          network: "hedera",
          transactionHash: mockTxHash,
          confirmations: 1,
          settlementTime: "2 seconds",
        },
      });
    } catch (error) {
      console.error("X402 payment error:", error);
      res.status(500).json({ error: "Payment processing failed" });
    }
  });

  // Offline CBDC Batch Settlement Endpoint
  app.post("/api/cbdc/settle-batch", async (req, res) => {
    try {
      const { stateChannelId, transactions, totalAmount } = req.body;

      if (!stateChannelId || !transactions || !totalAmount) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Create batch settlement
      const batchHash = `batch_${randomUUID().slice(0, 12)}`;
      const batch = await storage.createOfflineBatch({
        batchHash,
        stateChannelId,
        transactionCount: transactions.length.toString(),
        totalAmount: totalAmount.toString(),
        settlementStatus: "processing",
      });

      // Process X402 payment for batch settlement
      const paymentId = `x402_batch_${randomUUID().slice(0, 12)}`;
      const batchFee = parseFloat(totalAmount) * 0.0001; // 0.01% batch fee

      const payment = await storage.createX402Payment({
        paymentId,
        amount: totalAmount.toString(),
        currency: "USDC",
        status: "processing",
        recipientAddress: "0.0.789012", // Settlement wallet
        processingFee: batchFee.toString(),
        netAmount: (parseFloat(totalAmount) - batchFee).toString(),
        metadata: {
          paymentType: "batch_settlement",
          transactionCount: transactions.length,
          stateChannelId,
        },
      });

      // Simulate Hedera settlement
      const mockSettlementHash = `0x${randomUUID().replace(/-/g, "").slice(0, 64)}`;

      // Update batch settlement status
      const settledBatch = await storage.updateBatchSettlementStatus(batch.id, "settled", mockSettlementHash);
      await storage.updateX402PaymentStatus(paymentId, "completed", mockSettlementHash);

      res.status(201).json({
        success: true,
        batch: settledBatch,
        payment,
        settlement: {
          network: "hedera",
          transactionHash: mockSettlementHash,
          transactionCount: transactions.length,
          totalAmount,
          settlementTime: "2 seconds",
          costPerTransaction: (batchFee / transactions.length).toFixed(8),
        },
      });
    } catch (error) {
      console.error("Batch settlement error:", error);
      res.status(500).json({ error: "Batch settlement failed" });
    }
  });

  // KYC Verification with X402 Payment (protected)
  app.post("/api/kyc/verify", isAuthenticated, async (req: any, res) => {
    try {
      const { userId, verificationType } = req.body;

      if (!userId || !verificationType) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Create KYC verification record
      const kyc = await storage.createKYCVerification({
        userId,
        verificationType,
        verificationStatus: "pending",
      });

      // Process X402 payment for KYC (₹0.15 = ~$0.0018 in USDC)
      const verificationFees: Record<string, number> = {
        age_check: 0.0001,
        address_check: 0.0005,
        full_kyc: 0.0015,
      };

      const fee = verificationFees[verificationType] || 0.0015;
      const paymentId = `x402_kyc_${randomUUID().slice(0, 12)}`;

      const payment = await storage.createX402Payment({
        paymentId,
        amount: fee.toString(),
        currency: "USDC",
        status: "processing",
        recipientAddress: "0.0.123456", // KYC service wallet
        metadata: {
          paymentType: "kyc_verification",
          verificationType,
          userId,
        },
      });

      // Simulate payment completion
      const mockTxHash = `0x${randomUUID().replace(/-/g, "").slice(0, 64)}`;
      await storage.updateX402PaymentStatus(paymentId, "completed", mockTxHash);

      // Update KYC status to verified
      const verifiedKyc = await storage.updateKYCVerificationStatus(
        kyc.id,
        "verified",
        `did:hedera:mainnet:${randomUUID().slice(0, 8)}`
      );

      res.status(201).json({
        success: true,
        kyc: verifiedKyc,
        payment,
        verification: {
          status: "verified",
          credentialId: verifiedKyc.credentialId,
          processingTime: "87 seconds",
          settlementTime: "2 seconds",
        },
      });
    } catch (error) {
      console.error("KYC verification error:", error);
      res.status(500).json({ error: "KYC verification failed" });
    }
  });

  // Fraud Detection Analysis with X402 Payment (protected)
  app.post("/api/fraud/analyze", isAuthenticated, async (req: any, res) => {
    try {
      const { fileHash, analysisType } = req.body;

      if (!fileHash || !analysisType) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const analysisId = `fraud_${randomUUID().slice(0, 12)}`;

      // Process X402 payment for fraud analysis ($0.01 = ₹0.80)
      const paymentId = `x402_fraud_${randomUUID().slice(0, 12)}`;

      const payment = await storage.createX402Payment({
        paymentId,
        amount: "0.01", // $0.01 USDC
        currency: "USDC",
        status: "processing",
        recipientAddress: "0.0.456789", // Fraud detection service wallet
        metadata: {
          paymentType: "fraud_analysis",
          analysisType,
          fileHash,
        },
      });

      // Simulate payment completion
      const mockTxHash = `0x${randomUUID().replace(/-/g, "").slice(0, 64)}`;
      await storage.updateX402PaymentStatus(paymentId, "completed", mockTxHash);

      // Create fraud analysis with mock scores
      const analysis = await storage.createFraudAnalysis({
        analysisId,
        fileHash,
        analysisType,
        deepfakeScore: "0.15", // 15% deepfake probability
        voiceSynthesisScore: "0.08",
        behavioralScore: "0.22",
        overallRisk: "LOW",
        confidence: "0.9973",
        x402PaymentHash: mockTxHash,
        status: "completed",
      });

      res.status(201).json({
        success: true,
        analysis,
        payment,
        fraudDetection: {
          analysisId,
          deepfakeScore: 0.15,
          voiceSynthesisScore: 0.08,
          behavioralScore: 0.22,
          overallRisk: "LOW",
          confidence: 0.9973,
          processingTime: "1.25 seconds",
          settlementTime: "2 seconds",
        },
      });
    } catch (error) {
      console.error("Fraud analysis error:", error);
      res.status(500).json({ error: "Fraud analysis failed" });
    }
  });

  // Create CBDC Wallet (protected)
  app.post("/api/cbdc/wallet", isAuthenticated, async (req: any, res) => {
    try {
      const { userId, hederaAccountId, publicKey } = req.body;

      if (!userId || !hederaAccountId || !publicKey) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const wallet = await storage.createCBDCWallet({
        userId,
        hederaAccountId,
        publicKey,
      });

      res.status(201).json({ success: true, wallet });
    } catch (error) {
      console.error("Wallet creation error:", error);
      res.status(500).json({ error: "Wallet creation failed" });
    }
  });

  // Get Wallet Balance (protected)
  app.get("/api/cbdc/wallet/:walletId", isAuthenticated, async (req: any, res) => {
    try {
      const wallet = await storage.getCBDCWallet(req.params.walletId);

      if (!wallet) {
        return res.status(404).json({ error: "Wallet not found" });
      }

      res.json({
        success: true,
        wallet,
        balances: {
          online: wallet.balance,
          offline: wallet.offlineBalance,
          total: (BigInt(wallet.balance || "0") + BigInt(wallet.offlineBalance || "0")).toString(),
        },
      });
    } catch (error) {
      console.error("Wallet retrieval error:", error);
      res.status(500).json({ error: "Failed to retrieve wallet" });
    }
  });

  // Get Transaction History (protected)
  app.get("/api/cbdc/transactions/:userId", isAuthenticated, async (req: any, res) => {
    try {
      const transactions = await storage.getTransactionsByUserId(req.params.userId);

      res.json({
        success: true,
        transactions,
        count: transactions.length,
      });
    } catch (error) {
      console.error("Transaction retrieval error:", error);
      res.status(500).json({ error: "Failed to retrieve transactions" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
