import { z } from 'zod';

const uuidField = z.string().uuid();

/**
 * Mirrors storefront → Edge `card-challenge` body. Strict: unknown keys rejected.
 */
export const buyerEdgeCardChallengeBodySchemaZ = z.discriminatedUnion('action', [
  z
    .object({
      action: z.literal('start-challenge'),
      order_id: uuidField,
      payment_intent_id: z.string().min(1).max(255),
    })
    .strict(),
  z
    .object({
      action: z.literal('verify'),
      order_id: uuidField,
      amount_minor: z.number().int().min(1).max(100_000),
    })
    .strict(),
  z
    .object({
      action: z.literal('choose-id'),
      order_id: uuidField,
    })
    .strict(),
]);
