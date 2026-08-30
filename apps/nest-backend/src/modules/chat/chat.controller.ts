import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import type { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ChatService } from './chat.service';

class CompletionDto {
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  topK?: number;
}

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('sessions')
  createSession() {
    // TODO: 接入真实用户体系后从 JWT payload 取 userId
    return this.chatService.createSession(1);
  }

  @Get('sessions')
  listSessions() {
    return this.chatService.listSessions(1);
  }

  @Post('completions')
  async completions(@Body() dto: CompletionDto, @Res() res: Response) {
    await this.chatService.streamCompletion(dto.sessionId, dto.message, dto.topK ?? 5, res);
  }
}
