// ===================================================================
// Divine Travellers - Tour Service
// Business logic for Tour module
// ট্যুর মডিউলের বিজনেস লজিক
// ===================================================================

import { Tour } from './tour.model';
import { ITour, ITourFilters } from './tour.interface';
import AppError from '../../utils/AppError';

/**
 * Generate URL-friendly slug from title
 */
const generateSlug = (title: string): string => {
    return title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
};

/**
 * Create a new tour
 * নতুন ট্যুর তৈরি করা
 */
const createTour = async (payload: Partial<ITour>): Promise<ITour> => {
    let slug = generateSlug(payload.title || '');

    // Ensure unique slug
    let existing = await Tour.findOne({ slug });
    let counter = 1;
    while (existing) {
        slug = `${generateSlug(payload.title || '')}-${counter}`;
        existing = await Tour.findOne({ slug });
        counter++;
    }

    const tourData = { ...payload, slug };
    const tour = await Tour.create(tourData);
    return tour;
};

/**
 * Get all tours with filters and pagination
 */
const getAllTours = async (
    filters: ITourFilters,
    paginationOptions: {
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }
) => {
    const { searchTerm, isActive, isFeatured, category, tourType, status, destination, minPrice, maxPrice } = filters;
    const { page = 1, limit = 200, sortBy = 'order', sortOrder = 'asc' } = paginationOptions;

    const conditions: any[] = [];

    if (searchTerm) {
        conditions.push({
            $or: [
                { title: { $regex: searchTerm, $options: 'i' } },
                { titleBn: { $regex: searchTerm, $options: 'i' } },
                { destination: { $regex: searchTerm, $options: 'i' } },
                { destinationBn: { $regex: searchTerm, $options: 'i' } },
                { category: { $regex: searchTerm, $options: 'i' } },
            ],
        });
    }

    if (isActive !== undefined) conditions.push({ isActive });
    if (isFeatured !== undefined) conditions.push({ isFeatured });
    if (category) conditions.push({ category });
    if (tourType) conditions.push({ tourType });
    if (status) conditions.push({ status });
    if (destination) conditions.push({ destination: { $regex: destination, $options: 'i' } });
    if (minPrice !== undefined) conditions.push({ price: { $gte: minPrice } });
    if (maxPrice !== undefined) conditions.push({ price: { $lte: maxPrice } });

    const whereCondition = conditions.length > 0 ? { $and: conditions } : {};
    const skip = (page - 1) * limit;
    const sortConfig: any = {};
    sortConfig[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const tours = await Tour.find(whereCondition)
        .sort(sortConfig)
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await Tour.countDocuments(whereCondition);

    return {
        data: tours,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Get single tour by ID
 * Visitors only ever see active tours; the admin dashboard passes includeInactive
 * so it can still load a deactivated tour into the edit form.
 */
const getTourById = async (id: string, includeInactive = false): Promise<ITour | null> => {
    const tour = await Tour.findById(id).lean();
    if (!tour || (!includeInactive && !tour.isActive)) throw new AppError(404, 'Tour not found');
    return tour;
};

/**
 * Get tour by slug (public)
 */
const getTourBySlug = async (slug: string): Promise<ITour | null> => {
    const tour = await Tour.findOne({ slug, isActive: true }).lean();
    if (!tour) throw new AppError(404, 'Tour not found');
    return tour;
};

/**
 * Update tour
 */
const updateTour = async (
    id: string,
    payload: Partial<ITour>
): Promise<ITour | null> => {
    const tour = await Tour.findById(id);
    if (!tour) throw new AppError(404, 'Tour not found');

    // Whitelist: only client-updatable fields may be set here.
    // The unique `slug` is computed server-side (see below) and fields like
    // `_id`/`createdAt`/`updatedAt` must NEVER be assignable from the request body.
    const allowedFields: (keyof ITour)[] = [
        'title', 'titleBn', 'image', 'gallery',
        'destination', 'destinationBn', 'locationType', 'category', 'tourType', 'tourTypeBn',
        'duration', 'durationBn', 'departureDate', 'departureDates',
        'price', 'oldPrice', 'currency',
        'singleEnabled', 'coupleEnabled', 'couplePrice',
        'groupSize', 'bookings', 'minAge', 'maxAge',
        'description', 'descriptionBn', 'longDescription', 'longDescriptionBn',
        'itinerary', 'includes', 'includesBn', 'excludes', 'excludesBn',
        'faqs', 'tags', 'rating', 'reviewsCount',
        'metaTitle', 'metaDescription',
        'status', 'isActive', 'isFeatured', 'order',
    ];

    const updateData: Partial<ITour> = {};
    for (const field of allowedFields) {
        if (payload[field] !== undefined) {
            (updateData as Record<string, unknown>)[field] = payload[field];
        }
    }

    // Update slug if title changed (server-computed, never taken from client)
    if (payload.title && payload.title !== tour.title) {
        let newSlug = generateSlug(payload.title);
        const existing = await Tour.findOne({ slug: newSlug, _id: { $ne: id } });
        if (existing) newSlug = `${newSlug}-${Date.now()}`;
        updateData.slug = newSlug;
    }

    const updatedTour = await Tour.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    });

    return updatedTour;
};

/**
 * Delete tour
 */
const deleteTour = async (id: string): Promise<ITour | null> => {
    const tour = await Tour.findById(id);
    if (!tour) throw new AppError(404, 'Tour not found');
    const deleted = await Tour.findByIdAndDelete(id);
    return deleted;
};

/**
 * Get active tours (public - for frontend listing)
 */
const getActiveTours = async (): Promise<ITour[]> => {
    const tours = await Tour.find({ isActive: true })
        .sort({ order: 1, createdAt: -1 })
        .lean();
    return tours;
};

/**
 * Get featured tours (for homepage)
 */
const getFeaturedTours = async (): Promise<ITour[]> => {
    const tours = await Tour.find({ isActive: true, isFeatured: true })
        .sort({ order: 1 })
        .lean();
    return tours;
};

// Countries/regions that mark a tour International when named in its
// destination/title. Anything else (incl. explicit "Bangladesh") is Domestic.
const FOREIGN_MARKERS = [
    'thailand', 'nepal', 'india', 'malaysia', 'singapore', 'indonesia', 'bali',
    'dubai', 'uae', 'abu dhabi', 'saudi', 'makkah', 'madinah', 'turkey', 'istanbul',
    'maldives', 'sri lanka', 'bhutan', 'vietnam', 'cambodia', 'china', 'hong kong',
    'japan', 'korea', 'egypt', 'qatar', 'bahrain', 'kuwait', 'oman', 'europe',
    'uk', 'london', 'usa', 'america', 'canada', 'australia',
];

const inferLocationType = (text: string): 'Domestic' | 'International' => {
    const t = (text || '').toLowerCase();
    if (t.includes('bangladesh')) return 'Domestic';
    return FOREIGN_MARKERS.some((c) => t.includes(c)) ? 'International' : 'Domestic';
};

/**
 * One-time, idempotent backfill: any tour saved before locationType was
 * persisted has it null, which breaks the Domestic/International filter. This
 * fills those in (inferring from destination/title). Called once on server
 * startup, so a deploy self-heals the data with no manual migration step.
 * Silent and non-fatal — a failure here must never stop the server booting.
 */
const backfillLocationType = async (): Promise<void> => {
    try {
        const tours = await Tour.find({
            $or: [
                { locationType: { $exists: false } },
                { locationType: null },
                { locationType: '' },
            ],
        }).select('title destination destinationBn locationType');

        if (!tours.length) return;

        for (const tour of tours) {
            const hint = `${tour.destination || ''} ${(tour as any).destinationBn || ''} ${tour.title || ''}`;
            tour.locationType = inferLocationType(hint);
            await tour.save();
        }
        console.log(`🧭 Backfilled locationType on ${tours.length} tour(s).`);
    } catch (err) {
        console.error('locationType backfill skipped:', err instanceof Error ? err.message : err);
    }
};

export const TourService = {
    createTour,
    getAllTours,
    getTourById,
    getTourBySlug,
    updateTour,
    deleteTour,
    getActiveTours,
    getFeaturedTours,
    backfillLocationType,
};
