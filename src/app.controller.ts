import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { Observable, tap } from 'rxjs';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): Observable<string> {
    return this.appService.getHello().pipe(tap((message) => this.logger.log('SERVICE RESULT - ' + message)));
  }

  @Get('greeting')
  getGreeting(): Observable<string> {
    return this.appService.getGreeting().pipe(tap((message) => this.logger.log('SERVICE RESULT - ' + message)));
  }
}
