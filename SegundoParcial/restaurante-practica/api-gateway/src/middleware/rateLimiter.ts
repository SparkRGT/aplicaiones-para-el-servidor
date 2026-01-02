import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP en la ventana de tiempo
  message: {
    error: 'Demasiadas peticiones desde esta IP, por favor intenta más tarde.',
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 requests para operaciones críticas
  message: {
    error: 'Demasiadas peticiones. Por favor espera antes de intentar nuevamente.',
    statusCode: 429,
  },
});

