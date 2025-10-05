import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from '../entities/producto.entity';

@Injectable()
export class InventarioService {
  constructor(
    @InjectRepository(Producto)
    private productosRepository: Repository<Producto>,
  ) {
    this.seedProductos();
  }

  async findAll() {
    return this.productosRepository.find({ order: { nombre: 'ASC' } });
  }

  async findOne(id: number) {
    const producto = await this.productosRepository.findOne({ where: { id } });
    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }
    return producto;
  }

  async actualizarStock(id: number, cantidad: number) {
    const producto = await this.findOne(id);

    const nuevoStock = producto.stock + cantidad;
    if (nuevoStock < 0) {
      throw new BadRequestException('Stock insuficiente para realizar esta operación');
    }

    producto.stock = nuevoStock;
    await this.productosRepository.save(producto);

    return producto;
  }

  private async seedProductos() {
    const count = await this.productosRepository.count();
    if (count === 0) {
      console.log('🌱 Seeding productos de inventario...');

      const productos = [
        {
          nombre: 'Biela Motor V8',
          codigo: 'BIE-V8-001',
          stock: 100,
          precio: 250.0,
          descripcion: 'Biela para motor V8 alta resistencia',
        },
        {
          nombre: 'Biela Motor V6',
          codigo: 'BIE-V6-002',
          stock: 150,
          precio: 180.0,
          descripcion: 'Biela para motor V6 estándar',
        },
        {
          nombre: 'Biela Motor 4 Cilindros',
          codigo: 'BIE-4C-003',
          stock: 200,
          precio: 120.0,
          descripcion: 'Biela para motor 4 cilindros',
        },
      ];

      for (const productoData of productos) {
        const producto = this.productosRepository.create(productoData);
        await this.productosRepository.save(producto);
      }

      console.log('✅ Productos de inventario creados');
    }
  }
}
