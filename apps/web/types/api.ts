import { z } from 'zod';

// HTTP status codes
export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504
}

// Error types
export enum ApiErrorType {
  VALIDATION_ERROR = 'validation_error',
  AUTHENTICATION_ERROR = 'authentication_error',
  AUTHORIZATION_ERROR = 'authorization_error',
  NOT_FOUND_ERROR = 'not_found_error',
  CONFLICT_ERROR = 'conflict_error',
  RATE_LIMIT_ERROR = 'rate_limit_error',
  PAYMENT_ERROR = 'payment_error',
  BOOKING_ERROR = 'booking_error',
  TICKET_ERROR = 'ticket_error',
  PARK_ERROR = 'park_error',
  INTERNAL_ERROR = 'internal_error',
  EXTERNAL_SERVICE_ERROR = 'external_service_error',
  MAINTENANCE_ERROR = 'maintenance_error'
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean()
});

// Sort schema
export const sortSchema = z.object({
  field: z.string().min(1),
  direction: z.enum(['asc', 'desc']).default('asc')
});

// Filter schema
export const filterSchema = z.object({
  field: z.string().min(1),
  operator: z.enum(['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'nin', 'like', 'ilike']),
  value: z.unknown()
});

// Search query schema
export const searchQuerySchema = z.object({
  query: z.string().optional(),
  filters: z.array(filterSchema).default([]),
  sort: z.array(sortSchema).default([]),
  pagination: paginationSchema.optional()
});

// API error schema
export const apiErrorSchema = z.object({
  type: z.nativeEnum(ApiErrorType),
  code: z.string().min(1),
  message: z.string().min(1),
  details: z.string().optional(),
  field: z.string().optional(), // For validation errors
  severity: z.nativeEnum(ErrorSeverity).default(ErrorSeverity.MEDIUM),
  timestamp: z.date(),
  requestId: z.string().uuid().optional(),
  userMessage: z.string().optional(), // User-friendly message in Russian/Kyrgyz
  metadata: z.record(z.unknown()).default({})
});

// Validation error detail
export const validationErrorDetailSchema = z.object({
  field: z.string().min(1),
  message: z.string().min(1),
  code: z.string().min(1),
  value: z.unknown().optional()
});

// Success response schema
export const successResponseSchema = z.object({
  success: z.boolean().default(true),
  message: z.string().optional(),
  timestamp: z.date(),
  requestId: z.string().uuid().optional(),
  version: z.string().default('1.0.0')
});

// Error response schema
export const errorResponseSchema = z.object({
  success: z.boolean().default(false),
  error: apiErrorSchema,
  validationErrors: z.array(validationErrorDetailSchema).optional(),
  timestamp: z.date(),
  requestId: z.string().uuid().optional(),
  version: z.string().default('1.0.0')
});

// Paginated response schema
export const paginatedResponseSchema = <T>(dataSchema: z.ZodType<T>) =>
  z.object({
    success: z.boolean().default(true),
    data: z.array(dataSchema),
    pagination: paginationSchema,
    message: z.string().optional(),
    timestamp: z.date(),
    requestId: z.string().uuid().optional(),
    version: z.string().default('1.0.0')
  });

// Single item response schema
export const singleResponseSchema = <T>(dataSchema: z.ZodType<T>) =>
  z.object({
    success: z.boolean().default(true),
    data: dataSchema,
    message: z.string().optional(),
    timestamp: z.date(),
    requestId: z.string().uuid().optional(),
    version: z.string().default('1.0.0')
  });

// Bulk operation result
export const bulkOperationResultSchema = z.object({
  total: z.number().int().min(0),
  successful: z.number().int().min(0),
  failed: z.number().int().min(0),
  errors: z.array(z.object({
    index: z.number().int().min(0),
    error: apiErrorSchema
  })).default([])
});

// Health check response
export const healthCheckSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  version: z.string(),
  timestamp: z.date(),
  uptime: z.number().min(0), // seconds
  services: z.record(z.object({
    status: z.enum(['up', 'down', 'degraded']),
    responseTime: z.number().min(0).optional(), // milliseconds
    lastCheck: z.date(),
    details: z.string().optional()
  })),
  metrics: z.object({
    memoryUsage: z.number().min(0).max(100), // percentage
    cpuUsage: z.number().min(0).max(100), // percentage
    diskUsage: z.number().min(0).max(100), // percentage
    activeConnections: z.number().int().min(0),
    requestsPerMinute: z.number().min(0)
  }).optional()
});

// TypeScript types
export type Pagination = z.infer<typeof paginationSchema>;
export type Sort = z.infer<typeof sortSchema>;
export type Filter = z.infer<typeof filterSchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type ApiError = z.infer<typeof apiErrorSchema>;
export type ValidationErrorDetail = z.infer<typeof validationErrorDetailSchema>;
export type SuccessResponse = z.infer<typeof successResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export type BulkOperationResult = z.infer<typeof bulkOperationResultSchema>;
export type HealthCheck = z.infer<typeof healthCheckSchema>;

// Generic response types
export type PaginatedResponse<T> = {
  success: true;
  data: T[];
  pagination: Pagination;
  message?: string;
  timestamp: Date;
  requestId?: string;
  version: string;
};

export type SingleResponse<T> = {
  success: true;
  data: T;
  message?: string;
  timestamp: Date;
  requestId?: string;
  version: string;
};

// API response unions
export type ApiResponse<T> = SingleResponse<T> | ErrorResponse;
export type ApiListResponse<T> = PaginatedResponse<T> | ErrorResponse;

// Request context
export interface RequestContext {
  userId?: string;
  userAgent?: string;
  ipAddress?: string;
  language: 'ru' | 'ky';
  requestId: string;
  timestamp: Date;
  deviceType?: 'mobile' | 'desktop' | 'tablet';
  source?: 'web' | 'mobile' | 'api';
}

// Rate limiting info
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: Date;
  retryAfter?: number; // seconds
}

// API metadata
export interface ApiMetadata {
  version: string;
  environment: 'development' | 'staging' | 'production';
  region: string;
  timestamp: Date;
  rateLimit?: RateLimitInfo;
}

// Webhook event types
export enum WebhookEventType {
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  BOOKING_CREATED = 'booking.created',
  BOOKING_CONFIRMED = 'booking.confirmed',
  BOOKING_CANCELLED = 'booking.cancelled',
  PAYMENT_COMPLETED = 'payment.completed',
  PAYMENT_FAILED = 'payment.failed',
  TICKET_VALIDATED = 'ticket.validated',
  PARK_CAPACITY_UPDATED = 'park.capacity_updated'
}

// Webhook payload
export const webhookPayloadSchema = z.object({
  id: z.string().uuid(),
  event: z.nativeEnum(WebhookEventType),
  data: z.record(z.unknown()),
  timestamp: z.date(),
  version: z.string().default('1.0.0'),
  signature: z.string().optional()
});

export type WebhookPayload = z.infer<typeof webhookPayloadSchema>;

// Constants
export const API_ERROR_CODES = {
  // Authentication & Authorization
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Validation
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Business Logic
  BOOKING_NOT_AVAILABLE: 'BOOKING_NOT_AVAILABLE',
  INSUFFICIENT_CAPACITY: 'INSUFFICIENT_CAPACITY',
  PAYMENT_REQUIRED: 'PAYMENT_REQUIRED',
  TICKET_ALREADY_USED: 'TICKET_ALREADY_USED',
  TICKET_EXPIRED: 'TICKET_EXPIRED',
  PARK_CLOSED: 'PARK_CLOSED',
  
  // Resources
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  BOOKING_NOT_FOUND: 'BOOKING_NOT_FOUND',
  TICKET_NOT_FOUND: 'TICKET_NOT_FOUND',
  PARK_NOT_FOUND: 'PARK_NOT_FOUND',
  PAYMENT_NOT_FOUND: 'PAYMENT_NOT_FOUND',
  
  // External Services
  PAYMENT_GATEWAY_ERROR: 'PAYMENT_GATEWAY_ERROR',
  SMS_SERVICE_ERROR: 'SMS_SERVICE_ERROR',
  EMAIL_SERVICE_ERROR: 'EMAIL_SERVICE_ERROR',
  
  // System
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  MAINTENANCE_MODE: 'MAINTENANCE_MODE'
} as const;

export const API_ERROR_MESSAGES = {
  [API_ERROR_CODES.INVALID_TOKEN]: 'Недействительный токен авторизации',
  [API_ERROR_CODES.TOKEN_EXPIRED]: 'Токен авторизации истек',
  [API_ERROR_CODES.INSUFFICIENT_PERMISSIONS]: 'Недостаточно прав доступа',
  [API_ERROR_CODES.VALIDATION_FAILED]: 'Ошибка валидации данных',
  [API_ERROR_CODES.REQUIRED_FIELD_MISSING]: 'Обязательное поле отсутствует',
  [API_ERROR_CODES.INVALID_FORMAT]: 'Неверный формат данных',
  [API_ERROR_CODES.BOOKING_NOT_AVAILABLE]: 'Бронирование недоступно',
  [API_ERROR_CODES.INSUFFICIENT_CAPACITY]: 'Недостаточно свободных мест',
  [API_ERROR_CODES.PAYMENT_REQUIRED]: 'Требуется оплата',
  [API_ERROR_CODES.TICKET_ALREADY_USED]: 'Билет уже использован',
  [API_ERROR_CODES.TICKET_EXPIRED]: 'Билет истек',
  [API_ERROR_CODES.PARK_CLOSED]: 'Парк закрыт',
  [API_ERROR_CODES.USER_NOT_FOUND]: 'Пользователь не найден',
  [API_ERROR_CODES.BOOKING_NOT_FOUND]: 'Бронирование не найдено',
  [API_ERROR_CODES.TICKET_NOT_FOUND]: 'Билет не найден',
  [API_ERROR_CODES.PARK_NOT_FOUND]: 'Парк не найден',
  [API_ERROR_CODES.PAYMENT_NOT_FOUND]: 'Платеж не найден',
  [API_ERROR_CODES.PAYMENT_GATEWAY_ERROR]: 'Ошибка платежного шлюза',
  [API_ERROR_CODES.SMS_SERVICE_ERROR]: 'Ошибка SMS сервиса',
  [API_ERROR_CODES.EMAIL_SERVICE_ERROR]: 'Ошибка email сервиса',
  [API_ERROR_CODES.INTERNAL_SERVER_ERROR]: 'Внутренняя ошибка сервера',
  [API_ERROR_CODES.SERVICE_UNAVAILABLE]: 'Сервис временно недоступен',
  [API_ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Превышен лимит запросов',
  [API_ERROR_CODES.MAINTENANCE_MODE]: 'Режим технического обслуживания'
} as const;

// API versioning
export const API_VERSIONS = {
  V1: 'v1',
  V2: 'v2'
} as const;

// Content types
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded',
  TEXT: 'text/plain',
  HTML: 'text/html',
  XML: 'application/xml'
} as const;

// Default pagination limits
export const PAGINATION_LIMITS = {
  DEFAULT: 20,
  MIN: 1,
  MAX: 100,
  MAX_ADMIN: 500
} as const;

// Cache durations (in seconds)
export const CACHE_DURATIONS = {
  SHORT: 300,      // 5 minutes
  MEDIUM: 1800,    // 30 minutes
  LONG: 3600,      // 1 hour
  VERY_LONG: 86400 // 24 hours
} as const;

// Request timeout (in milliseconds)
export const REQUEST_TIMEOUTS = {
  DEFAULT: 30000,    // 30 seconds
  UPLOAD: 300000,    // 5 minutes
  PAYMENT: 60000,    // 1 minute
  EXTERNAL: 10000    // 10 seconds
} as const; 
 