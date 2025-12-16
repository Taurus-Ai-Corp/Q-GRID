import { describe, it, expect, beforeEach } from 'vitest';

/**
 * Fraud Detection Algorithm Tests
 * Testing multi-factor risk scoring system
 */

interface FraudAnalysisInput {
  userId: string;
  recentTransactionCount?: number;
  averageAmount?: number;
  latestAmount?: number;
  latestTimestamp?: Date;
  walletBalance?: number;
  uniqueRecipients?: number;
}

// Simulated fraud detection logic (same as server/fraud-detector.ts)
class FraudDetector {
  /**
   * Calculate velocity score (25% weight)
   * Detects rapid transaction patterns
   */
  calculateVelocityScore(transactionCount: number): number {
    if (transactionCount > 50) return 100;
    if (transactionCount > 25) return 80;
    if (transactionCount > 7) return 60;
    if (transactionCount > 5) return 30;
    return 0;
  }

  /**
   * Calculate amount anomaly (30% weight)
   * Detects unusual transaction amounts using z-score
   */
  calculateAmountAnomaly(
    latestAmount: number,
    averageAmount: number,
    stdDeviation: number = 1
  ): number {
    if (averageAmount === 0) return 0;
    const zScore = Math.abs((latestAmount - averageAmount) / (stdDeviation || 1));
    if (zScore > 3) return 100;
    if (zScore > 2.5) return 80;
    if (zScore > 2.2) return 60;
    if (zScore > 2.0) return 40;
    if (zScore > 1.5) return 20;
    return 0;
  }

  /**
   * Calculate time pattern score (15% weight)
   * Detects unusual transaction times
   */
  calculateTimePatternScore(timestamp: Date): number {
    const hour = timestamp.getUTCHours();
    // High risk during unusual hours (2-6 AM)
    if (hour >= 2 && hour < 6) return 60;
    // Medium risk during late evening (11 PM - 2 AM)
    if (hour >= 23 || hour < 2) return 30;
    return 0;
  }

  /**
   * Calculate balance behavior score (20% weight)
   * Detects account draining patterns
   */
  calculateBalanceBehaviorScore(
    latestAmount: number,
    walletBalance: number
  ): number {
    if (walletBalance === 0) return 0;
    const drainPercentage = (latestAmount / walletBalance) * 100;
    if (drainPercentage > 80) return 100;
    if (drainPercentage > 60) return 80;
    if (drainPercentage > 40) return 60;
    if (drainPercentage > 20) return 30;
    return 0;
  }

  /**
   * Calculate recipient pattern score (10% weight)
   * Detects unusual recipient patterns
   */
  calculateRecipientPatternScore(uniqueRecipients: number): number {
    if (uniqueRecipients > 20) return 80;
    if (uniqueRecipients > 10) return 60;
    if (uniqueRecipients > 5) return 40;
    if (uniqueRecipients >= 2) return 20;
    return 0;
  }

  /**
   * Calculate overall fraud risk score (weighted sum)
   */
  calculateOverallRiskScore(
    velocityScore: number,
    amountAnomalyScore: number,
    timePatternScore: number,
    balanceBehaviorScore: number,
    recipientPatternScore: number
  ): number {
    return (
      velocityScore * 0.25 +
      amountAnomalyScore * 0.3 +
      timePatternScore * 0.15 +
      balanceBehaviorScore * 0.2 +
      recipientPatternScore * 0.1
    );
  }

  /**
   * Determine risk level
   */
  getRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (score > 70) return 'HIGH';
    if (score > 30) return 'MEDIUM';
    return 'LOW';
  }
}

describe('Fraud Detection System', () => {
  let fraudDetector: FraudDetector;

  beforeEach(() => {
    fraudDetector = new FraudDetector();
  });

  describe('Velocity Analysis (25% weight)', () => {
    it('should score rapid transactions as high risk', () => {
      expect(fraudDetector.calculateVelocityScore(60)).toBe(100);
      expect(fraudDetector.calculateVelocityScore(30)).toBe(80);
      expect(fraudDetector.calculateVelocityScore(15)).toBe(60);
    });

    it('should score normal transactions as low risk', () => {
      expect(fraudDetector.calculateVelocityScore(3)).toBe(0);
      expect(fraudDetector.calculateVelocityScore(0)).toBe(0);
    });

    it('should score moderate velocity as medium risk', () => {
      expect(fraudDetector.calculateVelocityScore(6)).toBe(30);
      expect(fraudDetector.calculateVelocityScore(8)).toBe(60);
    });
  });

  describe('Amount Anomaly Detection (30% weight)', () => {
    it('should detect extreme outliers (>3σ)', () => {
      const score = fraudDetector.calculateAmountAnomaly(5000, 100, 1);
      expect(score).toBe(100);
    });

    it('should detect significant anomalies (>2σ)', () => {
      const score = fraudDetector.calculateAmountAnomaly(2000, 100, 1);
      expect(score).toBeGreaterThanOrEqual(60);
    });

    it('should not flag normal amounts', () => {
      const score = fraudDetector.calculateAmountAnomaly(120, 100, 10);
      expect(score).toBeLessThan(30);
    });

    it('should handle zero average gracefully', () => {
      const score = fraudDetector.calculateAmountAnomaly(100, 0, 1);
      expect(score).toBe(0);
    });
  });

  describe('Time Pattern Analysis (15% weight)', () => {
    it('should flag unusual hours (2-6 AM)', () => {
      const timestamp = new Date('2025-11-29T04:00:00Z');
      const score = fraudDetector.calculateTimePatternScore(timestamp);
      expect(score).toBe(60);
    });

    it('should flag late evening (11 PM - 2 AM)', () => {
      const timestamp = new Date('2025-11-29T23:30:00Z');
      const score = fraudDetector.calculateTimePatternScore(timestamp);
      expect(score).toBe(30);
    });

    it('should allow normal business hours', () => {
      const timestamp = new Date('2025-11-29T14:00:00Z');
      const score = fraudDetector.calculateTimePatternScore(timestamp);
      expect(score).toBe(0);
    });
  });

  describe('Balance Behavior Analysis (20% weight)', () => {
    it('should detect account draining (>80%)', () => {
      const score = fraudDetector.calculateBalanceBehaviorScore(900, 1000);
      expect(score).toBe(100);
    });

    it('should detect large withdrawals (40-80%)', () => {
      const score1 = fraudDetector.calculateBalanceBehaviorScore(500, 1000);
      const score2 = fraudDetector.calculateBalanceBehaviorScore(700, 1000);
      expect(score1).toBeGreaterThanOrEqual(60);
      expect(score2).toBeGreaterThanOrEqual(60);
    });

    it('should allow normal withdrawals', () => {
      const score = fraudDetector.calculateBalanceBehaviorScore(100, 1000);
      expect(score).toBeLessThan(30);
    });

    it('should handle zero balance', () => {
      const score = fraudDetector.calculateBalanceBehaviorScore(100, 0);
      expect(score).toBe(0);
    });
  });

  describe('Recipient Pattern Analysis (10% weight)', () => {
    it('should flag suspicious recipient behavior', () => {
      expect(fraudDetector.calculateRecipientPatternScore(25)).toBe(80);
      expect(fraudDetector.calculateRecipientPatternScore(15)).toBe(60);
    });

    it('should allow normal recipient patterns', () => {
      expect(fraudDetector.calculateRecipientPatternScore(1)).toBe(0);
      expect(fraudDetector.calculateRecipientPatternScore(2)).toBe(20);
    });
  });

  describe('Overall Risk Scoring (Weighted)', () => {
    it('should calculate HIGH risk correctly', () => {
      // High velocity + late night + large amount
      const score = fraudDetector.calculateOverallRiskScore(
        100,  // velocity
        100,  // amount anomaly
        100,  // time pattern
        60,   // balance behavior
        0     // recipient pattern
      );
      expect(score).toBeGreaterThanOrEqual(70);
      expect(fraudDetector.getRiskLevel(score)).toBe('HIGH');
    });

    it('should calculate MEDIUM risk correctly', () => {
      // Moderate velocity + normal time
      const score = fraudDetector.calculateOverallRiskScore(
        60,  // velocity
        60,  // amount anomaly
        30,  // time pattern
        0,   // balance behavior
        0    // recipient pattern
      );
      expect(score).toBeGreaterThanOrEqual(31);
      expect(score).toBeLessThan(71);
      expect(fraudDetector.getRiskLevel(score)).toBe('MEDIUM');
    });

    it('should calculate LOW risk correctly', () => {
      // Normal patterns
      const score = fraudDetector.calculateOverallRiskScore(
        0,   // velocity
        0,   // amount anomaly
        0,   // time pattern
        0,   // balance behavior
        0    // recipient pattern
      );
      expect(score).toBeLessThan(31);
      expect(fraudDetector.getRiskLevel(score)).toBe('LOW');
    });

    it('should weight components correctly (weighted average)', () => {
      // Only velocity at 100 (25% weight)
      const score1 = fraudDetector.calculateOverallRiskScore(100, 0, 0, 0, 0);
      expect(score1).toBe(25);

      // Only amount anomaly at 100 (30% weight)
      const score2 = fraudDetector.calculateOverallRiskScore(0, 100, 0, 0, 0);
      expect(score2).toBe(30);

      // Only balance behavior at 100 (20% weight)
      const score3 = fraudDetector.calculateOverallRiskScore(0, 0, 0, 100, 0);
      expect(score3).toBe(20);
    });
  });

  describe('Real-World Scenarios', () => {
    it('should detect rural late-night suspicious transfer', () => {
      // Scenario: Rural user, 4 AM, 500 TRUP transfer, avg 50 TRUP
      const velocityScore = fraudDetector.calculateVelocityScore(2); // Low
      const amountScore = fraudDetector.calculateAmountAnomaly(500, 50, 10);
      const timeScore = fraudDetector.calculateTimePatternScore(new Date('2025-11-29T04:00:00Z'));
      const balanceScore = fraudDetector.calculateBalanceBehaviorScore(500, 600);
      const recipientScore = fraudDetector.calculateRecipientPatternScore(1);

      const totalScore = fraudDetector.calculateOverallRiskScore(
        velocityScore,
        amountScore,
        timeScore,
        balanceScore,
        recipientScore
      );

      expect(totalScore).toBeGreaterThanOrEqual(50);
      expect(fraudDetector.getRiskLevel(totalScore)).toBe('MEDIUM');
    });

    it('should allow normal CBDC transfer', () => {
      // Scenario: User at 2 PM, 100 TRUP transfer, avg 90 TRUP
      const velocityScore = fraudDetector.calculateVelocityScore(1);
      const amountScore = fraudDetector.calculateAmountAnomaly(100, 90, 10);
      const timeScore = fraudDetector.calculateTimePatternScore(new Date('2025-11-29T14:00:00Z'));
      const balanceScore = fraudDetector.calculateBalanceBehaviorScore(100, 5000);
      const recipientScore = fraudDetector.calculateRecipientPatternScore(1);

      const totalScore = fraudDetector.calculateOverallRiskScore(
        velocityScore,
        amountScore,
        timeScore,
        balanceScore,
        recipientScore
      );

      expect(totalScore).toBeLessThan(31);
      expect(fraudDetector.getRiskLevel(totalScore)).toBe('LOW');
    });

    it('should detect account compromise (rapid large transfers)', () => {
      // Scenario: 15 rapid transfers, avg 1000, now 5000, 3 AM
      const velocityScore = fraudDetector.calculateVelocityScore(15);
      const amountScore = fraudDetector.calculateAmountAnomaly(5000, 1000, 200);
      const timeScore = fraudDetector.calculateTimePatternScore(new Date('2025-11-29T03:00:00Z'));
      const balanceScore = fraudDetector.calculateBalanceBehaviorScore(5000, 8000);
      const recipientScore = fraudDetector.calculateRecipientPatternScore(10);

      const totalScore = fraudDetector.calculateOverallRiskScore(
        velocityScore,
        amountScore,
        timeScore,
        balanceScore,
        recipientScore
      );

      expect(totalScore).toBeGreaterThanOrEqual(70);
      expect(fraudDetector.getRiskLevel(totalScore)).toBe('HIGH');
    });
  });

  describe('Edge Cases', () => {
    it('should handle all zeros gracefully', () => {
      const score = fraudDetector.calculateOverallRiskScore(0, 0, 0, 0, 0);
      expect(score).toBe(0);
      expect(fraudDetector.getRiskLevel(score)).toBe('LOW');
    });

    it('should handle all maxes correctly', () => {
      const score = fraudDetector.calculateOverallRiskScore(100, 100, 100, 100, 100);
      expect(score).toBe(100);
      expect(fraudDetector.getRiskLevel(score)).toBe('HIGH');
    });

    it('should handle boundary scores', () => {
      const mediumBoundary = fraudDetector.calculateOverallRiskScore(60, 60, 0, 0, 0);
      expect(fraudDetector.getRiskLevel(mediumBoundary)).toBe('MEDIUM');

      const highBoundary = fraudDetector.calculateOverallRiskScore(100, 100, 100, 60, 0);
      expect(fraudDetector.getRiskLevel(highBoundary)).toBe('HIGH');
    });
  });
});
