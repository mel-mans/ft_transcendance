import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';  // ← ADD

async function bootstrap() {
    const port = process.env.AUTH_SERVICE_PORT || 3004;
    const app = await NestFactory.create(AppModule);

    // Enable CORS - Allow NGINX origin
    app.enableCors({
        origin: [
            'https://localhost',           // ← NGINX HTTPS
            'https://localhost:443',       // ← NGINX HTTPS explicit
            'http://localhost',            // ← NGINX HTTP
            'http://localhost:3003',       // ← Direct frontend (for development)
            'http://10.0.2.15:3003',       // ← VM IP if needed
            process.env.FRONTEND_URL,
        ].filter(Boolean),
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
        preflightContinue: false,
        optionsSuccessStatus: 204,
    });

    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));

    app.setGlobalPrefix('api/auth');

    // ========== SWAGGER SETUP ========== ← ADD THIS
    const config = new DocumentBuilder()
        .setTitle('Auth Service API')
        .setDescription('Authentication and OAuth endpoints')
        .setVersion('1.0')
        .addBearerAuth()  // For JWT token
        .addTag('auth')
        .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/auth/docs', app, document);  // Available at /api/auth/docs
    // ====================================

    await app.listen(port);
    console.log(`Auth Service running on port ${port}`);
    console.log(`📚 Swagger docs: http://localhost:${port}/api/auth/docs`);  // ← ADD THIS
}
bootstrap();