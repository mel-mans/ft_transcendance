import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    private readonly startTime = Date.now();

    getHealthCheck() {
        return {
            status: 'ok',
            service: 'chat',
            version: '1.0.0',
            uptime: Math.floor((Date.now() - this.startTime) / 1000),
            timestamp: new Date().toISOString(),
        };
    }
}
