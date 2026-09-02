import crypto from 'crypto';
import { Types } from 'mongoose';
import { Booking } from './booking.model';
import { Tour } from '../tour/tour.model';
import { HajjUmrah } from '../hajjUmrah/hajjUmrah.model';
import AppError from '../../utils/AppError';
import { generateInvoicePdf } from '../invoice/invoice.service';
import { SettingsService } from '../settings/settings.service';
import EmailService from '../email/email.service';

// Generate a short, human-friendly public tracking code (e.g. AV-1A2B3C4D)
const makeCode = () => `AV-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

const generateTrackingId = async (): Promise<string> => {
    for (let i = 0; i < 5; i++) {
        const code = makeCode();
        const exists = await Booking.exists({ trackingId: code });
        if (!exists) return code;
    }
    // Extremely unlikely fallback — add more entropy
    return `AV-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
};

// Look up the advertised price of the booked service so the booking (and its
// invoice) starts with the real package amount instead of 0. Amounts are never
// taken from the request body — the client cannot quote its own price. Admin
// can still adjust the final quote later via "Set Amount".
const resolveServicePrice = async (
    type: unknown,
    serviceId: unknown
): Promise<{ amount: number; currency?: string } | null> => {
    const id = String(serviceId || '');
    if (!id || !Types.ObjectId.isValid(id)) return null;
    try {
        if (type === 'tour') {
            const t = await Tour.findById(id).select('price currency').lean();
            if (t && Number(t.price) > 0) return { amount: Number(t.price), currency: (t as any).currency };
        } else if (type === 'hajj') {
            const p = await HajjUmrah.findById(id).select('price currency').lean();
            if (p && Number(p.price) > 0) return { amount: Number(p.price), currency: (p as any).currency };
        }
    } catch {
        /* non-fatal — booking proceeds without a pre-filled amount */
    }
    return null;
};

// Create a new booking (guest bookings — customer accounts no longer exist).
// The booking keeps the visitor's name/email/phone and a public trackingId.
const createBooking = async (userId: string | null, payload: Record<string, unknown>) => {
    // Whitelist: only guest-writable schema fields are accepted.
    // status / adminNote / user / trackingId are NOT settable from the request body.
    const trackingId = await generateTrackingId();

    const bookingUserId: string | null = userId;

    // Pre-fill the quoted amount from the service's advertised price.
    const priced = await resolveServicePrice(payload.type, payload.serviceId);

    const data: Record<string, unknown> = {
        type: payload.type,
        serviceName: payload.serviceName,
        serviceId: payload.serviceId,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        details: payload.details,
        trackingId,
        statusHistory: [{ status: 'pending', note: 'Booking received', at: new Date() }],
        ...(priced && {
            amount: priced.amount,
            dueAmount: priced.amount,
            ...(priced.currency && { currency: priced.currency }),
        }),
        ...(bookingUserId && { user: bookingUserId }),
    };
    const booking = await Booking.create(data);
    return { booking, account: null };
};

// Admin bell + sidebar badges: total & per-type pending counts + latest pending bookings.
const getNotifications = async () => {
    const [typeCounts, items] = await Promise.all([
        Booking.aggregate([
            { $match: { status: 'pending' } },
            { $group: { _id: '$type', count: { $sum: 1 } } },
        ]),
        Booking.find({ status: 'pending' })
            .select('type serviceName name status trackingId createdAt')
            .sort({ createdAt: -1 })
            .limit(15)
            .lean(),
    ]);
    const byType: Record<string, number> = {};
    let pendingCount = 0;
    for (const t of typeCounts as { _id: string; count: number }[]) {
        byType[t._id] = t.count;
        pendingCount += t.count;
    }
    return { pendingCount, byType, items };
};

// Escape a user-supplied string for safe use inside a RegExp
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Build a Mongo filter from admin query params. Shared by getAllBookings and
// the analytics reports endpoint so both apply identical filtering semantics.
// All params are optional and combinable:
//   type          → exact match
//   status        → exact match
//   paymentStatus → exact match
//   dateFrom      → createdAt >= start-of-day(dateFrom)
//   dateTo        → createdAt <= end-of-day(dateTo)  (inclusive)
//   country       → case-insensitive match on serviceName OR details.country
//   assignedTo    → assignedTo == userId; 'unassigned' → assignedTo: null
export const buildBookingFilter = (query: Record<string, string> = {}): Record<string, unknown> => {
    const filter: Record<string, unknown> = {};

    if (query.type) filter.type = query.type;
    if (query.status) filter.status = query.status;
    if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;

    // Date range on createdAt (inclusive of the whole dateTo day)
    if (query.dateFrom || query.dateTo) {
        const range: Record<string, Date> = {};
        if (query.dateFrom) {
            const from = new Date(query.dateFrom);
            if (!Number.isNaN(from.getTime())) range.$gte = from;
        }
        if (query.dateTo) {
            const to = new Date(query.dateTo);
            if (!Number.isNaN(to.getTime())) {
                // If a plain date (no time) was given, extend to end-of-day.
                if (/^\d{4}-\d{2}-\d{2}$/.test(query.dateTo.trim())) {
                    to.setHours(23, 59, 59, 999);
                }
                range.$lte = to;
            }
        }
        if (Object.keys(range).length) filter.createdAt = range;
    }

    // Country: case-insensitive match against serviceName OR details.country
    if (query.country) {
        const rx = new RegExp(escapeRegex(query.country.trim()), 'i');
        filter.$or = [{ serviceName: rx }, { 'details.country': rx }];
    }

    // Assignment filter (special 'unassigned' sentinel → no assignee)
    if (query.assignedTo) {
        filter.assignedTo = query.assignedTo === 'unassigned' ? null : query.assignedTo;
    }

    return filter;
};

// Get all bookings (admin) - optional filters (type/status/date/country/assignee/payment)
const getAllBookings = async (query: Record<string, string>) => {
    const filter = buildBookingFilter(query);

    const bookings = await Booking.find(filter)
        .populate('user', 'name email phone profileImage')
        .populate('assignedTo', 'firstName lastName email')
        .sort({ createdAt: -1 });
    return bookings;
};

// Requester context for access-controlled operations
type TRequester = { userId: string; role: 'admin' };

// Update booking status — also appends to the status timeline. Admin only.
const updateBookingStatus = async (
    id: string,
    status: string,
    adminNote?: string,
    requester?: TRequester
) => {
    const booking = await Booking.findByIdAndUpdate(
        id,
        {
            status,
            ...(adminNote && { adminNote }),
            $push: {
                statusHistory: {
                    status,
                    note: adminNote || '',
                    at: new Date(),
                },
            },
        },
        { new: true, runValidators: true }
    );
    if (!booking) throw new AppError(404, 'Booking not found');

    return booking;
};

/**
 * Attach documents uploaded while applying. Admin only.
 */
const setBookingDocuments = async (
    id: string,
    documentFiles: { title: string; fileUrl: string; fileName?: string }[],
    requester: TRequester
) => {
    const booking = await Booking.findById(id);
    if (!booking) throw new AppError(404, 'Booking not found');

    const isOwner = booking.user && booking.user.toString() === requester.userId;
    if (requester.role !== 'admin' && !isOwner) {
        throw new AppError(403, 'You can only attach documents to your own booking.');
    }

    booking.details = { ...(booking.details || {}), documentFiles };
    booking.markModified('details');
    await booking.save();
    return booking;
};

// Add a remark to a booking's running history log. Admin only.
const addRemark = async (
    id: string,
    text: string,
    author: { userId: string; name: string; role: 'admin' }
) => {
    const trimmed = (text || '').trim();
    if (!trimmed) throw new AppError(400, 'Remark text is required');

    const booking = await Booking.findById(id);
    if (!booking) throw new AppError(404, 'Booking not found');

    booking.remarks.push({
        text: trimmed,
        authorId: author.userId as any,
        authorName: author.name || '',
        at: new Date(),
    } as any);

    await booking.save();
    await booking.populate('assignedTo', 'firstName lastName email');
    return booking;
};

// Recompute denormalized payment totals from the payments array + total amount
const applyPaymentTotals = (booking: any) => {
    const paid = (booking.payments || []).reduce(
        (sum: number, p: any) => sum + (Number(p.amount) || 0),
        0
    );
    booking.paidAmount = paid;
    booking.dueAmount = Math.max(0, (Number(booking.amount) || 0) - paid);
    if (paid <= 0) booking.paymentStatus = 'unpaid';
    else if (booking.amount > 0 && paid >= booking.amount) booking.paymentStatus = 'paid';
    else booking.paymentStatus = 'partial';
};

// Admin: set / update the total quoted amount for a booking
const setBookingAmount = async (id: string, amount: number, currency?: string) => {
    const value = Number(amount);
    if (Number.isNaN(value) || value < 0) {
        throw new AppError(400, 'A valid amount is required');
    }
    const booking = await Booking.findById(id);
    if (!booking) throw new AppError(404, 'Booking not found');
    booking.amount = value;
    if (currency) booking.currency = currency;
    applyPaymentTotals(booking);
    await booking.save();
    return booking;
};

const ALLOWED_METHODS = ['cash', 'bkash', 'nagad', 'rocket', 'card', 'bank', 'other'];

// Admin: record a manual / office payment against a booking
const addPayment = async (
    id: string,
    payload: { amount: number; method?: string; reference?: string; note?: string },
    recordedBy?: string
) => {
    const amount = Number(payload.amount);
    if (Number.isNaN(amount) || amount <= 0) {
        throw new AppError(400, 'A valid payment amount is required');
    }
    const method = payload.method && ALLOWED_METHODS.includes(payload.method) ? payload.method : 'cash';

    const booking = await Booking.findById(id);
    if (!booking) throw new AppError(404, 'Booking not found');

    booking.payments.push({
        amount,
        method: method as any,
        reference: payload.reference || '',
        note: payload.note || '',
        at: new Date(),
        recordedBy: recordedBy || '',
    });
    applyPaymentTotals(booking);

    // Log the payment on the status timeline for the customer/tracking view
    booking.statusHistory.push({
        status: booking.status,
        note: `Payment recorded: ${booking.currency} ${amount.toLocaleString()} via ${method}`,
        at: new Date(),
    } as any);

    await booking.save();

    // Auto-generate an invoice PDF and email a receipt to the customer + admin.
    // CRITICAL: PDF/email failure must NEVER fail the payment API call — log & continue.
    try {
        const settings = await SettingsService.getSettings();
        const pdfBuffer = await generateInvoicePdf(booking as any, settings);
        await EmailService.sendBookingInvoiceEmail(booking as any, pdfBuffer, settings, amount);
    } catch (err) {
        console.error('⚠️  Invoice PDF/email step failed (payment still recorded):', err);
    }

    return booking;
};

// Public tracking — look up a booking by tracking code (or id) + matching contact
const trackBooking = async (ref: string, contact: string) => {
    const trimmedRef = (ref || '').trim();
    if (!trimmedRef) throw new AppError(400, 'Please enter your tracking ID');
    if (!contact || !contact.trim()) {
        throw new AppError(400, 'Please enter the email or phone used for the booking');
    }

    const or: Record<string, unknown>[] = [{ trackingId: trimmedRef.toUpperCase() }];
    if (Types.ObjectId.isValid(trimmedRef)) or.push({ _id: trimmedRef });

    const booking = await Booking.findOne({ $or: or });
    if (!booking) throw new AppError(404, 'No booking found with this tracking ID');

    // Verify ownership: the provided contact must match the booking email or phone
    const c = contact.trim().toLowerCase();
    const contactDigits = contact.replace(/\D/g, '');
    const emailMatch = booking.email?.toLowerCase() === c;
    const phoneMatch = contactDigits.length > 0 && booking.phone?.replace(/\D/g, '') === contactDigits;
    if (!emailMatch && !phoneMatch) {
        throw new AppError(403, 'The email or phone does not match this booking');
    }

    // Return only non-sensitive tracking info
    return {
        trackingId: booking.trackingId || booking._id.toString(),
        type: booking.type,
        serviceName: booking.serviceName,
        name: booking.name,
        status: booking.status,
        adminNote: booking.adminNote || '',
        statusHistory: booking.statusHistory || [],
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
    };
};

// Delete booking (admin)
const deleteBooking = async (id: string) => {
    const booking = await Booking.findByIdAndDelete(id);
    if (!booking) throw new AppError(404, 'Booking not found');
    return booking;
};

export const BookingService = {
    getNotifications,
    createBooking,
    getAllBookings,
    updateBookingStatus,
    setBookingDocuments,
    addRemark,
    setBookingAmount,
    addPayment,
    trackBooking,
    deleteBooking,
};
