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

  // CORS configuration
  app.enableCors({
    // Option 1: Allow any origin (less secure but more permissive)
    origin: true,

    // Option 2: Allow specific origins including localhost and a specific IP
    // origin: ['http://localhost:8081', 'http://192.168.1.100:8081', 'http://your-specific-ip:port'],

    // Option 3: Dynamic origin validation using function
    // origin: (origin, callback) => {
    //   const allowedOrigins = ['http://localhost:8081', 'http://192.168.1.100:8081'];
    //   const isAllowed = !origin || allowedOrigins.includes(origin);
    //   callback(null, isAllowed);
    // },

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
