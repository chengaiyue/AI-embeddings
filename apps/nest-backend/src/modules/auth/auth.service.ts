import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async login(username: string, password: string) {
    const expectUser = this.config.get<string>('auth.adminUsername')!;
    const expectPwd = this.config.get<string>('auth.adminPassword')!;

    if (username !== expectUser || password !== expectPwd) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const accessToken = await this.jwtService.signAsync({ sub: username, username });
    return { accessToken, user: { username } };
  }
}
