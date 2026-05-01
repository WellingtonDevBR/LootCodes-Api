import { injectable } from 'tsyringe';
import type { IEventBus, DomainEvent, DomainEventHandler } from '../../core/ports/event-bus.port.js';
import { createLogger } from '../../shared/logger.js';

const logger = createLogger('event-bus');

@injectable()
export class InProcessEventBusAdapter implements IEventBus {
  private handlers = new Map<string, DomainEventHandler[]>();

  async emit(event: DomainEvent): Promise<void> {
    const eventHandlers = this.handlers.get(event.eventType) ?? [];
    const wildcardHandlers = this.handlers.get('*') ?? [];
    const allHandlers = [...eventHandlers, ...wildcardHandlers];

    for (const handler of allHandlers) {
      try {
        await handler(event);
      } catch (err) {
        logger.error('Event handler failed', err as Error, {
          eventType: event.eventType,
          aggregateId: event.aggregateId,
        });
      }
    }
  }

  subscribe(eventType: string, handler: DomainEventHandler): void {
    const existing = this.handlers.get(eventType) ?? [];
    existing.push(handler);
    this.handlers.set(eventType, existing);
  }
}
