import { z } from 'zod';

// Ticket status enum (from database)
export enum TicketStatus {
  ACTIVE = 'active',
  USED = 'used',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

// Ticket type enum (from database)
export enum TicketType {
  ADULT = 'adult',
  CHILD = 'child',
  GROUP = 'group',
  VIP = 'vip'
}



// Base ticket schema (matching database structure)
export const ticketSchema = z.object({
  id: z.string().uuid(),
  ticket_number: z.string(), // Generated automatically
  booking_id: z.string().uuid(),
  user_id: z.string().uuid(),
  type: z.nativeEnum(TicketType),
  status: z.nativeEnum(TicketStatus).default(TicketStatus.ACTIVE),
  
  // Ticket details
  holder_name: z.string().min(1, 'Имя держателя билета обязательно').max(200),
  holder_age: z.number().int().min(0).max(120).optional(),
  price: z.number().min(0),
  
  // Validity
  valid_from: z.date(),
  valid_to: z.date(),
  
  // QR Code
  qr_code: z.string().min(1, 'QR код обязателен'),
  
  // Usage tracking
  used_at: z.date().optional(),
  used_by: z.string().uuid().optional(), // staff member ID
  
  // Additional info
  special_requirements: z.string().optional(),
  notes: z.string().optional(),
  
  // Timestamps
  created_at: z.date(),
  updated_at: z.date()
});

// Create ticket schema
export const createTicketSchema = z.object({
  booking_id: z.string().uuid(),
  type: z.nativeEnum(TicketType),
  holder_name: z.string().min(1).max(200),
  holder_age: z.number().int().min(0).max(120).optional(),
  price: z.number().min(0),
  valid_from: z.string().pipe(z.coerce.date()),
  valid_to: z.string().pipe(z.coerce.date()),
  special_requirements: z.string().optional(),
  notes: z.string().optional()
});

// Update ticket schema
export const updateTicketSchema = z.object({
  holder_name: z.string().min(1).max(200).optional(),
  holder_age: z.number().int().min(0).max(120).optional(),
  special_requirements: z.string().optional(),
  notes: z.string().optional(),
  status: z.nativeEnum(TicketStatus).optional()
});

// Ticket validation request
export const validateTicketSchema = z.object({
  qr_code: z.string().min(1, 'QR код обязателен'),
  park_id: z.string().uuid(),
  staff_id: z.string().uuid(),
  location: z.string().optional()
});

// Bulk ticket creation
export const createBulkTicketsSchema = z.object({
  booking_id: z.string().uuid(),
  tickets: z.array(z.object({
    type: z.nativeEnum(TicketType),
    holder_name: z.string().min(1).max(200),
    holder_age: z.number().int().min(0).max(120).optional(),
    price: z.number().min(0),
    special_requirements: z.string().optional()
  })).min(1, 'Минимум один билет'),
  valid_from: z.string().pipe(z.coerce.date()),
  valid_to: z.string().pipe(z.coerce.date()),
  notes: z.string().optional()
});

// Ticket search schema
export const ticketSearchSchema = z.object({
  user_id: z.string().uuid().optional(),
  booking_id: z.string().uuid().optional(),
  status: z.nativeEnum(TicketStatus).optional(),
  type: z.nativeEnum(TicketType).optional(),
  valid_from: z.string().pipe(z.coerce.date()).optional(),
  valid_to: z.string().pipe(z.coerce.date()).optional(),
  holder_name: z.string().optional(),
  ticket_number: z.string().optional(),
  sort_by: z.enum(['created_at', 'valid_from', 'valid_to', 'price', 'holder_name']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20)
});

// TypeScript types from schemas
export type Ticket = z.infer<typeof ticketSchema>;
export type CreateTicket = z.infer<typeof createTicketSchema>;
export type UpdateTicket = z.infer<typeof updateTicketSchema>;
export type ValidateTicketRequest = z.infer<typeof validateTicketSchema>;
export type CreateBulkTickets = z.infer<typeof createBulkTicketsSchema>;
export type TicketSearch = z.infer<typeof ticketSearchSchema>;

// Extended ticket with relations
export interface TicketWithRelations extends Ticket {
  booking: {
    id: string;
    booking_number: string;
    visit_date: string;
    contact_name: string;
  };
  user: {
    id: string;
    full_name?: string;
    phone: string;
  };
  park?: {
    id: string;
    name: string;
    address: string;
  };
}

// Response types
export interface TicketResponse {
  ticket: TicketWithRelations;
}

export interface TicketValidationResponse {
  valid: boolean;
  ticket?: TicketWithRelations;
  message: string;
  can_enter: boolean;
  park_info?: {
    name: string;
    current_capacity: number;
    max_capacity: number;
  };
}

export interface TicketListResponse {
  tickets: TicketWithRelations[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface TicketStatsResponse {
  total_tickets: number;
  active_tickets: number;
  used_tickets: number;
  expired_tickets: number;
  cancelled_tickets: number;
  revenue_generated: number;
  most_popular_type: TicketType;
  type_breakdown: Record<TicketType, number>;
  status_breakdown: Record<TicketStatus, number>;
}

// Utility types
export type TicketId = Ticket['id'];
export type TicketNumber = Ticket['ticket_number'];
export type TicketQRCode = Ticket['qr_code'];

// Constants
export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  [TicketStatus.ACTIVE]: 'Активный',
  [TicketStatus.USED]: 'Использован',
  [TicketStatus.EXPIRED]: 'Истек',
  [TicketStatus.CANCELLED]: 'Отменен'
} as const;

export const TICKET_TYPE_LABELS: Record<TicketType, string> = {
  [TicketType.ADULT]: 'Взрослый',
  [TicketType.CHILD]: 'Детский',
  [TicketType.GROUP]: 'Групповой',
  [TicketType.VIP]: 'VIP'
} as const;

export const DEFAULT_TICKET_PAGE_SIZE = 20;
export const MAX_TICKET_PAGE_SIZE = 100;

// Helper functions
export const getTicketStatusColor = (status: TicketStatus): string => {
  switch (status) {
    case TicketStatus.ACTIVE:
      return 'green';
    case TicketStatus.USED:
      return 'blue';
    case TicketStatus.EXPIRED:
      return 'gray';
    case TicketStatus.CANCELLED:
      return 'red';
    default:
      return 'gray';
  }
};

export const isTicketValid = (ticket: Ticket): boolean => {
  const now = new Date();
  const validFrom = new Date(ticket.valid_from);
  const validTo = new Date(ticket.valid_to);
  
  return ticket.status === TicketStatus.ACTIVE &&
         now >= validFrom &&
         now <= validTo;
};

export const canUseTicket = (ticket: Ticket): boolean => {
  return isTicketValid(ticket) && !ticket.used_at;
};

export const getTicketAge = (ticket: Ticket): number => {
  const now = new Date();
  const createdAt = new Date(ticket.created_at);
  return Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
};

export const formatTicketNumber = (ticketNumber: string): string => {
  // Format: SKP-2025-000001 -> SKP-2025-000001
  return ticketNumber.toUpperCase();
};

export const generateQRCodeData = (ticket: Ticket): string => {
  return JSON.stringify({
    id: ticket.id,
    number: ticket.ticket_number,
    qr: ticket.qr_code,
    booking: ticket.booking_id,
    type: ticket.type,
    valid_from: ticket.valid_from,
    valid_to: ticket.valid_to
  });
}; 
 