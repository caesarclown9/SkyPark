import { z } from 'zod';

// Booking status enum (from database)
export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}



// Base booking schema (matching database structure)
export const bookingSchema = z.object({
  id: z.string().uuid(),
  booking_number: z.string(), // Generated automatically
  user_id: z.string().uuid(),
  park_id: z.string().uuid(),
  status: z.nativeEnum(BookingStatus).default(BookingStatus.PENDING),
  
  // Booking details
  visit_date: z.date(),
  visit_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  duration_hours: z.number().min(0.5).default(3), // в часах
  
  // Guest information
  adults_count: z.number().int().min(0).default(0),
  children_count: z.number().int().min(0).default(0),
  
  // Pricing
  base_price: z.number().min(0),
  discount_amount: z.number().min(0).default(0),
  total_amount: z.number().min(0),
  
  // Contact information
  contact_name: z.string().min(1, 'Имя контактного лица обязательно').max(200),
  contact_phone: z.string().regex(/^\+996[0-9]{9}$/, 'Неверный формат номера телефона'),
  contact_email: z.string().email('Неверный формат email').optional(),
  
  // Special requirements and notes
  special_requirements: z.string().optional(),
  notes: z.string().optional(),
  admin_notes: z.string().optional(),
  
  // Timestamps
  checked_in_at: z.date().optional(),
  completed_at: z.date().optional(),
  cancelled_at: z.date().optional(),
  created_at: z.date(),
  updated_at: z.date()
});

// Create booking schema
export const createBookingSchema = z.object({
  park_id: z.string().uuid(),
  visit_date: z.string().pipe(z.coerce.date()),
  visit_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  duration_hours: z.number().min(0.5).default(3),
  
  // Guest counts
  adults_count: z.number().int().min(0).default(1),
  children_count: z.number().int().min(0).default(0),
  
  // Contact information
  contact_name: z.string().min(1).max(200),
  contact_phone: z.string().regex(/^\+996[0-9]{9}$/),
  contact_email: z.string().email().optional(),
  
  // Optional fields
  special_requirements: z.string().optional(),
  notes: z.string().optional()
});

// Update booking schema
export const updateBookingSchema = z.object({
  visit_date: z.string().pipe(z.coerce.date()).optional(),
  visit_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  duration_hours: z.number().min(0.5).optional(),
  adults_count: z.number().int().min(0).optional(),
  children_count: z.number().int().min(0).optional(),
  contact_name: z.string().min(1).max(200).optional(),
  contact_phone: z.string().regex(/^\+996[0-9]{9}$/).optional(),
  contact_email: z.string().email().optional(),
  special_requirements: z.string().optional(),
  notes: z.string().optional(),
  admin_notes: z.string().optional()
});

// Cancel booking schema
export const cancelBookingSchema = z.object({
  reason: z.string().min(1, 'Причина отмены обязательна').max(500)
});

// Check-in schema
export const checkInSchema = z.object({
  booking_id: z.string().uuid(),
  actual_adults: z.number().int().min(0).optional(),
  actual_children: z.number().int().min(0).optional(),
  check_in_notes: z.string().optional()
});

// Booking search schema
export const bookingSearchSchema = z.object({
  user_id: z.string().uuid().optional(),
  park_id: z.string().uuid().optional(),
  status: z.nativeEnum(BookingStatus).optional(),
  visit_date_from: z.string().pipe(z.coerce.date()).optional(),
  visit_date_to: z.string().pipe(z.coerce.date()).optional(),
  created_from: z.string().pipe(z.coerce.date()).optional(),
  created_to: z.string().pipe(z.coerce.date()).optional(),
  search_query: z.string().optional(), // search by contact_name, phone, booking_number
  sort_by: z.enum(['created_at', 'visit_date', 'total_amount', 'contact_name']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20)
});

// TypeScript types from schemas
export type Booking = z.infer<typeof bookingSchema>;
export type CreateBooking = z.infer<typeof createBookingSchema>;
export type UpdateBooking = z.infer<typeof updateBookingSchema>;
export type CancelBooking = z.infer<typeof cancelBookingSchema>;
export type CheckIn = z.infer<typeof checkInSchema>;
export type BookingSearch = z.infer<typeof bookingSearchSchema>;

// Extended booking with relations
export interface BookingWithRelations extends Booking {
  park: {
    id: string;
    name: string;
    address: string;
    phone?: string;
  };
  user: {
    id: string;
    full_name?: string;
    phone: string;
  };
  tickets: Array<{
    id: string;
    ticket_number: string;
    type: string;
    status: string;
    qr_code: string;
  }>;
  payment?: {
    id: string;
    status: string;
    method: string;
    amount: number;
    provider: string;
  };
}

// Response types
export interface BookingResponse {
  booking: BookingWithRelations;
}

export interface BookingListResponse {
  bookings: BookingWithRelations[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface BookingStatsResponse {
  total_bookings: number;
  total_revenue: number;
  average_booking_value: number;
  total_guests: number;
  cancellation_rate: number;
  no_show_rate: number;
  status_breakdown: Record<BookingStatus, number>;
  revenue_by_month: Array<{
    month: string;
    revenue: number;
    bookings: number;
  }>;
}

export interface BookingAvailability {
  park_id: string;
  date: Date;
  total_capacity: number;
  current_bookings: number;
  available_slots: number;
  is_fully_booked: boolean;
  time_slots: Array<{
    time: string;
    capacity: number;
    booked: number;
    available: number;
    is_available: boolean;
  }>;
}

// Utility types
export type BookingId = Booking['id'];
export type BookingNumber = Booking['booking_number'];
export type BookingContactInfo = Pick<Booking, 'contact_name' | 'contact_phone' | 'contact_email'>;

// Constants
export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: 'Ожидает подтверждения',
  [BookingStatus.CONFIRMED]: 'Подтверждено',
  [BookingStatus.CHECKED_IN]: 'Зарегистрирован',
  [BookingStatus.COMPLETED]: 'Завершено',
  [BookingStatus.CANCELLED]: 'Отменено',
  [BookingStatus.NO_SHOW]: 'Не явился'
} as const;

export const DEFAULT_DURATION_HOURS = 3;
export const MIN_DURATION_HOURS = 0.5;
export const MAX_DURATION_HOURS = 8;
export const DEFAULT_BOOKING_PAGE_SIZE = 20;
export const MAX_BOOKING_PAGE_SIZE = 100;

// Helper functions
export const getTotalGuests = (booking: Booking): number => {
  return booking.adults_count + booking.children_count;
};

export const getBookingStatusColor = (status: BookingStatus): string => {
  switch (status) {
    case BookingStatus.PENDING:
      return 'yellow';
    case BookingStatus.CONFIRMED:
      return 'blue';
    case BookingStatus.CHECKED_IN:
      return 'green';
    case BookingStatus.COMPLETED:
      return 'green';
    case BookingStatus.CANCELLED:
      return 'red';
    case BookingStatus.NO_SHOW:
      return 'red';
    default:
      return 'gray';
  }
};

export const canCancelBooking = (booking: Booking): boolean => {
  const now = new Date();
  const visitDate = new Date(booking.visit_date);
  const hoursDiff = (visitDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  return booking.status === BookingStatus.PENDING || 
         booking.status === BookingStatus.CONFIRMED && hoursDiff > 2; // Can cancel up to 2 hours before
};

export const canCheckInBooking = (booking: Booking): boolean => {
  const now = new Date();
  const visitDate = new Date(booking.visit_date);
  const daysDiff = Math.abs(visitDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  
  return booking.status === BookingStatus.CONFIRMED && daysDiff < 1; // Can check in same day
}; 
 