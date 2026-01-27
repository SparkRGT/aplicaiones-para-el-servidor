import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CircuitBreakerState } from '../interfaces/circuit-breaker.interface';

@Entity('circuit_breaker_state')
export class CircuitBreakerStateEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  circuit_key: string;

  @Column({ type: 'varchar', length: 20, default: 'CLOSED' })
  state: CircuitBreakerState;

  @Column({ type: 'int', default: 0 })
  failure_count: number;

  @Column({ type: 'int', default: 0 })
  success_count: number;

  @Column({ type: 'timestamp', nullable: true })
  last_failure_time: Date;

  @Column({ type: 'timestamp', nullable: true })
  opened_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  last_state_change: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

