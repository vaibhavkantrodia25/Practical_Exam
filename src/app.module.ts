import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { config } from './config/conn';

@Module({
  imports: [UserModule, TypeOrmModule.forRoot(config), AuthModule],
})
export class AppModule {}
