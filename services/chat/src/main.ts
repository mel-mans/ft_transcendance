import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as promClient from 'prom-client';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ========== PROMETHEUS METRICS ==========
  promClient.collectDefaultMetrics({ prefix: 'chat_' });
  const httpRequestDuration = new promClient.Histogram({
      name: 'chat_http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 5],
  });
  const httpRequestTotal = new promClient.Counter({
      name: 'chat_http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
  });
  const wsConnectionsGauge = new promClient.Gauge({
      name: 'chat_websocket_connections_active',
      help: 'Number of active WebSocket connections',
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

    app.enableCors({
        origin: [
            process.env.APP_URL,
        ].filter(Boolean),
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,  // ← IMPORTANT: Allow cookies
    });

  await app.listen(process.env.CHAT_SERVICE_PORT || 3001);
}
bootstrap();