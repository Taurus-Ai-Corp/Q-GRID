/**
 * Coordinator Agent - Multi-Agent Orchestration
 * Main agent for coordinating complex multi-agent workflows
 */

import { BaseAgent, BaseSubAgent, AgentConfig, AgentContext, AgentResult, agentRegistry, IAgent } from './base-agent';

// ============================================
// MAIN AGENT: Coordinator Agent
// ============================================

interface CoordinatorInput {
  action: 'execute-workflow' | 'plan-task' | 'aggregate-results' | 'parallel-execute';
  workflow?: WorkflowStep[];
  task?: string;
  agentCalls?: Array<{ agentName: string; input: unknown }>;
  results?: AgentResult[];
}

interface WorkflowStep {
  agentName: string;
  input: unknown;
  dependsOn?: string[];
  condition?: string;
}

const coordinatorAgentConfig: AgentConfig = {
  name: 'coordinator-agent',
  description: 'Multi-Agent Orchestration - coordinate complex workflows across agents',
  version: '1.0.0',
  capabilities: [
    'execute-workflow',
    'plan-complex-task',
    'parallel-execution',
    'result-aggregation',
    'error-recovery',
    'workflow-optimization',
  ],
  pricing: {
    basePrice: 0.005,
    currency: 'USD',
    unit: 'per-workflow',
  },
};

export class CoordinatorAgent extends BaseAgent {
  constructor() {
    super(coordinatorAgentConfig);
  }

  validate(input: unknown): boolean {
    const data = input as CoordinatorInput;
    if (!data.action) return false;
    if (data.action === 'execute-workflow' && !data.workflow?.length) return false;
    if (data.action === 'plan-task' && !data.task) return false;
    if (data.action === 'parallel-execute' && !data.agentCalls?.length) return false;
    if (data.action === 'aggregate-results' && !data.results?.length) return false;
    return true;
  }

  async execute(input: unknown, context: AgentContext): Promise<AgentResult> {
    if (!this.validate(input)) {
      return this.createErrorResult('Invalid input for coordinator agent', 0);
    }

    const data = input as CoordinatorInput;
    this.status = 'running';

    try {
      const { result, executionTime } = await this.measureExecution(async () => {
        switch (data.action) {
          case 'execute-workflow':
            return this.executeWorkflow(data.workflow!, context);
          case 'plan-task':
            return this.planTask(data.task!);
          case 'parallel-execute':
            return this.parallelExecute(data.agentCalls!, context);
          case 'aggregate-results':
            return this.aggregateResults(data.results!);
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

  private async executeWorkflow(workflow: WorkflowStep[], context: AgentContext) {
    const results: Array<{
      step: number;
      agentName: string;
      success: boolean;
      data?: unknown;
      error?: string;
      executionTime: number;
    }> = [];

    for (let i = 0; i < workflow.length; i++) {
      const step = workflow[i];
      const agent = agentRegistry.get(step.agentName);

      if (!agent) {
        results.push({
          step: i + 1,
          agentName: step.agentName,
          success: false,
          error: `Agent not found: ${step.agentName}`,
          executionTime: 0,
        });
        continue;
      }

      const stepResult = await agent.execute(step.input, context);
      results.push({
        step: i + 1,
        agentName: step.agentName,
        success: stepResult.success,
        data: stepResult.data,
        error: stepResult.error,
        executionTime: stepResult.executionTime,
      });

      if (!stepResult.success) {
        break; // Stop workflow on error
      }
    }

    const totalTime = results.reduce((sum, r) => sum + r.executionTime, 0);
    const successCount = results.filter((r) => r.success).length;

    return {
      workflowId: `wf_${Date.now()}`,
      totalSteps: workflow.length,
      completedSteps: successCount,
      success: successCount === workflow.length,
      results,
      totalExecutionTime: totalTime,
      completedAt: new Date().toISOString(),
    };
  }

  private async planTask(task: string) {
    // AI-powered task planning (mock implementation)
    const suggestedWorkflow: WorkflowStep[] = [];

    // Simple keyword-based planning
    const taskLower = task.toLowerCase();

    if (taskLower.includes('token') && taskLower.includes('create')) {
      suggestedWorkflow.push({
        agentName: 'hts-agent',
        input: { action: 'create', tokenName: 'New Token', tokenSymbol: 'NEW' },
      });
    }

    if (taskLower.includes('transfer')) {
      suggestedWorkflow.push({
        agentName: 'account-agent',
        input: { action: 'balance' },
      });
      suggestedWorkflow.push({
        agentName: 'transfer-executor',
        input: { to: '0.0.XXXXX', amount: 1 },
      });
    }

    if (taskLower.includes('balance') || taskLower.includes('check')) {
      suggestedWorkflow.push({
        agentName: 'balance-checker',
        input: {},
      });
    }

    if (suggestedWorkflow.length === 0) {
      suggestedWorkflow.push({
        agentName: 'query-agent',
        input: { action: 'network-info' },
      });
    }

    return {
      task,
      analysis: 'Task analyzed and workflow generated',
      suggestedWorkflow,
      estimatedCost: suggestedWorkflow.length * 0.001,
      estimatedTime: suggestedWorkflow.length * 500,
      confidence: 0.85,
    };
  }

  private async parallelExecute(
    agentCalls: Array<{ agentName: string; input: unknown }>,
    context: AgentContext
  ) {
    const startTime = Date.now();

    const results = await Promise.all(
      agentCalls.map(async (call) => {
        const agent = agentRegistry.get(call.agentName);
        if (!agent) {
          return {
            agentName: call.agentName,
            success: false,
            error: `Agent not found: ${call.agentName}`,
            executionTime: 0,
          };
        }

        const result = await agent.execute(call.input, context);
        return {
          agentName: call.agentName,
          success: result.success,
          data: result.data,
          error: result.error,
          executionTime: result.executionTime,
        };
      })
    );

    const parallelTime = Date.now() - startTime;
    const successCount = results.filter((r) => r.success).length;

    return {
      type: 'parallel-execution',
      totalAgents: agentCalls.length,
      successCount,
      failureCount: agentCalls.length - successCount,
      results,
      parallelExecutionTime: parallelTime,
      averageAgentTime: parallelTime / agentCalls.length,
    };
  }

  private async aggregateResults(results: AgentResult[]) {
    const successResults = results.filter((r) => r.success);
    const failedResults = results.filter((r) => !r.success);
    const totalTime = results.reduce((sum, r) => sum + r.executionTime, 0);

    return {
      type: 'aggregated-results',
      total: results.length,
      successful: successResults.length,
      failed: failedResults.length,
      successRate: (successResults.length / results.length) * 100,
      totalExecutionTime: totalTime,
      averageExecutionTime: totalTime / results.length,
      data: successResults.map((r) => r.data),
      errors: failedResults.map((r) => r.error),
      aggregatedAt: new Date().toISOString(),
    };
  }
}

// ============================================
// SUBAGENT: Task Planner
// ============================================

const taskPlannerConfig: AgentConfig = {
  name: 'task-planner',
  description: 'Specialized agent for planning complex multi-step tasks',
  version: '1.0.0',
  capabilities: ['analyze-task', 'generate-workflow', 'optimize-steps', 'estimate-costs'],
};

export class TaskPlannerAgent extends BaseSubAgent {
  constructor() {
    super(taskPlannerConfig, 'coordinator-agent', 'task-planning');
  }

  validate(input: unknown): boolean {
    const data = input as { task: string };
    return !!data.task;
  }

  async execute(input: unknown, context: AgentContext): Promise<AgentResult> {
    const data = input as {
      task: string;
      constraints?: {
        maxSteps?: number;
        maxCost?: number;
        requiredAgents?: string[];
      };
    };

    this.status = 'running';

    try {
      const { result, executionTime } = await this.measureExecution(async () => {
        const availableAgents = agentRegistry.getAll();
        const taskLower = data.task.toLowerCase();

        // Analyze which agents are relevant
        const relevantAgents = availableAgents.filter((agent) => {
          const capabilities = agent.getCapabilities().join(' ').toLowerCase();
          return taskLower.split(' ').some((word) =>
            capabilities.includes(word) || agent.config.name.includes(word)
          );
        });

        // Generate workflow steps
        const steps: WorkflowStep[] = relevantAgents.slice(0, data.constraints?.maxSteps || 5).map((agent) => ({
          agentName: agent.config.name,
          input: {},
          dependsOn: [],
        }));

        return {
          task: data.task,
          analysis: {
            complexity: steps.length > 3 ? 'high' : steps.length > 1 ? 'medium' : 'low',
            relevantAgentsFound: relevantAgents.length,
            totalAvailableAgents: availableAgents.length,
          },
          suggestedWorkflow: steps,
          estimatedCost: steps.reduce((sum, s) => {
            const agent = agentRegistry.get(s.agentName);
            return sum + (agent?.config.pricing?.basePrice || 0.001);
          }, 0),
          estimatedTime: steps.length * 500,
          constraints: data.constraints,
          planGeneratedAt: new Date().toISOString(),
        };
      });

      this.status = 'completed';
      return this.createSuccessResult(result, executionTime);
    } catch (error) {
      this.status = 'error';
      return this.createErrorResult(
        error instanceof Error ? error.message : 'Task planning failed',
        0
      );
    }
  }
}

// ============================================
// SUBAGENT: Result Aggregator
// ============================================

const resultAggregatorConfig: AgentConfig = {
  name: 'result-aggregator',
  description: 'Specialized agent for aggregating and analyzing multi-agent results',
  version: '1.0.0',
  capabilities: ['aggregate-results', 'generate-report', 'analyze-patterns', 'export-data'],
};

export class ResultAggregatorAgent extends BaseSubAgent {
  constructor() {
    super(resultAggregatorConfig, 'coordinator-agent', 'result-aggregation');
  }

  validate(input: unknown): boolean {
    const data = input as { results: AgentResult[] };
    return Array.isArray(data.results) && data.results.length > 0;
  }

  async execute(input: unknown, context: AgentContext): Promise<AgentResult> {
    const data = input as {
      results: AgentResult[];
      format?: 'summary' | 'detailed' | 'export';
    };

    this.status = 'running';

    try {
      const { result, executionTime } = await this.measureExecution(async () => {
        const { results, format = 'summary' } = data;

        const successResults = results.filter((r) => r.success);
        const failedResults = results.filter((r) => !r.success);
        const totalTime = results.reduce((sum, r) => sum + r.executionTime, 0);
        const totalCost = results.reduce((sum, r) => sum + (r.cost || 0), 0);

        const summary = {
          totalOperations: results.length,
          successful: successResults.length,
          failed: failedResults.length,
          successRate: ((successResults.length / results.length) * 100).toFixed(2) + '%',
          totalExecutionTime: totalTime,
          averageExecutionTime: Math.round(totalTime / results.length),
          totalCost: totalCost.toFixed(6),
          transactionIds: results.filter((r) => r.transactionId).map((r) => r.transactionId),
        };

        if (format === 'summary') {
          return { type: 'summary', summary };
        }

        if (format === 'detailed') {
          return {
            type: 'detailed',
            summary,
            successfulOperations: successResults.map((r, i) => ({
              index: i,
              data: r.data,
              executionTime: r.executionTime,
              transactionId: r.transactionId,
            })),
            failedOperations: failedResults.map((r, i) => ({
              index: i,
              error: r.error,
              executionTime: r.executionTime,
            })),
          };
        }

        // Export format
        return {
          type: 'export',
          format: 'json',
          summary,
          rawResults: results,
          exportedAt: new Date().toISOString(),
        };
      });

      this.status = 'completed';
      return this.createSuccessResult(result, executionTime);
    } catch (error) {
      this.status = 'error';
      return this.createErrorResult(
        error instanceof Error ? error.message : 'Result aggregation failed',
        0
      );
    }
  }
}

// Register agents
export const coordinatorAgent = new CoordinatorAgent();
export const taskPlannerAgent = new TaskPlannerAgent();
export const resultAggregatorAgent = new ResultAggregatorAgent();

agentRegistry.register(coordinatorAgent);
agentRegistry.registerSubAgent(taskPlannerAgent);
agentRegistry.registerSubAgent(resultAggregatorAgent);
