import { Injectable, Logger } from '@nestjs/common';

/**
 * Estados posibles del Circuit Breaker
 */
export enum CircuitBreakerState {
  CLOSED = 'CLOSED',        // Funcionando normalmente
  OPEN = 'OPEN',            // Sistema caído, rechaza requests
  HALF_OPEN = 'HALF_OPEN',  // Periodo de prueba
}

/**
 * Configuración del Circuit Breaker
 */
export interface CircuitBreakerConfig {
  failureThreshold: number;      // Número de fallos antes de OPEN
  successThreshold: number;      // Éxitos en HALF_OPEN antes de CLOSED
  timeout: number;               // Tiempo en ms antes de pasar a HALF_OPEN
  halfOpenRequests: number;      // Máximo requests en HALF_OPEN
}

/**
 * Estadísticas del Circuit Breaker por endpoint
 */
interface EndpointStats {
  state: CircuitBreakerState;
  failureCount: number;
  successCount: number;
  lastFailureAt?: Date;
  lastSuccessAt?: Date;
  openedAt?: Date;
  halfOpenRequestsCount: number;
}

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private readonly endpointStats = new Map<string, EndpointStats>();
  private readonly defaultConfig: CircuitBreakerConfig = {
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 60000, // 1 minuto
    halfOpenRequests: 1,
  };

  /**
   * Verifica si una solicitud puede pasar a través del Circuit Breaker
   * @param endpoint - URL del endpoint
   * @param config - Configuración del Circuit Breaker
   * @returns true si la solicitud puede proceder
   */
  canExecute(endpoint: string, config?: Partial<CircuitBreakerConfig>): boolean {
    const finalConfig = { ...this.defaultConfig, ...config };
    const stats = this.getOrCreateStats(endpoint, finalConfig);

    switch (stats.state) {
      case CircuitBreakerState.CLOSED:
        // Estado normal, permite ejecución
        return true;

      case CircuitBreakerState.OPEN:
        // Verificar si ya pasó el timeout para cambiar a HALF_OPEN
        if (stats.openedAt && Date.now() - stats.openedAt.getTime() > finalConfig.timeout) {
          this.logger.log(`⚡ Circuit Breaker [${endpoint}] transitando a HALF_OPEN`);
          stats.state = CircuitBreakerState.HALF_OPEN;
          stats.successCount = 0;
          stats.halfOpenRequestsCount = 0;
          return true; // Permitir 1 request de prueba
        }
        this.logger.warn(`🔴 Circuit Breaker [${endpoint}] está OPEN - rechazando solicitud`);
        return false;

      case CircuitBreakerState.HALF_OPEN:
        // Solo permitir limited requests
        if (stats.halfOpenRequestsCount < finalConfig.halfOpenRequests) {
          stats.halfOpenRequestsCount++;
          return true;
        }
        this.logger.warn(`🟠 Circuit Breaker [${endpoint}] HALF_OPEN - límite de requests alcanzado`);
        return false;
    }
  }

  /**
   * Registra un éxito en la ejecución
   * @param endpoint - URL del endpoint
   * @param config - Configuración del Circuit Breaker
   */
  recordSuccess(endpoint: string, config?: Partial<CircuitBreakerConfig>): void {
    const finalConfig = { ...this.defaultConfig, ...config };
    const stats = this.getOrCreateStats(endpoint, finalConfig);

    stats.lastSuccessAt = new Date();

    if (stats.state === CircuitBreakerState.HALF_OPEN) {
      stats.successCount++;

      if (stats.successCount >= finalConfig.successThreshold) {
        this.logger.log(`✅ Circuit Breaker [${endpoint}] transitando a CLOSED`);
        stats.state = CircuitBreakerState.CLOSED;
        stats.failureCount = 0;
        stats.successCount = 0;
        stats.halfOpenRequestsCount = 0;
      }
    } else if (stats.state === CircuitBreakerState.CLOSED) {
      // Reset contador de fallos en estado CLOSED
      stats.failureCount = 0;
    }
  }

  /**
   * Registra un fallo en la ejecución
   * @param endpoint - URL del endpoint
   * @param config - Configuración del Circuit Breaker
   */
  recordFailure(endpoint: string, config?: Partial<CircuitBreakerConfig>): void {
    const finalConfig = { ...this.defaultConfig, ...config };
    const stats = this.getOrCreateStats(endpoint, finalConfig);

    stats.lastFailureAt = new Date();
    stats.failureCount++;

    this.logger.warn(
      `❌ Fallo registrado para [${endpoint}] - Contador: ${stats.failureCount}/${finalConfig.failureThreshold}`,
    );

    if (stats.state === CircuitBreakerState.HALF_OPEN) {
      // Si falla en HALF_OPEN, volver a OPEN
      this.logger.error(`⚠️ Circuit Breaker [${endpoint}] fallo en HALF_OPEN - volviendo a OPEN`);
      stats.state = CircuitBreakerState.OPEN;
      stats.openedAt = new Date();
      stats.successCount = 0;
      stats.halfOpenRequestsCount = 0;
    } else if (stats.state === CircuitBreakerState.CLOSED) {
      // Si alcanza threshold en CLOSED, ir a OPEN
      if (stats.failureCount >= finalConfig.failureThreshold) {
        this.logger.error(`🔴 Circuit Breaker [${endpoint}] abierto - demasiados fallos`);
        stats.state = CircuitBreakerState.OPEN;
        stats.openedAt = new Date();
      }
    }
  }

  /**
   * Obtiene el estado actual del Circuit Breaker
   * @param endpoint - URL del endpoint
   * @returns Estado actual
   */
  getState(endpoint: string): CircuitBreakerState {
    const stats = this.endpointStats.get(endpoint);
    return stats?.state || CircuitBreakerState.CLOSED;
  }

  /**
   * Obtiene estadísticas del Circuit Breaker
   * @param endpoint - URL del endpoint
   * @returns Estadísticas del endpoint
   */
  getStats(endpoint: string): EndpointStats | undefined {
    return this.endpointStats.get(endpoint);
  }

  /**
   * Resetea el Circuit Breaker de un endpoint
   * @param endpoint - URL del endpoint
   */
  reset(endpoint: string): void {
    const stats = this.endpointStats.get(endpoint);
    if (stats) {
      this.logger.log(`🔄 Reseteando Circuit Breaker para [${endpoint}]`);
      stats.state = CircuitBreakerState.CLOSED;
      stats.failureCount = 0;
      stats.successCount = 0;
      stats.halfOpenRequestsCount = 0;
      stats.openedAt = undefined;
    }
  }

  /**
   * Obtiene todos los estados de Circuit Breaker (para monitoreo)
   * @returns Mapa de endpoints y sus estados
   */
  getAllStats(): Record<string, EndpointStats> {
    const result: Record<string, EndpointStats> = {};
    this.endpointStats.forEach((stats, endpoint) => {
      result[endpoint] = { ...stats };
    });
    return result;
  }

  /**
   * Obtiene o crea estadísticas para un endpoint
   */
  private getOrCreateStats(
    endpoint: string,
    config: CircuitBreakerConfig,
  ): EndpointStats {
    if (!this.endpointStats.has(endpoint)) {
      this.endpointStats.set(endpoint, {
        state: CircuitBreakerState.CLOSED,
        failureCount: 0,
        successCount: 0,
        halfOpenRequestsCount: 0,
      });
    }
    return this.endpointStats.get(endpoint)!;
  }
}
