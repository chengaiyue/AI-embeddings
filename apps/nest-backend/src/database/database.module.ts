import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ChatSession } from './entities/chat-session.entity';
import { ChatMessage } from './entities/chat-message.entity';

/** 实体注册集中在这里，app.module 的 forRootAsync 已通过 autoLoadEntities 生效 */
@Module({
  imports: [TypeOrmModule.forFeature([User, ChatSession, ChatMessage])],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
