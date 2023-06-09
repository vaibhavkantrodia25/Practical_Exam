import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags } from '@nestjs/swagger';
import ResponseDto from 'src/utils/createresponsedto';
import UpdateResponseDto from 'src/utils/updateresponsedto';
import { User } from './entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guard/role.guard';
import { Roles } from 'src/auth/decorator/role.decorator';
import { ROLE } from 'src/helper/role.enum';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(ROLE.SUPER)
  create(@Body() createUserDto: CreateUserDto): Promise<ResponseDto> {
    return this.userService.create(createUserDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(ROLE.SUB)
  @Get()
  async findAll(
    @Query('name') name: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<ResponseDto> {
    return this.userService.findAll(name, page, limit);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(ROLE.USER)
  @Patch('update/:id')
  update(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UpdateResponseDto> {
    return this.userService.update(id, updateUserDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(ROLE.SUPER)
  @Delete('delete/:id')
  remove(@Param('id') id: number): Promise<UpdateResponseDto> {
    return this.userService.remove(id);
  }
}
