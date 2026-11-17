import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model.js';

export interface CreateUserInput {
  userName: string;
  email: string;
  homePage?: string;
}

@Injectable()
export class UserService {
  constructor(@InjectModel(User) private readonly userModel: typeof User) {}

  async findOrCreate(input: CreateUserInput): Promise<User> {
    let user = await this.userModel.findOne({ where: { email: input.email } });
    if (!user) {
      user = await this.userModel.create({
        userName: input.userName,
        email: input.email,
        homePage: input.homePage ?? '',
      });
    }
    return user;
  }

  findAll(): Promise<User[]> {
    return this.userModel.findAll();
  }

  findOne(id: string): Promise<User | null> {
    return this.userModel.findByPk(id);
  }
}
