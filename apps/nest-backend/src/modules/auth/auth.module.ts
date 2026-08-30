import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CommonModule } from '../common/common.module';

/** 简单登录鉴权（api.md 中的 POST /api/auth/login）。接入真实用户体系时替换 AuthService 即可。 */
@Module({
  imports: [CommonModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
