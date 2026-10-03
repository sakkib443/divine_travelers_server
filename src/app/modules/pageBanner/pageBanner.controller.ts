// ===================================================================
// Divine Travellers - Page Banner Controller
// ===================================================================

import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PageBannerService } from './pageBanner.service';

// GET /api/page-banners — all banners (public read; admin list)
const getAllBanners = catchAsync(async (_req: Request, res: Response) => {
    const data = await PageBannerService.getAllBanners();
    sendResponse(res, { statusCode: 200, success: true, message: 'Page banners retrieved', data });
});

// GET /api/page-banners/:page — one page's banner (public)
const getBanner = catchAsync(async (req: Request, res: Response) => {
    const data = await PageBannerService.getBanner(req.params.page);
    sendResponse(res, { statusCode: 200, success: true, message: 'Page banner retrieved', data });
});

// PUT /api/page-banners/:page — admin update/upsert
const updateBanner = catchAsync(async (req: Request, res: Response) => {
    const data = await PageBannerService.updateBanner(req.params.page, req.body);
    sendResponse(res, { statusCode: 200, success: true, message: 'Page banner updated', data });
});

// DELETE /api/page-banners/:page — admin reset to defaults
const resetBanner = catchAsync(async (req: Request, res: Response) => {
    const data = await PageBannerService.resetBanner(req.params.page);
    sendResponse(res, { statusCode: 200, success: true, message: 'Page banner reset to default', data });
});

export const PageBannerController = { getAllBanners, getBanner, updateBanner, resetBanner };
