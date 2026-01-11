import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      message: 'NestJS backend is running',
      endpoints: {
        upload: 'POST /sessions/upload',
      },
    };
  }
}
