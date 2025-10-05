import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Factura } from './factura.entity';

@Entity('pagos')
export class Pago {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  solicitudId: number;

  @Column()
  userId: number;

  @Column('decimal', { precision: 10, scale: 2 })
  monto: number;

  @Column({ default: 'completado' })
  estado: string;

  @OneToOne(() => Factura, factura => factura.pago, { cascade: true })
  @JoinColumn()
  factura: Factura;

  @CreateDateColumn()
  createdAt: Date;
}
