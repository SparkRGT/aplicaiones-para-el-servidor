export interface ServiceConfig {
  name: string;
  baseUrl: string;
  healthEndpoint: string;
  timeout: number;
  retries: number;
}

export const services: Record<string, ServiceConfig> = {
  menu: {
    name: 'Microservicio de Menú',
    baseUrl: process.env.MENU_SERVICE_URL || 'http://localhost:3001',
    healthEndpoint: '/health',
    timeout: 5000,
    retries: 2,
  },
  reservas: {
    name: 'Microservicio de Reservas',
    baseUrl: process.env.RESERVAS_SERVICE_URL || 'http://localhost:3002',
    healthEndpoint: '/health',
    timeout: 5000,
    retries: 2,
  },
};

export const getServiceUrl = (serviceName: string): string => {
  const service = services[serviceName];
  if (!service) {
    throw new Error(`Servicio ${serviceName} no encontrado`);
  }
  return service.baseUrl;
};

