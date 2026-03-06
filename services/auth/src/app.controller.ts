import { Controller, Get, Post, Body, UseGuards, Req, Res, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AppService } from './app.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Intra42AuthGuard } from './guards/intra42-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { Response, Request } from 'express';  // ← Add Response

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) { }

    @Get()
    @ApiOperation({ summary: 'Health check' })
    @ApiResponse({ status: 200, description: 'Service is running' })
    getHealthCheck() {
        return this.appService.getHealthCheck();
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
    async signup(@Body() signupDto: SignupDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.appService.signup(signupDto);

        // Set HTTP-Only Cookie
        res.cookie('access_token', result.access_token, {
            httpOnly: true,      // Can't access via JavaScript
            secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
            sameSite: 'strict',  // CSRF protection
            maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
        });

        return {
            message: result.message,
            user: result.user,
            // access_token: result.access_token,  // Optional: remove this for extra security
        };
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
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.appService.login(loginDto);

        // Set HTTP-Only Cookie
        res.cookie('access_token', result.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return {
            message: result.message,
            user: result.user,
        };
    }

  // ========== LOGOUT (NEW) ==========
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Logout user' })
    @ApiResponse({ 
        status: 200, 
        description: 'Logged out successfully',
        schema: {
            example: {
                message: 'Logged out successfully'
            }
        }
    })
    async logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('access_token');
        return { message: 'Logged out successfully' };
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
    async callback42(@Req() req: any, @Res() res: Response, ) {
        try {
            const result = await this.appService.oauthLogin(req.user);

            // Set cookie
            res.cookie('access_token', result.access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            // Redirect to frontend with success + token (fallback when cookies are blocked cross-origin)
            res.redirect(`${process.env.APP_URL}/auth/callback?success=true`);
        } catch (error) {
            console.error('42 OAuth error:', error);
            res.redirect(`${process.env.APP_URL}/auth/error`);
        }
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
    async callbackGoogle(@Req() req: any, @Res() res: Response) {
        try {
            const result = await this.appService.oauthLogin(req.user);

            // Set cookie
            res.cookie('access_token', result.access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            // Redirect to frontend with success + token (fallback when cookies are blocked cross-origin)
            res.redirect(`${process.env.APP_URL}/auth/callback?success=true`);
        } catch (error) {
            console.error('Google OAuth error:', error);
            res.redirect(`${process.env.APP_URL}/auth/error`);
        }
    }


}
