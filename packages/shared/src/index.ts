// Re-export all types and schemas from individual modules

// User types
export * from './types/user';

// Park types  
export * from './types/park';

// Ticket types
export * from './types/ticket';

// Booking types
export * from './types/booking';

// Payment types
export * from './types/payment';

// API types
export * from './types/api';

// Common type utilities
export type UUID = string;
export type Timestamp = Date;
export type PhoneNumber = string; // +996XXXXXXXXX format
export type EmailAddress = string;
export type Currency = 'KGS' | 'USD' | 'EUR' | 'RUB';
export type Language = 'ru' | 'ky';
export type Coordinates = {
  latitude: number;
  longitude: number;
};

// Common constants
export const SUPPORTED_LANGUAGES = ['ru', 'ky'] as const;
export const SUPPORTED_CURRENCIES = ['KGS', 'USD', 'EUR', 'RUB'] as const;
export const DEFAULT_LANGUAGE = 'ru' as const;
export const DEFAULT_CURRENCY = 'KGS' as const;
export const KYRGYZSTAN_PHONE_REGEX = /^\+996[0-9]{9}$/;

// Date and time utilities
export const TIMEZONE = 'Asia/Bishkek';
export const DATE_FORMAT = 'yyyy-MM-dd';
export const TIME_FORMAT = 'HH:mm';
export const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';

// File upload constraints
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] as const;

// Validation patterns
export const VALIDATION_PATTERNS = {
  PHONE: KYRGYZSTAN_PHONE_REGEX,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  SAFE_STRING: /^[a-zA-Z0-9\s\-_.,!?()]*$/,
  STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
} as const;

// Error messages in Russian
export const VALIDATION_MESSAGES = {
  REQUIRED: 'Поле обязательно для заполнения',
  INVALID_EMAIL: 'Неверный формат email',
  INVALID_PHONE: 'Неверный формат номера телефона (+996XXXXXXXXX)',
  INVALID_UUID: 'Неверный формат идентификатора',
  PASSWORD_TOO_WEAK: 'Пароль должен содержать минимум 8 символов, включая заглавные и строчные буквы, цифры и специальные символы',
  MIN_LENGTH: (min: number) => `Минимальная длина: ${min} символов`,
  MAX_LENGTH: (max: number) => `Максимальная длина: ${max} символов`,
  MIN_VALUE: (min: number) => `Минимальное значение: ${min}`,
  MAX_VALUE: (max: number) => `Максимальное значение: ${max}`,
  INVALID_DATE: 'Неверный формат даты',
  FUTURE_DATE_REQUIRED: 'Дата должна быть в будущем',
  PAST_DATE_REQUIRED: 'Дата должна быть в прошлом'
} as const;

// Business rules constants
export const BUSINESS_RULES = {
  // Booking constraints
  MAX_GUESTS_PER_BOOKING: 50,
  MIN_ADVANCE_BOOKING_HOURS: 2,
  MAX_ADVANCE_BOOKING_DAYS: 90,
  CANCELLATION_DEADLINE_HOURS: 24,
  
  // Loyalty program
  POINTS_PER_KGS_SPENT: 1,
  POINTS_REDEMPTION_RATE: 0.01, // 1 point = 0.01 KGS
  MIN_POINTS_FOR_REDEMPTION: 100,
  
  // Age categories (in years)
  AGE_CATEGORIES: {
    BABY: { min: 0, max: 2 },
    CHILD: { min: 3, max: 12 },
    TEEN: { min: 13, max: 17 },
    ADULT: { min: 18, max: 64 },
    SENIOR: { min: 65, max: 120 }
  },
  
  // Operating hours
  DEFAULT_OPENING_TIME: '09:00',
  DEFAULT_CLOSING_TIME: '21:00',
  
  // Capacity limits
  MIN_PARK_CAPACITY: 10,
  MAX_PARK_CAPACITY: 1000,
  SAFETY_CAPACITY_BUFFER: 0.1, // 10% buffer for safety
  
  // Payment
  MIN_PAYMENT_AMOUNT: 50, // KGS
  MAX_PAYMENT_AMOUNT: 500000, // KGS
  PAYMENT_EXPIRY_MINUTES: 30,
  
  // QR codes
  QR_CODE_EXPIRY_HOURS: 24,
  QR_CODE_SIZE: 256,
  
  // Session and tokens
  SESSION_DURATION_HOURS: 24,
  REFRESH_TOKEN_DURATION_DAYS: 30,
  OTP_EXPIRY_MINUTES: 5,
  OTP_MAX_ATTEMPTS: 3,
  
  // Rate limiting
  MAX_REQUESTS_PER_MINUTE: 60,
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_LOCKOUT_MINUTES: 15
} as const;

// Environment configurations
export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'staging' | 'production';
  DATABASE_URL: string;
  REDIS_URL: string;
  JWT_SECRET: string;
  API_BASE_URL: string;
  WEB_APP_URL: string;
  MOBILE_APP_SCHEME: string;
  
  // Payment gateways
  ELQR_API_KEY: string;
  ELQR_MERCHANT_ID: string;
  ELCART_API_KEY: string;
  ELCART_MERCHANT_ID: string;
  MBANK_API_KEY: string;
  ODENGI_API_KEY: string;
  
  // External services
  SMS_API_KEY: string;
  EMAIL_API_KEY: string;
  STORAGE_BUCKET: string;
  
  // Monitoring
  SENTRY_DSN?: string;
  LOG_LEVEL: 'error' | 'warn' | 'info' | 'debug';
}

// Feature flags
export interface FeatureFlags {
  ENABLE_LOYALTY_PROGRAM: boolean;
  ENABLE_MOBILE_PAYMENTS: boolean;
  ENABLE_WALK_IN_BOOKINGS: boolean;
  ENABLE_GROUP_DISCOUNTS: boolean;
  ENABLE_REAL_TIME_NOTIFICATIONS: boolean;
  ENABLE_ANALYTICS: boolean;
  ENABLE_A_B_TESTING: boolean;
  MAINTENANCE_MODE: boolean;
}

// Default feature flags
export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  ENABLE_LOYALTY_PROGRAM: true,
  ENABLE_MOBILE_PAYMENTS: true,
  ENABLE_WALK_IN_BOOKINGS: true,
  ENABLE_GROUP_DISCOUNTS: true,
  ENABLE_REAL_TIME_NOTIFICATIONS: true,
  ENABLE_ANALYTICS: true,
  ENABLE_A_B_TESTING: false,
  MAINTENANCE_MODE: false
};

// Export version
export const PACKAGE_VERSION = '1.0.0';
export const API_VERSION = 'v1';
export const SCHEMA_VERSION = '1.0';

// Export utility functions type definitions
export interface UtilityFunctions {
  formatPhoneNumber: (phone: string) => string;
  validatePhoneNumber: (phone: string) => boolean;
  formatCurrency: (amount: number, currency: Currency) => string;
  calculateLoyaltyPoints: (amount: number) => number;
  calculateAge: (birthDate: Date) => number;
  determineAgeCategory: (age: number) => string;
  generateQRCode: (data: string) => Promise<string>;
  validateQRCode: (code: string) => boolean;
  formatDateTime: (date: Date, format?: string) => string;
  parseDateTime: (dateString: string) => Date;
  isBusinessHours: (time: Date, operatingHours: any) => boolean;
  calculateDistance: (point1: Coordinates, point2: Coordinates) => number;
  slugify: (text: string) => string;
  sanitizeString: (input: string) => string;
  generateId: () => string;
  hashPassword: (password: string) => Promise<string>;
  verifyPassword: (password: string, hash: string) => Promise<boolean>;
  generateOTP: () => string;
  maskPhoneNumber: (phone: string) => string;
  maskEmail: (email: string) => string;
}

// Sky Park - Shared Package
// Общие утилиты и типы для всего проекта

export * from './types'; 