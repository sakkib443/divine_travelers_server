// ===================================================================
// Divine Travelers - Analytics Routes
// ===================================================================

import express from 'express';
import { AnalyticsController } from './analytics.controller';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth';

const router = express.Router();

// Admin only — dashboard analytics
router.get('/dashboard', authMiddleware, authorizeRoles('admin'), AnalyticsController.getDashboard);

// Admin only — per-team-member lead conversion performance

// Admin only — filtered sales/data reports (date/country/team/type + groupBy)
router.get('/reports', authMiddleware, authorizeRoles('admin'), AnalyticsController.getReports);

export const AnalyticsRoutes = router;
