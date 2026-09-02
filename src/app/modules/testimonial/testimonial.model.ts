// ===================================================================
// Divine Travelers - Testimonial Model
// টেস্টিমোনিয়াল মডিউলের Mongoose schema
// ===================================================================

import { Schema, model } from 'mongoose';
import { ITestimonial, TestimonialModel } from './testimonial.interface';

const testimonialSchema = new Schema<ITestimonial, TestimonialModel>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User is required'],
            index: true,
        },
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        avatar: {
            type: String,
        },
        role: {
            type: String,
            trim: true,
            maxlength: [100, 'Role cannot exceed 100 characters'],
        },
        rating: {
            type: Number,
            required: [true, 'Rating is required'],
            min: [1, 'Rating must be at least 1'],
            max: [5, 'Rating cannot exceed 5'],
        },
        message: {
            type: String,
            required: [true, 'Message is required'],
            trim: true,
            minlength: [10, 'Message must be at least 10 characters'],
            maxlength: [1000, 'Message cannot exceed 1000 characters'],
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
            index: true,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

testimonialSchema.index({ status: 1, isFeatured: -1, createdAt: -1 });

export const Testimonial = model<ITestimonial, TestimonialModel>(
    'Testimonial',
    testimonialSchema
);
