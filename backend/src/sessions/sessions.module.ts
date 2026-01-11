import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { OpenAIModule } from '../openai/openai.module';
import { SessionStorageService } from './session-storage.service';

@Module({
  imports: [OpenAIModule],
  controllers: [SessionsController],
  providers: [SessionsService, SessionStorageService],
})
export class SessionsModule {}
