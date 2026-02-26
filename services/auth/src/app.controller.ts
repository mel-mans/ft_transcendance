import { Controller, Get, Post, Body, UseGuards, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Intra42AuthGuard } from './guards/intra42-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';

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
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    testProtected(@Req() req: any) {  // ← Changed Request to any
        return {
            message: 'This is a protected route!',
            user: req.user,
        };
    }
        // ========== 42 OAUTH ENDPOINTS ==========
    
    @Get('42')
    @UseGuards(Intra42AuthGuard)
    async login42() {
        // This triggers the 42 OAuth flow
        // User will be redirected to 42's login page
    }

    @Get('42/callback')
    @UseGuards(Intra42AuthGuard)
    async callback42(@Req() req: any, @Res() res: any) {
        // After successful 42 authentication, user is redirected here
        // req.user contains the validated user data from strategy
        
        const result = await this.appService.oauthLogin(req.user);
        
        // Redirect to frontend with token
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3003';
        const redirectUrl = `${frontendUrl}/auth/callback?token=${result.access_token}`;
        
        return res.redirect(redirectUrl);
    }
   // ========== GOOGLE OAUTH ENDPOINTS ========== (ADD THESE)
    
    @Get('google')
    @UseGuards(GoogleAuthGuard)
    async loginGoogle() {
        // Triggers Google OAuth flow
    }

    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    async callbackGoogle(@Req() req: any, @Res() res: any) {
        const result = await this.appService.oauthLogin(req.user);
        
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3003';
        const redirectUrl = `${frontendUrl}/auth/callback?token=${result.access_token}`;
        
        return res.redirect(redirectUrl);
    }


}