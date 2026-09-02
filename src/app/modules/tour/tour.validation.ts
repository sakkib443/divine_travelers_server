// ===================================================================
// Divine Travelers - Tour Validation
// Zod validation schemas for Tour module
// ট্যুর মডিউলের ভ্যালিডেশন স্কিমা
// ===================================================================

import { z } from 'zod';

const itineraryItemSchema = z.object({
    day: z.number().min(1, 'Day must be at least 1'),
    title: z.string().min(1, 'Itinerary title is required'),
    titleBn: z.string().optional(),
    description: z.string().optional(),
    descriptionBn: z.string().optional(),
});

const faqSchema = z.object({
    question: z.string().min(1, 'Question is required'),
    questionBn: z.string().optional(),
    answer: z.string().min(1, 'Answer is required'),
    answerBn: z.string().optional(),
});

/**
 * Create Tour Validation Schema
 */
const createTourSchema = z.object({
    body: z.object({
        title: z
            .string({ required_error: 'Tour title is required' })
            .min(2, 'Title must be at least 2 characters')
            .max(200, 'Title cannot exceed 200 characters'),
        titleBn: z.string().max(200).optional(),
        image: z.string().optional().or(z.literal('')),
        gallery: z.array(z.string()).optional(),

        // Location & Category
        destination: z
            .string({ required_error: 'Destination is required' })
            .min(2, 'Destination must be at least 2 characters'),
        destinationBn: z.string().optional(),
        locationType: z.enum(['Domestic', 'International']).default('Domestic'),
        category: z.enum([
            'adventure', 'beach', 'city', 'culture', 'hill',
            'international', 'luxury', 'religious', 'nature', 'historical'
        ]).default('adventure'),
        tourType: z.enum([
            'Solo Tour', 'Group Tour', 'Family Tour', 'Couple Tour', 'Corporate Tour'
        ]).nullable().optional(),
        tourTypeBn: z.string().optional(),

        // Duration & Schedule
        duration: z.string({ required_error: 'Duration is required' }).min(1),
        durationBn: z.string().optional(),
        departureDate: z.string().optional(),
        departureDates: z.array(z.string()).optional(),

        // Pricing
        price: z.number({ required_error: 'Price is required' }).min(0),
        oldPrice: z.number().min(0).nullable().optional(),
        currency: z.string().default('BDT'),

        // Group & Booking
        groupSize: z.number().min(1).default(20),
        bookings: z.number().min(0).default(0),
        minAge: z.number().min(0).optional(),
        maxAge: z.number().min(0).optional(),

        // Description
        description: z.string().max(1000).optional(),
        descriptionBn: z.string().max(1000).optional(),
        longDescription: z.string().max(5000).optional(),
        longDescriptionBn: z.string().max(5000).optional(),

        // Itinerary
        itinerary: z.array(itineraryItemSchema).default([]),

        // Inclusions & Exclusions
        includes: z.array(z.string()).default([]),
        includesBn: z.array(z.string()).optional(),
        excludes: z.array(z.string()).optional(),
        excludesBn: z.array(z.string()).optional(),

        // FAQs
        faqs: z.array(faqSchema).optional(),

        // Tags
        tags: z.array(z.string()).optional(),

        // Rating
        rating: z.number().min(0).max(5).default(0),
        reviewsCount: z.number().min(0).default(0),

        // SEO
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),

        // Status & Order
        status: z.enum(['active', 'upcoming', 'completed', 'cancelled']).default('active'),
        isActive: z.boolean().default(true),
        isFeatured: z.boolean().default(false),
        order: z.number().min(0).default(0),
    }),
});

/**
 * Update Tour Validation Schema
 */
const updateTourSchema = z.object({
    body: z.object({
        title: z.string().min(2).max(200).optional(),
        titleBn: z.string().max(200).optional(),
        image: z.string().optional().or(z.literal('')),
        gallery: z.array(z.string()).optional(),

        destination: z.string().min(2).optional(),
        destinationBn: z.string().optional(),
        locationType: z.enum(['Domestic', 'International']).optional(),
        category: z.enum([
            'adventure', 'beach', 'city', 'culture', 'hill',
            'international', 'luxury', 'religious', 'nature', 'historical'
        ]).optional(),
        // nullable so the admin form can clear an already-set tour type.
        // null (not '') because the Mongoose enum has no '' member and would reject it.
        tourType: z.enum([
            'Solo Tour', 'Group Tour', 'Family Tour', 'Couple Tour', 'Corporate Tour'
        ]).nullable().optional(),
        tourTypeBn: z.string().optional(),

        duration: z.string().optional(),
        durationBn: z.string().optional(),
        departureDate: z.string().optional(),
        departureDates: z.array(z.string()).optional(),

        price: z.number().min(0).optional(),
        // nullable: the admin form sends null to clear the old (strike-through) price
        oldPrice: z.number().min(0).nullable().optional(),
        currency: z.string().optional(),

        groupSize: z.number().min(1).optional(),
        bookings: z.number().min(0).optional(),
        minAge: z.number().min(0).optional(),
        maxAge: z.number().min(0).optional(),

        description: z.string().max(1000).optional(),
        descriptionBn: z.string().max(1000).optional(),
        longDescription: z.string().max(5000).optional(),
        longDescriptionBn: z.string().max(5000).optional(),

        itinerary: z.array(itineraryItemSchema).optional(),

        includes: z.array(z.string()).optional(),
        includesBn: z.array(z.string()).optional(),
        excludes: z.array(z.string()).optional(),
        excludesBn: z.array(z.string()).optional(),

        faqs: z.array(faqSchema).optional(),
        tags: z.array(z.string()).optional(),

        rating: z.number().min(0).max(5).optional(),
        reviewsCount: z.number().min(0).optional(),

        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),

        status: z.enum(['active', 'upcoming', 'completed', 'cancelled']).optional(),
        isActive: z.boolean().optional(),
        isFeatured: z.boolean().optional(),
        order: z.number().min(0).optional(),
    }),
});

export const TourValidation = {
    createTourSchema,
    updateTourSchema,
};
