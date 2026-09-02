// ===================================================================
// Divine Travelers - Tour Controller
// HTTP request handlers for Tour module
// ট্যুর মডিউলের HTTP রিকোয়েস্ট হ্যান্ডলার
// ===================================================================

import { Request, Response, NextFunction } from 'express';
import { TourService } from './tour.service';
import { ITourFilters } from './tour.interface';

/**
 * Create a new tour
 * POST /api/tours
 */
const createTour = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tour = await TourService.createTour(req.body);
        res.status(201).json({
            success: true,
            message: 'Tour created successfully',
            data: tour,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all tours with filters
 * GET /api/tours
 */
const getAllTours = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            searchTerm, isActive, isFeatured, category, tourType,
            status, destination, minPrice, maxPrice,
            page, limit, sortBy, sortOrder
        } = req.query;

        const filters: ITourFilters = {};
        if (searchTerm) filters.searchTerm = searchTerm as string;
        if (isActive === 'true') filters.isActive = true;
        if (isActive === 'false') filters.isActive = false;
        if (isFeatured === 'true') filters.isFeatured = true;
        if (category) filters.category = category as string;
        if (tourType) filters.tourType = tourType as string;
        if (status) filters.status = status as string;
        if (destination) filters.destination = destination as string;
        if (minPrice) filters.minPrice = Number(minPrice);
        if (maxPrice) filters.maxPrice = Number(maxPrice);

        // Only an admin may list inactive tours; visitors are pinned to active ones
        // regardless of the isActive query they send.
        if (req.user?.role !== 'admin') filters.isActive = true;

        const paginationOptions = {
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 200,
            sortBy: (sortBy as string) || 'order',
            sortOrder: (sortOrder as 'asc' | 'desc') || 'asc',
        };

        const result = await TourService.getAllTours(filters, paginationOptions);

        res.status(200).json({
            success: true,
            message: 'Tours retrieved successfully',
            data: result.data,
            meta: result.meta,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get single tour by ID
 * GET /api/tours/:id
 */
const getTourById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const tour = await TourService.getTourById(id, req.user?.role === 'admin');
        res.status(200).json({
            success: true,
            message: 'Tour retrieved successfully',
            data: tour,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get tour by slug (public)
 * GET /api/tours/slug/:slug
 */
const getTourBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;
        const tour = await TourService.getTourBySlug(slug);
        res.status(200).json({
            success: true,
            message: 'Tour retrieved successfully',
            data: tour,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update tour
 * PATCH /api/tours/:id
 */
const updateTour = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const tour = await TourService.updateTour(id, req.body);
        res.status(200).json({
            success: true,
            message: 'Tour updated successfully',
            data: tour,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete tour
 * DELETE /api/tours/:id
 */
const deleteTour = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await TourService.deleteTour(id);
        res.status(200).json({
            success: true,
            message: 'Tour deleted successfully',
            data: null,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get active tours (public - for frontend listing)
 * GET /api/tours/active
 */
const getActiveTours = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tours = await TourService.getActiveTours();
        res.status(200).json({
            success: true,
            message: 'Active tours retrieved successfully',
            data: tours,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get featured tours (public - for homepage)
 * GET /api/tours/featured
 */
const getFeaturedTours = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tours = await TourService.getFeaturedTours();
        res.status(200).json({
            success: true,
            message: 'Featured tours retrieved successfully',
            data: tours,
        });
    } catch (error) {
        next(error);
    }
};

export const TourController = {
    createTour,
    getAllTours,
    getTourById,
    getTourBySlug,
    updateTour,
    deleteTour,
    getActiveTours,
    getFeaturedTours,
};
