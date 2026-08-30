import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiClientService } from '../../services/ai-client.service';

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);
  private readonly maxFileSizeMb: number;
  private readonly allowedExtensions: string[];

  constructor(
    private readonly aiClient: AiClientService,
    config: ConfigService,
  ) {
    this.maxFileSizeMb = config.get<number>('upload.maxFileSizeMb')!;
    this.allowedExtensions = config.get<string[]>('upload.allowedExtensions')!;
  }

  async uploadDocument(file: Express.Multer.File, collection: string) {
    this.validateFile(file);
    // 以流/内存方式转发到内网 Python 服务做解析、切片、向量化
    return this.aiClient.uploadDocument(file, collection);
  }

  listDocuments() {
    return this.aiClient.request<unknown>('GET', '/internal/rag/documents');
  }

  deleteDocument(docId: string) {
    return this.aiClient.request<unknown>('DELETE', `/internal/rag/documents/${encodeURIComponent(docId)}`);
  }

  private validateFile(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('未收到文件');
    const ext = file.originalname.toLowerCase().match(/\.[^.]+$/)?.[0] ?? '';
    if (!this.allowedExtensions.includes(ext)) {
      throw new BadRequestException(`文件类型不支持，仅允许：${this.allowedExtensions.join(' / ')}`);
    }
    if (file.size > this.maxFileSizeMb * 1024 * 1024) {
      throw new BadRequestException(`文件大小不能超过 ${this.maxFileSizeMb}MB`);
    }
  }
}
