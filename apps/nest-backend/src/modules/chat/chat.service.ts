import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Response } from 'express';
import { AiClientService } from '../../services/ai-client.service';
import { ChatSession } from '../../database/entities/chat-session.entity';
import { ChatMessage } from '../../database/entities/chat-message.entity';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly aiClient: AiClientService,
    @InjectRepository(ChatSession)
    private readonly sessionRepo: Repository<ChatSession>,
    @InjectRepository(ChatMessage)
    private readonly messageRepo: Repository<ChatMessage>,
  ) {}

  async createSession(userId: number): Promise<ChatSession> {
    return this.sessionRepo.save(this.sessionRepo.create({ userId }));
  }

  listSessions(userId: number): Promise<ChatSession[]> {
    return this.sessionRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  /**
   * 对话补全：请求内网 Python 服务的 SSE，并逐事件转发给浏览器。
   * 同时落库用户消息与完整回答。
   */
  async streamCompletion(
    sessionId: string,
    message: string,
    topK: number,
    res: Response,
  ): Promise<void> {
    const session = await this.sessionRepo.findOneBy({ id: sessionId });
    if (!session) throw new NotFoundException('会话不存在');

    const history = await this.messageRepo.find({
      where: { sessionId },
      order: { createdAt: 'ASC' },
      take: 20,
    });

    await this.messageRepo.save(this.messageRepo.create({ sessionId, role: 'user', content: message }));

    const upstream = await this.aiClient.openChatStream({
      sessionId,
      message,
      topK,
      history: history.map((m) => ({ role: m.role, content: m.content })),
    });

    if (!upstream.ok || !upstream.body) {
      const detail = await upstream.text().catch(() => '');
      this.logger.error(`ai-service chat/completions -> ${upstream.status}: ${detail}`);
      res.status(502).json({ statusCode: 502, message: 'AI 服务不可用' });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let answer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        res.write(chunk); // 原样转发 SSE 事件

        // 从事件流里抽取 delta，拼出完整回答用于落库
        for (const event of chunk.split('\n\n')) {
          const dataLine = event.split('\n').find((l) => l.startsWith('data:'));
          if (!dataLine) continue;
          try {
            const payload = JSON.parse(dataLine.slice(5).trim());
            if (payload.type === 'delta') answer += payload.content;
          } catch {
            // 不完整 JSON 忽略
          }
        }
      }
      res.end();
    } catch (err) {
      this.logger.error(`SSE 转发中断: ${err instanceof Error ? err.message : err}`);
      res.end();
    }

    await this.messageRepo.save(
      this.messageRepo.create({
        sessionId,
        role: 'assistant',
        content: answer,
        sources: null,
      }),
    );
  }
}
