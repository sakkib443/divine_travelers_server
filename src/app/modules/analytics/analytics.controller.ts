// ===================================================================
// Divine Travelers - Analytics Controller
// ===================================================================

import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AnalyticsService } from './analytics.service';

// GET /api/analytics/dashboard  → admin dashboard stats
const getDashboard = catchAsync(async (_req: Request, res: Response) => {
    const data = await AnalyticsService.getDashboard();
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Dashboard analytics retrieved',
        data,
    });
});

// GET /api/analytics/reports  → filtered sales/data reports (admin)
// Supports ?dateFrom&dateTo&type&country&assignedTo&status&paymentStatus&groupBy
const getReports = catchAsync(async (req: Request, res: Response) => {
    const data = await AnalyticsService.getReports(req.query as Record<string, string>);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Reports retrieved',
        data,
    });
});

export const AnalyticsController = {
    getDashboard,
    getReports,
};
