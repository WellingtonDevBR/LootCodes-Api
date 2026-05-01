export interface DomainEvent {
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  payload: Record<string, unknown>;
  id?: string;
  createdAt?: string;
  version?: number;
}

export type DomainEventHandler = (event: DomainEvent) => Promise<void>;

export interface IEventBus {
  emit(event: DomainEvent): Promise<void>;
  subscribe(eventType: string, handler: DomainEventHandler): void;
}
