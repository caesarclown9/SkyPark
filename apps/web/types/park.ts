import { z } from 'zod';

// Park status enum (from database)
export enum ParkStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  CLOSED = 'closed'
}

// Day of week enum
export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday'
}

// Amenity type enum
export enum AmenityType {
  PARKING = 'parking',
  WIFI = 'wifi',
  RESTAURANT = 'restaurant',
  CAFE = 'cafe',
  SHOP = 'shop',
  RESTROOM = 'restroom',
  BABY_ROOM = 'baby_room',
  FIRST_AID = 'first_aid',
  ACCESSIBILITY = 'accessibility',
  SECURITY = 'security'
}

// Coordinates schema
export const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180)
});

// Address schema
export const addressSchema = z.object({
  street: z.string().min(1, 'Адрес обязателен').max(255),
  city: z.string().min(1, 'Город обязателен').max(100),
  district: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().default('Кыргызстан')
});

// Operating hours schema
export const operatingHoursSchema = z.object({
  day: z.nativeEnum(DayOfWeek),
  openTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Неверный формат времени'),
  closeTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Неверный формат времени'),
  isClosed: z.boolean().default(false)
});

// Amenity schema
export const amenitySchema = z.object({
  type: z.nativeEnum(AmenityType),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isAvailable: z.boolean().default(true)
});

// Capacity info schema
export const capacitySchema = z.object({
  total: z.number().int().min(1, 'Общая вместимость должна быть больше 0'),
  current: z.number().int().min(0),
  reserved: z.number().int().min(0).default(0),
  available: z.number().int().min(0)
});

// Park image schema
export const parkImageSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url('Неверный формат URL'),
  altText: z.string().max(255).optional(),
  caption: z.string().max(500).optional(),
  isPrimary: z.boolean().default(false),
  order: z.number().int().min(0).default(0)
});

// Base park schema (matching database structure)
export const parkSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  name: z.string().min(1, 'Название парка обязательно').max(200),
  description: z.string().optional(),
  address: z.string().min(1, 'Адрес обязателен').max(500),
  phone: z.string().regex(/^\+996[0-9]{9}$/, 'Неверный формат номера телефона').optional(),
  email: z.string().email('Неверный формат email').optional(),
  website: z.string().url('Неверный формат URL').optional(),
  
  // Location
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  
  // Pricing and capacity
  base_price: z.number().min(0),
  capacity: z.number().int().min(1),
  
  // Hours
  opening_hours: z.record(z.string()).optional(), // JSON object with day->hours mapping
  
  // Features and amenities as JSON
  amenities: z.array(z.string()).optional(),
  age_restrictions: z.string().optional(),
  safety_rules: z.string().optional(),
  
  // Status and visibility
  status: z.nativeEnum(ParkStatus).default(ParkStatus.ACTIVE),
  is_featured: z.boolean().default(false),
  
  // Images
  image_urls: z.array(z.string().url()).optional(),
  
  // Timestamps
  created_at: z.date(),
  updated_at: z.date()
});

// Attraction schema (matching database structure)
export const attractionSchema = z.object({
  id: z.string().uuid(),
  park_id: z.string().uuid(),
  name: z.string().min(1, 'Название аттракциона обязательно').max(200),
  description: z.string().optional(),
  age_min: z.number().int().min(0).optional(),
  age_max: z.number().int().optional(),
  height_min: z.number().min(0).optional(),
  height_max: z.number().optional(),
  duration_minutes: z.number().int().min(1).optional(),
  capacity_per_session: z.number().int().min(1).optional(),
  price: z.number().min(0).optional(),
  is_included: z.boolean().default(true), // Включен в базовый билет
  is_active: z.boolean().default(true),
  image_url: z.string().url().optional(),
  safety_instructions: z.string().optional(),
  created_at: z.date(),
  updated_at: z.date()
});

// Organization schema (simplified)
export const organizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  logo_url: z.string().url().optional(),
  website: z.string().url().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  created_at: z.date(),
  updated_at: z.date()
});

// Create schemas
export const createParkSchema = parkSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
});

export const createAttractionSchema = attractionSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
});

// Update schemas
export const updateParkSchema = createParkSchema.partial();
export const updateAttractionSchema = createAttractionSchema.partial();

// Park with relations schema
export const parkWithAttractionsSchema = parkSchema.extend({
  attractions: z.array(attractionSchema).optional(),
  organization: organizationSchema.optional()
});

// Park list item schema (for listings)
export const parkListItemSchema = parkSchema.pick({
  id: true,
  name: true,
  description: true,
  address: true,
  latitude: true,
  longitude: true,
  base_price: true,
  capacity: true,
  status: true,
  is_featured: true,
  image_urls: true,
  created_at: true
}).extend({
  distance: z.number().optional(), // Distance from user in km
  is_open: z.boolean().optional(),
  organization_name: z.string().optional(),
  attractions_count: z.number().int().min(0).optional()
});

// TypeScript types
export type Coordinates = z.infer<typeof coordinatesSchema>;
export type Address = z.infer<typeof addressSchema>;
export type OperatingHours = z.infer<typeof operatingHoursSchema>;
export type Amenity = z.infer<typeof amenitySchema>;
export type Capacity = z.infer<typeof capacitySchema>;
export type ParkImage = z.infer<typeof parkImageSchema>;
export type Park = z.infer<typeof parkSchema>;
export type Attraction = z.infer<typeof attractionSchema>;
export type Organization = z.infer<typeof organizationSchema>;
export type CreatePark = z.infer<typeof createParkSchema>;
export type CreateAttraction = z.infer<typeof createAttractionSchema>;
export type UpdatePark = z.infer<typeof updateParkSchema>;
export type UpdateAttraction = z.infer<typeof updateAttractionSchema>;
export type ParkWithAttractions = z.infer<typeof parkWithAttractionsSchema>;
export type ParkListItem = z.infer<typeof parkListItemSchema>;

// Search and filter schemas
export const parkSearchSchema = z.object({
  query: z.string().optional(),
  city: z.string().optional(),
  coordinates: coordinatesSchema.optional(),
  radius: z.number().min(0).max(50).default(10), // km
  min_price: z.number().min(0).optional(),
  max_price: z.number().min(0).optional(),
  amenities: z.array(z.string()).optional(),
  has_availability: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  status: z.nativeEnum(ParkStatus).optional(),
  sort_by: z.enum(['distance', 'name', 'price', 'created_at']).default('distance'),
  sort_order: z.enum(['asc', 'desc']).default('asc'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20)
});

export type ParkSearch = z.infer<typeof parkSearchSchema>;

// Response types
export interface ParkSearchResponse {
  parks: ParkListItem[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface ParkStatsResponse {
  total_parks: number;
  active_parks: number;
  featured_parks: number;
  total_capacity: number;
  average_price: number;
}

// Utility types
export type ParkId = Park['id'];
export type ParkName = Park['name'];
export type AttractionId = Attraction['id'];
export type OrganizationId = Organization['id'];

// Opening hours type helper
export interface OpeningHours {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
}

// Constants
export const DEFAULT_PARK_CAPACITY = 100;
export const DEFAULT_SEARCH_RADIUS = 10; // km
export const MAX_SEARCH_RADIUS = 50; // km
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const AMENITY_LABELS: Record<AmenityType, string> = {
  [AmenityType.PARKING]: 'Парковка',
  [AmenityType.WIFI]: 'Wi-Fi',
  [AmenityType.RESTAURANT]: 'Ресторан',
  [AmenityType.CAFE]: 'Кафе',
  [AmenityType.SHOP]: 'Магазин',
  [AmenityType.RESTROOM]: 'Туалет',
  [AmenityType.BABY_ROOM]: 'Детская комната',
  [AmenityType.FIRST_AID]: 'Первая помощь',
  [AmenityType.ACCESSIBILITY]: 'Доступность',
  [AmenityType.SECURITY]: 'Безопасность'
} as const;

export const DEFAULT_OPERATING_HOURS: OperatingHours[] = [
  { day: DayOfWeek.MONDAY, openTime: '10:00', closeTime: '22:00', isClosed: false },
  { day: DayOfWeek.TUESDAY, openTime: '10:00', closeTime: '22:00', isClosed: false },
  { day: DayOfWeek.WEDNESDAY, openTime: '10:00', closeTime: '22:00', isClosed: false },
  { day: DayOfWeek.THURSDAY, openTime: '10:00', closeTime: '22:00', isClosed: false },
  { day: DayOfWeek.FRIDAY, openTime: '10:00', closeTime: '23:00', isClosed: false },
  { day: DayOfWeek.SATURDAY, openTime: '09:00', closeTime: '23:00', isClosed: false },
  { day: DayOfWeek.SUNDAY, openTime: '09:00', closeTime: '22:00', isClosed: false }
]; 
 