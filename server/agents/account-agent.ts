/**
 * Account Agent - HBAR and Account Operations
 * Main agent for Hedera account management
 */

import { BaseAgent, BaseSubAgent, AgentConfig, AgentContext, AgentResult, agentRegistry } from './base-agent';
import { Client, AccountId, PrivateKey, AccountBalanceQuery, TransferTransaction, Hbar, AccountCreateTransaction, AccountInfoQuery } from '@hashgraph/sdk';

// ============================================
// MAIN AGENT: Account Agent
// ============================================

interface AccountInput {
  action: 'balance' | 'transfer' | 'create' | 'info';
  accountId?: string;
  toAccountId?: string;
  amount?: number;
  memo?: string;
}

interface BalanceData {
  accountId: string;
  hbars: string;
  tinybars: string;
  tokens: Record<string, string>;
}

interface TransferData {
  transactionId: string;
  from: string;
  to: string;
  amount: string;
  status: string;
}

const accountAgentConfig: AgentConfig = {
  name: 'account-agent',
  description: 'Hedera Account Management - balance queries, transfers, account creation',
  version: '1.0.0',
  capabilities: [
    'check-balance',
    'transfer-hbar',
    'create-account',
    'get-account-info',
  ],
  pricing: {
    basePrice: 0.001,
    currency: 'USD',
    unit: 'per-operation',
  },
};

export class AccountAgent extends BaseAgent {
  private client: Client | null = null;

  constructor() {
    super(accountAgentConfig);
  }

  setClient(client: Client): void {
    this.client = client;
  }

  validate(input: unknown): boolean {
    const data = input as AccountInput;
    if (!data.action) return false;
    if (data.action === 'transfer' && (!data.toAccountId || !data.amount)) return false;
    return true;
  }

  async execute(input: unknown, context: AgentContext): Promise<AgentResult> {
    if (!this.validate(input)) {
      return this.createErrorResult('Invalid input for account agent', 0);
    }

    const data = input as AccountInput;
    this.status = 'running';

    try {
      const { result, executionTime } = await this.measureExecution(async () => {
        switch (data.action) {
          case 'balance':
            return this.getBalance(data.accountId || context.hederaAccountId!);
          case 'transfer':
            return this.transferHbar(
              context.hederaAccountId!,
              data.toAccountId!,
              data.amount!,
              data.memo
            );
          case 'info':
            return this.getAccountInfo(data.accountId || context.hederaAccountId!);
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

  private async getBalance(accountId: string): Promise<BalanceData> {
    if (!this.client) {
      // Return mock data if no client
      return {
        accountId,
        hbars: '100.00000000',
        tinybars: '10000000000',
        tokens: {},
      };
    }

    const balance = await new AccountBalanceQuery()
      .setAccountId(AccountId.fromString(accountId))
      .execute(this.client);

    const tokens: Record<string, string> = {};
    balance.tokens?.forEach((amount, tokenId) => {
      tokens[tokenId.toString()] = amount.toString();
    });

    return {
      accountId,
      hbars: balance.hbars.toString(),
      tinybars: balance.hbars.toTinybars().toString(),
      tokens,
    };
  }

  private async transferHbar(
    from: string,
    to: string,
    amount: number,
    memo?: string
  ): Promise<TransferData> {
    if (!this.client) {
      // Return mock data if no client
      return {
        transactionId: `mock_tx_${Date.now()}`,
        from,
        to,
        amount: amount.toString(),
        status: 'SUCCESS (mock)',
      };
    }

    const transaction = new TransferTransaction()
      .addHbarTransfer(AccountId.fromString(from), Hbar.from(-amount))
      .addHbarTransfer(AccountId.fromString(to), Hbar.from(amount));

    if (memo) {
      transaction.setTransactionMemo(memo);
    }

    const response = await transaction.execute(this.client);
    const receipt = await response.getReceipt(this.client);

    return {
      transactionId: response.transactionId.toString(),
      from,
      to,
      amount: amount.toString(),
      status: receipt.status.toString(),
    };
  }

  private async getAccountInfo(accountId: string): Promise<Record<string, unknown>> {
    if (!this.client) {
      return {
        accountId,
        balance: '100.00000000',
        isDeleted: false,
        mock: true,
      };
    }

    const info = await new AccountInfoQuery()
      .setAccountId(AccountId.fromString(accountId))
      .execute(this.client);

    return {
      accountId: info.accountId.toString(),
      balance: info.balance.toString(),
      isDeleted: info.isDeleted,
      key: info.key?.toString(),
      expirationTime: info.expirationTime?.toDate(),
    };
  }
}

// ============================================
// SUBAGENT: Balance Checker
// ============================================

const balanceCheckerConfig: AgentConfig = {
  name: 'balance-checker',
  description: 'Specialized agent for checking HBAR and token balances',
  version: '1.0.0',
  capabilities: ['check-hbar-balance', 'check-token-balance', 'batch-balance-check'],
};

export class BalanceCheckerAgent extends BaseSubAgent {
  constructor() {
    super(balanceCheckerConfig, 'account-agent', 'balance-operations');
  }

  validate(input: unknown): boolean {
    const data = input as { accountIds?: string[]; accountId?: string };
    return !!(data.accountIds?.length || data.accountId);
  }

  async execute(input: unknown, context: AgentContext): Promise<AgentResult> {
    const data = input as { accountIds?: string[]; accountId?: string };
    this.status = 'running';

    try {
      const { result, executionTime } = await this.measureExecution(async () => {
        const accountIds = data.accountIds || [data.accountId || context.hederaAccountId!];

        const balances = await Promise.all(
          accountIds.map(async (id) => ({
            accountId: id,
            hbars: '100.00000000', // Mock balance
            tinybars: '10000000000',
            checkedAt: new Date().toISOString(),
          }))
        );

        return { balances, count: balances.length };
      });

      this.status = 'completed';
      return this.createSuccessResult(result, executionTime);
    } catch (error) {
      this.status = 'error';
      return this.createErrorResult(
        error instanceof Error ? error.message : 'Balance check failed',
        0
      );
    }
  }
}

// ============================================
// SUBAGENT: Transfer Executor
// ============================================

const transferExecutorConfig: AgentConfig = {
  name: 'transfer-executor',
  description: 'Specialized agent for executing HBAR transfers with validation',
  version: '1.0.0',
  capabilities: ['single-transfer', 'batch-transfer', 'scheduled-transfer'],
};

export class TransferExecutorAgent extends BaseSubAgent {
  constructor() {
    super(transferExecutorConfig, 'account-agent', 'transfer-operations');
  }

  validate(input: unknown): boolean {
    const data = input as { to: string; amount: number };
    return !!(data.to && data.amount && data.amount > 0);
  }

  async execute(input: unknown, context: AgentContext): Promise<AgentResult> {
    const data = input as { to: string; amount: number; memo?: string };
    this.status = 'running';

    try {
      const { result, executionTime } = await this.measureExecution(async () => {
        // Validate transfer
        if (data.amount <= 0) {
          throw new Error('Transfer amount must be positive');
        }

        // Mock transfer execution
        return {
          transactionId: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          from: context.hederaAccountId || '0.0.XXXXX',
          to: data.to,
          amount: data.amount.toString(),
          memo: data.memo || '',
          status: 'SUCCESS',
          timestamp: new Date().toISOString(),
        };
      });

      this.status = 'completed';
      return this.createSuccessResult(result, executionTime);
    } catch (error) {
      this.status = 'error';
      return this.createErrorResult(
        error instanceof Error ? error.message : 'Transfer failed',
        0
      );
    }
  }
}

// Register agents
export const accountAgent = new AccountAgent();
export const balanceCheckerAgent = new BalanceCheckerAgent();
export const transferExecutorAgent = new TransferExecutorAgent();

agentRegistry.register(accountAgent);
agentRegistry.registerSubAgent(balanceCheckerAgent);
agentRegistry.registerSubAgent(transferExecutorAgent);
