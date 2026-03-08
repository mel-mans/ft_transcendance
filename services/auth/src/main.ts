import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';  // ← ADD
import * as cookieParser from 'cookie-parser';  // ← ADD
import * as promClient from 'prom-client';

async function bootstrap() {
    const port = process.env.AUTH_SERVICE_PORT || 3004;
    const app = await NestFactory.create(AppModule);

    // ========== PROMETHEUS METRICS ==========
    promClient.collectDefaultMetrics({ prefix: 'auth_' });
    const httpRequestDuration = new promClient.Histogram({
        name: 'auth_http_request_duration_seconds',
        help: 'Duration of HTTP requests in seconds',
        labelNames: ['method', 'route', 'status_code'],
        buckets: [0.01, 0.05, 0.1, 0.5, 1, 5],
    });
    const httpRequestTotal = new promClient.Counter({
        name: 'auth_http_requests_total',
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

    // Enable CORS - Allow NGINX origin
    const allowedOrigins = [
        process.env.APP_URL,
        process.env.FRONTEND_URL,
    ].filter(Boolean);

    app.enableCors({
        origin: allowedOrigins,
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
