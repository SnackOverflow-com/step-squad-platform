import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { TokenPayload } from './dto/token-payload';
import { UserCreateRequest } from '../user/dto/user-create-request';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/model/user.entity';
import { Repository } from 'typeorm';
import { UserRegisterRequest } from './dto/user-register-request';
import { UserLoginRequest } from './dto/user-login-request';
import { UserLoginResponse } from './dto/user-login-response';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UserService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async validateUser(userLoginRequest: UserLoginRequest): Promise<any> {
    const email = userLoginRequest.email;
    const user = await this.userRepository.findOneBy({ email });

    if (user && (await bcrypt.compare(userLoginRequest.password, user.password))) {
      const { password, ...result } = user;
      return result;
    }

    throw new UnauthorizedException('Invalid credentials');
  }

  async login(userLoginRequest: UserLoginRequest): Promise<UserLoginResponse> {
    const user: User = await this.validateUser(userLoginRequest);

    const token: TokenPayload = { email: user.email, sub: user.id };
    const jwt: string = this.jwtService.sign(token);

    return { token: jwt } as UserLoginResponse;
  }

  async register(userRegisterRequest: UserRegisterRequest): Promise<UserLoginResponse> {
    const hashedPassword = await bcrypt.hash(userRegisterRequest.password, 10);

    await this.usersService.createUser({
      firstName: userRegisterRequest.firstName,
      lastName: userRegisterRequest.lastName,
      email: userRegisterRequest.email,
      password: hashedPassword,
    } as UserCreateRequest);

    return this.login({
      email: userRegisterRequest.email,
      password: userRegisterRequest.password,
    } as UserLoginRequest);
  }
}
