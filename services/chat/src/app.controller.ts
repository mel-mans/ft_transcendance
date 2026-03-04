import { Controller, Get } from '@nestjs/common';

@Controller('api/chat')
export class AppController {
  @Get()
  health() {
    return { status: 'ok' };
  }
}