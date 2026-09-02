// ===================================================================
// Divine Travelers - Booking Validation (Zod)
// ===================================================================

import { z } from 'zod';

const createBookingSchema = z.object({
    body: z.object({
        type: z.enum(['tour', 'hajj'], {
            required_error: 'Booking type is required',
        }),
        serviceName: z
            .string({ required_error: 'Service name is required' })
            .min(1, 'Service name is required'),
        serviceId: z.string().optional(),
        name: z
            .string({ required_error: 'Name is required' })
            .min(1, 'Name is required'),
        email: z
            .string({ required_error: 'Email is required' })
            .email('A valid email is required'),
        phone: z
            .string({ required_error: 'Phone is required' })
            .min(1, 'Phone is required'),
        details: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
    }),
});

export const BookingValidation = {
    createBookingSchema,
};
