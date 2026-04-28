import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';
import * as promClient from 'prom-client';





async function bootstrap() {
    const port = process.env.LISTINGS_SERVICE_PORT || 3005;
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // ========== PROMETHEUS METRICS ==========
    promClient.collectDefaultMetrics({ prefix: 'listings_' });
    const httpRequestDuration = new promClient.Histogram({
        name: 'listings_http_request_duration_seconds',
        help: 'Duration of HTTP requests in seconds',
        labelNames: ['method', 'route', 'status_code'],
        buckets: [0.01, 0.05, 0.1, 0.5, 1, 5],
    });
    const httpRequestTotal = new promClient.Counter({
        name: 'listings_http_requests_total',
        help: 'Total number of HTTP requests',
        labelNames: ['method', 'route', 'status_code'],
    });
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.use((req, res, next) => {
        if (req.path === '/metrics') return next();
        const end = httpRequestDuration.startTimer();
        res.on('finish', () => {
            const route = req.route?.path || req.path;
            end({ method: req.method, route, status_code: res.statusCode });
            httpRequestTotal.inc({ method: req.method, route, status_code: res.statusCode });
        });
        next();
    });
    expressApp.get('/metrics', async (_req, res) => {
        res.set('Content-Type', promClient.register.contentType);
        res.end(await promClient.register.metrics());
    });
    // =========================================

    app.use(cookieParser());
    // CORS
    app.enableCors({
        origin: [
            process.env.APP_URL,
        ].filter(Boolean),
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    });

    // ========== SERVE STATIC FILES ==========
    app.useStaticAssets(join(__dirname, '..', 'uploads'), {
        prefix: '/uploads/',
    });
    // =========================================


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