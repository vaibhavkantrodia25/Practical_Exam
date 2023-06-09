import {
  Controller,
  Post,
  Body,
  Req,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login-userdto';
import { LoginResponseDto } from './dto/loginresponsedto';
import { ChangePasswordDto } from './dto/change-passwordDto';
import ResponseDto from 'src/utils/createresponsedto';
import { GetUser } from './decorator/get-userdecorator';
import { User } from 'src/user/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './guard/role.guard';
import { Roles } from './decorator/role.decorator';
import { ROLE } from 'src/helper/role.enum';
import UpdateResponseDto from 'src/utils/updateresponsedto';

@ApiTags('Auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  signIn(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @Patch('change-password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @GetUser() user: User,
  ): Promise<ResponseDto> {
    return this.authService.changePassword(changePasswordDto, user);
  }

  @Post('/forgot-pasword')
  async forgotPassword(
    @Body('email') email: string,
    @Req() req,
  ): Promise<UpdateResponseDto> {
    return this.authService.forgotPassword(email, req);
  }
}
