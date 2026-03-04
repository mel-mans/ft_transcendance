import { Controller, Get } from '@nestjs/common';

@Controller('api/chat')
export class AppController {
    constructor(private readonly appService: AppService) { }

    @Get()
    getHealthCheck() {
        return this.appService.getHealthCheck();
    }
}
