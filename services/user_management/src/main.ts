import { NestFactory } from '@nestjs/core';
<<<<<<< HEAD
import { AppModule } from './app.module';

async function bootstrap() {
    const port = process.env.USER_SERVICE_PORT;
    const app = await NestFactory.create(AppModule);
    // Set global prefix to handle requests routed from /api/user
    app.setGlobalPrefix('api/user');
    await app.listen(port);
}
bootstrap();
=======
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
    const port = process.env.USER_SERVICE_PORT || 3005;
    const app = await NestFactory.create(AppModule);
    
    // ========== ENABLE CORS ==========
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3003', // Your frontend URL
        credentials: true,
    });

    // Enable validation
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    
    // Set global prefix
    app.setGlobalPrefix('api/users');
    
    await app.listen(port);
    console.log(`User Management Service running on port ${port}`);
}
bootstrap();
>>>>>>> 8a306b6d (adding some new endpoints)
