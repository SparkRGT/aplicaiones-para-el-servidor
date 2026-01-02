import axios from 'axios';
import { Request, Response } from 'express';
import { services } from '../config/services';

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  responseTime?: number;
  details?: any;
  error?: string;
}

export const checkServiceHealth = async (serviceName: string): Promise<ServiceHealth> => {
  const service = services[serviceName];
  if (!service) {
    return {
      name: serviceName,
      status: 'unknown',
      error: 'Servicio no configurado',
    };
  }

  const startTime = Date.now();
  try {
    const response = await axios.get(`${service.baseUrl}${service.healthEndpoint}`, {
      timeout: service.timeout,
    });
    const responseTime = Date.now() - startTime;

    return {
      name: service.name,
      status: response.status === 200 ? 'healthy' : 'unhealthy',
      responseTime,
      details: response.data,
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    return {
      name: service.name,
      status: 'unhealthy',
      responseTime,
      error: error.message || 'Error desconocido',
    };
  }
};

export const aggregateHealthCheck = async (req: Request, res: Response): Promise<void> => {
  const serviceNames = Object.keys(services);
  const healthChecks = await Promise.all(
    serviceNames.map((name) => checkServiceHealth(name))
  );

  const allHealthy = healthChecks.every((check) => check.status === 'healthy');
  const statusCode = allHealthy ? 200 : 503;

  res.status(statusCode).json({
    status: allHealthy ? 'OK' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    services: healthChecks,
    gateway: {
      status: 'healthy',
      uptime: process.uptime(),
    },
  });
};

