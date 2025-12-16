import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

/**
 * Global test setup
 * Runs before all tests
 */
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/qgrid_test';
  process.env.HEDERA_NETWORK = 'testnet';
  process.env.HEDERA_ACCOUNT_ID = '0.0.7231851';
  process.env.HEDERA_PRIVATE_KEY = '302e020100300506032b6570042204200242d9566016bd0b19dc564df257fe816bb29cbb73bd3fb129afa451b71c0398';
  process.env.HEDERA_PUBLIC_KEY = '302a300506032b657003210067971f5c7603d9c0c2ce2728fe0c98e5cad256284d0913f478e5d11e5cdcc43f';

  console.log('✅ Test environment initialized');
});

/**
 * Cleanup after all tests
 */
afterAll(() => {
  console.log('✅ Test cleanup completed');
});

/**
 * Setup before each test
 */
beforeEach(() => {
  // Reset mocks before each test
  vi.clearAllMocks();
});

/**
 * Cleanup after each test
 */
afterEach(() => {
  // Add any per-test cleanup here
});

/**
 * Mock Hedera SDK for testing
 */
export const mockHederaClient = {
  getAccountBalance: vi.fn().mockResolvedValue(1000),
  getAccountInfo: vi.fn().mockResolvedValue({
    accountId: '0.0.7231851',
    balance: 1000,
    key: { _type: 'PublicKey' },
  }),
  submitTransaction: vi.fn().mockResolvedValue('mock-transaction-hash'),
  getTransactionReceipt: vi.fn().mockResolvedValue({
    status: 'SUCCESS',
    transactionId: 'mock-tx-id',
  }),
  close: vi.fn(),
};

/**
 * Mock database for testing
 */
export const mockDb = {
  query: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  select: vi.fn(),
};

/**
 * Mock storage operations
 */
export const mockStorage = {
  getUserById: vi.fn().mockResolvedValue({
    id: 'user-123',
    email: 'test@example.com',
  }),
  getTransactionsByUserId: vi.fn().mockResolvedValue([]),
  createFraudAnalysis: vi.fn().mockResolvedValue({
    id: 'analysis-123',
    riskScore: 45,
  }),
  getCBDCWalletByUserId: vi.fn().mockResolvedValue({
    balance: 1000,
    offlineBalance: 0,
  }),
};

export { vi } from 'vitest';
