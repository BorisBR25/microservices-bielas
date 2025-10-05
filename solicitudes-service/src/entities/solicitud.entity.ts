import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('solicitudes')
export class Solicitud {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productoId: number;

  @Column()
  cantidad: number;

  @Column()
  empresa: string;

  @Column({ nullable: true })
  observaciones: string;

  @Column()
  userId: number;

  @Column({ default: 'pendiente' })
  estado: string;

  @CreateDateColumn()
  createdAt: Date;
}
