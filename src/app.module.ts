import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './web/user/user.module';
import { User } from './web/user/model/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      password: 'postgres',
      username: 'postgres',
      entities: [User],
      database: 'postgres',
      synchronize: true,
      logging: false,
    }),
    UserModule,
  ],
})
export class AppModule {}
