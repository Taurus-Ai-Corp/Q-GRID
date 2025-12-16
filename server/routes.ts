import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { cachedStorage } from "./services/cached-storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { randomUUID } from "crypto";
import { getAllAgents, executeAgent, getAgentNames, hasAgent, agentRegistry, getAgentStats } from "./agents";
import { analyzeFraudPatterns } from "./fraud-detector";

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

  // Fraud Detection Analysis with Real Pattern Analysis (protected)
  app.post("/api/fraud/analyze", isAuthenticated, async (req: any, res) => {
    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/b80fd094-512e-4e48-b4fb-d00c68e5e41a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run2',hypothesisId:'A',location:'routes.ts:fraud:entry',message:'/api/fraud/analyze called',data:{bodyKeys:Object.keys(req.body||{}),hasUserId:!!req.body?.userId,hasTransactionId:!!req.body?.transactionId,authSubPresent:!!req.user?.claims?.sub},timestamp:Date.now()})}).catch(()=>{});
      // #endregion

      const { userId, transactionId } = req.body;
      const authenticatedUserId = req.user.claims.sub;

      // Use authenticated user ID as fallback if userId/transactionId not provided
      if (!userId && !transactionId && !authenticatedUserId) {
        return res.status(400).json({ error: "userId or transactionId required" });
      }

      // Get user ID from transaction if provided, otherwise use userId or authenticatedUserId
      let targetUserId = userId || authenticatedUserId;

      if (!targetUserId) {
        return res.status(400).json({ error: "Unable to determine user ID. Please provide userId or transactionId, or ensure you are authenticated." });
      }

      if (transactionId) {
        const transaction = await storage.getCBDCTransactionByTxId(transactionId);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/b80fd094-512e-4e48-b4fb-d00c68e5e41a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run2',hypothesisId:'B',location:'routes.ts:fraud:tx-lookup',message:'transactionId lookup completed',data:{transactionId,found:!!transaction,senderId:transaction?.senderId},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        if (!transaction) {
          return res.status(404).json({ error: "Transaction not found" });
        }
        targetUserId = transaction.senderId;
      }

      // Get data for analysis (using cached storage for performance)
      let transactions, recentTxs, wallet;
      try {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/b80fd094-512e-4e48-b4fb-d00c68e5e41a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run2',hypothesisId:'C',location:'routes.ts:fraud:data-fetch:start',message:'Fetching transactions/recentTxs/wallet',data:{targetUserId,via:'cachedStorage'},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        [transactions, recentTxs, wallet] = await Promise.all([
          cachedStorage.getTransactionsByUserId(targetUserId),
          cachedStorage.getRecentTransactions(targetUserId, 24),
          cachedStorage.getCBDCWalletByUserId(targetUserId),
        ]);
      } catch (cacheError) {
        console.error("Error fetching data from cached storage:", cacheError);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/b80fd094-512e-4e48-b4fb-d00c68e5e41a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run2',hypothesisId:'C',location:'routes.ts:fraud:data-fetch:cache-error',message:'cachedStorage fetch failed; falling back to storage',data:{targetUserId,cacheError:cacheError instanceof Error ? cacheError.message : String(cacheError)},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        // Fallback to direct storage if cache fails
        [transactions, recentTxs, wallet] = await Promise.all([
          storage.getTransactionsByUserId(targetUserId),
          storage.getRecentTransactions(targetUserId, 24),
          storage.getCBDCWalletByUserId(targetUserId),
        ]);
      }

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/b80fd094-512e-4e48-b4fb-d00c68e5e41a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run2',hypothesisId:'C',location:'routes.ts:fraud:data-fetch:done',message:'Data fetched',data:{transactionCount:Array.isArray(transactions)?transactions.length:null,recentTxCount:Array.isArray(recentTxs)?recentTxs.length:null,hasWallet:!!wallet},timestamp:Date.now()})}).catch(()=>{});
      // #endregion

      // Run fraud detection analysis
      const fraudAnalysis = await analyzeFraudPatterns({
        userId: targetUserId,
        transactionId,
        transactions,
        recentTransactions: recentTxs,
        wallet,
      });

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/b80fd094-512e-4e48-b4fb-d00c68e5e41a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run2',hypothesisId:'D',location:'routes.ts:fraud:analysis',message:'Fraud analysis computed',data:{overallRisk:fraudAnalysis?.overallRisk,riskScore:fraudAnalysis?.riskScore,confidence:fraudAnalysis?.confidence},timestamp:Date.now()})}).catch(()=>{});
      // #endregion

      // Create analysis ID
      const analysisId = `fraud_${randomUUID().slice(0, 12)}`;

      // Store analysis (using cached storage)
      const analysis = await cachedStorage.createFraudAnalysis({
        analysisId,
        fileHash: transactionId || `user_${targetUserId}`,
        analysisType: "behavioral",
        deepfakeScore: "0",
        voiceSynthesisScore: "0",
        behavioralScore: (fraudAnalysis.riskScore / 100).toString(),
        overallRisk: fraudAnalysis.overallRisk,
        confidence: fraudAnalysis.confidence.toString(),
        x402PaymentHash: undefined,
        status: "completed",
      });

      // Process X402 payment for fraud analysis
      const paymentId = `x402_fraud_${randomUUID().slice(0, 12)}`;
      const mockTxHash = `0x${randomUUID().replace(/-/g, "").slice(0, 64)}`;

      const payment = await storage.createX402Payment({
        paymentId,
        amount: "0.01",
        currency: "USDC",
        status: "completed",
        recipientAddress: "0.0.456789",
        transactionHash: mockTxHash,
        metadata: {
          paymentType: "fraud_analysis",
          userId: targetUserId,
          transactionId,
          riskLevel: fraudAnalysis.overallRisk,
        },
      });

      res.status(201).json({
        success: true,
        analysis,
        payment,
        fraudDetection: {
          ...fraudAnalysis,
          analysisId,
          userId: targetUserId,
          transactionId,
          processingTime: "1.25 seconds",
          settlementTime: "2 seconds",
        },
      });
    } catch (error) {
      console.error("Fraud analysis error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      // Log detailed error for debugging
      console.error("Error details:", {
        message: errorMessage,
        stack: errorStack,
        name: error instanceof Error ? error.name : typeof error,
      });

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/b80fd094-512e-4e48-b4fb-d00c68e5e41a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run2',hypothesisId:'E',location:'routes.ts:fraud:catch',message:'Handler threw error',data:{errorMessage,errorName:error instanceof Error ? error.name : typeof error},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      
      res.status(500).json({
        error: "Fraud analysis failed",
        message: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { stack: errorStack }),
      });
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

  // ============================================
  // CACHE MANAGEMENT API ROUTES
  // ============================================

  // Get cache statistics (public)
  app.get("/api/cache/stats", async (req, res) => {
    try {
      const stats = cachedStorage.getCacheStats();
      res.json({
        success: true,
        usingRedis: cachedStorage.isUsingRedis(),
        stats,
      });
    } catch (error) {
      console.error("Error fetching cache stats:", error);
      res.status(500).json({ error: "Failed to fetch cache stats" });
    }
  });

  // ============================================
  // HEDERA AGENT ORCHESTRATION API ROUTES
  // ============================================

  // Get all agents (public)
  app.get("/api/agents", async (req, res) => {
    try {
      const agents = getAllAgents();
      res.json({
        success: true,
        ...agents,
      });
    } catch (error) {
      console.error("Error fetching agents:", error);
      res.status(500).json({ error: "Failed to fetch agents" });
    }
  });

  // Get agent stats (public)
  app.get("/api/agents/stats", async (req, res) => {
    try {
      const stats = getAgentStats();
      res.json({
        success: true,
        stats,
      });
    } catch (error) {
      console.error("Error fetching agent stats:", error);
      res.status(500).json({ error: "Failed to fetch agent stats" });
    }
  });

  // Get agent names (public)
  app.get("/api/agents/names", async (req, res) => {
    try {
      const names = getAgentNames();
      res.json({
        success: true,
        agents: names,
        count: names.length,
      });
    } catch (error) {
      console.error("Error fetching agent names:", error);
      res.status(500).json({ error: "Failed to fetch agent names" });
    }
  });

  // Get specific agent info (public)
  app.get("/api/agents/:agentName", async (req, res) => {
    try {
      const { agentName } = req.params;
      const agent = agentRegistry.get(agentName);

      if (!agent) {
        return res.status(404).json({ error: `Agent not found: ${agentName}` });
      }

      const isSubAgent = 'parentAgent' in agent;

      res.json({
        success: true,
        agent: {
          name: agent.config.name,
          description: agent.config.description,
          version: agent.config.version,
          capabilities: agent.getCapabilities(),
          pricing: agent.config.pricing,
          status: agent.status,
          type: isSubAgent ? 'subagent' : 'main',
          ...(isSubAgent && {
            parentAgent: (agent as any).parentAgent,
            specialization: (agent as any).specialization,
          }),
        },
      });
    } catch (error) {
      console.error("Error fetching agent:", error);
      res.status(500).json({ error: "Failed to fetch agent" });
    }
  });

  // Execute agent (protected)
  app.post("/api/agents/:agentName/execute", isAuthenticated, async (req: any, res) => {
    try {
      const { agentName } = req.params;
      const { input, hederaAccountId, network } = req.body;

      if (!hasAgent(agentName)) {
        return res.status(404).json({ error: `Agent not found: ${agentName}` });
      }

      const userId = req.user?.claims?.sub;
      const sessionId = `session_${randomUUID().slice(0, 12)}`;

      const result = await executeAgent(agentName, input || {}, {
        sessionId,
        userId,
        hederaAccountId,
        network: network || 'testnet',
      });

      // Store execution record
      const executionId = `exec_${randomUUID().slice(0, 12)}`;

      res.json({
        success: result.success,
        executionId,
        agentName,
        result,
        context: {
          sessionId,
          userId,
          network: network || 'testnet',
          executedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Agent execution error:", error);
      res.status(500).json({ error: "Agent execution failed" });
    }
  });

  // Execute workflow (protected)
  app.post("/api/agents/workflow/execute", isAuthenticated, async (req: any, res) => {
    try {
      const { workflow, hederaAccountId, network } = req.body;

      if (!workflow || !Array.isArray(workflow) || workflow.length === 0) {
        return res.status(400).json({ error: "Workflow must be a non-empty array of steps" });
      }

      const userId = req.user?.claims?.sub;
      const sessionId = `session_${randomUUID().slice(0, 12)}`;
      const workflowId = `wf_${randomUUID().slice(0, 12)}`;

      const context = {
        sessionId,
        userId,
        hederaAccountId,
        network: network || 'testnet',
      };

      // Execute coordinator agent with workflow
      const coordinatorResult = await executeAgent('coordinator-agent', {
        action: 'execute-workflow',
        workflow,
      }, context);

      res.json({
        success: coordinatorResult.success,
        workflowId,
        result: coordinatorResult,
        context: {
          sessionId,
          userId,
          network: network || 'testnet',
          executedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Workflow execution error:", error);
      res.status(500).json({ error: "Workflow execution failed" });
    }
  });

  // Plan task (protected)
  app.post("/api/agents/plan", isAuthenticated, async (req: any, res) => {
    try {
      const { task, constraints } = req.body;

      if (!task) {
        return res.status(400).json({ error: "Task description is required" });
      }

      const userId = req.user?.claims?.sub;
      const sessionId = `session_${randomUUID().slice(0, 12)}`;

      const result = await executeAgent('task-planner', {
        task,
        constraints,
      }, {
        sessionId,
        userId,
        network: 'testnet',
      });

      res.json({
        success: result.success,
        plan: result.data,
        executionTime: result.executionTime,
      });
    } catch (error) {
      console.error("Task planning error:", error);
      res.status(500).json({ error: "Task planning failed" });
    }
  });

  // Parallel execute multiple agents (protected)
  app.post("/api/agents/parallel", isAuthenticated, async (req: any, res) => {
    try {
      const { agentCalls, hederaAccountId, network } = req.body;

      if (!agentCalls || !Array.isArray(agentCalls) || agentCalls.length === 0) {
        return res.status(400).json({ error: "agentCalls must be a non-empty array" });
      }

      const userId = req.user?.claims?.sub;
      const sessionId = `session_${randomUUID().slice(0, 12)}`;

      const context = {
        sessionId,
        userId,
        hederaAccountId,
        network: network || 'testnet',
      };

      const result = await executeAgent('coordinator-agent', {
        action: 'parallel-execute',
        agentCalls,
      }, context);

      res.json({
        success: result.success,
        result: result.data,
        executionTime: result.executionTime,
      });
    } catch (error) {
      console.error("Parallel execution error:", error);
      res.status(500).json({ error: "Parallel execution failed" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
