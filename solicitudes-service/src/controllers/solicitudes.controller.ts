import { Controller, Post, Get, Put, Delete, Body, Param, Headers, UnauthorizedException } from '@nestjs/common';
import { SolicitudesService } from '../services/solicitudes.service';
import * as jwt from 'jsonwebtoken';

@Controller('solicitudes')
export class SolicitudesController {
  constructor(private readonly solicitudesService: SolicitudesService) {}

  private getUserFromToken(authorization: string) {
    if (!authorization) {
      throw new UnauthorizedException('Token no proporcionado');
    }
    const token = authorization.replace('Bearer ', '');
    try {
      const secret = process.env.JWT_SECRET || 'tu-secret-super-seguro-cambiar-en-produccion';
      return jwt.verify(token, secret) as any;
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }

  @Post()
  async create(@Body() body: any, @Headers('authorization') authorization: string) {
    const user = this.getUserFromToken(authorization);
    return this.solicitudesService.create(body, user.userId);
  }

  @Get()
  async findAll(@Headers('authorization') authorization: string) {
    this.getUserFromToken(authorization);
    return this.solicitudesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Headers('authorization') authorization: string) {
    this.getUserFromToken(authorization);
    return this.solicitudesService.findOne(+id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any, @Headers('authorization') authorization: string) {
    this.getUserFromToken(authorization);
    return this.solicitudesService.update(+id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Headers('authorization') authorization: string) {
    this.getUserFromToken(authorization);
    return this.solicitudesService.remove(+id);
  }
}
