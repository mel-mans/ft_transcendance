<<<<<<< HEAD
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) { }
=======
import { Controller, Get, UseGuards, Req, ParseIntPipe, Param, Patch, Body } from '@nestjs/common';
import { Request } from 'express';
import { AppService } from './app.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}
>>>>>>> 8a306b6d (adding some new endpoints)

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }
<<<<<<< HEAD
}
=======

    // Test protected route
    @UseGuards(JwtAuthGuard)
    @Get('test')
    testProtected(@Req() req: Request) {
        return {
            message: 'User Management protected route works!',
            user: req.user,
        };
    }
  // ========== GET CURRENT USER PROFILE (ME) ==========
    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getMe(@Req() req: Request) {
        const userId = req.user.userId;
        return this.appService.getMe(userId);
    }

    // ========== GET USER BY ID ==========
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async getUserById(@Param('id', ParseIntPipe) id: number) {
        return this.appService.getUserById(id);
    }
    @UseGuards(JwtAuthGuard)
    @Patch('profile')
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
    async changePassword(
        @Req() req: Request,
        @Body() changePasswordDto: ChangePasswordDto,
    ) {
        const userId = req.user.userId;
        return this.appService.changePassword(userId, changePasswordDto);
    }
}
>>>>>>> 8a306b6d (adding some new endpoints)
