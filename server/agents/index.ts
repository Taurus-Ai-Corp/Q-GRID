/**
 * HEDERA Agent Orchestration System
 * Central export for all 24 ML-Agents
 */

// Base classes and registry
export * from './base-agent';

// Main Agents (7)
export * from './account-agent';
export * from './hts-agent';
export * from './hcs-agent';
export * from './contract-agent';
export * from './query-agent';
export * from './coordinator-agent';
export * from './pqc-agent';

// Re-export registry with all agents registered
import { agentRegistry } from './base-agent';

// Import all agents to ensure they register themselves
import './account-agent';
import './hts-agent';
import './hcs-agent';
import './contract-agent';
import './query-agent';
import './coordinator-agent';
import './pqc-agent';

/**
 * Get agent statistics
 */
export function getAgentStats() {
  return agentRegistry.getAgentStats();
}

/**
 * Get all agents as a structured list
 */
export function getAllAgents() {
  const mainAgents = agentRegistry.getAllMainAgents();
  const subAgents = agentRegistry.getAllSubAgents();

  return {
    mainAgents: mainAgents.map((agent) => ({
      name: agent.config.name,
      description: agent.config.description,
      version: agent.config.version,
      capabilities: agent.getCapabilities(),
      pricing: agent.config.pricing,
      status: agent.status,
    })),
    subAgents: subAgents.map((agent) => ({
      name: agent.config.name,
      description: agent.config.description,
      version: agent.config.version,
      capabilities: agent.getCapabilities(),
      pricing: agent.config.pricing,
      status: agent.status,
      parentAgent: agent.parentAgent,
      specialization: agent.specialization,
    })),
    stats: agentRegistry.getAgentStats(),
  };
}

/**
 * Execute an agent by name
 */
export async function executeAgent(
  agentName: string,
  input: unknown,
  context: {
    sessionId: string;
    userId?: string;
    hederaAccountId?: string;
    network?: 'testnet' | 'mainnet';
  }
) {
  const agent = agentRegistry.get(agentName);

  if (!agent) {
    return {
      success: false,
      error: `Agent not found: ${agentName}`,
      executionTime: 0,
    };
  }

  const fullContext = {
    ...context,
    network: context.network || 'testnet',
  };

  return agent.execute(input, fullContext);
}

/**
 * Get available agent names
 */
export function getAgentNames(): string[] {
  return agentRegistry.getAll().map((agent) => agent.config.name);
}

/**
 * Check if agent exists
 */
export function hasAgent(name: string): boolean {
  return !!agentRegistry.get(name);
}

// Export default registry
export { agentRegistry };
