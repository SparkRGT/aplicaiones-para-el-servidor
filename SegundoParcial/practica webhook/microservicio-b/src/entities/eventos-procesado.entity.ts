import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('eventos_procesados')
export class EventosProcesado {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  event_id: string;

  @Column({ type: 'varchar', length: 100 })
  event_type: string;

  @CreateDateColumn()
  processed_at: Date;
}

