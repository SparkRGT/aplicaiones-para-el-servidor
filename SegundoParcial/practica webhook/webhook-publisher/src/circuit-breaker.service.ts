import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CircuitBreakerStateEntity } from './entities/circuit-breaker-state.entity';
import { CircuitBreakerState, CircuitBreakerConfig } from './interfaces/circuit-breaker.interface';

@Injectable()
export class CircuitBreakerService {
  private readonly config: CircuitBreakerConfig = {
    failureThreshold: 5,
    timeout: 60000, // 60 segundos
    successThreshold: 2,
  };

  constructor(
    @InjectRepository(CircuitBreakerStateEntity, 'webhooks_db')
    private circuitBreakerRepository: Repository<CircuitBreakerStateEntity>,
  ) {}

  async getState(circuitKey: string): Promise<CircuitBreakerStateEntity> {
    let state = await this.circuitBreakerRepository.findOne({
      where: { circuit_key: circuitKey },
    });

    if (!state) {
      state = this.circuitBreakerRepository.create({
        circuit_key: circuitKey,
        state: CircuitBreakerState.CLOSED,
        failure_count: 0,
        success_count: 0,
      });
      state = await this.circuitBreakerRepository.save(state);
    }

    // Verificar si el circuito está en OPEN y si ya pasó el timeout
    if (state.state === CircuitBreakerState.OPEN) {
      const now = new Date();
      const openedAt = state.opened_at || state.last_state_change;
      const timeSinceOpen = now.getTime() - openedAt.getTime();

      if (timeSinceOpen >= this.config.timeout) {
        // Transición a HALF_OPEN
        state.state = CircuitBreakerState.HALF_OPEN;
        state.last_state_change = now;
        state.success_count = 0;
        await this.circuitBreakerRepository.save(state);
      }
    }

    return state;
  }

  async recordSuccess(circuitKey: string): Promise<void> {
    const state = await this.getState(circuitKey);

    if (state.state === CircuitBreakerState.HALF_OPEN) {
      state.success_count += 1;
      if (state.success_count >= this.config.successThreshold) {
        // Cerrar el circuito
        state.state = CircuitBreakerState.CLOSED;
        state.failure_count = 0;
        state.success_count = 0;
        state.opened_at = null;
      }
    } else if (state.state === CircuitBreakerState.CLOSED) {
      // Resetear contador de fallos en caso de éxito
      state.failure_count = 0;
    }

    state.last_state_change = new Date();
    await this.circuitBreakerRepository.save(state);
  }

  async recordFailure(circuitKey: string): Promise<void> {
    const state = await this.getState(circuitKey);
    const now = new Date();

    state.failure_count += 1;
    state.last_failure_time = now;

    if (state.state === CircuitBreakerState.HALF_OPEN) {
      // Si falla en HALF_OPEN, volver a OPEN
      state.state = CircuitBreakerState.OPEN;
      state.opened_at = now;
      state.success_count = 0;
    } else if (state.state === CircuitBreakerState.CLOSED) {
      // Si alcanza el umbral de fallos, abrir el circuito
      if (state.failure_count >= this.config.failureThreshold) {
        state.state = CircuitBreakerState.OPEN;
        state.opened_at = now;
      }
    }

    state.last_state_change = now;
    await this.circuitBreakerRepository.save(state);
  }

  async canExecute(circuitKey: string): Promise<boolean> {
    const state = await this.getState(circuitKey);
    return state.state === CircuitBreakerState.CLOSED || state.state === CircuitBreakerState.HALF_OPEN;
  }
}

