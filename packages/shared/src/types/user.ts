import { z } from 'zod';

// Phone validation for Kyrgyzstan format (+996)
export const phoneNumberSchema = z
  .string()
  .regex(/^\+996[0-9]{9}$/, 'Неверный формат номера телефона (+996XXXXXXXXX)');

// User status enum (from database)
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
  DELETED = 'deleted'
}

// Loyalty tiers (from database)
export enum LoyaltyTier {
  BEGINNER = 'beginner',
  FRIEND = 'friend',
  VIP = 'vip'
}

// Gender enum (from database)
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  NOT_STATED = 'not_stated'
}

// Base user schema (matching database structure)
export const userSchema = z.object({
  id: z.string().uuid(),
  phone: phoneNumberSchema,
  email: z.string().email('Неверный формат email').optional(),
  full_name: z.string().optional(),
  first_name: z.string().min(1, 'Имя обязательно').max(100).optional(),
  last_name: z.string().min(1, 'Фамилия обязательна').max(100).optional(),
  birth_date: z.date().optional(),
  gender: z.nativeEnum(Gender).optional(),
  avatar_url: z.string().url().optional(),
  status: z.nativeEnum(UserStatus).default(UserStatus.ACTIVE),
  
  // Loyalty fields
  loyalty_tier: z.nativeEnum(LoyaltyTier).default(LoyaltyTier.BEGINNER),
  loyalty_points: z.number().int().min(0).default(0),
  total_spent: z.number().min(0).default(0),
  total_visits: z.number().int().min(0).default(0),
  
  // Notification preferences
  notification_email: z.boolean().default(true),
  notification_sms: z.boolean().default(true),
  notification_push: z.boolean().default(true),
  
  // Timestamps
  last_login_at: z.date().optional(),
  email_verified_at: z.date().optional(),
  phone_verified_at: z.date().optional(),
  created_at: z.date(),
  updated_at: z.date()
});



// Create user schema (for registration)
export const createUserSchema = z.object({
  phone: phoneNumberSchema,
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  email: z.string().email().optional(),
  birth_date: z.string().pipe(z.coerce.date()).optional(),
  gender: z.nativeEnum(Gender).optional()
});

// Update user schema
export const updateUserSchema = createUserSchema.partial().omit({
  phone: true
});

// User profile schema (public view)
export const userProfileSchema = userSchema.pick({
  id: true,
  first_name: true,
  last_name: true,
  full_name: true,
  loyalty_tier: true,
  loyalty_points: true,
  total_spent: true,
  total_visits: true,
  created_at: true
});

// Authentication schemas
export const loginSchema = z.object({
  phone: phoneNumberSchema,
  otp: z.string().length(6, 'OTP должен содержать 6 цифр')
});

export const sendOtpSchema = z.object({
  phone: phoneNumberSchema
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token обязателен')
});

// TypeScript types from schemas
export type User = z.infer<typeof userSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type SendOtpRequest = z.infer<typeof sendOtpSchema>;
export type RefreshTokenRequest = z.infer<typeof refreshTokenSchema>;

// User with relations
export interface UserWithStats extends User {
  stats: {
    favoriteParks: string[];
    lastVisitDate?: Date;
  };
}

// API Response types
export interface UserResponse {
  user: User;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface OtpResponse {
  success: boolean;
  message: string;
  expiresIn: number;
}

// Utility types
export type UserId = User['id'];
export type UserPhone = User['phone'];
export type UserEmail = NonNullable<User['email']>;

// Constants (matching database system_settings)
export const LOYALTY_TIER_BENEFITS = {
  [LoyaltyTier.BEGINNER]: {
    discountPercent: 0,
    pointsMultiplier: 1,
    specialOffers: false,
    priorityBooking: false
  },
  [LoyaltyTier.FRIEND]: {
    discountPercent: 5,
    pointsMultiplier: 1.5,
    specialOffers: true,
    priorityBooking: false
  },
  [LoyaltyTier.VIP]: {
    discountPercent: 10,
    pointsMultiplier: 2,
    specialOffers: true,
    priorityBooking: true
  }
} as const;

export const LOYALTY_TIER_REQUIREMENTS = {
  [LoyaltyTier.FRIEND]: {
    minTotalSpent: 5000, // from database: friend_threshold
    minVisits: 5
  },
  [LoyaltyTier.VIP]: {
    minTotalSpent: 15000, // from database: vip_threshold
    minVisits: 20
  }
} as const; 
 