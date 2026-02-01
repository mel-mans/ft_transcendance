import { Controller, Get, Post, Body } from '@nestjs/common';
// Controller - Marks the class as a controller
// Get - Decorator for GET requests
// Post - Decorator for POST requests
// Body - Decorator to extract body from requests
import { AppService } from './app.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) { }

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }

    @Post('signup')
    async signup(@Body() body: { email: string; username: string; password: string }) {
    return this.appService.signup(body.email, body.username, body.password);
    }

    // @Post('signup')
    // async signup(@Body() body) {
    //     // Call appService.signup()
    // }

}
