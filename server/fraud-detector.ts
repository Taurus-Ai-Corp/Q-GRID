/**
 * Fraud Detection Engine
 * Real-time transaction pattern analysis with multi-factor risk scoring
 *
 * Risk Factors:
 * - Velocity Analysis (25% weight): Transaction frequency patterns
 * - Amount Anomaly (30% weight): Unusual transaction amounts
 * - Time Pattern (15% weight): Suspicious timing patterns
 * - Balance Behavior (20% weight): Account draining patterns
 * - Recipient Pattern (10% weight): New recipient patterns
 */

import { CBDCTransaction, CBDCWallet } from '@shared/schema';

export interface FraudAnalysisInput {
  userId?: string;
  transactionId?: string;
  walletId?: string;
  transactions?: CBDCTransaction[];
  recentTransactions?: CBDCTransaction[];
  wallet?: CBDCWallet | null;
}

export interface RiskFactor {
  factor: string;
  score: number; // 0-100
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface FraudAnalysisResult {
  overallRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  riskScore: number; // 0-100
  confidence: number; // 0-1
  velocityScore: number;
  amountAnomalyScore: number;
  timePatternScore: number;
  balanceBehaviorScore: number;
  recipientPatternScore: number;
  riskFactors: RiskFactor[];
  metadata: {
    transactionCount24h: number;
    transactionCount7d: number;
    avgTransactionAmount: string;
    stdDevAmount: string;
    uniqueRecipients: number;
    uniqueRecipients24h: number;
    walletBalance: string;
    suspiciousPatterns: string[];
    receiverCountries: string[];
  };
}

/**
 * Calculate standard deviation for amount anomaly detection
 */
function calculateStdDev(amounts: number[]): number {
  if (amounts.length === 0) return 0;

  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const squaredDiffs = amounts.map(x => Math.pow(x - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / amounts.length;

  return Math.sqrt(variance);
}

/**
 * Velocity Analysis (25% weight)
 * Detects rapid transaction patterns
 */
function analyzeVelocity(recentTransactions: CBDCTransaction[]): number {
  if (recentTransactions.length === 0) {
    return 0; // No transactions, no risk
  }

  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  const txInHour = recentTransactions.filter(tx => {
    const txTime = new Date(tx.createdAt).getTime();
    return txTime >= oneHourAgo;
  }).length;

  const txInDay = recentTransactions.filter(tx => {
    const txTime = new Date(tx.createdAt).getTime();
    return txTime >= oneDayAgo;
  }).length;

  // Flag > 10 tx/hour or > 50 tx/day
  let score = 0;
  if (txInHour > 10) {
    score = Math.min(100, (txInHour / 10) * 50);
  }
  if (txInDay > 50) {
    score = Math.max(score, Math.min(100, (txInDay / 50) * 60));
  }

  return Math.round(score);
}

/**
 * Amount Anomaly Detection (30% weight)
 * Detects unusual transaction amounts
 */
function analyzeAmountAnomaly(
  recentTransactions: CBDCTransaction[],
  allTransactions: CBDCTransaction[]
): number {
  if (allTransactions.length === 0 || recentTransactions.length === 0) {
    return 0;
  }

  const allAmounts = allTransactions.map(tx => parseFloat(tx.amount));
  const recentAmounts = recentTransactions.map(tx => parseFloat(tx.amount));

  const mean = allAmounts.reduce((a, b) => a + b, 0) / allAmounts.length;
  const stdDev = calculateStdDev(allAmounts);

  // Check if recent transactions are anomalous
  let score = 0;
  let anomalyCount = 0;

  recentAmounts.forEach(amount => {
    const zScore = stdDev > 0 ? Math.abs((amount - mean) / stdDev) : 0;
    if (zScore > 3) {
      anomalyCount++;
      score = Math.max(score, Math.min(100, (zScore / 5) * 100));
    }
  });

  return Math.round(score);
}

/**
 * Time Pattern Analysis (15% weight)
 * Detects unusual transaction timings
 */
function analyzeTimePattern(recentTransactions: CBDCTransaction[]): number {
  if (recentTransactions.length === 0) {
    return 0;
  }

  let score = 0;
  let suspiciousCount = 0;

  recentTransactions.forEach(tx => {
    const txDate = new Date(tx.createdAt);
    const hour = txDate.getHours();
    const minute = txDate.getMinutes();

    // Flag unusual hours (2 AM - 6 AM)
    if (hour >= 2 && hour < 6) {
      suspiciousCount++;
    }

    // Flag rapid-fire pattern (multiple txs within same minute)
    const sameMinuteCount = recentTransactions.filter(t => {
      const t2 = new Date(t.createdAt);
      return (
        t2.getHours() === hour &&
        t2.getMinutes() === minute
      );
    }).length;

    if (sameMinuteCount > 3) {
      score = Math.max(score, 70);
    }
  });

  if (suspiciousCount > 0) {
    score = Math.max(score, (suspiciousCount / recentTransactions.length) * 60);
  }

  return Math.round(score);
}

/**
 * Balance Behavior Analysis (20% weight)
 * Detects account draining patterns
 */
function analyzeBalanceBehavior(
  recentTransactions: CBDCTransaction[],
  wallet: CBDCWallet | null
): number {
  if (!wallet || recentTransactions.length === 0) {
    return 0;
  }

  let score = 0;
  const balance = parseFloat(wallet.balance || '0');

  recentTransactions.forEach(tx => {
    const amount = parseFloat(tx.amount);

    // Flag if amount > 80% of balance (account draining)
    if (balance > 0 && amount / balance > 0.8) {
      score = Math.max(score, 80);
    }

    // Flag if amount > 50% of balance (significant)
    if (balance > 0 && amount / balance > 0.5) {
      score = Math.max(score, 50);
    }
  });

  return Math.round(score);
}

/**
 * Recipient Pattern Analysis (10% weight)
 * Detects suspicious recipient patterns
 */
function analyzeRecipientPattern(
  recentTransactions: CBDCTransaction[],
  allTransactions: CBDCTransaction[]
): number {
  if (recentTransactions.length === 0) {
    return 0;
  }

  const recentRecipients = new Set(recentTransactions.map(tx => tx.recipientId));
  const allRecipients = new Set(allTransactions.map(tx => tx.recipientId));

  // Count new recipients
  let newRecipientCount = 0;
  recentRecipients.forEach(recipient => {
    if (!allRecipients.has(recipient) || allTransactions.filter(tx => tx.recipientId === recipient).length === 1) {
      newRecipientCount++;
    }
  });

  // Flag if sending to many new recipients quickly
  let score = 0;
  if (recentRecipients.size > 5 && newRecipientCount > recentRecipients.size * 0.5) {
    score = Math.min(100, (newRecipientCount / recentRecipients.size) * 80);
  }

  return Math.round(score);
}

/**
 * Generate mock geographic data for demonstration
 */
function generateMockCountries(): string[] {
  const countries = [
    'US', 'UK', 'IN', 'CN', 'JP', 'DE', 'FR', 'BR', 'MX', 'SG',
    'AE', 'HK', 'AU', 'CA', 'ZA'
  ];

  // Return 2-4 random countries
  const count = Math.floor(Math.random() * 3) + 2;
  const selected = [];
  for (let i = 0; i < count; i++) {
    selected.push(countries[Math.floor(Math.random() * countries.length)]);
  }

  return [...new Set(selected)];
}

/**
 * Main fraud detection function
 */
export async function analyzeFraudPatterns(
  input: FraudAnalysisInput
): Promise<FraudAnalysisResult> {
  const transactions = input.transactions || [];
  const recentTransactions = input.recentTransactions || [];
  const wallet = input.wallet || null;

  // Calculate individual risk scores
  const velocityScore = analyzeVelocity(recentTransactions);
  const amountAnomalyScore = analyzeAmountAnomaly(recentTransactions, transactions);
  const timePatternScore = analyzeTimePattern(recentTransactions);
  const balanceBehaviorScore = analyzeBalanceBehavior(recentTransactions, wallet);
  const recipientPatternScore = analyzeRecipientPattern(recentTransactions, transactions);

  // Calculate weighted overall risk score
  const overallRisk =
    (velocityScore * 0.25) +
    (amountAnomalyScore * 0.30) +
    (timePatternScore * 0.15) +
    (balanceBehaviorScore * 0.20) +
    (recipientPatternScore * 0.10);

  // Determine risk level
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  if (overallRisk <= 30) {
    riskLevel = 'LOW';
  } else if (overallRisk <= 70) {
    riskLevel = 'MEDIUM';
  } else {
    riskLevel = 'HIGH';
  }

  // Calculate confidence (based on data available)
  let confidence = 0.8; // Base confidence
  if (transactions.length < 5) confidence -= 0.1;
  if (recentTransactions.length < 2) confidence -= 0.1;
  if (!wallet) confidence -= 0.1;
  confidence = Math.max(0.3, Math.min(1, confidence));

  // Build risk factors array
  const riskFactors: RiskFactor[] = [];

  if (velocityScore > 30) {
    riskFactors.push({
      factor: 'High Transaction Velocity',
      score: velocityScore,
      description: `${recentTransactions.length} transactions detected. Threshold exceeded.`,
      severity: velocityScore > 70 ? 'HIGH' : 'MEDIUM'
    });
  }

  if (amountAnomalyScore > 30) {
    riskFactors.push({
      factor: 'Amount Anomaly',
      score: amountAnomalyScore,
      description: 'Transaction amounts deviate significantly from historical patterns',
      severity: amountAnomalyScore > 70 ? 'HIGH' : 'MEDIUM'
    });
  }

  if (timePatternScore > 30) {
    riskFactors.push({
      factor: 'Suspicious Timing',
      score: timePatternScore,
      description: 'Transactions at unusual hours or rapid succession',
      severity: timePatternScore > 70 ? 'HIGH' : 'MEDIUM'
    });
  }

  if (balanceBehaviorScore > 30) {
    riskFactors.push({
      factor: 'Account Draining',
      score: balanceBehaviorScore,
      description: 'Large transaction amounts relative to wallet balance',
      severity: balanceBehaviorScore > 70 ? 'HIGH' : 'MEDIUM'
    });
  }

  if (recipientPatternScore > 30) {
    riskFactors.push({
      factor: 'Unusual Recipient Pattern',
      score: recipientPatternScore,
      description: 'Multiple new recipients or circular transaction patterns',
      severity: recipientPatternScore > 70 ? 'HIGH' : 'MEDIUM'
    });
  }

  // Calculate transaction statistics
  const allAmounts = transactions.map(tx => parseFloat(tx.amount));
  const avg = allAmounts.length > 0
    ? (allAmounts.reduce((a, b) => a + b, 0) / allAmounts.length).toFixed(8)
    : '0';
  const stdDev = allAmounts.length > 0
    ? calculateStdDev(allAmounts).toFixed(8)
    : '0';

  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const txIn24h = transactions.filter(tx => {
    const txTime = new Date(tx.createdAt).getTime();
    return txTime >= oneDayAgo;
  }).length;

  const uniqueRecipientsRecent = new Set(recentTransactions.map(tx => tx.recipientId)).size;

  return {
    overallRisk: riskLevel,
    riskScore: Math.round(overallRisk),
    confidence,
    velocityScore: Math.round(velocityScore),
    amountAnomalyScore: Math.round(amountAnomalyScore),
    timePatternScore: Math.round(timePatternScore),
    balanceBehaviorScore: Math.round(balanceBehaviorScore),
    recipientPatternScore: Math.round(recipientPatternScore),
    riskFactors,
    metadata: {
      transactionCount24h: txIn24h,
      transactionCount7d: transactions.length,
      avgTransactionAmount: avg,
      stdDevAmount: stdDev,
      uniqueRecipients: new Set(transactions.map(tx => tx.recipientId)).size,
      uniqueRecipients24h: uniqueRecipientsRecent,
      walletBalance: wallet ? (wallet.balance || '0') : '0',
      suspiciousPatterns: riskFactors.map(rf => rf.factor),
      receiverCountries: generateMockCountries()
    }
  };
}

/**
 * Get risk color based on score
 */
export function getRiskColor(score: number): string {
  if (score <= 30) return 'green';
  if (score <= 70) return 'yellow';
  return 'red';
}

/**
 * Format risk score for display
 */
export function formatRiskScore(score: number): string {
  return `${score}/100`;
}
