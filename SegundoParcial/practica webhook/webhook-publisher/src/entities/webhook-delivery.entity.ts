import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { WebhookSubscription } from './webhook-subscription.entity';

@Entity('webhook_deliveries')
export class WebhookDelivery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  subscription_id: number;

  @ManyToOne(() => WebhookSubscription)
  @JoinColumn({ name: 'subscription_id' })
  subscription?: WebhookSubscription;

  @Column({ type: 'varchar', length: 255 })
  event_id: string;

  @Column({ type: 'varchar', length: 100 })
  event_type: string;

  @Column({ type: 'text' })
  url: string;

  @Column({ type: 'jsonb' })
  payload: any;

  @Column({ type: 'varchar', length: 50 })
  status: string; // 'pending', 'success', 'failed', 'retrying'

  @Column({ type: 'int', default: 1 })
  attempt_number: number;

  @Column({ type: 'int', nullable: true })
  http_status_code: number;

  @Column({ type: 'text', nullable: true })
  response_body: string;

  @Column({ type: 'text', nullable: true })
  error_message: string;

  @Column({ type: 'timestamp', nullable: true })
  delivered_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

