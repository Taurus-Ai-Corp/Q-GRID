/**
 * HTS Agent - Hedera Token Service Operations
 * Main agent for token creation, management, and airdrops
 */

import { BaseAgent, BaseSubAgent, AgentConfig, AgentContext, AgentResult, agentRegistry } from './base-agent';

// ============================================
// MAIN AGENT: HTS Agent
// ============================================

interface HTSInput {
  action: 'create' | 'mint' | 'burn' | 'transfer' | 'associate' | 'airdrop' | 'info';
  tokenName?: string;
  tokenSymbol?: string;
  initialSupply?: number;
  decimals?: number;
  tokenId?: string;
  amount?: number;
  toAccountId?: string;
  recipients?: Array<{ accountId: string; amount: number }>;
  tokenType?: 'fungible' | 'nft';
}

const htsAgentConfig: AgentConfig = {
  name: 'hts-agent',
  description: 'Hedera Token Service - create, manage, and transfer tokens (fungible & NFT)',
  version: '1.0.0',
  capabilities: [
    'create-fungible-token',
    'create-nft',
    'mint-tokens',
    'burn-tokens',
    'transfer-tokens',
    'associate-token',
    'airdrop-tokens',
  ],
  pricing: {
    basePrice: 0.01,
    currency: 'USD',
    unit: 'per-token-operation',
  },
};

export class HTSAgent extends BaseAgent {
  constructor() {
    super(htsAgentConfig);
  }

  validate(input: unknown): boolean {
    const data = input as HTSInput;
    if (!data.action) return false;
    if (data.action === 'create' && (!data.tokenName || !data.tokenSymbol)) return false;
    if (data.action === 'transfer' && (!data.tokenId || !data.toAccountId || !data.amount)) return false;
    if (data.action === 'airdrop' && (!data.tokenId || !data.recipients?.length)) return false;
    return true;
  }

  async execute(input: unknown, context: AgentContext): Promise<AgentResult> {
    if (!this.validate(input)) {
      return this.createErrorResult('Invalid input for HTS agent', 0);
    }

    const data = input as HTSInput;
    this.status = 'running';

    try {
      const { result, executionTime } = await this.measureExecution(async () => {
        switch (data.action) {
          case 'create':
            return this.createToken(data, context);
          case 'mint':
            return this.mintTokens(data.tokenId!, data.amount!);
          case 'burn':
            return this.burnTokens(data.tokenId!, data.amount!);
          case 'transfer':
            return this.transferTokens(data.tokenId!, data.toAccountId!, data.amount!);
          case 'associate':
            return this.associateToken(data.tokenId!, context.hederaAccountId!);
          case 'airdrop':
            return this.airdropTokens(data.tokenId!, data.recipients!);
          case 'info':
            return this.getTokenInfo(data.tokenId!);
          default:
            throw new Error(`Unknown action: ${data.action}`);
        }
      });

      this.status = 'completed';
      return this.createSuccessResult(result, executionTime);
    } catch (error) {
      this.status = 'error';
      return this.createErrorResult(
        error instanceof Error ? error.message : 'Unknown error',
        0
      );
    }
  }

  private async createToken(data: HTSInput, context: AgentContext) {
    const tokenId = `0.0.${Math.floor(Math.random() * 1000000) + 1000000}`;
    return {
      tokenId,
      name: data.tokenName,
      symbol: data.tokenSymbol,
      decimals: data.decimals || 8,
      initialSupply: data.initialSupply || 0,
      tokenType: data.tokenType || 'fungible',
      treasury: context.hederaAccountId,
      transactionId: `tx_create_${Date.now()}`,
      status: 'SUCCESS',
      createdAt: new Date().toISOString(),
    };
  }

  private async mintTokens(tokenId: string, amount: number) {
    return {
      tokenId,
      mintedAmount: amount,
      transactionId: `tx_mint_${Date.now()}`,
      status: 'SUCCESS',
    };
  }

  private async burnTokens(tokenId: string, amount: number) {
    return {
      tokenId,
      burnedAmount: amount,
      transactionId: `tx_burn_${Date.now()}`,
      status: 'SUCCESS',
    };
  }

  private async transferTokens(tokenId: string, toAccountId: string, amount: number) {
    return {
      tokenId,
      to: toAccountId,
      amount,
      transactionId: `tx_transfer_${Date.now()}`,
      status: 'SUCCESS',
    };
  }

  private async associateToken(tokenId: string, accountId: string) {
    return {
      tokenId,
      accountId,
      transactionId: `tx_associate_${Date.now()}`,
      status: 'SUCCESS',
    };
  }

  private async airdropTokens(tokenId: string, recipients: Array<{ accountId: string; amount: number }>) {
    const results = recipients.map((r, i) => ({
      recipient: r.accountId,
      amount: r.amount,
      transactionId: `tx_airdrop_${Date.now()}_${i}`,
      status: 'SUCCESS',
    }));

    return {
      tokenId,
      totalRecipients: recipients.length,
      totalAmount: recipients.reduce((sum, r) => sum + r.amount, 0),
      results,
    };
  }

  private async getTokenInfo(tokenId: string) {
    return {
      tokenId,
      name: 'Sample Token',
      symbol: 'SMPL',
      decimals: 8,
      totalSupply: '1000000000000000',
      treasury: '0.0.12345',
      mock: true,
    };
  }
}

// ============================================
// SUBAGENT: Token Creator
// ============================================

const tokenCreatorConfig: AgentConfig = {
  name: 'token-creator',
  description: 'Specialized agent for creating fungible tokens and NFTs with advanced options',
  version: '1.0.0',
  capabilities: ['create-fungible', 'create-nft', 'configure-keys', 'set-fees'],
};

export class TokenCreatorAgent extends BaseSubAgent {
  constructor() {
    super(tokenCreatorConfig, 'hts-agent', 'token-creation');
  }

  validate(input: unknown): boolean {
    const data = input as { name: string; symbol: string };
    return !!(data.name && data.symbol);
  }

  async execute(input: unknown, context: AgentContext): Promise<AgentResult> {
    const data = input as {
      name: string;
      symbol: string;
      decimals?: number;
      initialSupply?: number;
      tokenType?: 'fungible' | 'nft';
      maxSupply?: number;
      freezeDefault?: boolean;
    };

    this.status = 'running';

    try {
      const { result, executionTime } = await this.measureExecution(async () => {
        const tokenId = `0.0.${Math.floor(Math.random() * 1000000) + 1000000}`;

        return {
          tokenId,
          name: data.name,
          symbol: data.symbol,
          decimals: data.tokenType === 'nft' ? 0 : (data.decimals || 8),
          initialSupply: data.initialSupply || 0,
          maxSupply: data.maxSupply,
          tokenType: data.tokenType || 'fungible',
          freezeDefault: data.freezeDefault || false,
          treasury: context.hederaAccountId,
          transactionId: `tx_create_${Date.now()}`,
          status: 'SUCCESS',
          network: context.network,
          createdAt: new Date().toISOString(),
        };
      });

      this.status = 'completed';
      return this.createSuccessResult(result, executionTime);
    } catch (error) {
      this.status = 'error';
      return this.createErrorResult(
        error instanceof Error ? error.message : 'Token creation failed',
        0
      );
    }
  }
}

// ============================================
// SUBAGENT: Airdrop Manager
// ============================================

const airdropManagerConfig: AgentConfig = {
  name: 'airdrop-manager',
  description: 'Specialized agent for managing token airdrops with batching and validation',
  version: '1.0.0',
  capabilities: ['batch-airdrop', 'validate-recipients', 'calculate-fees', 'schedule-airdrop'],
};

export class AirdropManagerAgent extends BaseSubAgent {
  constructor() {
    super(airdropManagerConfig, 'hts-agent', 'airdrop-operations');
  }

  validate(input: unknown): boolean {
    const data = input as { tokenId: string; recipients: Array<{ accountId: string; amount: number }> };
    return !!(data.tokenId && data.recipients?.length > 0);
  }

  async execute(input: unknown, context: AgentContext): Promise<AgentResult> {
    const data = input as {
      tokenId: string;
      recipients: Array<{ accountId: string; amount: number }>;
      batchSize?: number;
    };

    this.status = 'running';

    try {
      const { result, executionTime } = await this.measureExecution(async () => {
        const batchSize = data.batchSize || 10;
        const batches: Array<Array<{ accountId: string; amount: number }>> = [];

        for (let i = 0; i < data.recipients.length; i += batchSize) {
          batches.push(data.recipients.slice(i, i + batchSize));
        }

        const batchResults = batches.map((batch, index) => ({
          batchNumber: index + 1,
          recipients: batch.length,
          totalAmount: batch.reduce((sum, r) => sum + r.amount, 0),
          transactionId: `tx_airdrop_batch_${Date.now()}_${index}`,
          status: 'SUCCESS',
        }));

        return {
          tokenId: data.tokenId,
          totalRecipients: data.recipients.length,
          totalAmount: data.recipients.reduce((sum, r) => sum + r.amount, 0),
          batchCount: batches.length,
          batchSize,
          batches: batchResults,
          estimatedFees: data.recipients.length * 0.0001,
          completedAt: new Date().toISOString(),
        };
      });

      this.status = 'completed';
      return this.createSuccessResult(result, executionTime);
    } catch (error) {
      this.status = 'error';
      return this.createErrorResult(
        error instanceof Error ? error.message : 'Airdrop failed',
        0
      );
    }
  }
}

// Register agents
export const htsAgent = new HTSAgent();
export const tokenCreatorAgent = new TokenCreatorAgent();
export const airdropManagerAgent = new AirdropManagerAgent();

agentRegistry.register(htsAgent);
agentRegistry.registerSubAgent(tokenCreatorAgent);
agentRegistry.registerSubAgent(airdropManagerAgent);
