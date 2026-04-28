import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        super({
            // Connection pooling and timeout settings
            datasources: {
                db: {
                    url: process.env.DATABASE_URL,
                },
            },
            // Log connection issues for debugging
            log: ['error', 'warn'],
        });
    }

    async onModuleInit() {
        // Retry connection logic with exponential backoff
        let retries = 5;
        let delay = 1000; // Start with 1 second

        while (retries > 0) {
            try {
                await this.$connect();
                console.log('✅ Database connected successfully');
                break;
            } catch (error) {
                retries--;
                if (retries === 0) {
                    console.error('❌ Failed to connect to database after multiple attempts');
                    throw error;
                }
                console.log(`⚠️  Database connection failed, retrying in ${delay}ms... (${retries} attempts left)`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
            }
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}