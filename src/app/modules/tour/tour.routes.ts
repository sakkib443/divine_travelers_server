// ===================================================================
// Divine Travelers - Tour Routes
// Tour module এর API endpoints
// ট্যুর মডিউলের API রাউটস
// ===================================================================

import express from 'express';
import { TourController } from './tour.controller';
import { TourValidation } from './tour.validation';
import { authMiddleware, authorizeRoles, optionalAuth } from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';

const router = express.Router();

// ==================== Public Routes ====================

// Get active tours (for frontend listing)
router.get(
    '/active',
    TourController.getActiveTours
);

// Get featured tours (for homepage)
router.get(
    '/featured',
    TourController.getFeaturedTours
);

// Get tour by slug (public detail page)
router.get(
    '/slug/:slug',
    TourController.getTourBySlug
);

// Get all tours (public list — inactive tours are admin-only, see controller)
router.get(
    '/',
    optionalAuth,
    TourController.getAllTours
);

// Get single tour by ID (admins additionally get inactive tours, for the edit form)
router.get(
    '/:id',
    optionalAuth,
    TourController.getTourById
);

// ==================== Admin Routes ====================

// Create new tour
router.post(
    '/',
    authMiddleware,
    authorizeRoles('admin'),
    validateRequest(TourValidation.createTourSchema),
    TourController.createTour
);

// Update tour
router.patch(
    '/:id',
    authMiddleware,
    authorizeRoles('admin'),
    validateRequest(TourValidation.updateTourSchema),
    TourController.updateTour
);

// Delete tour
router.delete(
    '/:id',
    authMiddleware,
    authorizeRoles('admin'),
    TourController.deleteTour
);

export const TourRoutes = router;
