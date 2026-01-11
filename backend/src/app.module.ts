import { Module } from '@nestjs/common';
import { SessionsModule } from './sessions/sessions.module';
import { AppController } from './app.controller';
import { SupabaseModule } from './supabase/supabase.module';

@Module({
  imports: [SupabaseModule, SessionsModule],
  controllers: [AppController],
})
export class AppModule {}
