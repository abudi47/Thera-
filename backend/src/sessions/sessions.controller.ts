import {
  Controller,
  Post,
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
}
