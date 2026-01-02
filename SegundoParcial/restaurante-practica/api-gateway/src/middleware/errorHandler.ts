import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  service?: string;
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  console.error(`[API Gateway Error] ${req.method} ${req.path}:`, {
    statusCode,
    message,
    service: err.service,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  res.status(statusCode).json({
    error: {
      message,
      statusCode,
      service: err.service || 'api-gateway',
      timestamp: new Date().toISOString(),
      path: req.path,
    },
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: {
      message: `Ruta no encontrada: ${req.method} ${req.path}`,
      statusCode: 404,
      timestamp: new Date().toISOString(),
    },
  });
};

