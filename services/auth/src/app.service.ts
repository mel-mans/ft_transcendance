import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AppService {
    constructor(private prisma: PrismaService, private jwtService: JwtService,) {}
    
    getHello(): string {
        return 'Hello from Auth Service!';
    }

    //sigup
    async signup(signupDto: SignupDto) {
        const { email, password } = signupDto;

        // Check if email already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                // name, age, bio will be filled in profile completion
            },
        });

        // Remove password from response
        const { password: _, ...result } = user;

        return {
            message: 'User created successfully',
            user: result,
        };
    }

    // ========== LOGIN ==========
    async login(loginDto: LoginDto) {
        const { identifier, password } = loginDto;

        // Find user by email OR username
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { username: { equals: identifier, mode: 'insensitive' } },
                ],
            },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check if password exists (OAuth users don't have passwords)
        if (!user.password) {
            throw new UnauthorizedException(
                'This account uses OAuth login. Please login with 42 or Google.'
            );
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Generate JWT token
        const payload = {
            sub: user.id,
            email: user.email,
            username: user.username,
        };

        const accessToken = this.jwtService.sign(payload);

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        return {
            message: 'Login successful',
            access_token: accessToken,
            user: userWithoutPassword,
        };
    }

        // ========== OAUTH LOGIN/SIGNUP ==========
    async oauthLogin(oauthUser: any) {
        // Check if user exists by OAuth ID (42 or Google)
        let user;

        if (oauthUser.intra42Id) {
            // 42 OAuth user
            user = await this.prisma.user.findUnique({
                where: { intra42Id: oauthUser.intra42Id },
            });
        } else if (oauthUser.googleId) {
            // Google OAuth user
            user = await this.prisma.user.findUnique({
                where: { googleId: oauthUser.googleId },
            });
        }

        // If user doesn't exist, create new account
        if (!user) {
            // Check if email already exists (from regular signup)
            if (oauthUser.email) {
                const existingEmail = await this.prisma.user.findUnique({
                    where: { email: oauthUser.email },
                });

                if (existingEmail) {
                    // Email exists but not linked to OAuth
                    // You could link them or throw error
                    throw new ConflictException(
                        'Email already registered. Please login with email/password.'
                    );
                }
            }

            // Create new user from OAuth data
            user = await this.prisma.user.create({
                data: {
                    email: oauthUser.email,
                    intra42Id: oauthUser.intra42Id || null,
                    googleId: oauthUser.googleId || null,
                    password: null, // OAuth users don't have passwords
                    isVerified: true, // Auto-verify OAuth users
                },
            });
        }

        // Generate JWT token
        const payload = {
            sub: user.id,
            email: user.email,
            username: user.username,
        };

        const accessToken = this.jwtService.sign(payload);

        // Remove sensitive data
        const { password, ...userWithoutPassword } = user;

        return {
            message: 'Login successful',
            access_token: accessToken,
            user: userWithoutPassword,
        };
    }

}