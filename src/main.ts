import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      logLevels: ['error', 'log', 'warn'],
    }),
  });

  // Enable CORS for any localhost origin
  app.enableCors({
    origin: /localhost(:[0-9]+)?$/,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  // Add validation pipe for DTO validation
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Set up Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Step Squad API')
    .setDescription('Step Squad Platform API Documentation')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('user', 'User management endpoints')
    .addTag('leaderboard', 'Leaderboard endpoints')
    .addTag('activity', 'Activity tracking endpoints')
    .addTag('friend', 'Friend management endpoints')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 8080);
}

bootstrap();
