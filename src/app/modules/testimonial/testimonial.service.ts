// ===================================================================
// Divine Travelers - Testimonial Service
// টেস্টিমোনিয়াল মডিউলের Business logic
// ===================================================================

import { Testimonial } from './testimonial.model';
import { ITestimonial, ITestimonialFilters } from './testimonial.interface';
import { User } from '../user/user.model';
import AppError from '../../utils/AppError';

/**
 * Create testimonial (logged-in user submits review)
 */
const createTestimonial = async (
    userId: string,
    payload: { rating: number; message: string; role?: string }
): Promise<ITestimonial> => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError(404, 'User not found');
    }

    const fullName =
        [user.firstName, user.lastName].filter(Boolean).join(' ') ||
        user.email ||
        'Anonymous';

    const testimonial = await Testimonial.create({
        user: userId,
        name: fullName,
        avatar: user.avatar,
        role: payload.role,
        rating: payload.rating,
        message: payload.message,
        status: 'pending',
    });

    return testimonial;
};

/**
 * Get approved testimonials for public display
 */
const getApprovedTestimonials = async (): Promise<ITestimonial[]> => {
    return Testimonial.find({ status: 'approved' })
        .sort({ isFeatured: -1, createdAt: -1 })
        .limit(12)
        .lean();
};

/**
 * Get all testimonials (admin)
 */
const getAllTestimonials = async (
    filters: ITestimonialFilters
): Promise<ITestimonial[]> => {
    const query: Record<string, unknown> = {};

    if (filters.status) query.status = filters.status;
    if (typeof filters.isFeatured === 'boolean')
        query.isFeatured = filters.isFeatured;
    if (filters.searchTerm) {
        query.$or = [
            { name: { $regex: filters.searchTerm, $options: 'i' } },
            { message: { $regex: filters.searchTerm, $options: 'i' } },
        ];
    }

    return Testimonial.find(query)
        .populate('user', 'firstName lastName email avatar')
        .sort({ createdAt: -1 })
        .lean();
};

/**
 * Get single testimonial
 */
const getTestimonialById = async (id: string): Promise<ITestimonial> => {
    const testimonial = await Testimonial.findById(id)
        .populate('user', 'firstName lastName email avatar')
        .lean();
    if (!testimonial) {
        throw new AppError(404, 'Testimonial not found');
    }
    return testimonial as ITestimonial;
};

/**
 * Update testimonial (admin can change status, isFeatured, or content)
 */
const updateTestimonial = async (
    id: string,
    payload: Partial<ITestimonial>
): Promise<ITestimonial> => {
    // Whitelist only the fields an admin is allowed to update.
    // Never pass raw payload through to prevent mass-assignment
    // (e.g. overwriting user, name, avatar, createdAt).
    const updateData: Partial<ITestimonial> = {};
    if (payload.rating !== undefined) updateData.rating = payload.rating;
    if (payload.message !== undefined) updateData.message = payload.message;
    if (payload.role !== undefined) updateData.role = payload.role;
    if (payload.status !== undefined) updateData.status = payload.status;
    if (payload.isFeatured !== undefined)
        updateData.isFeatured = payload.isFeatured;

    const testimonial = await Testimonial.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    });
    if (!testimonial) {
        throw new AppError(404, 'Testimonial not found');
    }
    return testimonial;
};

/**
 * Delete testimonial
 */
const deleteTestimonial = async (id: string): Promise<void> => {
    const result = await Testimonial.findByIdAndDelete(id);
    if (!result) {
        throw new AppError(404, 'Testimonial not found');
    }
};

export const TestimonialService = {
    createTestimonial,
    getApprovedTestimonials,
    getAllTestimonials,
    getTestimonialById,
    updateTestimonial,
    deleteTestimonial,
};
