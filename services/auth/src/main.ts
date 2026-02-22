import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
    const port = process.env.AUTH_SERVICE_PORT;
    const app = await NestFactory.create(AppModule);
    
<<<<<<< HEAD
=======
    // ========== ENABLE CORS ========== 
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3003', // Your frontend URL
        credentials: true,  // Allow cookies/auth headers
    });
    
>>>>>>> 8a306b6d (adding some new endpoints)
    // Enable validation globally
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    
    // Set global prefix to handle requests routed from /api/auth
    app.setGlobalPrefix('api/auth');
    
    await app.listen(port);
}
bootstrap();