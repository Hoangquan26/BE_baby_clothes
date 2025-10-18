import { Controller, Post, Body} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDTO } from './dto/login-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async login(@Body() loginAuthDTO: LoginAuthDTO) {
    return await this.authService.login(loginAuthDTO)
  }
}
