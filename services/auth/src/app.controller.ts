import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { AppService } from './app.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';  // ← NEW

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) { }

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }

    @Post('signup')
    async signup(@Body() signupDto: SignupDto) {
        return this.appService.signup(signupDto);
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.appService.login(loginDto);
    }

    // ========== NEW: PROTECTED ROUTE ==========
    @UseGuards(JwtAuthGuard)  // ← This protects the route!
    @Get('profile')
    getProfile(@Req() req: Request) { 
        // req.user contains the decoded JWT payload
        // { userId: 5, email: "younes@test.com", username: "younes42" }
        
        return {
            message: 'This is a protected route!',
            user: req.user,  // The authenticated user's info
        };
    }

}