import { Controller, Get, Post, Body, UseGuards, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
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
    @ApiOperation({ summary: 'Health check' })
    @ApiResponse({ status: 200, description: 'Service is running' })
    getHello(): string {
        return this.appService.getHello();
    }

    @Post('signup')
    @ApiOperation({ summary: 'Create new account' })
    @ApiBody({ type: SignupDto })
    @ApiResponse({ 
        status: 201, 
        description: 'User created successfully',
        schema: {
            example: {
                message: 'User created successfully',
                user: {
                    id: 1,
                    email: 'user@example.com',
                    username: 'user_1234567890',
                    name: null,
                    age: null,
                    avatar: 'default-avatar.png'
                }
            }
        }
    })
    @ApiResponse({ status: 409, description: 'Email already exists' })
    @ApiResponse({ status: 400, description: 'Validation failed' })
    async signup(@Body() signupDto: SignupDto) {
        return this.appService.signup(signupDto);
    }

    @Post('login')
    @ApiOperation({ summary: 'Login with email/username and password' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({ 
        status: 200, 
        description: 'Login successful, returns JWT token',
        schema: {
            example: {
                message: 'Login successful',
                access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                user: {
                    id: 1,
                    email: 'user@example.com',
                    username: 'testuser',
                    name: 'John Doe',
                    age: 24
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    async login(@Body() loginDto: LoginDto) {
        return this.appService.login(loginDto);
    }

    // ========== NEW: PROTECTED ROUTE ==========
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Test protected route (requires JWT)' })
    @ApiResponse({ 
        status: 200, 
        description: 'Returns authenticated user info from JWT token',
        schema: {
            example: {
                message: 'This is a protected route!',
                user: {
                    userId: 1,
                    email: 'user@example.com',
                    username: 'testuser'
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
    testProtected(@Req() req: any) {  // ← Changed Request to any
        return {
            message: 'This is a protected route!',
            user: req.user,
        };
    }
        // ========== 42 OAUTH ENDPOINTS ==========
    
    @Get('42')
    @UseGuards(Intra42AuthGuard)
    @ApiOperation({ 
        summary: 'Login with 42 OAuth',
        description: 'Redirects to 42 OAuth authorization page. After successful login, redirects back to /42/callback'
    })
    @ApiResponse({ status: 302, description: 'Redirects to 42 OAuth page' })
    async login42() {
        // This triggers the 42 OAuth flow
        // User will be redirected to 42's login page
    }

    @Get('42/callback')
    @UseGuards(Intra42AuthGuard)
    @ApiOperation({ 
        summary: '42 OAuth callback (Internal)',
        description: 'Handles 42 OAuth callback. Users should not call this directly.'
    })
    @ApiResponse({ status: 302, description: 'Redirects to frontend with JWT token' })
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
   @ApiOperation({ 
        summary: 'Login with Google OAuth',
        description: 'Redirects to Google OAuth authorization page. After successful login, redirects back to /google/callback'
    })
    @ApiResponse({ status: 302, description: 'Redirects to Google OAuth page' })
    async loginGoogle() {
        // Triggers Google OAuth flow
    }

    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    @ApiOperation({ 
        summary: 'Google OAuth callback (Internal)',
        description: 'Handles Google OAuth callback. Users should not call this directly.'
    })
    @ApiResponse({ status: 302, description: 'Redirects to frontend with JWT token' })
    async callbackGoogle(@Req() req: any, @Res() res: any) {
        const result = await this.appService.oauthLogin(req.user);
        
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3003';
        const redirectUrl = `${frontendUrl}/auth/callback?token=${result.access_token}`;
        
        return res.redirect(redirectUrl);
    }


}