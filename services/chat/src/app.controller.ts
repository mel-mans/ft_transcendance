import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api/chat')
export class AppController {
    constructor(private readonly appService: AppService) { }

    @Get()
    getHealthCheck() {
        return this.appService.getHealthCheck();
    }
}
