import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
    const port = process.env.LISTINGS_SERVICE_PORT || 3005;
    const app = await NestFactory.create(AppModule);

    // CORS
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
    });

    // Validation
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));

    // Global prefix
    app.setGlobalPrefix('api/listings');

    // Swagger
    const config = new DocumentBuilder()
        .setTitle('Listings Service API')
        .setDescription('Apartment and room listings endpoints')
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('Listings')
        .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/listings/docs', app, document);

    await app.listen(port);
    console.log(`Listings Service running on port ${port}`);
    console.log(`📚 Swagger docs: http://localhost:${port}/api/listings/docs`);
}
bootstrap();