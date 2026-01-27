export enum CircuitBreakerState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitBreakerConfig {
  failureThreshold: number; // Número de fallos antes de abrir (default: 5)
  timeout: number; // Tiempo en ms antes de intentar half-open (default: 60000)
  successThreshold: number; // Número de éxitos para cerrar desde half-open (default: 2)
}

export interface CircuitBreakerStateEntity {
  id?: number;
  circuitKey: string;
  state: CircuitBreakerState;
  failureCount: number;
  successCount: number;
  lastFailureTime?: Date;
  openedAt?: Date;
  lastStateChange: Date;
}

