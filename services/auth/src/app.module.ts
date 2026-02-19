import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { PassportModule } from '@nestjs/passport';  // ← NEW
import { JwtStrategy } from './strategies/jwt.strategy';  // ← NEW

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
    providers: [AppService, PrismaService, JwtStrategy],
})
export class AppModule { }