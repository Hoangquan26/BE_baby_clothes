import { Injectable } from '@nestjs/common';
import { LoginAuthDTO } from './dto/login-auth.dto';

@Injectable()
export class AuthService {
  login(loginAuthDto: LoginAuthDTO) {
    const { username, password, rememberMe } = loginAuthDto;
    return true
  }
}
