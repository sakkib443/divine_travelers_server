// ===================================================================
// Divine Travelers Backend - Inquiry Model
// Generic service-inquiry collection: flight is just one `service`
// value — future services (tour, hajj…) reuse the same table.
// ===================================================================

import { Schema, model, Types } from 'mongoose';

export type TInquiryStatus = 'new' | 'contacted' | 'converted' | 'closed' | 'spam';

export interface IInquiry {
    _id?: Types.ObjectId;
    service: string;
    serviceLabel: string;
    name: string;
    email?: string;
    phone: string;
    subject?: string;
    message?: string;
    extra?: Record<string, unknown>;
    status: TInquiryStatus;
    adminNote?: string;
    assignedTo?: Types.ObjectId | null;
    assignedToName?: string;
    source: string;
    pageUrl?: string;
    userAgent?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const inquirySchema = new Schema<IInquiry>(
    {
        service: { type: String, required: true, lowercase: true, trim: true, index: true },
        serviceLabel: { type: String, default: '' },
        name: { type: String, required: true, trim: true, maxlength: 120 },
        email: { type: String, lowercase: true, trim: true, default: '' },
        phone: { type: String, required: true, trim: true, maxlength: 40 },
        subject: { type: String, trim: true, maxlength: 200, default: '' },
        message: { type: String, maxlength: 4000, default: '' },
        // Service-specific fields (trip type, route, legs…) live here so the
        // collection stays generic across services.
        extra: { type: Schema.Types.Mixed, default: {} },
        status: {
            type: String,
            enum: ['new', 'contacted', 'converted', 'closed', 'spam'],
            default: 'new',
            index: true,
        },
        adminNote: { type: String, default: '' },
        assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },
        assignedToName: { type: String, default: '' },
        source: { type: String, default: 'website' },
        pageUrl: { type: String, default: '' },
        userAgent: { type: String, default: '' },
    },
    { timestamps: true }
);

inquirySchema.index({ createdAt: -1 });
inquirySchema.index({ service: 1, status: 1, createdAt: -1 });

export const Inquiry = model<IInquiry>('Inquiry', inquirySchema);
