// ===================================================================
// Divine Travelers - Testimonial Interface
// টেস্টিমোনিয়াল মডিউলের TypeScript interfaces
// ===================================================================

import { Document, Model, Types } from 'mongoose';

export type TestimonialStatus = 'pending' | 'approved' | 'rejected';

export interface ITestimonial extends Document {
    user: Types.ObjectId;
    name: string;
    avatar?: string;
    role?: string;
    rating: number;
    message: string;
    status: TestimonialStatus;
    isFeatured?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ITestimonialFilters {
    status?: TestimonialStatus;
    isFeatured?: boolean;
    searchTerm?: string;
}

export type TestimonialModel = Model<ITestimonial>;
