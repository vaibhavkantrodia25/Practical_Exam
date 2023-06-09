import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  EMAIL_NOT_FOUND,
  FORGOT_PASSWORD_SENT,
  INCORRECT_PASSWORD_MESSAGE,
  INVALID_LOGIN_CREDENTIALS_MESSAGE,
  LOGIN_SUCCESSFULLY,
  PASSWORD_CHANGED_MESSAGE,
  PASSWORD_SAME_MESSAGE,
} from 'src/helper/message';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import ResponseDto from 'src/utils/createresponsedto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login-userdto';
import { JwtPayload } from './strategy/jwt.payload';
import { LoginResponseDto } from './dto/loginresponsedto';
import { ChangePasswordDto } from './dto/change-passwordDto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import UpdateResponseDto from 'src/utils/updateresponsedto';
import { jwtConstants } from './constants/constants';
import { EmailService } from 'src/helper/EmailService';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userTable: Repository<User>,
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  // login
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    try {
      const user = await this.userService.getUserByEmail(loginDto.email);

      if (!user) {
        throw new UnauthorizedException(INVALID_LOGIN_CREDENTIALS_MESSAGE);
      }

      const passwordValidate = await bcrypt.compare(
        loginDto.password,
        user.password,
      );

      if (!passwordValidate) {
        throw new UnauthorizedException(INVALID_LOGIN_CREDENTIALS_MESSAGE);
      }

      const payload: JwtPayload = { email: user.email, role: user.role };
      const accessToken: string = await this.jwtService.sign(payload);

      const { id, name, email, role } = user;

      return {
        accessToken,
        statusCode: 201,
        data: { id, name, email, role },
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //change password
  async changePassword(
    changePasswordDto: ChangePasswordDto,
    user: User,
  ): Promise<ResponseDto> {
    try {
      const { password, new_password } = changePasswordDto;

      const passwordvalidation = await bcrypt.compare(password, user.password);

      if (!passwordvalidation) {
        throw new BadRequestException(INCORRECT_PASSWORD_MESSAGE);
      }

      if (password === new_password) {
        throw new BadRequestException(PASSWORD_SAME_MESSAGE);
      }

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(new_password, salt);

      user.password = hashedPassword;
      await this.userTable.save(user);

      return {
        statusCode: 200,
        message: PASSWORD_CHANGED_MESSAGE,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //forgot password

  async forgotPassword(email, req): Promise<UpdateResponseDto> {
    try {
      const user = await this.userService.getUserByEmail(email);

      if (!user) {
        throw new UnauthorizedException(EMAIL_NOT_FOUND);
      }

      const userEmailid = user.email;

      const token = this.jwtService.sign(
        { user: user.id, email: userEmailid },
        { secret: jwtConstants.secret },
      );
      const expireTime = new Date(Date.now() + 15 * 60 * 1000);

      await this.userService.setTokenAndDate(userEmailid, token, expireTime);

      const resetPasswordLink = `${req.protocol}://${req.get(
        'host',
      )}/auth/password-reset/${token}`;
      await EmailService.sendEmail(
        userEmailid,
        'Reset Password link',
        resetPasswordLink,
      );

      return {
        statusCode: 201,
        message: FORGOT_PASSWORD_SENT,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
