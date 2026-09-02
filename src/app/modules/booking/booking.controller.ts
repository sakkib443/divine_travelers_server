import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import AppError from '../../utils/AppError';
import { Booking } from './booking.model';
import { BookingService } from './booking.service';
import { User } from '../user/user.model';
import { generateInvoicePdf } from '../invoice/invoice.service';
import { SettingsService } from '../settings/settings.service';

// POST /api/bookings  → anyone can submit (auth optional)
const createBooking = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId || null;
    const { booking, account } = await BookingService.createBooking(userId, req.body);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Booking submitted successfully',
        // `account` is non-null only when a brand-new account was auto-created
        // for a guest — the frontend uses its token to log the customer in.
        data: { booking, account },
    });
});

// GET /api/bookings  → admin gets all
const getAllBookings = catchAsync(async (req: Request, res: Response) => {
    const bookings = await BookingService.getAllBookings(req.query as Record<string, string>);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Bookings retrieved',
        data: bookings,
    });
});

// GET /api/bookings/track?ref=...&contact=...  → public application tracking
const trackBooking = catchAsync(async (req: Request, res: Response) => {
    const ref = (req.query.ref as string) || '';
    const contact = (req.query.contact as string) || '';
    const booking = await BookingService.trackBooking(ref, contact);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Booking found',
        data: booking,
    });
});

// PATCH /api/bookings/:id/status  → admin updates status
const updateStatus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, adminNote } = req.body;
    const requester = { userId: req.user!.userId, role: req.user!.role };
    const booking = await BookingService.updateBookingStatus(id, status, adminNote, requester);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Booking status updated',
        data: booking,
    });
});

// PATCH /api/bookings/:id/documents → admin attaches the papers uploaded while applying.
const setDocuments = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const requester = { userId: req.user!.userId, role: req.user!.role };
    const booking = await BookingService.setBookingDocuments(id, req.body.documentFiles || [], requester);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Documents attached to booking',
        data: booking,
    });
});

// POST /api/bookings/:id/remarks  → admin adds a remark
const addRemark = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { text } = req.body;

    // Resolve a display name for the remark author (JWT only carries email/role).
    const dbUser = await User.findById(req.user!.userId).select('firstName lastName');
    const name = dbUser
        ? `${dbUser.firstName} ${dbUser.lastName}`.trim()
        : req.user!.email || 'User';

    const booking = await BookingService.addRemark(id, text, {
        userId: req.user!.userId,
        name,
        role: req.user!.role,
    });
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Remark added',
        data: booking,
    });
});

// PATCH /api/bookings/:id/amount  → admin sets the total amount
const setAmount = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { amount, currency } = req.body;
    const booking = await BookingService.setBookingAmount(id, amount, currency);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Booking amount updated',
        data: booking,
    });
});

// POST /api/bookings/:id/payments  → admin records a manual/office payment
const addPayment = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const recordedBy =
        (req.user as { name?: string; email?: string })?.name ||
        (req.user as { name?: string; email?: string })?.email ||
        'Admin';
    const booking = await BookingService.addPayment(id, req.body, recordedBy);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Payment recorded',
        data: booking,
    });
});

// GET /api/bookings/:id/invoice  → download the booking invoice PDF (admin or owner)
const downloadInvoice = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) throw new AppError(404, 'Booking not found');

    // Access control: admin OR the user who owns this booking.
    const isAdmin = req.user?.role === 'admin';
    const isOwner =
        !!booking.user && !!req.user?.userId && booking.user.toString() === req.user.userId;
    if (!isAdmin && !isOwner) {
        throw new AppError(403, 'You do not have permission to access this invoice.');
    }

    const settings = await SettingsService.getSettings();
    const pdfBuffer = await generateInvoicePdf(booking as any, settings);

    const trackingId = booking.trackingId || `INV-${booking._id.toString().slice(-6).toUpperCase()}`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${trackingId}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.status(200).send(pdfBuffer);
});

// DELETE /api/bookings/:id  → admin deletes
const deleteBooking = catchAsync(async (req: Request, res: Response) => {
    await BookingService.deleteBooking(req.params.id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Booking deleted',
        data: null,
    });
});

// GET /api/bookings/notifications → admin bell + sidebar badge (pending bookings)
const getNotifications = catchAsync(async (_req: Request, res: Response) => {
    const data = await BookingService.getNotifications();
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Booking notifications retrieved',
        data,
    });
});

export const BookingController = {
    getNotifications,
    createBooking,
    getAllBookings,
    trackBooking,
    updateStatus,
    setDocuments,
    addRemark,
    setAmount,
    addPayment,
    downloadInvoice,
    deleteBooking,
};
