import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class CreateUserDto extends PartialType(User) {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'xyz@gmail.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: '********' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(12)
  @Matches(/^(?=.*\d)(?=.*[A-Z])(?=.*[a-z]).{8,12}$/, {
    message:
      'Your password must be at least 8 characters long, contain at least one number and have a mixture of uppercase and lowercase letters.',
  })
  password: string;
}
