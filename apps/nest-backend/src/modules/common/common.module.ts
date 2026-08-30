import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TransformInterceptor } from './interceptors/transform.interceptor';

/**
 * 公共能力：JWT 守卫、响应包装拦截器、统一异常过滤器（过滤器在 main.ts 全局注册）。
 * 限流：单机部署可直接用 @nestjs/throttler 的 ThrottlerGuard，
 * 多实例部署建议在网关层（nginx）做限流。
 */
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('auth.jwtSecret'),
        signOptions: { expiresIn: config.get<string>('auth.jwtExpiresIn') },
      }),
    }),
  ],
  providers: [JwtAuthGuard, TransformInterceptor],
  exports: [JwtAuthGuard, TransformInterceptor, JwtModule],
})
export class CommonModule {}
