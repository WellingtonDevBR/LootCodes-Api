import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetBalanceUseCase } from '../../../../../src/core/use-cases/wallet/get-balance.use-case.js';
import type { IWalletRepository } from '../../../../../src/core/ports/wallet-repository.port.js';
import type { WalletBalance } from '../../../../../src/core/use-cases/wallet/wallet.types.js';

describe('GetBalanceUseCase', () => {
  let useCase: GetBalanceUseCase;
  let walletRepo: {
    getBalance: ReturnType<typeof vi.fn>;
    listLedger: ReturnType<typeof vi.fn>;
    getOrderEarnings: ReturnType<typeof vi.fn>;
    claimReviewReward: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    walletRepo = {
      getBalance: vi.fn(),
      listLedger: vi.fn(),
      getOrderEarnings: vi.fn(),
      claimReviewReward: vi.fn(),
    };
    useCase = new GetBalanceUseCase(walletRepo as unknown as IWalletRepository);
  });

  it('should return wallet balance for user', async () => {
    const balance: WalletBalance = {
      balance_cents: 5000,
      lifetime_credited_cents: 10000,
      lifetime_redeemed_cents: 5000,
      expiring_soon_cents: 1000,
      next_expiry: '2026-06-01T00:00:00Z',
    };
    walletRepo.getBalance.mockResolvedValue(balance);

    const result = await useCase.execute('user-1');

    expect(result).toEqual(balance);
    expect(walletRepo.getBalance).toHaveBeenCalledWith('user-1');
  });

  it('should return zero balance for new user', async () => {
    const balance: WalletBalance = {
      balance_cents: 0,
      lifetime_credited_cents: 0,
      lifetime_redeemed_cents: 0,
      expiring_soon_cents: 0,
      next_expiry: null,
    };
    walletRepo.getBalance.mockResolvedValue(balance);

    const result = await useCase.execute('new-user');

    expect(result).toEqual(balance);
    expect(result.balance_cents).toBe(0);
    expect(result.next_expiry).toBeNull();
  });

  it('should propagate repository errors', async () => {
    walletRepo.getBalance.mockRejectedValue(new Error('DB connection failed'));

    await expect(useCase.execute('user-1')).rejects.toThrow('DB connection failed');
  });
});
