import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';

@Injectable()
export class AppService {
  getHello(): Observable<string> {
    return of('Hello World!');
  }

  getGreeting(): Observable<string> {
    return of('Greetings from the backend!');
  }
}
