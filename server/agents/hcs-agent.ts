/**
 * HCS Agent - Hedera Consensus Service Operations
 * Main agent for topic management and message publishing
 */

import { BaseAgent, BaseSubAgent, AgentConfig, AgentContext, AgentResult, agentRegistry } from './base-agent';

// ============================================
// MAIN AGENT: HCS Agent
// ============================================

interface HCSInput {
  action: 'create-topic' | 'delete-topic' | 'submit-message' | 'get-messages' | 'topic-info';
  topicId?: string;
  message?: string;
  memo?: string;
  submitKey?: boolean;
  adminKey?: boolean;
}

const hcsAgentConfig: AgentConfig = {
  name: 'hcs-agent',
  description: 'Hedera Consensus Service - topic management and message publishing',
  version: '1.0.0',
  capabilities: [
    'create-topic',
    'delete-topic',
    'submit-message',
    'get-topic-messages',
    'get-topic-info',
  ],
  pricing: {
    basePrice: 0.0001,
    currency: 'USD',
    unit: 'per-message',
  },
};

export class HCSAgent extends BaseAgent {
  constructor() {
    super(hcsAgentConfig);
  }

  validate(input: unknown): boolean {
    const data = input as HCSInput;
    if (!data.action) return false;
    if (data.action === 'submit-message' && (!data.topicId || !data.message)) return false;
    if (['delete-topic', 'get-messages', 'topic-info'].includes(data.action) && !data.topicId) return false;
    return true;
  }

  async execute(input: unknown, context: AgentContext): Promise<AgentResult> {
    if (!this.validate(input)) {
      return this.createErrorResult('Invalid input for HCS agent', 0);
    }

    const data = input as HCSInput;
    this.status = 'running';

    try {
      const { result, executionTime } = await this.measureExecution(async () => {
        switch (data.action) {
          case 'create-topic':
            return this.createTopic(data, context);
          case 'delete-topic':
            return this.deleteTopic(data.topicId!);
          case 'submit-message':
            return this.submitMessage(data.topicId!, data.message!);
          case 'get-messages':
            return this.getMessages(data.topicId!);
          case 'topic-info':
            return this.getTopicInfo(data.topicId!);
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

  private async createTopic(data: HCSInput, context: AgentContext) {
    const topicId = `0.0.${Math.floor(Math.random() * 1000000) + 2000000}`;
    return {
      topicId,
      memo: data.memo || '',
      hasSubmitKey: data.submitKey || false,
      hasAdminKey: data.adminKey || false,
      transactionId: `tx_topic_create_${Date.now()}`,
      status: 'SUCCESS',
      createdAt: new Date().toISOString(),
    };
  }

  private async deleteTopic(topicId: string) {
    return {
      topicId,
      transactionId: `tx_topic_delete_${Date.now()}`,
      status: 'SUCCESS',
      deletedAt: new Date().toISOString(),
    };
  }

  private async submitMessage(topicId: string, message: string) {
    const sequenceNumber = Math.floor(Math.random() * 10000);
    return {
      topicId,
      message,
      sequenceNumber,
      runningHash: `hash_${Date.now()}`,
      transactionId: `tx_msg_${Date.now()}`,
      status: 'SUCCESS',
      timestamp: new Date().toISOString(),
    };
  }

  private async getMessages(topicId: string) {
    return {
      topicId,
      messages: [
        { sequenceNumber: 1, message: 'Sample message 1', timestamp: new Date().toISOString() },
        { sequenceNumber: 2, message: 'Sample message 2', timestamp: new Date().toISOString() },
      ],
      count: 2,
      mock: true,
    };
  }

  private async getTopicInfo(topicId: string) {
    return {
      topicId,
      memo: 'Sample Topic',
      runningHash: `hash_${topicId}`,
      sequenceNumber: 100,
      expirationTime: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      mock: true,
    };
  }
}

// ============================================
// SUBAGENT: Topic Manager
// ============================================

const topicManagerConfig: AgentConfig = {
  name: 'topic-manager',
  description: 'Specialized agent for HCS topic lifecycle management',
  version: '1.0.0',
  capabilities: ['create-topic', 'update-topic', 'delete-topic', 'list-topics'],
};

export class TopicManagerAgent extends BaseSubAgent {
  constructor() {
    super(topicManagerConfig, 'hcs-agent', 'topic-management');
  }

  validate(input: unknown): boolean {
    const data = input as { action: string };
    return !!data.action;
  }

  async execute(input: unknown, context: AgentContext): Promise<AgentResult> {
    const data = input as {
      action: 'create' | 'update' | 'delete' | 'list';
      topicId?: string;
      memo?: string;
      submitKey?: boolean;
      adminKey?: boolean;
    };

    this.status = 'running';

    try {
      const { result, executionTime } = await this.measureExecution(async () => {
        switch (data.action) {
          case 'create':
            const topicId = `0.0.${Math.floor(Math.random() * 1000000) + 2000000}`;
            return {
              action: 'created',
              topicId,
              memo: data.memo || '',
              hasSubmitKey: data.submitKey || false,
              hasAdminKey: data.adminKey || false,
              transactionId: `tx_topic_${Date.now()}`,
              status: 'SUCCESS',
            };
          case 'delete':
            return {
              action: 'deleted',
              topicId: data.topicId,
              transactionId: `tx_delete_${Date.now()}`,
              status: 'SUCCESS',
            };
          case 'list':
            return {
              action: 'list',
              topics: [
                { topicId: '0.0.2000001', memo: 'Topic 1' },
                { topicId: '0.0.2000002', memo: 'Topic 2' },
              ],
              count: 2,
            };
          default:
            throw new Error(`Unknown action: ${data.action}`);
        }
      });

      this.status = 'completed';
      return this.createSuccessResult(result, executionTime);
    } catch (error) {
      this.status = 'error';
      return this.createErrorResult(
        error instanceof Error ? error.message : 'Topic operation failed',
        0
      );
    }
  }
}

// ============================================
// SUBAGENT: Message Publisher
// ============================================

const messagePublisherConfig: AgentConfig = {
  name: 'message-publisher',
  description: 'Specialized agent for publishing messages to HCS topics',
  version: '1.0.0',
  capabilities: ['publish-message', 'batch-publish', 'scheduled-publish'],
};

export class MessagePublisherAgent extends BaseSubAgent {
  constructor() {
    super(messagePublisherConfig, 'hcs-agent', 'message-publishing');
  }

  validate(input: unknown): boolean {
    const data = input as { topicId: string; message?: string; messages?: string[] };
    return !!(data.topicId && (data.message || data.messages?.length));
  }

  async execute(input: unknown, context: AgentContext): Promise<AgentResult> {
    const data = input as {
      topicId: string;
      message?: string;
      messages?: string[];
    };

    this.status = 'running';

    try {
      const { result, executionTime } = await this.measureExecution(async () => {
        const messagesToPublish = data.messages || [data.message!];

        const results = messagesToPublish.map((msg, index) => ({
          message: msg,
          sequenceNumber: Date.now() + index,
          transactionId: `tx_msg_${Date.now()}_${index}`,
          status: 'SUCCESS',
          timestamp: new Date().toISOString(),
        }));

        return {
          topicId: data.topicId,
          messagesPublished: results.length,
          results,
          totalCost: results.length * 0.0001,
        };
      });

      this.status = 'completed';
      return this.createSuccessResult(result, executionTime);
    } catch (error) {
      this.status = 'error';
      return this.createErrorResult(
        error instanceof Error ? error.message : 'Message publishing failed',
        0
      );
    }
  }
}

// Register agents
export const hcsAgent = new HCSAgent();
export const topicManagerAgent = new TopicManagerAgent();
export const messagePublisherAgent = new MessagePublisherAgent();

agentRegistry.register(hcsAgent);
agentRegistry.registerSubAgent(topicManagerAgent);
agentRegistry.registerSubAgent(messagePublisherAgent);
