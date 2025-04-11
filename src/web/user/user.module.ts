import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './model/user.entity';
import { UserToUserResponseDtoMapper } from './mapper/user-to-user-response-dto-mapper';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService, UserToUserResponseDtoMapper],
  exports: [UserService, TypeOrmModule.forFeature([User])],
})
export class UserModule {}
