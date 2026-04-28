import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';
import * as promClient from 'prom-client';



async function bootstrap() {
    const port = process.env.USER_SERVICE_PORT || 3005;
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // ========== PROMETHEUS METRICS ==========
    promClient.collectDefaultMetrics({ prefix: 'user_' });
    const httpRequestDuration = new promClient.Histogram({
        name: 'user_http_request_duration_seconds',
        help: 'Duration of HTTP requests in seconds',
        labelNames: ['method', 'route', 'status_code'],
        buckets: [0.01, 0.05, 0.1, 0.5, 1, 5],
    });
    const httpRequestTotal = new promClient.Counter({
        name: 'user_http_requests_total',
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
    // ========== ENABLE CORS ==========
    app.enableCors({
        origin: [
            process.env.APP_URL,
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
