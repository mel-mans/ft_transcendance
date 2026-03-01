import { Injectable , NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import { CompleteProfileDto } from './dto/complete-profile.dto';  // ← ADD THIS

@Injectable()
export class AppService {
    constructor(private prisma: PrismaService) {}
    
    getHello(): string {
        return 'Hello from User Management Service!';
    }
    // ========== GET CURRENT USER (ME) ==========
    async getMe(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    // ========== GET USER BY ID ==========
    async getUserById(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                username: true,
                name: true,      // ← Changed from firstName
                age: true,       // ← Added
                avatar: true,
                bio: true,
                isOnline: true,
                isVerified: true,
                createdAt: true,
                // Don't include: password, googleId, intra42Id
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }
    async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
        // If username is being updated, check if it's already taken
        if (updateProfileDto.username) {
            const existingUser = await this.prisma.user.findUnique({
                where: { username: updateProfileDto.username },
            });

            // If username exists and it's not the current user's username
            if (existingUser && existingUser.id !== userId) {
                throw new ConflictException('Username already taken');
            }
        }

        // Update the user
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: updateProfileDto,
        });

        // Remove password from response
        const { password, ...userWithoutPassword } = updatedUser;
        return {
            message: 'Profile updated successfully',
            user: userWithoutPassword,
        };
    }
    async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
        const { currentPassword, newPassword } = changePasswordDto;

        // Get user with password
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || !user.password) {
            throw new NotFoundException('User not found');
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        
        if (!isPasswordValid) {
            throw new UnauthorizedException('Current password is incorrect');
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        return {
            message: 'Password changed successfully',
        };
    }

   // ========== COMPLETE PROFILE ==========
    async completeProfile(userId: number, completeProfileDto: CompleteProfileDto) {
        const { username, name, age, bio, location, moveInDate, budget, currency, ...preferences } = completeProfileDto;

        // Check if username is taken
        if (username) {
            const existingUsername = await this.prisma.user.findFirst({
                where: {
                    username,
                    id: { not: userId },  // Exclude current user
                },
            });

            if (existingUsername) {
                throw new ConflictException('Username already taken');
            }
        }

        // Update user basic info
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: {
                username,
                name,
                age,
                bio,
            },
        });

        // Create or update preferences
        await this.prisma.userPreferences.upsert({
            where: { userId },
            create: {
                userId,
                location,
                moveInDate: moveInDate ? new Date(moveInDate) : null,
                budget,
                currency,
                ...preferences,  // All lifestyle booleans
            },
            update: {
                location,
                moveInDate: moveInDate ? new Date(moveInDate) : null,
                budget,
                currency,
                ...preferences,  // All lifestyle booleans
            },
        });

        // Return updated user with preferences
        const updatedUser = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { preferences: true },
        });

        const { password: _, ...userWithoutPassword } = updatedUser;

        return {
            message: 'Profile completed successfully',
            user: userWithoutPassword,
        };
    }
}
