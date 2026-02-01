import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import * as bcrypt from 'bcrypt';
// Injectable - Marks the class as a provider that can be injected
// ConflictException - Error when user already exists (HTTP 409)
// PrismaService - Database connection (we already have this file!)
// bcrypt - Password hashing library

@Injectable()
export class AppService {
    constructor(private prisma: PrismaService) {}
    getHello(): string {
        return 'Hello from Auth Service!';
    }

    async signup(email: string, username: string, password: string) {
    // Step 1: Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
        where: {
        OR: [
            { email: email },
            { username: username }
        ],
        },
    });

    if (existingUser) {
        throw new ConflictException('Email or username already exists');
    }

    // Step 2: Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Step 3: Create user in database
    const user = await this.prisma.user.create({
        data: {
        email,
        username,
        password: hashedPassword,
        },
    });

    // Step 4: Remove password from response
    const { password: _, ...result } = user;
    return {
        message: 'User created successfully',
        user: result,
    };
    }
}
