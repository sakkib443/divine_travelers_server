// ===================================================================
// Divine Travelers - Testimonial Routes
// ===================================================================

import express from 'express';
import { TestimonialController } from './testimonial.controller';
import { TestimonialValidation } from './testimonial.validation';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';

const router = express.Router();

// ──────── Public ────────
// Get approved testimonials for public homepage
router.get('/approved', TestimonialController.getApprovedTestimonials);

// ──────── Authenticated User ────────
// Logged-in user submits a review
router.post(
    '/',
    authMiddleware,
    validateRequest(TestimonialValidation.createTestimonialSchema),
    TestimonialController.createTestimonial
);

// ──────── Admin ────────
// List all testimonials (with filters)
router.get(
    '/',
    authMiddleware,
    authorizeRoles('admin'),
    TestimonialController.getAllTestimonials
);

// Get single testimonial by id
router.get(
    '/:id',
    authMiddleware,
    authorizeRoles('admin'),
    TestimonialController.getTestimonialById
);

// Update testimonial (status / isFeatured / content)
router.patch(
    '/:id',
    authMiddleware,
    authorizeRoles('admin'),
    validateRequest(TestimonialValidation.updateTestimonialSchema),
    TestimonialController.updateTestimonial
);

// Delete testimonial
router.delete(
    '/:id',
    authMiddleware,
    authorizeRoles('admin'),
    TestimonialController.deleteTestimonial
);

export const TestimonialRoutes = router;
