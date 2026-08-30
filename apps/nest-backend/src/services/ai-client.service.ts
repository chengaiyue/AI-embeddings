import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * 内网 Python FastAPI 服务的 HTTP 客户端。
 * ai-service 不对外暴露，所有调用都必须经过这里并携带内部令牌。
 */
@Injectable()
export class AiClientService {
  private readonly logger = new Logger(AiClientService.name);
  private readonly baseUrl: string;
  private readonly internalToken: string;
  private readonly timeoutMs: number;

  constructor(config: ConfigService) {
    this.baseUrl = config.get<string>('aiService.baseUrl')!;
    this.internalToken = config.get<string>('aiService.internalToken')!;
    this.timeoutMs = config.get<number>('aiService.timeoutMs')!;
  }

  private headers(extra: Record<string, string> = {}): Record<string, string> {
    return { 'X-Internal-Token': this.internalToken, ...extra };
  }

  /** 普通 JSON 请求（非流式） */
  async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: this.headers(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(this.timeoutMs),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      this.logger.error(`ai-service ${method} ${path} -> ${res.status}: ${text}`);
      throw new Error(`AI 服务返回 ${res.status}`);
    }
    return res.json() as Promise<T>;
  }

  /** 转发 multipart 文件上传到 ai-service */
  async uploadDocument(file: Express.Multer.File, collection: string): Promise<unknown> {
    const form = new FormData();
    form.append('file', new Blob([new Uint8Array(file.buffer)]), file.originalname);
    form.append('collection', collection);

    const res = await fetch(`${this.baseUrl}/internal/rag/documents`, {
      method: 'POST',
      headers: this.headers(),
      body: form,
      signal: AbortSignal.timeout(this.timeoutMs),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      this.logger.error(`ai-service upload -> ${res.status}: ${text}`);
      throw new Error(`AI 服务返回 ${res.status}`);
    }
    return res.json();
  }

  /** 打开到 ai-service 的 SSE 流（对话补全），返回 Response 供上层逐段转发 */
  openChatStream(body: unknown): Promise<Response> {
    return fetch(`${this.baseUrl}/internal/chat/completions`, {
      method: 'POST',
      headers: this.headers({ 'Content-Type': 'application/json', Accept: 'text/event-stream' }),
      body: JSON.stringify(body),
    });
  }
}
