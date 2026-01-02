import { Router } from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { getServiceUrl } from '../config/services';
import { aggregateHealthCheck } from '../middleware/healthCheck';
import { apiLimiter, strictLimiter } from '../middleware/rateLimiter';

const router = Router();

// Health check agregado
router.get('/health', aggregateHealthCheck);

// Configuración de proxy para el microservicio de Menú
const menuProxyOptions: Options = {
  target: getServiceUrl('menu'),
  changeOrigin: true,
  timeout: 30000,
  proxyTimeout: 30000,
  ws: false,
  logLevel: 'debug',
  onError: (err, req, res) => {
    console.error('[Menu Service Error]', err.message);
    if (!res.headersSent) {
      res.status(503).json({
        error: {
          message: 'Servicio de Menú no disponible',
          statusCode: 503,
          service: 'menu',
          timestamp: new Date().toISOString(),
        },
      });
    }
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[Gateway] ${req.method} ${req.url} -> Menu Service`);
    if (req.body && Object.keys(req.body).length > 0 && !req.body._readableState) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[Gateway] ${req.method} ${req.url} <- Menu Service (${proxyRes.statusCode})`);
  },
};

// Configuración de proxy para el microservicio de Reservas
const reservasProxyOptions: Options = {
  target: getServiceUrl('reservas'),
  changeOrigin: true,
  timeout: 30000,
  proxyTimeout: 30000,
  ws: false,
  logLevel: 'debug',
  onError: (err, req, res) => {
    console.error('[Reservas Service Error]', err.message);
    if (!res.headersSent) {
      res.status(503).json({
        error: {
          message: 'Servicio de Reservas no disponible',
          statusCode: 503,
          service: 'reservas',
          timestamp: new Date().toISOString(),
        },
      });
    }
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[Gateway] ${req.method} ${req.url} -> Reservas Service`);
    if (req.body && Object.keys(req.body).length > 0 && !req.body._readableState) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[Gateway] ${req.method} ${req.url} <- Reservas Service (${proxyRes.statusCode})`);
  },
};

// Rutas del microservicio de Menú
router.use('/api/menus', apiLimiter, createProxyMiddleware(menuProxyOptions));
router.use('/api/platos', apiLimiter, createProxyMiddleware(menuProxyOptions));

// Rutas del microservicio de Reservas
router.use('/api/reservas', apiLimiter, createProxyMiddleware(reservasProxyOptions));
router.use('/api/mesas', apiLimiter, createProxyMiddleware(reservasProxyOptions));

// Ruta de información del gateway
router.get('/info', (req, res) => {
  res.json({
    name: 'API Gateway - Sistema de Restaurante',
    version: '1.0.0',
    description: 'Punto único de entrada para todos los microservicios',
    services: {
      menu: {
        baseUrl: getServiceUrl('menu'),
        endpoints: ['/api/menus', '/api/platos'],
      },
      reservas: {
        baseUrl: getServiceUrl('reservas'),
        endpoints: ['/api/reservas', '/api/mesas'],
      },
    },
    timestamp: new Date().toISOString(),
  });
});

// Ruta para favicon (evitar 404)
router.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

export default router;

