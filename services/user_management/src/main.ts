import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';  // ← ADD
import { NestExpressApplication } from '@nestjs/platform-express';  // ← ADD
import { join } from 'path';  // ← ADD


async function bootstrap() {
    const port = process.env.USER_SERVICE_PORT || 3005;
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    
    // ========== ENABLE CORS ==========
    app.enableCors({
        origin: [
            'https://localhost',
            'https://localhost:443',
            'http://localhost',
            'http://localhost:3003',
            process.env.FRONTEND_URL,
        ].filter(Boolean),
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
        preflightContinue: false,
        optionsSuccessStatus: 204,
    });

    // ========== SERVE STATIC FILES ==========
    app.useStaticAssets(join(__dirname, '..', 'uploads'), {
        prefix: '/uploads/',
    });
    // =========================================

    // Enable validation
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    
    // Set global prefix
    app.setGlobalPrefix('api/users');
    

    // ========== SWAGGER SETUP ==========
    const config = new DocumentBuilder()
        .setTitle('User Management API')
        .setDescription('User profiles and preferences endpoints')
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('users')
        .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/users/docs', app, document);
    // ====================================

    await app.listen(port);
    console.log(`User Management Service running on port ${port}`);
    console.log(`📚 Swagger docs: http://localhost:${port}/api/users/docs`);
}
bootstrap();
