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
    // ========== UPDATE PROFILE ==========
    async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
        const { username, name, age, sex, bio, location, moveInDate, budget, currency, ...preferences } = updateProfileDto;

        // Check username availability if being updated
        if (username) {
            const existingUser = await this.prisma.user.findUnique({
                where: { username },
            });

            if (existingUser && existingUser.id !== userId) {
                throw new ConflictException('Username already taken');
            }
        }

        // Build user update data (only provided fields)
        const userUpdateData: any = {};
        if (username !== undefined) userUpdateData.username = username;
        if (name !== undefined) userUpdateData.name = name;
        if (age !== undefined) userUpdateData.age = age;
        if (sex !== undefined) userUpdateData.sex = sex;
        if (bio !== undefined) userUpdateData.bio = bio;

        // Update user if there are fields to update
        if (Object.keys(userUpdateData).length > 0) {
            await this.prisma.user.update({
                where: { id: userId },
                data: userUpdateData,
            });
        }

        // Build preferences update data (only provided fields)
        const preferencesUpdateData: any = {};
        if (location !== undefined) preferencesUpdateData.location = location;
        if (moveInDate !== undefined) preferencesUpdateData.moveInDate = new Date(moveInDate);
        if (budget !== undefined) preferencesUpdateData.budget = budget;
        if (currency !== undefined) preferencesUpdateData.currency = currency;

        // Add lifestyle preferences that were provided
        Object.keys(preferences).forEach(key => {
            if (preferences[key] !== undefined) {
                preferencesUpdateData[key] = preferences[key];
            }
        });

        // Update preferences if there are fields to update
        if (Object.keys(preferencesUpdateData).length > 0) {
            await this.prisma.userPreferences.upsert({
                where: { userId },
                create: {
                    userId,
                    ...preferencesUpdateData,
                },
                update: preferencesUpdateData,
            });
        }

        // Return updated user with preferences
        const updatedUser = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { preferences: true },
        });

        const { password: _, ...userWithoutPassword } = updatedUser;

        return {
            message: 'Profile updated successfully',
            user: userWithoutPassword,
        };
    }
    // ========== CHANGE PASSWORD ==========
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
        const { 
            username, 
            name, 
            age, 
            sex, 
            bio, 
            location, 
            moveInDate, 
            budget, 
            currency,
            // Explicitly destructure lifestyle preferences
            smoker,
            quietHours,
            earlyBird,
            nightOwl,
            petFriendly,
            cooks,
            gamer,
            social,
            studious,
            clean
        } = completeProfileDto;

        // Check if username is taken
        if (username) {
            const existingUsername = await this.prisma.user.findFirst({
                where: {
                    username,
                    id: { not: userId },
                },
            });

            if (existingUsername) {
                throw new ConflictException('Username already taken');
            }
        }

        // Update user basic info
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                username,
                name,
                age,
                sex,
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
                smoker,
                quietHours,
                earlyBird,
                nightOwl,
                petFriendly,
                cooks,
                gamer,
                social,
                studious,
                clean,
            },
            update: {
                location,
                moveInDate: moveInDate ? new Date(moveInDate) : null,
                budget,
                currency,
                smoker,
                quietHours,
                earlyBird,
                nightOwl,
                petFriendly,
                cooks,
                gamer,
                social,
                studious,
                clean,
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
