import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

/**
 * Entidad exam2pRegistroAuditoria
 * Almacena los registros de auditoría del sistema
 */
@Entity('exam2pRegistroAuditoria')
export class Exam2pRegistroAuditoria {
  @PrimaryGeneratedColumn('uuid')
  registroId: string;

  @Column({ type: 'varchar', length: 255 })
  exam2p_entidad: string;

  @Column({ type: 'bigint' })
  exam2p_registroAfectadoId: number;

  @Column({ 
    type: 'varchar', 
    length: 50,
  })
  exam2p_accion: 'CREAR' | 'MODIFICAR' | 'ELIMINAR';

  @Column({ type: 'timestamp' })
  exam2p_fechaHora: Date;

  @Column({ type: 'text', nullable: true })
  exam2p_detalle: string;

  @CreateDateColumn()
  createdAt: Date;
}
