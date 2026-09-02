// ===================================================================
// Divine Travelers - Tour Interface
// Tour module TypeScript interface definitions
// ট্যুর মডিউলের TypeScript interface definitions
// ===================================================================

import { Model, Types } from 'mongoose';

/**
 * IItineraryItem - Day-by-day itinerary
 * দিন অনুযায়ী ভ্রমণসূচি
 */
export interface IItineraryItem {
    day: number;                       // Day number
    title: string;                     // e.g. "Arrival in Zurich"
    titleBn?: string;                  // e.g. "জুরিখে আগমন"
    description?: string;              // Detail about this day
    descriptionBn?: string;            // Bengali detail
}

/**
 * IFaq - Frequently asked questions
 * সাধারণ জিজ্ঞাসা
 */
export interface IFaq {
    question: string;
    questionBn?: string;
    answer: string;
    answerBn?: string;
}

/**
 * ITour - Main Tour Interface
 * Database এ যে format এ tour data save হবে
 */
export interface ITour {
    _id?: Types.ObjectId;

    // ==================== Basic Info ====================
    title: string;                     // Tour title (English) e.g. "Majestic Switzerland"
    titleBn?: string;                  // Tour title (Bengali)
    slug: string;                      // URL friendly slug e.g. "majestic-switzerland"
    image?: string;                    // Tour cover image URL
    gallery?: string[];                // Additional images

    // ==================== Location & Category ====================
    destination: string;               // e.g. "Switzerland"
    destinationBn?: string;            // e.g. "সুইজারল্যান্ড"
    locationType: 'Domestic' | 'International';
    category: string;                  // e.g. "adventure", "beach", "city", "culture"
    tourType?: string;                 // e.g. "Solo Tour", "Group Tour", "Family Tour"
    tourTypeBn?: string;

    // ==================== Duration & Schedule ====================
    duration: string;                  // e.g. "07 Days" or "3 Days 2 Nights"
    durationBn?: string;
    departureDate?: string;            // Next departure date
    departureDates?: string[];         // Multiple departure dates

    // ==================== Pricing ====================
    price: number;                     // Current price in BDT/USD
    oldPrice?: number;                 // Original price (for discount display)
    currency?: string;                 // e.g. "BDT", "USD"

    // ==================== Group & Booking ====================
    groupSize?: number;                // Maximum group size
    bookings?: number;                 // Current bookings count
    minAge?: number;                   // Minimum age requirement
    maxAge?: number;                   // Maximum age requirement

    // ==================== Description ====================
    description?: string;              // Short description
    descriptionBn?: string;
    longDescription?: string;          // Detailed description
    longDescriptionBn?: string;

    // ==================== Itinerary ====================
    itinerary: IItineraryItem[];       // Day-by-day plan

    // ==================== Inclusions & Exclusions ====================
    includes: string[];                // What's included (English)
    includesBn?: string[];             // What's included (Bengali)
    excludes?: string[];               // What's excluded (English)
    excludesBn?: string[];             // What's excluded (Bengali)

    // ==================== FAQs ====================
    faqs?: IFaq[];

    // ==================== Tags ====================
    tags?: string[];                   // e.g. ["Alpine", "Nature", "Luxury"]

    // ==================== Rating ====================
    rating?: number;                   // Average rating (0-5)
    reviewsCount?: number;             // Total reviews

    // ==================== SEO ====================
    metaTitle?: string;
    metaDescription?: string;

    // ==================== Status & Order ====================
    status: 'active' | 'upcoming' | 'completed' | 'cancelled';
    isActive: boolean;
    isFeatured: boolean;
    order: number;

    // ==================== Timestamps ====================
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * ITourFilters - Query Filters
 * Tour list filter করার জন্য
 */
export interface ITourFilters {
    searchTerm?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    category?: string;
    tourType?: string;
    status?: string;
    destination?: string;
    minPrice?: number;
    maxPrice?: number;
}

/**
 * TourModel - Mongoose Model Type
 */
export interface TourModel extends Model<ITour> {
    isTourExists(id: string): Promise<boolean>;
    findBySlug(slug: string): Promise<ITour | null>;
}
