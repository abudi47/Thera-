import {
  Controller,
  Get,
  Post,
  Param,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SessionsService } from './sessions.service';
import { multerConfig } from './multer.config';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('audio', multerConfig))
  uploadAudio(@UploadedFile() file: Express.Multer.File) {
    return this.sessionsService.handleAudioUpload(file);
  }

  @Get()
  getAllSessions() {
    return this.sessionsService.getAllSessions();
  }

  @Get(':id')
  getSessionById(@Param('id') id: string) {
    return this.sessionsService.getSessionById(id);
  }
}
