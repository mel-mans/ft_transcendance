import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AppService {
    private readonly startTime = Date.now();

    constructor(private prisma: PrismaService, private jwtService: JwtService,) {}
    
    async getHealthCheck() {
        let dbStatus = 'ok';
        try {
            await this.prisma.$queryRaw`SELECT 1`;
        } catch {
            dbStatus = 'error';
        }

        return {
            status: dbStatus === 'ok' ? 'ok' : 'error',
            service: 'auth',
            version: '1.0.0',
            uptime: Math.floor((Date.now() - this.startTime) / 1000),
            timestamp: new Date().toISOString(),
            checks: {
                database: dbStatus,
            },
        };
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
    

        // ========== GENERATE JWT TOKEN ==========
        const payload = {
            sub: user.id,
            email: user.email,

        };

        const accessToken = this.jwtService.sign(payload);
        // =========================================


        // Remove password from response
        const { password: _, ...result } = user;

        return {
            message: 'User created successfully',
            access_token: accessToken,
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
        let user;
        
        // ========== STEP 1: Try to find user by OAuth ID ==========
        if (oauthUser.intra42Id) {
            user = await this.prisma.user.findUnique({
                where: { intra42Id: oauthUser.intra42Id },
            });
        } else if (oauthUser.googleId) {
            user = await this.prisma.user.findUnique({
                where: { googleId: oauthUser.googleId },
            });
        }

        // ========== STEP 2: If found by OAuth ID, user already exists - just login ==========
        if (user) {
            const payload = {
                sub: user.id,
                email: user.email,
                username: user.username,
            };

            const accessToken = this.jwtService.sign(payload);
            const { password, ...userWithoutPassword } = user;

            return {
                message: 'Login successful',
                access_token: accessToken,
                user: userWithoutPassword,
            };
        }

        // ========== STEP 3: Not found by OAuth ID - check if email exists ==========
        if (oauthUser.email) {
            const existingEmail = await this.prisma.user.findUnique({
                where: { email: oauthUser.email },
            });

            if (existingEmail) {
                // Email exists - link OAuth ID to existing account
                user = await this.prisma.user.update({
                    where: { id: existingEmail.id },
                    data: {
                        intra42Id: oauthUser.intra42Id || undefined,
                        googleId: oauthUser.googleId || undefined,
                        isVerified: true,
                    },
                });

                const payload = {
                    sub: user.id,
                    email: user.email,
                    username: user.username,
                };

                const accessToken = this.jwtService.sign(payload);
                const { password, ...userWithoutPassword } = user;

                return {
                    message: 'Login successful',
                    access_token: accessToken,
                    user: userWithoutPassword,
                };
            }
        }

        // ========== STEP 4: User doesn't exist at all - create new account ==========
        user = await this.prisma.user.create({
            data: {
                email: oauthUser.email,
                intra42Id: oauthUser.intra42Id || null,
                googleId: oauthUser.googleId || null,
                password: null,
                isVerified: true,
            },
        });

        const payload = {
            sub: user.id,
            email: user.email,
            username: user.username,
        };

        const accessToken = this.jwtService.sign(payload);
        const { password, ...userWithoutPassword } = user;

        return {
            message: 'Login successful',
            access_token: accessToken,
            user: userWithoutPassword,
        };
    }
}