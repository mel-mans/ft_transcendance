import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import * as promClient from 'prom-client';

async function bootstrap() {
    const port = process.env.PORT || 3000;
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

    // Enable CORS
    const allowedOrigins = [
        process.env.FRONTEND_URL,
        process.env.APP_URL,
    ].filter(Boolean);

    // If no specific origins configured, allow all (for Railway/container deployments)
    const corsOptions = {
        origin: allowedOrigins.length > 0 ? allowedOrigins : true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
        preflightContinue: false,
        optionsSuccessStatus: 204,
    };

    if (allowedOrigins.length === 0) {
        console.warn('⚠️  CORS: No FRONTEND_URL or APP_URL set, allowing all origins');
    } else {
        console.log('✅ CORS: Allowed origins:', allowedOrigins);
    }

    app.enableCors(corsOptions);

    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));

    app.setGlobalPrefix('api/auth');

    // ========== SWAGGER SETUP ==========
    const config = new DocumentBuilder()
        .setTitle('Auth Service API')
        .setDescription('Authentication and OAuth endpoints')
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('auth')
        .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/auth/docs', app, document);
    // ====================================

    await app.listen(port, '0.0.0.0');
    console.log(`Auth Service running on 0.0.0.0:${port}`);
    console.log(`📚 Swagger docs: http://localhost:${port}/api/auth/docs`);
}
bootstrap();
