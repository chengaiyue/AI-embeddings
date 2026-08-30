import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { RagModule } from './modules/rag/rag.module';
import { ChatModule } from './modules/chat/chat.module';
import { AiClientService } from './services/ai-client.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'better-sqlite3' as const,
        database: config.get<string>('database.url') ?? './data/nest.db',
        autoLoadEntities: true,
        synchronize: config.get<boolean>('database.synchronize') ?? true, // 生产环境请改用 migration
      }),
    }),
    DatabaseModule,
    AuthModule,
    RagModule,
    ChatModule,
  ],
  providers: [AiClientService],
  exports: [AiClientService],
})
export class AppModule {}
