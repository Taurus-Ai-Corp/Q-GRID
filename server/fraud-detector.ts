/**
 * Fraud Detection Engine
 * Real-time transaction pattern analysis with multi-factor risk scoring
 *
 * Risk Factors:
 * - Velocity Analysis (20% weight): Transaction frequency patterns
 * - Amount Anomaly (25% weight): Unusual transaction amounts
 * - Time Pattern (15% weight): Suspicious timing patterns
 * - Balance Behavior (15% weight): Account draining patterns
 * - Recipient Pattern (10% weight): New recipient patterns
 * - Geographic Risk (10% weight): High-risk jurisdiction analysis
 * - Circular Flow Detection (5% weight): Money laundering patterns
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
  details?: Record<string, unknown>;
}

export interface CircularFlowResult {
  detected: boolean;
  score: number;
  cycles: Array<{
    path: string[];
    amount: number;
    timeSpan: number; // milliseconds
  }>;
}

export interface GeographicRiskResult {
  score: number;
  highRiskCountries: string[];
  jurisdictions: Array<{
    country: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    transactionCount: number;
    totalAmount: number;
  }>;
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
  geographicRiskScore: number;
  circularFlowScore: number;
  riskFactors: RiskFactor[];
  circularFlows?: CircularFlowResult;
  geographicRisk?: GeographicRiskResult;
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

// FATF High-Risk Jurisdictions and monitored countries
// Updated based on FATF gray list and black list 2024-2025
const HIGH_RISK_JURISDICTIONS: Record<string, { level: 'HIGH' | 'CRITICAL'; reason: string }> = {
  'KP': { level: 'CRITICAL', reason: 'FATF Black List - North Korea' },
  'IR': { level: 'CRITICAL', reason: 'FATF Black List - Iran' },
  'MM': { level: 'CRITICAL', reason: 'FATF Black List - Myanmar' },
  'SY': { level: 'HIGH', reason: 'Sanctions - Syria' },
  'YE': { level: 'HIGH', reason: 'Conflict Zone - Yemen' },
  'VE': { level: 'HIGH', reason: 'Sanctions risk - Venezuela' },
  'BY': { level: 'HIGH', reason: 'Sanctions risk - Belarus' },
  'RU': { level: 'HIGH', reason: 'Sanctions risk - Russia' },
  'CU': { level: 'HIGH', reason: 'Sanctions - Cuba' },
};

// FATF Gray List (Increased Monitoring) - partial list
const MEDIUM_RISK_JURISDICTIONS: Record<string, string> = {
  'PK': 'FATF Gray List - Pakistan',
  'NG': 'FATF Gray List - Nigeria',
  'TZ': 'FATF Gray List - Tanzania',
  'VN': 'FATF Gray List - Vietnam',
  'JM': 'FATF Gray List - Jamaica',
  'PA': 'FATF Gray List - Panama',
  'PH': 'FATF Gray List - Philippines',
  'ZA': 'FATF Gray List - South Africa',
  'TR': 'FATF Gray List - Turkey',
  'AE': 'FATF Gray List - UAE',
};

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
 * Extract country code from transaction metadata or recipient ID
 * In production, this would integrate with a geolocation service or KYC data
 */
function extractCountryFromTransaction(tx: CBDCTransaction): string | null {
  const metadata = tx.metadata as Record<string, unknown> | null;

  // Check metadata for country information
  if (metadata) {
    if (typeof metadata.recipientCountry === 'string') {
      return metadata.recipientCountry.toUpperCase().slice(0, 2);
    }
    if (typeof metadata.country === 'string') {
      return metadata.country.toUpperCase().slice(0, 2);
    }
    if (typeof metadata.jurisdiction === 'string') {
      return metadata.jurisdiction.toUpperCase().slice(0, 2);
    }
  }

  // Try to extract from recipient address format (e.g., 0.0.12345_US)
  if (tx.recipientId && tx.recipientId.includes('_')) {
    const parts = tx.recipientId.split('_');
    const lastPart = parts[parts.length - 1];
    if (lastPart.length === 2) {
      return lastPart.toUpperCase();
    }
  }

  return null;
}

/**
 * Geographic Risk Analysis
 * Analyzes transaction jurisdictions against FATF risk lists
 */
function analyzeGeographicRisk(transactions: CBDCTransaction[]): GeographicRiskResult {
  const jurisdictionStats: Map<string, { count: number; amount: number }> = new Map();
  const highRiskCountries: string[] = [];

  transactions.forEach(tx => {
    const country = extractCountryFromTransaction(tx);
    if (country) {
      const existing = jurisdictionStats.get(country) || { count: 0, amount: 0 };
      jurisdictionStats.set(country, {
        count: existing.count + 1,
        amount: existing.amount + parseFloat(tx.amount),
      });

      if (HIGH_RISK_JURISDICTIONS[country] && !highRiskCountries.includes(country)) {
        highRiskCountries.push(country);
      }
    }
  });

  // Build jurisdiction details
  const jurisdictions: GeographicRiskResult['jurisdictions'] = [];
  jurisdictionStats.forEach((stats, country) => {
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';

    if (HIGH_RISK_JURISDICTIONS[country]) {
      riskLevel = HIGH_RISK_JURISDICTIONS[country].level;
    } else if (MEDIUM_RISK_JURISDICTIONS[country]) {
      riskLevel = 'MEDIUM';
    }

    jurisdictions.push({
      country,
      riskLevel,
      transactionCount: stats.count,
      totalAmount: stats.amount,
    });
  });

  // Calculate geographic risk score
  let score = 0;
  let totalWeight = 0;

  jurisdictions.forEach(j => {
    const weight = j.transactionCount;
    totalWeight += weight;

    switch (j.riskLevel) {
      case 'CRITICAL':
        score += weight * 100;
        break;
      case 'HIGH':
        score += weight * 75;
        break;
      case 'MEDIUM':
        score += weight * 40;
        break;
      case 'LOW':
        score += weight * 0;
        break;
    }
  });

  const finalScore = totalWeight > 0 ? Math.round(score / totalWeight) : 0;

  return {
    score: finalScore,
    highRiskCountries,
    jurisdictions: jurisdictions.sort((a, b) => {
      const riskOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
    }),
  };
}

/**
 * Circular Flow Detection
 * Detects potential money laundering patterns where funds return to the sender
 * Uses graph analysis to find cycles in transaction flows
 */
function analyzeCircularFlows(
  transactions: CBDCTransaction[],
  userId: string
): CircularFlowResult {
  // Build a directed graph of transactions
  const graph: Map<string, Array<{ to: string; amount: number; timestamp: number; txId: string }>> = new Map();

  transactions.forEach(tx => {
    const sender = tx.senderId;
    const recipient = tx.recipientId;

    if (!graph.has(sender)) {
      graph.set(sender, []);
    }

    graph.get(sender)!.push({
      to: recipient,
      amount: parseFloat(tx.amount),
      timestamp: new Date(tx.createdAt).getTime(),
      txId: tx.transactionId,
    });
  });

  const cycles: CircularFlowResult['cycles'] = [];

  // DFS to find cycles starting from the user
  function findCycles(
    current: string,
    path: string[],
    amounts: number[],
    timestamps: number[],
    visited: Set<string>
  ) {
    if (path.length > 1 && current === userId) {
      // Found a cycle back to the user
      const totalAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const timeSpan = Math.max(...timestamps) - Math.min(...timestamps);

      cycles.push({
        path: [...path],
        amount: totalAmount,
        timeSpan,
      });
      return;
    }

    if (path.length > 5 || visited.has(current)) {
      // Limit depth and prevent infinite loops
      return;
    }

    visited.add(current);
    const edges = graph.get(current) || [];

    for (const edge of edges) {
      findCycles(
        edge.to,
        [...path, edge.to],
        [...amounts, edge.amount],
        [...timestamps, edge.timestamp],
        new Set(visited)
      );
    }
  }

  // Start DFS from userId
  const userEdges = graph.get(userId) || [];
  for (const edge of userEdges) {
    findCycles(
      edge.to,
      [userId, edge.to],
      [edge.amount],
      [edge.timestamp],
      new Set([userId])
    );
  }

  // Calculate score based on cycles found
  let score = 0;
  if (cycles.length > 0) {
    // Base score for having any cycles
    score = 40;

    // Additional score based on cycle characteristics
    cycles.forEach(cycle => {
      // Quick cycles (< 24 hours) are more suspicious
      if (cycle.timeSpan < 24 * 60 * 60 * 1000) {
        score += 20;
      }
      // Multiple cycles compound suspicion
      score += 10;
      // Large amounts are more suspicious
      if (cycle.amount > 10000) {
        score += 15;
      }
    });

    score = Math.min(100, score);
  }

  return {
    detected: cycles.length > 0,
    score,
    cycles: cycles.slice(0, 5), // Return top 5 cycles
  };
}

/**
 * Get country codes from transactions for metadata
 */
function getCountriesFromTransactions(transactions: CBDCTransaction[]): string[] {
  const countries = new Set<string>();

  transactions.forEach(tx => {
    const country = extractCountryFromTransaction(tx);
    if (country) {
      countries.add(country);
    }
  });

  // If no countries extracted, return common defaults for display
  if (countries.size === 0) {
    return ['US']; // Default jurisdiction
  }

  return Array.from(countries);
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
  const userId = input.userId || 'unknown';

  // Calculate individual risk scores
  const velocityScore = analyzeVelocity(recentTransactions);
  const amountAnomalyScore = analyzeAmountAnomaly(recentTransactions, transactions);
  const timePatternScore = analyzeTimePattern(recentTransactions);
  const balanceBehaviorScore = analyzeBalanceBehavior(recentTransactions, wallet);
  const recipientPatternScore = analyzeRecipientPattern(recentTransactions, transactions);

  // New: Geographic risk analysis
  const geographicRisk = analyzeGeographicRisk(transactions);
  const geographicRiskScore = geographicRisk.score;

  // New: Circular flow detection (money laundering patterns)
  const circularFlows = analyzeCircularFlows(transactions, userId);
  const circularFlowScore = circularFlows.score;

  // Calculate weighted overall risk score with new factors
  // Updated weights: Velocity (20%), Amount (25%), Time (15%), Balance (15%), Recipient (10%), Geographic (10%), Circular (5%)
  const overallRisk =
    (velocityScore * 0.20) +
    (amountAnomalyScore * 0.25) +
    (timePatternScore * 0.15) +
    (balanceBehaviorScore * 0.15) +
    (recipientPatternScore * 0.10) +
    (geographicRiskScore * 0.10) +
    (circularFlowScore * 0.05);

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
  // Boost confidence if we have geographic data
  if (geographicRisk.jurisdictions.length > 0) confidence += 0.05;
  confidence = Math.max(0.3, Math.min(1, confidence));

  // Build risk factors array
  const riskFactors: RiskFactor[] = [];

  if (velocityScore > 30) {
    riskFactors.push({
      factor: 'High Transaction Velocity',
      score: velocityScore,
      description: `${recentTransactions.length} transactions detected. Threshold exceeded.`,
      severity: velocityScore > 70 ? 'HIGH' : 'MEDIUM',
    });
  }

  if (amountAnomalyScore > 30) {
    riskFactors.push({
      factor: 'Amount Anomaly',
      score: amountAnomalyScore,
      description: 'Transaction amounts deviate significantly from historical patterns',
      severity: amountAnomalyScore > 70 ? 'HIGH' : 'MEDIUM',
    });
  }

  if (timePatternScore > 30) {
    riskFactors.push({
      factor: 'Suspicious Timing',
      score: timePatternScore,
      description: 'Transactions at unusual hours or rapid succession',
      severity: timePatternScore > 70 ? 'HIGH' : 'MEDIUM',
    });
  }

  if (balanceBehaviorScore > 30) {
    riskFactors.push({
      factor: 'Account Draining',
      score: balanceBehaviorScore,
      description: 'Large transaction amounts relative to wallet balance',
      severity: balanceBehaviorScore > 70 ? 'HIGH' : 'MEDIUM',
    });
  }

  if (recipientPatternScore > 30) {
    riskFactors.push({
      factor: 'Unusual Recipient Pattern',
      score: recipientPatternScore,
      description: 'Multiple new recipients in short time period',
      severity: recipientPatternScore > 70 ? 'HIGH' : 'MEDIUM',
    });
  }

  // New: Geographic risk factor
  if (geographicRiskScore > 30) {
    riskFactors.push({
      factor: 'High-Risk Jurisdiction',
      score: geographicRiskScore,
      description: `Transactions involving ${geographicRisk.highRiskCountries.length > 0
        ? `FATF-listed countries: ${geographicRisk.highRiskCountries.join(', ')}`
        : 'elevated-risk jurisdictions'}`,
      severity: geographicRiskScore > 70 ? 'HIGH' : 'MEDIUM',
      details: {
        highRiskCountries: geographicRisk.highRiskCountries,
        jurisdictionCount: geographicRisk.jurisdictions.length,
      },
    });
  }

  // New: Circular flow risk factor
  if (circularFlowScore > 30) {
    riskFactors.push({
      factor: 'Circular Transaction Pattern',
      score: circularFlowScore,
      description: `Detected ${circularFlows.cycles.length} potential money laundering cycle(s)`,
      severity: circularFlowScore > 70 ? 'HIGH' : 'MEDIUM',
      details: {
        cycleCount: circularFlows.cycles.length,
        shortestCycle: circularFlows.cycles.length > 0
          ? circularFlows.cycles.reduce((min, c) =>
              c.path.length < min.path.length ? c : min
            ).path.length
          : 0,
      },
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
    geographicRiskScore: Math.round(geographicRiskScore),
    circularFlowScore: Math.round(circularFlowScore),
    riskFactors,
    circularFlows: circularFlows.detected ? circularFlows : undefined,
    geographicRisk: geographicRisk.jurisdictions.length > 0 ? geographicRisk : undefined,
    metadata: {
      transactionCount24h: txIn24h,
      transactionCount7d: transactions.length,
      avgTransactionAmount: avg,
      stdDevAmount: stdDev,
      uniqueRecipients: new Set(transactions.map(tx => tx.recipientId)).size,
      uniqueRecipients24h: uniqueRecipientsRecent,
      walletBalance: wallet ? (wallet.balance || '0') : '0',
      suspiciousPatterns: riskFactors.map(rf => rf.factor),
      receiverCountries: getCountriesFromTransactions(transactions),
    },
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
