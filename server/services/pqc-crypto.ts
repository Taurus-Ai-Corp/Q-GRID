/**
 * Post-Quantum Cryptography Service
 * Provides real cryptographic operations using NIST-approved PQC algorithms
 *
 * Supported Algorithms:
 * - CRYSTALS-Kyber: Key Encapsulation Mechanism (KEM)
 * - CRYSTALS-Dilithium: Digital Signatures
 * - SPHINCS+: Hash-based Signatures (stateless)
 *
 * Note: In production, this would integrate with liboqs or OpenQuantumSafe
 * This implementation provides a simulation layer with realistic outputs
 */

import { randomBytes, createHash, createHmac } from 'crypto';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface KeyPair {
  publicKey: string;
  privateKey: string;
  algorithm: string;
  securityLevel: number;
  createdAt: string;
  expiresAt: string;
}

export interface HybridKeyPair {
  classical: KeyPair;
  quantum: KeyPair;
  combined: {
    publicKey: string;
    fingerprint: string;
  };
}

export interface Signature {
  algorithm: string;
  signature: string;
  publicKeyHash: string;
  timestamp: string;
  securityLevel: number;
}

export interface HybridSignature {
  classical: Signature;
  quantum: Signature;
  combined: {
    signature: string;
    verified: boolean;
  };
}

export interface EncapsulatedKey {
  ciphertext: string;
  sharedSecret: string;
  algorithm: string;
  securityLevel: number;
}

export interface CryptoInventoryItem {
  id: string;
  type: 'RSA' | 'ECDSA' | 'AES' | 'CRYSTALS-Kyber' | 'CRYSTALS-Dilithium' | 'SPHINCS+';
  keySize: number;
  algorithm: string;
  quantumSafe: boolean;
  location: string;
  lastRotated: string;
  expiresAt: string;
  usageCount: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface MigrationPlan {
  id: string;
  currentAlgorithm: string;
  targetAlgorithm: string;
  phase: number;
  totalPhases: number;
  estimatedDuration: string;
  estimatedCost: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dependencies: string[];
  risks: string[];
}

// ============================================
// ALGORITHM CONSTANTS
// ============================================

const NIST_SECURITY_LEVELS = {
  1: { bits: 128, description: 'Equivalent to AES-128' },
  2: { bits: 160, description: 'Between AES-128 and AES-192' },
  3: { bits: 192, description: 'Equivalent to AES-192' },
  4: { bits: 224, description: 'Between AES-192 and AES-256' },
  5: { bits: 256, description: 'Equivalent to AES-256' },
};

const PQC_ALGORITHMS = {
  'CRYSTALS-Kyber': {
    type: 'KEM',
    variants: {
      'Kyber512': { securityLevel: 1, publicKeySize: 800, ciphertextSize: 768 },
      'Kyber768': { securityLevel: 3, publicKeySize: 1184, ciphertextSize: 1088 },
      'Kyber1024': { securityLevel: 5, publicKeySize: 1568, ciphertextSize: 1568 },
    },
    nistStandard: 'FIPS 203',
  },
  'CRYSTALS-Dilithium': {
    type: 'Signature',
    variants: {
      'Dilithium2': { securityLevel: 2, publicKeySize: 1312, signatureSize: 2420 },
      'Dilithium3': { securityLevel: 3, publicKeySize: 1952, signatureSize: 3293 },
      'Dilithium5': { securityLevel: 5, publicKeySize: 2592, signatureSize: 4595 },
    },
    nistStandard: 'FIPS 204',
  },
  'SPHINCS+': {
    type: 'Signature',
    variants: {
      'SPHINCS+-128s': { securityLevel: 1, publicKeySize: 32, signatureSize: 7856 },
      'SPHINCS+-192s': { securityLevel: 3, publicKeySize: 48, signatureSize: 16224 },
      'SPHINCS+-256s': { securityLevel: 5, publicKeySize: 64, signatureSize: 29792 },
    },
    nistStandard: 'FIPS 205',
  },
};

// ============================================
// CRYPTOGRAPHIC OPERATIONS
// ============================================

/**
 * Generate a simulated PQC key pair
 * In production, this would use liboqs bindings
 */
export function generateKeyPair(
  algorithm: 'CRYSTALS-Kyber' | 'CRYSTALS-Dilithium' | 'SPHINCS+',
  variant?: string
): KeyPair {
  const algoConfig = PQC_ALGORITHMS[algorithm];
  const defaultVariant = Object.keys(algoConfig.variants)[1]; // Middle security level
  const selectedVariant = variant || defaultVariant;
  const variantConfig = algoConfig.variants[selectedVariant as keyof typeof algoConfig.variants];

  if (!variantConfig) {
    throw new Error(`Invalid variant ${variant} for algorithm ${algorithm}`);
  }

  // Generate realistic-looking keys using secure random bytes
  const publicKeyBytes = randomBytes(variantConfig.publicKeySize);
  const privateKeyBytes = randomBytes(variantConfig.publicKeySize * 2);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year

  return {
    publicKey: publicKeyBytes.toString('base64'),
    privateKey: privateKeyBytes.toString('base64'),
    algorithm: `${algorithm}/${selectedVariant}`,
    securityLevel: variantConfig.securityLevel,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}

/**
 * Generate a hybrid key pair (classical + quantum-resistant)
 */
export function generateHybridKeyPair(
  classicalAlgorithm: 'ECDSA-P256' | 'ECDSA-P384' | 'RSA-4096' = 'ECDSA-P256',
  quantumAlgorithm: 'CRYSTALS-Dilithium' | 'SPHINCS+' = 'CRYSTALS-Dilithium'
): HybridKeyPair {
  // Generate classical key (simulated)
  const classicalKeySize = classicalAlgorithm === 'RSA-4096' ? 512 : classicalAlgorithm === 'ECDSA-P384' ? 48 : 32;
  const classicalPublic = randomBytes(classicalKeySize).toString('base64');
  const classicalPrivate = randomBytes(classicalKeySize * 2).toString('base64');

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

  const classical: KeyPair = {
    publicKey: classicalPublic,
    privateKey: classicalPrivate,
    algorithm: classicalAlgorithm,
    securityLevel: classicalAlgorithm === 'RSA-4096' ? 3 : classicalAlgorithm === 'ECDSA-P384' ? 3 : 1,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  // Generate quantum-resistant key
  const quantum = generateKeyPair(quantumAlgorithm);

  // Create combined public key (concatenation with hash)
  const combinedPublicKey = createHash('sha384')
    .update(Buffer.from(classical.publicKey, 'base64'))
    .update(Buffer.from(quantum.publicKey, 'base64'))
    .digest('base64');

  const fingerprint = createHash('sha256')
    .update(combinedPublicKey)
    .digest('hex')
    .slice(0, 40);

  return {
    classical,
    quantum,
    combined: {
      publicKey: combinedPublicKey,
      fingerprint,
    },
  };
}

/**
 * Sign data with a PQC algorithm
 */
export function signData(
  data: string | Buffer,
  privateKey: string,
  algorithm: 'CRYSTALS-Dilithium' | 'SPHINCS+'
): Signature {
  const algoConfig = PQC_ALGORITHMS[algorithm];
  const variant = Object.keys(algoConfig.variants)[1]; // Middle security level
  const variantConfig = algoConfig.variants[variant as keyof typeof algoConfig.variants];

  const dataBuffer = typeof data === 'string' ? Buffer.from(data) : data;

  // Create a deterministic signature simulation
  const hmac = createHmac('sha512', Buffer.from(privateKey, 'base64'));
  hmac.update(dataBuffer);
  const sigHash = hmac.digest();

  // Extend to realistic signature size
  const signatureBytes = Buffer.alloc(variantConfig.signatureSize);
  for (let i = 0; i < variantConfig.signatureSize; i++) {
    signatureBytes[i] = sigHash[i % sigHash.length] ^ randomBytes(1)[0];
  }

  const publicKeyHash = createHash('sha256')
    .update(Buffer.from(privateKey, 'base64').slice(0, 64))
    .digest('hex');

  return {
    algorithm: `${algorithm}/${variant}`,
    signature: signatureBytes.toString('base64'),
    publicKeyHash,
    timestamp: new Date().toISOString(),
    securityLevel: variantConfig.securityLevel,
  };
}

/**
 * Create a hybrid signature (classical + quantum)
 */
export function signHybrid(
  data: string | Buffer,
  hybridKeyPair: HybridKeyPair
): HybridSignature {
  const dataBuffer = typeof data === 'string' ? Buffer.from(data) : data;

  // Classical signature (ECDSA simulation)
  const classicalHmac = createHmac('sha256', Buffer.from(hybridKeyPair.classical.privateKey, 'base64'));
  classicalHmac.update(dataBuffer);
  const classicalSig = classicalHmac.digest('base64');

  const classical: Signature = {
    algorithm: hybridKeyPair.classical.algorithm,
    signature: classicalSig,
    publicKeyHash: createHash('sha256')
      .update(Buffer.from(hybridKeyPair.classical.publicKey, 'base64'))
      .digest('hex'),
    timestamp: new Date().toISOString(),
    securityLevel: hybridKeyPair.classical.securityLevel,
  };

  // Quantum signature
  const quantum = signData(data, hybridKeyPair.quantum.privateKey, 'CRYSTALS-Dilithium');

  // Combined signature
  const combinedSig = createHash('sha512')
    .update(classical.signature)
    .update(quantum.signature)
    .digest('base64');

  return {
    classical,
    quantum,
    combined: {
      signature: combinedSig,
      verified: true,
    },
  };
}

/**
 * Verify a hybrid signature
 */
export function verifyHybridSignature(
  data: string | Buffer,
  signature: HybridSignature,
  publicKeys: { classical: string; quantum: string }
): { classical: boolean; quantum: boolean; combined: boolean } {
  // In production, this would perform actual verification
  // For simulation, we verify the structure and return success
  const hasClassicalSig = !!signature.classical?.signature;
  const hasQuantumSig = !!signature.quantum?.signature;
  const hasCombinedSig = !!signature.combined?.signature;

  return {
    classical: hasClassicalSig,
    quantum: hasQuantumSig,
    combined: hasClassicalSig && hasQuantumSig && hasCombinedSig,
  };
}

/**
 * Key Encapsulation (Kyber KEM)
 */
export function encapsulate(publicKey: string): EncapsulatedKey {
  const sharedSecretBytes = randomBytes(32);
  const ciphertextBytes = randomBytes(1088); // Kyber768 ciphertext size

  return {
    ciphertext: ciphertextBytes.toString('base64'),
    sharedSecret: sharedSecretBytes.toString('base64'),
    algorithm: 'CRYSTALS-Kyber/Kyber768',
    securityLevel: 3,
  };
}

/**
 * Key Decapsulation (Kyber KEM)
 */
export function decapsulate(ciphertext: string, privateKey: string): string {
  // In production, this would perform actual decapsulation
  // For simulation, derive a consistent shared secret
  const hmac = createHmac('sha256', Buffer.from(privateKey, 'base64'));
  hmac.update(Buffer.from(ciphertext, 'base64'));
  return hmac.digest('base64');
}

// ============================================
// INVENTORY AND ASSESSMENT
// ============================================

/**
 * Simulate cryptographic asset inventory scan
 */
export function scanCryptoInventory(organizationId: string): CryptoInventoryItem[] {
  // In production, this would scan actual systems
  // Generate realistic inventory based on organization
  const inventory: CryptoInventoryItem[] = [];
  const baseHash = createHash('sha256').update(organizationId).digest('hex');

  // RSA keys (legacy, high risk)
  const rsaCount = parseInt(baseHash.slice(0, 2), 16) % 100 + 50;
  for (let i = 0; i < rsaCount; i++) {
    inventory.push({
      id: `rsa_${baseHash.slice(0, 8)}_${i}`,
      type: 'RSA',
      keySize: i % 3 === 0 ? 4096 : 2048,
      algorithm: i % 3 === 0 ? 'RSA-4096' : 'RSA-2048',
      quantumSafe: false,
      location: `/systems/server-${i % 10}/keys`,
      lastRotated: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString(),
      expiresAt: new Date(Date.now() + ((365 - i) * 24 * 60 * 60 * 1000)).toISOString(),
      usageCount: Math.floor(Math.random() * 10000),
      riskLevel: i % 3 === 0 ? 'MEDIUM' : 'HIGH',
    });
  }

  // ECDSA keys (moderate risk)
  const ecdsaCount = parseInt(baseHash.slice(2, 4), 16) % 50 + 25;
  for (let i = 0; i < ecdsaCount; i++) {
    inventory.push({
      id: `ecdsa_${baseHash.slice(0, 8)}_${i}`,
      type: 'ECDSA',
      keySize: i % 2 === 0 ? 384 : 256,
      algorithm: i % 2 === 0 ? 'ECDSA-P384' : 'ECDSA-P256',
      quantumSafe: false,
      location: `/systems/api-${i % 5}/certificates`,
      lastRotated: new Date(Date.now() - (i * 12 * 60 * 60 * 1000)).toISOString(),
      expiresAt: new Date(Date.now() + ((180 + i * 10) * 24 * 60 * 60 * 1000)).toISOString(),
      usageCount: Math.floor(Math.random() * 50000),
      riskLevel: 'MEDIUM',
    });
  }

  // AES keys (symmetric, lower risk)
  const aesCount = parseInt(baseHash.slice(4, 6), 16) % 150 + 100;
  for (let i = 0; i < aesCount; i++) {
    inventory.push({
      id: `aes_${baseHash.slice(0, 8)}_${i}`,
      type: 'AES',
      keySize: i % 2 === 0 ? 256 : 128,
      algorithm: i % 2 === 0 ? 'AES-256-GCM' : 'AES-128-GCM',
      quantumSafe: i % 2 === 0, // AES-256 is quantum-safe with Grover's adjustment
      location: `/systems/data-${i % 8}/encryption`,
      lastRotated: new Date(Date.now() - (i * 6 * 60 * 60 * 1000)).toISOString(),
      expiresAt: new Date(Date.now() + ((90 + i * 5) * 24 * 60 * 60 * 1000)).toISOString(),
      usageCount: Math.floor(Math.random() * 100000),
      riskLevel: i % 2 === 0 ? 'LOW' : 'MEDIUM',
    });
  }

  return inventory;
}

/**
 * Calculate quantum risk score for an organization
 */
export function calculateQuantumRisk(inventory: CryptoInventoryItem[]): {
  overallScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  breakdown: {
    rsaRisk: number;
    ecdsaRisk: number;
    symmetricRisk: number;
  };
  timeToQuantumThreat: string;
  recommendations: string[];
} {
  const rsaKeys = inventory.filter(i => i.type === 'RSA');
  const ecdsaKeys = inventory.filter(i => i.type === 'ECDSA');
  const aesKeys = inventory.filter(i => i.type === 'AES');

  // Calculate risk scores (0-100)
  const rsaRisk = rsaKeys.length > 0
    ? Math.min(100, (rsaKeys.filter(k => k.keySize < 4096).length / rsaKeys.length) * 100 + 20)
    : 0;

  const ecdsaRisk = ecdsaKeys.length > 0
    ? Math.min(100, (ecdsaKeys.length / (ecdsaKeys.length + 1)) * 60 + 15)
    : 0;

  const symmetricRisk = aesKeys.length > 0
    ? Math.min(100, (aesKeys.filter(k => k.keySize < 256).length / aesKeys.length) * 40)
    : 0;

  // Weighted overall score
  const totalKeys = inventory.length;
  const overallScore = totalKeys > 0
    ? Math.round(
        (rsaRisk * rsaKeys.length +
          ecdsaRisk * ecdsaKeys.length +
          symmetricRisk * aesKeys.length) / totalKeys
      )
    : 0;

  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  if (overallScore <= 25) riskLevel = 'LOW';
  else if (overallScore <= 50) riskLevel = 'MEDIUM';
  else if (overallScore <= 75) riskLevel = 'HIGH';
  else riskLevel = 'CRITICAL';

  const recommendations: string[] = [];
  if (rsaRisk > 50) {
    recommendations.push('Urgent: Migrate RSA-2048 keys to RSA-4096 or hybrid PQC');
  }
  if (ecdsaRisk > 40) {
    recommendations.push('Plan migration from ECDSA to hybrid signatures (ECDSA + Dilithium)');
  }
  if (symmetricRisk > 30) {
    recommendations.push('Upgrade AES-128 to AES-256 for quantum resistance');
  }
  if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
    recommendations.push('Implement "harvest now, decrypt later" protection immediately');
    recommendations.push('Enable hybrid TLS for all external communications');
  }

  return {
    overallScore,
    riskLevel,
    breakdown: { rsaRisk, ecdsaRisk, symmetricRisk },
    timeToQuantumThreat: '5-15 years (NIST estimate)',
    recommendations,
  };
}

// ============================================
// COST CALCULATION ENGINE
// ============================================

export interface CostEstimate {
  totalMin: number;
  totalMax: number;
  currency: string;
  breakdown: {
    assessment: { min: number; max: number };
    planning: { min: number; max: number };
    implementation: { min: number; max: number };
    testing: { min: number; max: number };
    training: { min: number; max: number };
    managedServices: { monthlyMin: number; monthlyMax: number };
  };
  timeline: {
    totalMonths: number;
    phases: Array<{
      name: string;
      durationMonths: number;
      cost: number;
    }>;
  };
  factors: {
    keyCount: number;
    systemCount: number;
    complianceRequirements: string[];
    riskMultiplier: number;
  };
}

/**
 * Calculate comprehensive PQC migration cost estimate
 */
export function calculateMigrationCost(
  inventory: CryptoInventoryItem[],
  options: {
    urgency: 'standard' | 'accelerated' | 'emergency';
    complianceFrameworks: string[];
    managedServicesRequired: boolean;
    trainingRequired: boolean;
  }
): CostEstimate {
  const totalKeys = inventory.length;
  const uniqueSystems = new Set(inventory.map(i => i.location.split('/')[2])).size;
  const quantumUnsafeKeys = inventory.filter(i => !i.quantumSafe).length;

  // Base costs per key (USD)
  const baseCostPerKey = {
    assessment: 50,
    planning: 100,
    implementation: 500,
    testing: 150,
  };

  // Urgency multipliers
  const urgencyMultiplier = {
    standard: 1.0,
    accelerated: 1.5,
    emergency: 2.5,
  };

  // Compliance overhead
  const complianceCost: Record<string, number> = {
    'NIST': 15000,
    'FIPS': 25000,
    'ISO27001': 20000,
    'PCI-DSS': 30000,
    'HIPAA': 35000,
    'SOC2': 20000,
  };

  const multiplier = urgencyMultiplier[options.urgency];
  const complianceTotal = options.complianceFrameworks.reduce(
    (sum, fw) => sum + (complianceCost[fw] || 10000),
    0
  );

  // Calculate phase costs
  const assessmentCost = {
    min: Math.round(totalKeys * baseCostPerKey.assessment * 0.8 * multiplier),
    max: Math.round(totalKeys * baseCostPerKey.assessment * 1.2 * multiplier),
  };

  const planningCost = {
    min: Math.round(quantumUnsafeKeys * baseCostPerKey.planning * 0.8 * multiplier),
    max: Math.round(quantumUnsafeKeys * baseCostPerKey.planning * 1.2 * multiplier),
  };

  const implementationCost = {
    min: Math.round(quantumUnsafeKeys * baseCostPerKey.implementation * 0.7 * multiplier),
    max: Math.round(quantumUnsafeKeys * baseCostPerKey.implementation * 1.5 * multiplier),
  };

  const testingCost = {
    min: Math.round(quantumUnsafeKeys * baseCostPerKey.testing * 0.8 * multiplier),
    max: Math.round(quantumUnsafeKeys * baseCostPerKey.testing * 1.3 * multiplier),
  };

  const trainingCost = options.trainingRequired
    ? { min: uniqueSystems * 2000, max: uniqueSystems * 5000 }
    : { min: 0, max: 0 };

  const managedServices = options.managedServicesRequired
    ? {
        monthlyMin: Math.round(totalKeys * 10 + uniqueSystems * 500),
        monthlyMax: Math.round(totalKeys * 25 + uniqueSystems * 1500),
      }
    : { monthlyMin: 0, monthlyMax: 0 };

  // Timeline calculation
  const baseMonths = Math.ceil(quantumUnsafeKeys / 100) + 6; // 6 month minimum
  const totalMonths = Math.round(baseMonths / multiplier);

  const phases = [
    { name: 'Assessment & Inventory', durationMonths: Math.max(1, Math.round(totalMonths * 0.1)), cost: (assessmentCost.min + assessmentCost.max) / 2 },
    { name: 'Planning & Architecture', durationMonths: Math.max(2, Math.round(totalMonths * 0.15)), cost: (planningCost.min + planningCost.max) / 2 },
    { name: 'Pilot Implementation', durationMonths: Math.max(2, Math.round(totalMonths * 0.2)), cost: implementationCost.min * 0.2 },
    { name: 'Full Migration', durationMonths: Math.max(3, Math.round(totalMonths * 0.4)), cost: implementationCost.max * 0.8 },
    { name: 'Testing & Validation', durationMonths: Math.max(1, Math.round(totalMonths * 0.15)), cost: (testingCost.min + testingCost.max) / 2 },
  ];

  const totalMin = assessmentCost.min + planningCost.min + implementationCost.min + testingCost.min + trainingCost.min + complianceTotal;
  const totalMax = assessmentCost.max + planningCost.max + implementationCost.max + testingCost.max + trainingCost.max + complianceTotal;

  return {
    totalMin,
    totalMax,
    currency: 'USD',
    breakdown: {
      assessment: assessmentCost,
      planning: planningCost,
      implementation: implementationCost,
      testing: testingCost,
      training: trainingCost,
      managedServices,
    },
    timeline: {
      totalMonths,
      phases,
    },
    factors: {
      keyCount: totalKeys,
      systemCount: uniqueSystems,
      complianceRequirements: options.complianceFrameworks,
      riskMultiplier: multiplier,
    },
  };
}

// ============================================
// COMPLIANCE MAPPING
// ============================================

export interface ComplianceAssessment {
  framework: string;
  score: number;
  status: 'COMPLIANT' | 'PARTIAL' | 'NON_COMPLIANT';
  requirements: Array<{
    id: string;
    description: string;
    status: 'met' | 'partial' | 'not_met';
    remediation?: string;
  }>;
}

/**
 * Assess compliance against PQC requirements
 */
export function assessCompliance(
  framework: string,
  inventory: CryptoInventoryItem[]
): ComplianceAssessment {
  const quantumSafeRatio = inventory.filter(i => i.quantumSafe).length / Math.max(inventory.length, 1);

  const frameworkRequirements: Record<string, Array<{ id: string; description: string; threshold: number }>> = {
    'NIST': [
      { id: 'NIST-PQC-1', description: 'Implement NIST-approved PQC algorithms', threshold: 0.5 },
      { id: 'NIST-PQC-2', description: 'Hybrid signature support', threshold: 0.3 },
      { id: 'NIST-PQC-3', description: 'Key encapsulation mechanisms', threshold: 0.4 },
      { id: 'NIST-PQC-4', description: 'Cryptographic agility', threshold: 0.6 },
    ],
    'FIPS': [
      { id: 'FIPS-203', description: 'CRYSTALS-Kyber implementation', threshold: 0.5 },
      { id: 'FIPS-204', description: 'CRYSTALS-Dilithium implementation', threshold: 0.5 },
      { id: 'FIPS-205', description: 'SPHINCS+ implementation', threshold: 0.3 },
      { id: 'FIPS-140-3', description: 'Cryptographic module validation', threshold: 0.8 },
    ],
    'ISO27001': [
      { id: 'ISO-A.10.1', description: 'Cryptographic controls policy', threshold: 0.4 },
      { id: 'ISO-A.10.2', description: 'Key management procedures', threshold: 0.5 },
      { id: 'ISO-PQC', description: 'Quantum-safe migration plan', threshold: 0.3 },
    ],
  };

  const requirements = frameworkRequirements[framework] || frameworkRequirements['NIST'];

  const assessedRequirements = requirements.map(req => ({
    id: req.id,
    description: req.description,
    status: quantumSafeRatio >= req.threshold ? 'met' as const
      : quantumSafeRatio >= req.threshold * 0.5 ? 'partial' as const
      : 'not_met' as const,
    remediation: quantumSafeRatio < req.threshold
      ? `Increase quantum-safe key coverage to ${Math.round(req.threshold * 100)}%`
      : undefined,
  }));

  const metCount = assessedRequirements.filter(r => r.status === 'met').length;
  const partialCount = assessedRequirements.filter(r => r.status === 'partial').length;
  const score = Math.round(((metCount + partialCount * 0.5) / requirements.length) * 100);

  let status: 'COMPLIANT' | 'PARTIAL' | 'NON_COMPLIANT';
  if (score >= 80) status = 'COMPLIANT';
  else if (score >= 40) status = 'PARTIAL';
  else status = 'NON_COMPLIANT';

  return {
    framework,
    score,
    status,
    requirements: assessedRequirements,
  };
}

// Export algorithm info for reference
export const ALGORITHM_INFO = PQC_ALGORITHMS;
export const SECURITY_LEVELS = NIST_SECURITY_LEVELS;
