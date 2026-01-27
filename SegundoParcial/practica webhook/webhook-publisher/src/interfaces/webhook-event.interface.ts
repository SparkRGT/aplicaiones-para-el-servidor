export interface WebhookEvent {
  eventId: string;
  eventType: string;
  source: string;
  timestamp: string;
  data: any;
  correlationId?: string;
}

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: number;
  signature: string;
}

export interface WebhookSubscription {
  id: number;
  name: string;
  url: string;
  secret: string;
  eventTypes: string[];
  active: boolean;
  retryConfig: {
    maxAttempts: number;
    delays: number[];
  };
}

export interface WebhookDelivery {
  id?: number;
  subscriptionId: number;
  eventId: string;
  eventType: string;
  url: string;
  payload: any;
  status: 'pending' | 'success' | 'failed' | 'retrying';
  attemptNumber: number;
  httpStatusCode?: number;
  responseBody?: string;
  errorMessage?: string;
  deliveredAt?: Date;
}

