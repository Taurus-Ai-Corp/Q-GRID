/**
 * Hedera Network Configuration
 * Loads credentials from environment variables ONLY
 * NEVER hardcode keys or account IDs
 */

import { Client, AccountId, PrivateKey } from '@hashgraph/sdk';

export interface HederaConfig {
  accountId: string;
  privateKey: string;
  publicKey: string;
  network: 'testnet' | 'mainnet';
}

/**
 * Load Hedera configuration from environment variables
 */
export function loadHederaConfig(): HederaConfig {
  const accountId = process.env.HEDERA_ACCOUNT_ID;
  const privateKey = process.env.HEDERA_PRIVATE_KEY;
  const publicKey = process.env.HEDERA_PUBLIC_KEY;
  const network = (process.env.HEDERA_NETWORK || 'testnet') as 'testnet' | 'mainnet';

  if (!accountId || !privateKey) {
    console.warn(
      '[Hedera Config] Missing credentials. Set HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY in .env file'
    );
    // Return mock config for development without real credentials
    return {
      accountId: '0.0.0',
      privateKey: '',
      publicKey: '',
      network,
    };
  }

  return { accountId, privateKey, publicKey, network };
}

/**
 * Create Hedera client with configured credentials
 */
export function createHederaClient(): Client | null {
  const config = loadHederaConfig();

  // Return null if not properly configured
  if (!config.accountId || config.accountId === '0.0.0' || !config.privateKey) {
    console.warn('[Hedera Client] Client not initialized - missing credentials');
    return null;
  }

  try {
    const client = config.network === 'testnet'
      ? Client.forTestnet()
      : Client.forMainnet();

    client.setOperator(
      AccountId.fromString(config.accountId),
      PrivateKey.fromStringDer(config.privateKey)
    );

    console.log(`[Hedera Client] Initialized on ${config.network}`);
    return client;
  } catch (error) {
    console.error('[Hedera Client] Failed to create client:', error);
    return null;
  }
}

/**
 * Get or create singleton Hedera client
 */
let hederaClientInstance: Client | null = null;

export function getHederaClient(): Client | null {
  if (!hederaClientInstance) {
    hederaClientInstance = createHederaClient();
  }
  return hederaClientInstance;
}

/**
 * Reset client (useful for testing)
 */
export function resetHederaClient(): void {
  if (hederaClientInstance) {
    hederaClientInstance.close();
  }
  hederaClientInstance = null;
}

// Initialize client on module load
export const hederaClient = getHederaClient();
