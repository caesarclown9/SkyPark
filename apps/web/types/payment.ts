import { z } from 'zod';

// Payment status enum (from database)
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

// Payment method enum (from database - Kyrgyzstan specific)
export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  ELQR = 'elqr',
  ELCART = 'elcart',
  MBANK = 'mbank',
  ODENGI = 'odengi',
  WALLET = 'wallet',
  LOYALTY_POINTS = 'loyalty_points'
}

// Payment provider enum (from database)
export enum PaymentProvider {
  ELQR = 'elqr',
  ELCART = 'elcart',
  MBANK = 'mbank',
  ODENGI = 'odengi',
  VISA = 'visa',
  MASTERCARD = 'mastercard',
  INTERNAL = 'internal'
}

// Refund reason enum
export enum RefundReason {
  USER_REQUEST = 'user_request',
  BOOKING_CANCELLED = 'booking_cancelled',
  PARK_CLOSURE = 'park_closure',
  TECHNICAL_ISSUE = 'technical_issue',
  OVERBOOKING = 'overbooking',
  ADMIN_ACTION = 'admin_action'
}

// Payment card schema
export const paymentCardSchema = z.object({
  last4: z.string().length(4),
  brand: z.enum(['visa', 'mastercard', 'elcart']),
  expiryMonth: z.number().int().min(1).max(12),
  expiryYear: z.number().int().min(2024),
  holderName: z.string().min(1).max(255).optional()
});

// Payment details schema (provider specific)
export const paymentDetailsSchema = z.object({
  provider: z.nativeEnum(PaymentProvider),
  providerTransactionId: z.string().optional(),
  providerReference: z.string().optional(),
  card: paymentCardSchema.optional(),
  phoneNumber: z.string().regex(/^\+996[0-9]{9}$/).optional(), // For mobile payments
  walletId: z.string().optional(),
  metadata: z.record(z.unknown()).default({})
});

// Refund details schema
export const refundDetailsSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().min(0),
  reason: z.nativeEnum(RefundReason),
  description: z.string().max(500).optional(),
  requestedBy: z.string().uuid(),
  processedBy: z.string().uuid().optional(),
  requestedAt: z.date(),
  processedAt: z.date().optional(),
  providerRefundId: z.string().optional(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  metadata: z.record(z.unknown()).default({})
});

// Base payment schema (matching database structure)
export const paymentSchema = z.object({
  id: z.string().uuid(),
  booking_id: z.string().uuid(),
  user_id: z.string().uuid(),
  
  // Payment details
  amount: z.number().min(0),
  currency: z.string().default('KGS'),
  status: z.nativeEnum(PaymentStatus).default(PaymentStatus.PENDING),
  method: z.nativeEnum(PaymentMethod),
  provider: z.nativeEnum(PaymentProvider),
  
  // Provider specific fields
  provider_transaction_id: z.string().optional(),
  provider_reference: z.string().optional(),
  provider_data: z.record(z.unknown()).optional(), // JSON for provider-specific data
  
  // Card data (if applicable)
  card_last4: z.string().optional(),
  card_brand: z.string().optional(),
  
  // Fee information
  fee_amount: z.number().min(0).default(0),
  net_amount: z.number().min(0),
  
  // Timestamps
  processed_at: z.date().optional(),
  failed_at: z.date().optional(),
  created_at: z.date(),
  updated_at: z.date(),
  
  // Additional fields
  description: z.string().optional(),
  failure_reason: z.string().optional(),
  refund_amount: z.number().min(0).default(0)
});

// Payment initiation schema
export const initiatePaymentSchema = z.object({
  booking_id: z.string().uuid(),
  method: z.nativeEnum(PaymentMethod),
  provider: z.nativeEnum(PaymentProvider),
  amount: z.number().min(0),
  description: z.string().optional(),
  
  // Method specific data
  card_details: z.object({
    number: z.string().min(13).max(19),
    expiry_month: z.number().int().min(1).max(12),
    expiry_year: z.number().int().min(2024),
    cvv: z.string().min(3).max(4),
    holder_name: z.string().min(1).max(255)
  }).optional(),
  
  phone_number: z.string().regex(/^\+996[0-9]{9}$/).optional(),
  wallet_id: z.string().optional(),
  
  // Client info
  return_url: z.string().url().optional(),
  cancel_url: z.string().url().optional()
});

// Payment confirmation schema
export const confirmPaymentSchema = z.object({
  payment_id: z.string().uuid(),
  confirmation_code: z.string().optional(),
  otp: z.string().optional()
});

// Refund request schema
export const requestRefundSchema = z.object({
  paymentId: z.string().uuid(),
  amount: z.number().min(0).optional(), // If not provided, full refund
  reason: z.nativeEnum(RefundReason),
  description: z.string().max(500).optional()
});

// Payment search schema
export const paymentSearchSchema = z.object({
  user_id: z.string().uuid().optional(),
  booking_id: z.string().uuid().optional(),
  method: z.nativeEnum(PaymentMethod).optional(),
  status: z.nativeEnum(PaymentStatus).optional(),
  provider: z.nativeEnum(PaymentProvider).optional(),
  amount_from: z.number().min(0).optional(),
  amount_to: z.number().min(0).optional(),
  date_from: z.string().pipe(z.coerce.date()).optional(),
  date_to: z.string().pipe(z.coerce.date()).optional(),
  sort_by: z.enum(['created_at', 'amount', 'status']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20)
});

// TypeScript types from schemas
export type Payment = z.infer<typeof paymentSchema>;
export type InitiatePayment = z.infer<typeof initiatePaymentSchema>;
export type ConfirmPayment = z.infer<typeof confirmPaymentSchema>;
export type PaymentSearch = z.infer<typeof paymentSearchSchema>;

// Extended payment with relations
export interface PaymentWithRelations extends Payment {
  booking: {
    id: string;
    booking_number: string;
    contact_name: string;
  };
  user: {
    id: string;
    full_name?: string;
    phone: string;
  };
}

// Response types
export interface PaymentResponse {
  payment: PaymentWithRelations;
}

export interface PaymentInitiationResponse {
  payment: Payment;
  redirect_url?: string;
  qr_code?: string;
  deep_link?: string;
  expires_at?: Date;
  instructions?: {
    title: string;
    steps: string[];
    help_text?: string;
  };
}

export interface PaymentListResponse {
  payments: PaymentWithRelations[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface PaymentStatsResponse {
  total_transactions: number;
  total_amount: number;
  total_fees: number;
  total_refunded: number;
  success_rate: number;
  average_transaction_value: number;
  
  method_stats: Array<{
    method: PaymentMethod;
    count: number;
    amount: number;
    success_rate: number;
  }>;
  
  daily_stats: Array<{
    date: string;
    count: number;
    amount: number;
    success_count: number;
  }>;
}

// Provider specific response types
export interface ELQRPaymentResponse {
  transaction_id: string;
  qr_code: string;
  deep_link: string;
  status: string;
  message: string;
}

export interface ElcartPaymentResponse {
  payment_id: string;
  redirect_url: string;
  status: string;
  session_id: string;
}

export interface MBankPaymentResponse {
  transaction_id: string;
  phone_number: string;
  confirmation_code: string;
  status: string;
}

export interface ODengiPaymentResponse {
  wallet_transaction_id: string;
  qr_code: string;
  status: string;
  balance: number;
}

// Utility types
export type PaymentId = Payment['id'];
export type PaymentAmount = Payment['amount'];

// Constants
export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'Ожидание',
  [PaymentStatus.PROCESSING]: 'Обработка',
  [PaymentStatus.COMPLETED]: 'Завершен',
  [PaymentStatus.FAILED]: 'Неудачный',
  [PaymentStatus.CANCELLED]: 'Отменен',
  [PaymentStatus.REFUNDED]: 'Возвращен'
} as const;

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: 'Наличные',
  [PaymentMethod.CARD]: 'Банковская карта',
  [PaymentMethod.ELQR]: 'ЭЛQR',
  [PaymentMethod.ELCART]: 'Элкарт',
  [PaymentMethod.MBANK]: 'M-Bank',
  [PaymentMethod.ODENGI]: 'O!Деньги',
  [PaymentMethod.WALLET]: 'Кошелек',
  [PaymentMethod.LOYALTY_POINTS]: 'Баллы лояльности'
} as const;

export const PAYMENT_PROVIDER_LABELS: Record<PaymentProvider, string> = {
  [PaymentProvider.ELQR]: 'ЭЛQR',
  [PaymentProvider.ELCART]: 'Элкарт',
  [PaymentProvider.MBANK]: 'M-Bank',
  [PaymentProvider.ODENGI]: 'O!Деньги',
  [PaymentProvider.VISA]: 'Visa',
  [PaymentProvider.MASTERCARD]: 'Mastercard',
  [PaymentProvider.INTERNAL]: 'Внутренняя система'
} as const;

export const DEFAULT_PAYMENT_PAGE_SIZE = 20;
export const MAX_PAYMENT_PAGE_SIZE = 100;

// Helper functions
export const getPaymentStatusColor = (status: PaymentStatus): string => {
  switch (status) {
    case PaymentStatus.PENDING:
      return 'yellow';
    case PaymentStatus.PROCESSING:
      return 'blue';
    case PaymentStatus.COMPLETED:
      return 'green';
    case PaymentStatus.FAILED:
      return 'red';
    case PaymentStatus.CANCELLED:
      return 'gray';
    case PaymentStatus.REFUNDED:
      return 'purple';
    default:
      return 'gray';
  }
};

export const canRefundPayment = (payment: Payment): boolean => {
  const maxRefundDays = 30;
  const daysSincePayment = (Date.now() - new Date(payment.created_at).getTime()) / (1000 * 60 * 60 * 24);
  
  return payment.status === PaymentStatus.COMPLETED && 
         payment.refund_amount === 0 && 
         daysSincePayment <= maxRefundDays;
};

export const getNetAmount = (payment: Payment): number => {
  return payment.amount - payment.fee_amount - payment.refund_amount;
};

export const PAYMENT_FEES = {
  [PaymentMethod.ELQR]: 0.015,        // 1.5%
  [PaymentMethod.ELCART]: 0.02,       // 2%
  [PaymentMethod.MBANK]: 0.01,        // 1%
  [PaymentMethod.ODENGI]: 0.015,      // 1.5%
  [PaymentMethod.CARD]: 0.025,   // 2.5%
  [PaymentMethod.CASH]: 0,            // 0%
  [PaymentMethod.LOYALTY_POINTS]: 0,  // 0%
  [PaymentMethod.WALLET]: 0.01        // 1%
} as const;

export const REFUND_REASON_NAMES = {
  [RefundReason.USER_REQUEST]: 'Запрос пользователя',
  [RefundReason.BOOKING_CANCELLED]: 'Отмена бронирования',
  [RefundReason.PARK_CLOSURE]: 'Закрытие парка',
  [RefundReason.TECHNICAL_ISSUE]: 'Техническая проблема',
  [RefundReason.OVERBOOKING]: 'Овербукинг',
  [RefundReason.ADMIN_ACTION]: 'Действие администратора'
} as const;

// Payment method capabilities
export const PAYMENT_METHOD_CAPABILITIES = {
  [PaymentMethod.ELQR]: {
    supportsRefund: true,
    supportsPartialRefund: true,
    requiresConfirmation: false,
    maxAmount: 1000000, // KGS
    minAmount: 50,
    processingTime: '1-3 минуты'
  },
  [PaymentMethod.ELCART]: {
    supportsRefund: true,
    supportsPartialRefund: true,
    requiresConfirmation: true,
    maxAmount: 2000000,
    minAmount: 100,
    processingTime: '2-5 минут'
  },
  [PaymentMethod.MBANK]: {
    supportsRefund: true,
    supportsPartialRefund: false,
    requiresConfirmation: true,
    maxAmount: 500000,
    minAmount: 50,
    processingTime: '1-2 минуты'
  },
  [PaymentMethod.ODENGI]: {
    supportsRefund: true,
    supportsPartialRefund: true,
    requiresConfirmation: false,
    maxAmount: 100000,
    minAmount: 20,
    processingTime: 'Мгновенно'
  },
  [PaymentMethod.CARD]: {
    supportsRefund: true,
    supportsPartialRefund: true,
    requiresConfirmation: true,
    maxAmount: 5000000,
    minAmount: 100,
    processingTime: '3-7 дней'
  },
  [PaymentMethod.CASH]: {
    supportsRefund: true,
    supportsPartialRefund: true,
    requiresConfirmation: false,
    maxAmount: 50000,
    minAmount: 50,
    processingTime: 'Мгновенно'
  },
  [PaymentMethod.LOYALTY_POINTS]: {
    supportsRefund: true,
    supportsPartialRefund: true,
    requiresConfirmation: false,
    maxAmount: undefined,
    minAmount: 10,
    processingTime: 'Мгновенно'
  },
  [PaymentMethod.WALLET]: {
    supportsRefund: true,
    supportsPartialRefund: true,
    requiresConfirmation: false,
    maxAmount: 1000000,
    minAmount: 50,
    processingTime: 'Мгновенно'
  }
} as const; 
 