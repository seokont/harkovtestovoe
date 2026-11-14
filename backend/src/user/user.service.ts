import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { User } from '../user/user.model.js';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}
  create(createUserDto: CreateUserDto): Promise<User> {
    return this.userModel.create({
      userName: createUserDto.userName,
      email: createUserDto.email ?? '',
    });
  }

  findAll(): Promise<User[]> {
    return this.userModel.findAll();
  }

  findOne(id: string): Promise<User | null> {
    return this.userModel.findOne({
      where: {
        id,
      },
    });
  }

  update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    return this.userModel
      .update(updateUserDto, {
        where: {
          id,
        },
      })
      .then(() => this.findOne(id));
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
