// ===================================================================
// Divine Travelers Backend - Inquiry Routes
// Public create + admin-only queue management.
// ===================================================================

import express from 'express';
import { InquiryController } from './inquiry.controller';
import validateRequest from '../../middlewares/validateRequest';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth';
import { createInquiryValidation, updateInquiryValidation } from './inquiry.validation';

const router = express.Router();

// ── Public: any visitor can submit an inquiry (no auth)
router.post('/', validateRequest(createInquiryValidation), InquiryController.createInquiry);

// ── Admin: aggregate counts by service + status (before '/:id')
router.get('/stats', authMiddleware, authorizeRoles('admin'), InquiryController.getStats);

// ── Admin: paginated queue with filters + search
router.get('/', authMiddleware, authorizeRoles('admin'), InquiryController.getAllInquiries);

// ── Admin: inline status / note update
router.patch(
    '/:id',
    authMiddleware,
    authorizeRoles('admin'),
    validateRequest(updateInquiryValidation),
    InquiryController.updateInquiry
);

// ── Admin: delete
router.delete('/:id', authMiddleware, authorizeRoles('admin'), InquiryController.deleteInquiry);

export const InquiryRoutes = router;
