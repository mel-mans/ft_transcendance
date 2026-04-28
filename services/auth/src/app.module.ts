import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Intra42Strategy } from './strategies/intra42.strategy';
import { GoogleStrategy } from './strategies/google.strategy';



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
    providers: [AppService, PrismaService, JwtStrategy, Intra42Strategy, GoogleStrategy],
})
export class AppModule { }