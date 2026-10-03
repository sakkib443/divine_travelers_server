// ===================================================================
// Divine Travellers - Page Banner Routes
// Public reads; admin writes.
// ===================================================================

import express from 'express';
import { PageBannerController } from './pageBanner.controller';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth';

const router = express.Router();

// Public — pages read their banner
router.get('/', PageBannerController.getAllBanners);
router.get('/:page', PageBannerController.getBanner);

// Admin / manager — manage banners
router.put('/:page', authMiddleware, authorizeRoles('admin', 'manager'), PageBannerController.updateBanner);
router.delete('/:page', authMiddleware, authorizeRoles('admin', 'manager'), PageBannerController.resetBanner);

export const PageBannerRoutes = router;
