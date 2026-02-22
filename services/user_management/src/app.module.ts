import { Module } from '@nestjs/common';
<<<<<<< HEAD
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
    imports: [],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
=======
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'fallback-secret-key',
            signOptions: { expiresIn: '7d' },
        }),
    ],
    controllers: [AppController],
    providers: [AppService, PrismaService, JwtStrategy],
})
export class AppModule {}
>>>>>>> 8a306b6d (adding some new endpoints)
