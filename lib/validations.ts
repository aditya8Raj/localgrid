import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  searchRadius: z.number().min(1).max(100).optional(),
})

export const skillSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.enum([
    'TECHNOLOGY',
    'ARTS_CRAFTS',
    'EDUCATION',
    'FITNESS_WELLNESS',
    'LANGUAGE',
    'BUSINESS',
    'HOME_GARDEN',
    'MUSIC',
    'COOKING',
    'OTHER',
  ]),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
  pricePerHour: z.number().min(0).optional(),
  creditPrice: z.number().min(0).optional(),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed').optional(),
})

export const skillRequestSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.enum([
    'TECHNOLOGY',
    'ARTS_CRAFTS',
    'EDUCATION',
    'FITNESS_WELLNESS',
    'LANGUAGE',
    'BUSINESS',
    'HOME_GARDEN',
    'MUSIC',
    'COOKING',
    'OTHER',
  ]),
  budget: z.number().min(0).optional(),
  urgency: z.enum(['URGENT', 'SOON', 'FLEXIBLE']),
  tags: z.array(z.string()).max(10).optional(),
})

export const bookingSchema = z.object({
  skillId: z.string(),
  providerId: z.string(),
  title: z.string().min(3),
  startTime: z.date(),
  endTime: z.date(),
  locationType: z.enum(['IN_PERSON', 'ONLINE', 'HYBRID']),
  location: z.string().optional(),
  notes: z.string().optional(),
  paidWithCredits: z.boolean().default(false),
})

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, 'Comment must be at least 10 characters').optional(),
  communication: z.number().min(1).max(5).optional(),
  quality: z.number().min(1).max(5).optional(),
  punctuality: z.number().min(1).max(5).optional(),
})

export const projectSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  category: z.enum([
    'TECHNOLOGY',
    'ARTS_CRAFTS',
    'EDUCATION',
    'FITNESS_WELLNESS',
    'LANGUAGE',
    'BUSINESS',
    'HOME_GARDEN',
    'MUSIC',
    'COOKING',
    'OTHER',
  ]),
  goals: z.string().min(20),
  skillsNeeded: z.array(z.string()).min(1, 'At least one skill is required'),
  location: z.string().optional(),
  isRemote: z.boolean().default(false),
  maxMembers: z.number().min(2).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  tags: z.array(z.string()).max(10).optional(),
})

export const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(2000, 'Message is too long'),
  conversationId: z.string(),
})
