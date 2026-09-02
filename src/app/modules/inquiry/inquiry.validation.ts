// ===================================================================
// Divine Travelers Backend - Inquiry Validation (zod)
// ===================================================================

import { z } from 'zod';

// Public create — the ONLY fields a visitor can set. status / assignedTo /
// adminNote are never accepted from the public form.
export const createInquiryValidation = z.object({
    body: z.object({
        service: z
            .string({ required_error: 'Service is required' })
            .trim()
            .min(2, 'Service is required')
            .max(60),
        serviceLabel: z.string().trim().max(80).optional(),
        name: z
            .string({ required_error: 'Name is required' })
            .trim()
            .min(1, 'Name is required')
            .max(120, 'Name cannot exceed 120 characters'),
        email: z.string().trim().email('Please provide a valid email').optional().or(z.literal('')),
        phone: z
            .string({ required_error: 'Phone is required' })
            .trim()
            .min(6, 'A valid phone number is required')
            .max(40, 'Phone cannot exceed 40 characters'),
        subject: z.string().trim().max(200).optional(),
        message: z.string().max(4000).optional(),
        extra: z.record(z.unknown()).optional(),
        pageUrl: z.string().max(600).optional(),
    }),
});

// Admin inline update — status and/or admin note only.
export const updateInquiryValidation = z.object({
    body: z.object({
        status: z.enum(['new', 'contacted', 'converted', 'closed', 'spam']).optional(),
        adminNote: z.string().max(2000).optional(),
    }),
    params: z.object({ id: z.string() }),
});

export type TCreateInquiryInput = z.infer<typeof createInquiryValidation>['body'];
