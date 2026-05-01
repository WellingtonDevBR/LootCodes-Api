import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IDatabase } from '../../core/ports/database.port.js';
import type { IRiskAssessor } from '../../core/ports/risk-assessor.port.js';
import type { RiskAssessmentInput, RiskAssessment } from '../../core/use-cases/payments/payment.types.js';
import { createLogger } from '../../shared/logger.js';

const logger = createLogger('supabase-risk-assessor');

const SAFE_DEFAULT: RiskAssessment = {
  score: 0,
  level: 'low',
  factors: ['risk_engine_error'],
  should_hold: false,
  should_block: false,
};

interface IpReputationRow {
  risk_score: number | null;
  is_vpn: boolean | null;
  is_proxy: boolean | null;
}

@injectable()
export class SupabaseRiskAssessorAdapter implements IRiskAssessor {
  constructor(
    @inject(TOKENS.Database) private db: IDatabase,
  ) {}

  async assess(input: RiskAssessmentInput): Promise<RiskAssessment> {
    try {
      let score = 0;
      const factors: string[] = [];

      await this.checkIpReputation(input.client_ip, factors, (pts) => { score += pts; });
      await this.checkIpVelocity(input.client_ip, factors, (pts) => { score += pts; });

      if (input.user_id) {
        await this.checkUserVelocity(input.user_id, factors, (pts) => { score += pts; });
      }

      if (!input.fingerprint_hash) {
        score += 10;
        factors.push('missing_fingerprint');
      }

      if (input.client_ip === 'unknown') {
        score += 15;
        factors.push('unknown_ip');
      }

      const level = this.scoreToLevel(score);

      logger.info('Risk assessment completed', {
        orderId: input.order_id,
        score,
        level,
        factorCount: factors.length,
      });

      return {
        score,
        level,
        factors,
        should_hold: score >= 50,
        should_block: score >= 75,
      };
    } catch (err: unknown) {
      logger.error('Risk assessment engine failed — returning safe default', err, {
        orderId: input.order_id,
      });
      return { ...SAFE_DEFAULT };
    }
  }

  private async checkIpReputation(
    ip: string,
    factors: string[],
    addScore: (pts: number) => void,
  ): Promise<void> {
    try {
      const row = await this.db.queryOne<IpReputationRow>('ip_reputation_cache', {
        eq: [['ip_address', ip]],
        select: 'risk_score,is_vpn,is_proxy',
      });

      if (!row) return;

      if (row.risk_score != null && row.risk_score > 50) {
        addScore(20);
        factors.push(`high_ip_risk_score:${row.risk_score}`);
      }

      if (row.is_vpn) {
        addScore(15);
        factors.push('vpn_detected');
      } else if (row.is_proxy) {
        addScore(15);
        factors.push('proxy_detected');
      }
    } catch (err: unknown) {
      logger.warn('IP reputation check failed — skipping signal', err, { ip });
    }
  }

  private async checkIpVelocity(
    ip: string,
    factors: string[],
    addScore: (pts: number) => void,
  ): Promise<void> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const recentOrders = await this.db.rpc<{ count: number }>('count_orders_by_ip_since', {
        p_ip: ip,
        p_since: oneHourAgo,
      });

      const count = typeof recentOrders === 'object' && recentOrders !== null
        ? (recentOrders as { count: number }).count
        : 0;

      if (count > 3) {
        addScore(25);
        factors.push(`high_ip_velocity:${count}`);
      }
    } catch (err: unknown) {
      logger.warn('IP velocity check failed — skipping signal', err, { ip });
    }
  }

  private async checkUserVelocity(
    userId: string,
    factors: string[],
    addScore: (pts: number) => void,
  ): Promise<void> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const recentOrders = await this.db.rpc<{ count: number }>('count_orders_by_user_since', {
        p_user_id: userId,
        p_since: oneHourAgo,
      });

      const count = typeof recentOrders === 'object' && recentOrders !== null
        ? (recentOrders as { count: number }).count
        : 0;

      if (count > 5) {
        addScore(20);
        factors.push(`high_user_velocity:${count}`);
      }
    } catch (err: unknown) {
      logger.warn('User velocity check failed — skipping signal', err, { userId });
    }
  }

  private scoreToLevel(score: number): RiskAssessment['level'] {
    if (score < 30) return 'low';
    if (score < 50) return 'medium';
    if (score < 75) return 'high';
    return 'critical';
  }
}
