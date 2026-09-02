// ===================================================================
// Divine Travelers Backend - Inquiry Service
// ===================================================================

import { Inquiry, IInquiry } from './inquiry.model';
import AppError from '../../utils/AppError';
import { TCreateInquiryInput } from './inquiry.validation';

// Escape a user-supplied string for safe use inside a RegExp
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Public: create an inquiry. Whitelisted fields only — status always starts 'new'.
const createInquiry = async (
    payload: TCreateInquiryInput,
    userAgent?: string
): Promise<IInquiry> => {
    const doc = await Inquiry.create({
        service: payload.service,
        serviceLabel: payload.serviceLabel || '',
        name: payload.name,
        email: payload.email || '',
        phone: payload.phone,
        subject: payload.subject || '',
        message: payload.message || '',
        extra: payload.extra || {},
        source: 'website',
        pageUrl: payload.pageUrl || '',
        userAgent: userAgent || '',
    });
    return doc;
};

// Admin: paginated list with filters + free-text search (name / phone / route).
const getAllInquiries = async (query: Record<string, string>) => {
    const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10) || 20));

    const filter: Record<string, unknown> = {};
    if (query.service) filter.service = query.service.toLowerCase();
    if (query.status) filter.status = query.status;

    if (query.search && query.search.trim()) {
        const rx = new RegExp(escapeRegex(query.search.trim()), 'i');
        filter.$or = [
            { name: rx },
            { phone: rx },
            { email: rx },
            { subject: rx },
            { 'extra.from': rx },
            { 'extra.to': rx },
        ];
    }

    const [data, total] = await Promise.all([
        Inquiry.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Inquiry.countDocuments(filter),
    ]);

    return {
        data,
        meta: { total, pages: Math.ceil(total / limit) || 1, page, limit },
    };
};

// Admin: aggregate counts by service + status (drives stat cards + badges).
const getStats = async () => {
    const rows = await Inquiry.aggregate([
        { $group: { _id: { service: '$service', status: '$status' }, count: { $sum: 1 } } },
    ]);
    // Shape: { [service]: { total, new, contacted, converted, closed, spam } }
    const byService: Record<string, Record<string, number>> = {};
    for (const r of rows as { _id: { service: string; status: string }; count: number }[]) {
        const s = r._id.service;
        if (!byService[s]) byService[s] = { total: 0 };
        byService[s][r._id.status] = r.count;
        byService[s].total += r.count;
    }
    return byService;
};

// Admin: inline update (status / adminNote only — whitelisted).
const updateInquiry = async (id: string, payload: { status?: string; adminNote?: string }) => {
    const update: Record<string, unknown> = {};
    if (payload.status !== undefined) update.status = payload.status;
    if (payload.adminNote !== undefined) update.adminNote = payload.adminNote;
    if (!Object.keys(update).length) throw new AppError(400, 'Nothing to update');

    const doc = await Inquiry.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true });
    if (!doc) throw new AppError(404, 'Inquiry not found');
    return doc;
};

// Admin: hard delete.
const deleteInquiry = async (id: string) => {
    const doc = await Inquiry.findByIdAndDelete(id);
    if (!doc) throw new AppError(404, 'Inquiry not found');
    return doc;
};

export const InquiryService = {
    createInquiry,
    getAllInquiries,
    getStats,
    updateInquiry,
    deleteInquiry,
};
