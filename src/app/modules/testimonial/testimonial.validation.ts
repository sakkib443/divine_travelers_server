// ===================================================================
// Divine Travelers - Testimonial Validation (Zod)
// ===================================================================

import { z } from 'zod';

const createTestimonialSchema = z.object({
    body: z.object({
        rating: z
            .number({ required_error: 'Rating is required' })
            .min(1, 'Rating must be at least 1')
            .max(5, 'Rating cannot exceed 5'),
        message: z
            .string({ required_error: 'Message is required' })
            .min(10, 'Message must be at least 10 characters')
            .max(1000, 'Message cannot exceed 1000 characters'),
        role: z.string().max(100).optional(),
    }),
});

const updateTestimonialSchema = z.object({
    body: z.object({
        rating: z.number().min(1).max(5).optional(),
        message: z.string().min(10).max(1000).optional(),
        role: z.string().max(100).optional(),
        status: z.enum(['pending', 'approved', 'rejected']).optional(),
        isFeatured: z.boolean().optional(),
    }),
});

export const TestimonialValidation = {
    createTestimonialSchema,
    updateTestimonialSchema,
};
