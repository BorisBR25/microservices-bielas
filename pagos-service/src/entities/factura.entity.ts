import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToOne } from 'typeorm';
import { Pago } from './pago.entity';

@Entity('facturas')
export class Factura {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  numero: string;

  @Column('decimal', { precision: 10, scale: 2 })
  monto: number;

  @OneToOne(() => Pago, pago => pago.factura)
  pago: Pago;

  @CreateDateColumn()
  createdAt: Date;
}
