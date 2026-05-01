import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../../../../src/di/tokens.js';
import { setupTestContainer, type TestMocks } from '../../../../helpers/test-app.js';
import type { GetHoldUseCase } from '../../../../../src/core/use-cases/security/get-hold.use-case.js';
import { NotFoundError } from '../../../../../src/core/errors/domain-errors.js';
import type { SecurityHold } from '../../../../../src/core/use-cases/security/security.types.js';

describe('GetHoldUseCase', () => {
  let mocks: TestMocks;
  let useCase: GetHoldUseCase;

  beforeEach(() => {
    container.clearInstances();
    mocks = setupTestContainer();
    useCase = container.resolve<GetHoldUseCase>(UC_TOKENS.GetHold);
  });

  it('returns the hold when found', async () => {
    const hold: SecurityHold = {
      id: 'hold-1',
      order_id: 'order-1',
      user_id: 'user-1',
      status: 'pending',
      reason: 'High risk score',
      created_at: new Date().toISOString(),
    } as SecurityHold;

    mocks.securityHoldRepo.addHold(hold);

    const result = await useCase.execute('hold-1');

    expect(result.id).toBe('hold-1');
    expect(result.status).toBe('pending');
  });

  it('throws NotFoundError when hold does not exist', async () => {
    await expect(
      useCase.execute('nonexistent-hold'),
    ).rejects.toThrow(NotFoundError);
  });
});
