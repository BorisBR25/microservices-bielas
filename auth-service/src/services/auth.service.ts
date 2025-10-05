import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    this.seedUsers();
  }

  async register(email: string, password: string, nombre: string, rol: string = 'cliente') {
    const existingUser = await this.usersRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
      nombre,
      rol,
    });

    await this.usersRepository.save(user);

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(email: string, password: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const secret = process.env.JWT_SECRET || 'tu-secret-super-seguro-cambiar-en-produccion';
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        rol: user.rol,
      },
      secret,
      { expiresIn: '24h' },
    );

    const { password: _, ...userWithoutPassword } = user;
    return {
      access_token: token,
      user: userWithoutPassword,
    };
  }

  async validateToken(token: string) {
    try {
      const secret = process.env.JWT_SECRET || 'tu-secret-super-seguro-cambiar-en-produccion';
      const decoded = jwt.verify(token, secret);
      return decoded;
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  async getProfile(userId: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  private async seedUsers() {
    const count = await this.usersRepository.count();
    if (count === 0) {
      console.log('🌱 Seeding usuarios iniciales...');

      const users = [
        {
          email: 'admin@bielas.com',
          password: await bcrypt.hash('Admin123!', 10),
          nombre: 'Juan Administrador',
          rol: 'admin',
        },
        {
          email: 'cliente@automotriz.com',
          password: await bcrypt.hash('Cliente123!', 10),
          nombre: 'María Cliente',
          rol: 'cliente',
        },
      ];

      for (const userData of users) {
        const user = this.usersRepository.create(userData);
        await this.usersRepository.save(user);
      }

      console.log('✅ Usuarios iniciales creados');
    }
  }
}
