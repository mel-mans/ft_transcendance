import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { PassportModule } from '@nestjs/passport';  // ← NEW
import { JwtStrategy } from './strategies/jwt.strategy';  // ← NEW
import { Intra42Strategy } from './strategies/intra42.strategy';  // ← NEW
import { GoogleStrategy } from './strategies/google.strategy';  // ← Add this



@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'fallback-secret-key',
            signOptions: { 
                expiresIn: '7d'
            },
        }),
    ],
    controllers: [AppController],
    providers: [AppService, PrismaService, JwtStrategy, Intra42Strategy, GoogleStrategy],  // ← NEW: Register strategies as providers
})
export class AppModule { }