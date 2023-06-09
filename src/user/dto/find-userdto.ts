import { PartialType } from '@nestjs/mapped-types';
import { User } from '../entities/user.entity';

export class FindUser extends PartialType(User) {}
