import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { CommonModule } from '../common/common.module';
import { ChatSession } from '../../database/entities/chat-session.entity';
import { ChatMessage } from '../../database/entities/chat-message.entity';

@Module({
  imports: [CommonModule, TypeOrmModule.forFeature([ChatSession, ChatMessage])],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
