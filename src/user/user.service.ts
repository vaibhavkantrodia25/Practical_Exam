import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import {
  EMAIL_ALREADY_EXIST,
  USERS_FOUND,
  USER_CREATE_SUCCESSFULLY,
  USER_DELETE_SUCCESSFULLY,
  USER_FOUND_SUCCESSFULLY,
  USER_NOT_FOUND,
  USER_UPDATE_SUCCESSFULLY,
} from 'src/helper/message';
import * as bcrypt from 'bcrypt';
import ResponseDto from 'src/utils/createresponsedto';
import { StringifyOptions } from 'querystring';
import { skip } from 'rxjs';
import UpdateResponseDto from 'src/utils/updateresponsedto';
import { FindUser } from './dto/find-userdto';

@Injectable()
export class UserService {
  setTokenAndDate(userEmailid: string, token: any, expireTime: Date) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  //create user
  async create(createUserDto: CreateUserDto): Promise<ResponseDto> {
    try {
      const { name, email, password } = createUserDto;

      const existingEmail = await this.userRepository.findOneBy({ email });

      if (existingEmail) {
        throw new HttpException(EMAIL_ALREADY_EXIST, HttpStatus.BAD_REQUEST);
      }

      const salt = await bcrypt.genSalt();
      const hashPassword = await bcrypt.hash(password, salt);

      const newUser = await this.userRepository.create({
        name,
        email,
        password: hashPassword,
      });

      await this.userRepository.save(newUser);
      newUser.password = undefined;
      return {
        statusCode: 201,
        message: USER_CREATE_SUCCESSFULLY,
        data: newUser,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserByEmail(email: string): Promise<User> {
    try {
      const result = await this.userRepository.findOne({ where: { email } });
      return result;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // find all users
  async findAll(
    name: string,
    page: number = 1,
    limit: number,
  ): Promise<ResponseDto> {
    try {
      limit = limit || 10;
      const skip = (page - 1) * limit;
      const user = await this.userRepository.createQueryBuilder('user');

      if (name) {
        user.where('user.name LIKE :name', { name: `%${name}%` });
      }
      user.skip(skip).take(limit);
      const users = await user.getMany();

      if (users.length === 0) {
        throw new HttpException(USER_NOT_FOUND, HttpStatus.NOT_FOUND);
      }
      return {
        statusCode: 200,
        message: USERS_FOUND,
        data: users,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UpdateResponseDto> {
    try {
      const user = await this.userRepository.findOneBy({ id });

      if (!user) {
        throw new HttpException(USER_NOT_FOUND, HttpStatus.NOT_FOUND);
      }
      const updateUser = await this.userRepository.update(id, updateUserDto);

      return {
        statusCode: 200,
        message: USER_UPDATE_SUCCESSFULLY,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number): Promise<UpdateResponseDto> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new HttpException(USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const delUser = await this.userRepository.delete(id);

    return {
      statusCode: 200,
      message: USER_DELETE_SUCCESSFULLY,
    };
  }
}
