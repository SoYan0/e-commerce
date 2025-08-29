import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './entities/session.entity';
import { UsersService } from 'src/users/users.service';

import * as bcrypt from 'bcrypt';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
    private readonly usersService: UsersService,
  ) {}

  async createSession(dto: CreateSessionDto) {
    const user = await this.usersService.findById(dto.userId);

    if (!user) {
      return { message: 'User not found' };
    }

    const session = await this.sessionRepo.findOne({
      where: { refreshToken: dto.refreshToken },
      relations: ['user'],
    });

    if (session) {
      return { message: 'Session already exists', session };
    }

    const newSession = this.sessionRepo.create({
      user,
      refreshToken: dto.refreshToken,
      userAgent: dto.userAgent,
      ipAddress: Array.isArray(dto.ipAddress)
        ? dto.ipAddress.join(', ')
        : dto.ipAddress,
      expiresAt: dto.expiresAt,
    });

    return await this.sessionRepo.save(newSession);
  }

  async findSessionByRefreshToken(refreshToken: string) {
    const sessions = await this.sessionRepo.find({
      relations: ['user'],
    });

    if (!sessions || sessions.length === 0) {
      return null;
    }

    for (const session of sessions) {
      if (await bcrypt.compare(refreshToken, session.refreshToken)) {
        return session;
      }
    }

    return null;
  }

  async updateSession(id: number, dto: UpdateSessionDto) {
    const session = await this.sessionRepo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    Object.assign(session, dto);

    return await this.sessionRepo.save(session);
  }

  async deleteSession(id: number) {
    return await this.sessionRepo.delete(id);
  }
}
