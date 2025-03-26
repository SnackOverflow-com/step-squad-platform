import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './web/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './web/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      password: 'postgres',
      username: 'postgres',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      database: 'postgres',
      synchronize: true,
      logging: false,
    }),
    UserModule,
    AuthModule,
  ],
})
export class AppModule {}
