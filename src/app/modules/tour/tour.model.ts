// ===================================================================
// Divine Travelers - Tour Model
// Mongoose schema for Tour module
// ট্যুর মডিউলের Mongoose স্কিমা
// ===================================================================

import { Schema, model } from 'mongoose';
import { ITour, TourModel } from './tour.interface';

// ==================== Sub-schemas ====================

const itineraryItemSchema = new Schema(
    {
        day: { type: Number, required: true },
        title: { type: String, required: true },
        titleBn: { type: String },
        description: { type: String },
        descriptionBn: { type: String },
    },
    { _id: false }
);

const faqSchema = new Schema(
    {
        question: { type: String, required: true },
        questionBn: { type: String },
        answer: { type: String, required: true },
        answerBn: { type: String },
    },
    { _id: false }
);

// ==================== Tour Schema ====================
const tourSchema = new Schema<ITour, TourModel>(
    {
        // Basic Info
        title: {
            type: String,
            required: [true, 'Tour title is required'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        titleBn: {
            type: String,
            trim: true,
            maxlength: [200, 'Bengali title cannot exceed 200 characters'],
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        image: { type: String },
        gallery: [{ type: String }],

        // Location & Category
        destination: {
            type: String,
            required: [true, 'Destination is required'],
            trim: true,
        },
        destinationBn: { type: String, trim: true },
        locationType: {
            type: String,
            enum: ['Domestic', 'International'],
            required: [true, 'Location type is required'],
            default: 'Domestic',
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: ['adventure', 'beach', 'city', 'culture', 'hill', 'international', 'luxury', 'religious', 'nature', 'historical'],
            default: 'adventure',
        },
        tourType: {
            type: String,
            enum: ['Solo Tour', 'Group Tour', 'Family Tour', 'Couple Tour', 'Corporate Tour'],
        },
        tourTypeBn: { type: String },

        // Duration & Schedule
        duration: {
            type: String,
            required: [true, 'Duration is required'],
        },
        durationBn: { type: String },
        departureDate: { type: String },
        departureDates: [{ type: String }],

        // Pricing
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
        },
        oldPrice: { type: Number, min: 0 },
        currency: {
            type: String,
            default: 'BDT',
        },

        // Group & Booking
        groupSize: { type: Number, default: 20 },
        bookings: { type: Number, default: 0 },
        minAge: { type: Number },
        maxAge: { type: Number },

        // Description
        description: {
            type: String,
            maxlength: [1000, 'Short description cannot exceed 1000 characters'],
        },
        descriptionBn: {
            type: String,
            maxlength: [1000, 'Bengali short description cannot exceed 1000 characters'],
        },
        longDescription: {
            type: String,
            maxlength: [5000, 'Long description cannot exceed 5000 characters'],
        },
        longDescriptionBn: {
            type: String,
            maxlength: [5000, 'Bengali long description cannot exceed 5000 characters'],
        },

        // Itinerary
        itinerary: [itineraryItemSchema],

        // Inclusions & Exclusions
        includes: [{ type: String }],
        includesBn: [{ type: String }],
        excludes: [{ type: String }],
        excludesBn: [{ type: String }],

        // FAQs
        faqs: [faqSchema],

        // Tags
        tags: [{ type: String }],

        // Rating
        rating: { type: Number, default: 0, min: 0, max: 5 },
        reviewsCount: { type: Number, default: 0 },

        // SEO
        metaTitle: { type: String },
        metaDescription: { type: String },

        // Status & Order
        status: {
            type: String,
            enum: ['active', 'upcoming', 'completed', 'cancelled'],
            default: 'active',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        order: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// ==================== Indexes ====================
// slug already has a unique index from its schema definition — no separate index here
tourSchema.index({ isActive: 1 });
tourSchema.index({ isFeatured: 1 });
tourSchema.index({ category: 1 });
tourSchema.index({ status: 1 });
tourSchema.index({ price: 1 });
tourSchema.index({ order: 1 });
tourSchema.index({ title: 'text', titleBn: 'text', destination: 'text' });

// ==================== Static Methods ====================
tourSchema.statics.isTourExists = async function (id: string): Promise<boolean> {
    const tour = await this.findById(id);
    return !!tour;
};

tourSchema.statics.findBySlug = async function (slug: string): Promise<ITour | null> {
    return this.findOne({ slug });
};

// ==================== Export Model ====================
export const Tour = model<ITour, TourModel>('Tour', tourSchema);
