// ===================================================================
// Divine Travelers Backend - Inquiry Controller
// ===================================================================

import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { InquiryService } from './inquiry.service';

// POST /api/inquiries — public
const createInquiry = catchAsync(async (req: Request, res: Response) => {
    const doc = await InquiryService.createInquiry(req.body, req.headers['user-agent']);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Inquiry submitted successfully',
        data: doc,
    });
});

// GET /api/inquiries?service=&status=&page=&limit=&search= — admin
const getAllInquiries = catchAsync(async (req: Request, res: Response) => {
    const { data, meta } = await InquiryService.getAllInquiries(req.query as Record<string, string>);
    res.status(200).json({ success: true, message: 'Inquiries retrieved', data, meta });
});

// GET /api/inquiries/stats — admin
const getStats = catchAsync(async (_req: Request, res: Response) => {
    const data = await InquiryService.getStats();
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Inquiry stats retrieved',
        data,
    });
});

// PATCH /api/inquiries/:id — admin (inline status / note update)
const updateInquiry = catchAsync(async (req: Request, res: Response) => {
    const doc = await InquiryService.updateInquiry(req.params.id, req.body);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Inquiry updated',
        data: doc,
    });
});

// DELETE /api/inquiries/:id — admin
const deleteInquiry = catchAsync(async (req: Request, res: Response) => {
    await InquiryService.deleteInquiry(req.params.id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Inquiry deleted',
        data: null,
    });
});

export const InquiryController = {
    createInquiry,
    getAllInquiries,
    getStats,
    updateInquiry,
    deleteInquiry,
};
