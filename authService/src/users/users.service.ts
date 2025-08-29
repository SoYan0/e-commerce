import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async createUser(dto: CreateUserDto) {
    const user = this.userRepo.create(dto);

    return await this.userRepo.save(user);
  }

  async updateUser(user: User) {
    const udpatedUser = await this.userRepo.update(user.id, {
      ...user,
    });

    if (udpatedUser.affected === 0) {
      throw new BadRequestException('User not found');
    }

    return { message: 'User updated successfully' };
  }

  async findByEmail(email: string) {
    const user = await this.userRepo.findOne({
      where: { email },
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async isEmailAvailable(email: string) {
    const user = await this.findByEmail(email);
    return !user;
  }

  async activateUserByEmail(email: string) {
    const user = await this.findByEmail(email);
    if (!user) {
      return null;
    }

    user.isActive = true;

    return await this.userRepo.save(user);
  }

  async findById(id: number) {
    const user = await this.userRepo.findOne({
      where: { id },
    });

    if (!user) {
      return null;
    }

    return user;
  }
}
