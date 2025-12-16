/**
 * HEDERA Agent Base Classes
 * Foundation for all 24 ML-Agents in Q-GRID
 */

export type AgentStatus = 'idle' | 'running' | 'completed' | 'error';

export interface AgentConfig {
  name: string;
  description: string;
  version: string;
  capabilities: string[];
  pricing?: {
    basePrice: number;
    currency: string;
    unit: string;
  };
}

export interface AgentContext {
  sessionId: string;
  userId?: string;
  hederaAccountId?: string;
  network: 'testnet' | 'mainnet';
  metadata?: Record<string, unknown>;
}

export interface AgentResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  executionTime: number;
  transactionId?: string;
  cost?: number;
}

export interface IAgent {
  config: AgentConfig;
  status: AgentStatus;
  execute(input: unknown, context: AgentContext): Promise<AgentResult>;
  validate(input: unknown): boolean;
  getCapabilities(): string[];
}

export interface ISubAgent extends IAgent {
  parentAgent: string;
  specialization: string;
}

/**
 * Base Agent Class - Foundation for all Hedera agents
 */
export abstract class BaseAgent implements IAgent {
  config: AgentConfig;
  status: AgentStatus = 'idle';

  constructor(config: AgentConfig) {
    this.config = config;
  }

  abstract execute(input: unknown, context: AgentContext): Promise<AgentResult>;

  abstract validate(input: unknown): boolean;

  getCapabilities(): string[] {
    return this.config.capabilities;
  }

  protected async measureExecution<T>(
    fn: () => Promise<T>
  ): Promise<{ result: T; executionTime: number }> {
    const start = Date.now();
    const result = await fn();
    const executionTime = Date.now() - start;
    return { result, executionTime };
  }

  protected createSuccessResult<T>(data: T, executionTime: number, extras?: Partial<AgentResult<T>>): AgentResult<T> {
    return {
      success: true,
      data,
      executionTime,
      ...extras,
    };
  }

  protected createErrorResult(error: string, executionTime: number): AgentResult {
    return {
      success: false,
      error,
      executionTime,
    };
  }
}

/**
 * Base SubAgent Class - Foundation for specialized sub-agents
 */
export abstract class BaseSubAgent extends BaseAgent implements ISubAgent {
  parentAgent: string;
  specialization: string;

  constructor(config: AgentConfig, parentAgent: string, specialization: string) {
    super(config);
    this.parentAgent = parentAgent;
    this.specialization = specialization;
  }
}

/**
 * Agent Registry - Central registry for all agents
 */
export class AgentRegistry {
  private agents: Map<string, IAgent> = new Map();
  private subAgents: Map<string, ISubAgent[]> = new Map();

  register(agent: IAgent): void {
    this.agents.set(agent.config.name, agent);
  }

  registerSubAgent(subAgent: ISubAgent): void {
    const parent = subAgent.parentAgent;
    if (!this.subAgents.has(parent)) {
      this.subAgents.set(parent, []);
    }
    this.subAgents.get(parent)!.push(subAgent);
    this.agents.set(subAgent.config.name, subAgent);
  }

  get(name: string): IAgent | undefined {
    return this.agents.get(name);
  }

  getSubAgents(parentName: string): ISubAgent[] {
    return this.subAgents.get(parentName) || [];
  }

  getAll(): IAgent[] {
    return Array.from(this.agents.values());
  }

  getAllMainAgents(): IAgent[] {
    return Array.from(this.agents.values()).filter(
      (agent) => !(agent as ISubAgent).parentAgent
    );
  }

  getAllSubAgents(): ISubAgent[] {
    return Array.from(this.agents.values()).filter(
      (agent) => (agent as ISubAgent).parentAgent
    ) as ISubAgent[];
  }

  getAgentStats(): {
    total: number;
    mainAgents: number;
    subAgents: number;
    byParent: Record<string, number>;
  } {
    const mainAgents = this.getAllMainAgents();
    const subAgents = this.getAllSubAgents();
    const byParent: Record<string, number> = {};

    for (const [parent, subs] of this.subAgents.entries()) {
      byParent[parent] = subs.length;
    }

    return {
      total: this.agents.size,
      mainAgents: mainAgents.length,
      subAgents: subAgents.length,
      byParent,
    };
  }
}

// Global registry instance
export const agentRegistry = new AgentRegistry();
