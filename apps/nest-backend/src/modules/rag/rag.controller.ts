import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ConfigService } from '@nestjs/config';
import { IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RagService } from './rag.service';

export class UploadDocDto {
  @IsOptional()
  @IsString()
  collection?: string;
}

@Controller('rag')
@UseGuards(JwtAuthGuard)
export class RagController {
  constructor(
    private readonly ragService: RagService,
    private readonly config: ConfigService,
  ) {}

  @Post('documents')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  upload(@UploadedFile() file: Express.Multer.File, @Body() dto: UploadDocDto) {
    return this.ragService.uploadDocument(file, dto.collection ?? 'default');
  }

  @Get('documents')
  list() {
    return this.ragService.listDocuments();
  }

  @Delete('documents/:id')
  remove(@Param('id') id: string) {
    return this.ragService.deleteDocument(id);
  }
}
