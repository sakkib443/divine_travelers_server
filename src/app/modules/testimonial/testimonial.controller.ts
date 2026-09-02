// ===================================================================
// Divine Travelers - Testimonial Controller
// টেস্টিমোনিয়াল মডিউলের HTTP request handlers
// ===================================================================

import { Request, Response, NextFunction } from 'express';
import { TestimonialService } from './testimonial.service';
import { ITestimonialFilters } from './testimonial.interface';
import AppError from '../../utils/AppError';

/**
 * Create testimonial (authenticated user)
 * POST /api/testimonials
 */
const createTestimonial = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?._id || req.user?.userId;
        if (!userId) throw new AppError(401, 'Not authenticated');

        const testimonial = await TestimonialService.createTestimonial(userId, req.body);

        res.status(201).json({
            success: true,
            message: 'Thank you! Your review has been submitted and is awaiting approval.',
            data: testimonial,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get approved testimonials (public)
 * GET /api/testimonials/approved
 */
const getApprovedTestimonials = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await TestimonialService.getApprovedTestimonials();
        res.status(200).json({
            success: true,
            message: 'Approved testimonials retrieved successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all testimonials (admin)
 * GET /api/testimonials
 */
const getAllTestimonials = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { status, isFeatured, searchTerm } = req.query;
        const filters: ITestimonialFilters = {};
        if (status) filters.status = status as ITestimonialFilters['status'];
        if (isFeatured === 'true') filters.isFeatured = true;
        if (isFeatured === 'false') filters.isFeatured = false;
        if (searchTerm) filters.searchTerm = searchTerm as string;

        const data = await TestimonialService.getAllTestimonials(filters);
        res.status(200).json({
            success: true,
            message: 'Testimonials retrieved successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get single testimonial
 * GET /api/testimonials/:id
 */
const getTestimonialById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await TestimonialService.getTestimonialById(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Testimonial retrieved successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update testimonial (admin)
 * PATCH /api/testimonials/:id
 */
const updateTestimonial = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await TestimonialService.updateTestimonial(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Testimonial updated successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete testimonial (admin)
 * DELETE /api/testimonials/:id
 */
const deleteTestimonial = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await TestimonialService.deleteTestimonial(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Testimonial deleted successfully',
            data: null,
        });
    } catch (error) {
        next(error);
    }
};

export const TestimonialController = {
    createTestimonial,
    getApprovedTestimonials,
    getAllTestimonials,
    getTestimonialById,
    updateTestimonial,
    deleteTestimonial,
};
