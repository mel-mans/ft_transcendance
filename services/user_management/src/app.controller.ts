import { Controller, Get, UseGuards, Req, ParseIntPipe, Param, Patch, Body, Post } from '@nestjs/common';
import { Request } from 'express';
import { AppService } from './app.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CompleteProfileDto } from './dto/complete-profile.dto';  // ← ADD THIS
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam } from '@nestjs/swagger';  // ← ADD

@ApiTags('User Management')  // ← ADD
@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    @ApiOperation({ summary: 'Health check' })
    @ApiResponse({ status: 200, description: 'Service is running' })
    getHello(): string {
        return this.appService.getHello();
    }

    // Test protected route
    @UseGuards(JwtAuthGuard)
    @Get('test')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Test protected route' })
    @ApiResponse({ status: 200, description: 'Returns user info from JWT' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    testProtected(@Req() req: Request) {
        return {
            message: 'User Management protected route works!',
            user: req.user,
        };
    }
  // ========== GET CURRENT USER PROFILE (ME) ==========
    @UseGuards(JwtAuthGuard)
    @Get('me')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user profile' })
    @ApiResponse({ 
        status: 200, 
        description: 'Returns current user profile',
        schema: {
            example: {
                id: 1,
                email: 'user@example.com',
                username: 'johndoe',
                name: 'John Doe',
                age: 24,
                avatar: 'default-avatar.png',
                bio: '42 student',
                isOnline: true,
                isVerified: true,
                createdAt: '2026-03-01T00:00:00.000Z'
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async getMe(@Req() req: Request) {
        const userId = req.user.userId;
        return this.appService.getMe(userId);
    }

    // ========== GET USER BY ID ==========
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get user by ID' })
    @ApiParam({ name: 'id', description: 'User ID', example: 1 })
    @ApiResponse({ 
        status: 200, 
        description: 'Returns user profile',
        schema: {
            example: {
                id: 1,
                email: 'user@example.com',
                username: 'johndoe',
                name: 'John Doe',
                age: 24,
                avatar: 'default-avatar.png',
                bio: '42 student',
                isOnline: true,
                isVerified: true,
                createdAt: '2026-03-01T00:00:00.000Z'
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async getUserById(@Param('id', ParseIntPipe) id: number) {
        return this.appService.getUserById(id);
    }

    // ========== UPDATE PROFILE ==========
    @UseGuards(JwtAuthGuard)
    @Patch('profile')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update user profile' })
    @ApiBody({ type: UpdateProfileDto })
    @ApiResponse({ 
        status: 200, 
        description: 'Profile updated successfully',
        schema: {
            example: {
                message: 'Profile updated successfully',
                user: {
                    id: 1,
                    username: 'johndoe',
                    name: 'John Doe',
                    bio: 'Updated bio'
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 409, description: 'Username already taken' })
    async updateProfile(
        @Req() req: Request,
        @Body() updateProfileDto: UpdateProfileDto,
    ) {
        const userId = req.user.userId;
        return this.appService.updateProfile(userId, updateProfileDto);
    }
    // ========== CHANGE PASSWORD ==========
    @UseGuards(JwtAuthGuard)
    @Patch('password')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update user profile' })
    @ApiBody({ type: UpdateProfileDto })
    @ApiResponse({ 
        status: 200, 
        description: 'Profile updated successfully',
        schema: {
            example: {
                message: 'Profile updated successfully',
                user: {
                    id: 1,
                    username: 'johndoe',
                    name: 'John Doe',
                    bio: 'Updated bio'
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 409, description: 'Username already taken' })
    async changePassword(
        @Req() req: Request,
        @Body() changePasswordDto: ChangePasswordDto,
    ) {
        const userId = req.user.userId;
        return this.appService.changePassword(userId, changePasswordDto);
    }
    // ========== COMPLETE PROFILE (NEW) ==========
    @UseGuards(JwtAuthGuard)
    @Post('complete-profile')
    @ApiBearerAuth()
    @ApiOperation({ 
        summary: 'Complete user profile after signup',
        description: 'First-time profile completion. All fields are required. Called after email/password signup or OAuth login.'
    })
    @ApiBody({ type: CompleteProfileDto })
    @ApiResponse({ 
        status: 201, 
        description: 'Profile completed successfully',
        schema: {
            example: {
                message: 'Profile completed successfully',
                user: {
                    id: 1,
                    email: 'user@example.com',
                    username: 'johndoe',
                    name: 'John Doe',
                    age: 24,
                    bio: '42 student looking for roommate',
                    avatar: 'default-avatar.png',
                    preferences: {
                        id: 1,
                        userId: 1,
                        location: 'Casablanca',
                        moveInDate: '2026-04-01T00:00:00.000Z',
                        budget: 5000,
                        currency: 'MAD',
                        smoker: false,
                        quietHours: true,
                        nightOwl: true,
                        petFriendly: true,
                        cooks: true,
                        gamer: true,
                        social: false,
                        studious: true,
                        clean: true
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Validation failed - missing required fields' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 409, description: 'Username already taken' })
    async completeProfile(
        @Req() req: Request,
        @Body() completeProfileDto: CompleteProfileDto,
    ) {
        const userId = req.user.userId;
        return this.appService.completeProfile(userId, completeProfileDto);
    }
}
