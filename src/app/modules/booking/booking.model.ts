import { Schema, model } from 'mongoose';
import { IBooking, BookingModel } from './booking.interface';

const statusHistorySchema = new Schema(
    {
        status: {
            type: String,
            enum: ['pending', 'processing', 'confirmed', 'cancelled', 'rejected'],
            required: true,
        },
        note: { type: String, default: '' },
        at: { type: Date, default: Date.now },
    },
    { _id: false }
);

const remarkEntrySchema = new Schema(
    {
        text: { type: String, required: true, trim: true },
        authorId: { type: Schema.Types.ObjectId, ref: 'User' },
        authorName: { type: String, default: '' },
        at: { type: Date, default: Date.now },
    },
    { _id: false }
);

const paymentEntrySchema = new Schema(
    {
        amount: { type: Number, required: true, min: 0 },
        method: {
            type: String,
            enum: ['cash', 'bkash', 'nagad', 'rocket', 'card', 'bank', 'other'],
            default: 'cash',
        },
        reference: { type: String, default: '' },
        note: { type: String, default: '' },
        at: { type: Date, default: Date.now },
        recordedBy: { type: String, default: '' },
    },
    { _id: false }
);

const bookingSchema = new Schema<IBooking, BookingModel>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        type: {
            type: String,
            enum: ['tour', 'hajj'],
            required: true,
        },

        // Public tracking code — sparse so existing bookings (without one) don't clash
        trackingId: { type: String, unique: true, sparse: true, trim: true, uppercase: true },

        serviceName: { type: String, required: true, trim: true },
        serviceId: { type: String },

        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        phone: { type: String, required: true, trim: true },

        details: { type: Schema.Types.Mixed, default: {} },

        status: {
            type: String,
            enum: ['pending', 'processing', 'confirmed', 'cancelled', 'rejected'],
            default: 'pending',
        },
        adminNote: { type: String },

        // Payment / financial
        amount: { type: Number, default: 0, min: 0 },
        paidAmount: { type: Number, default: 0, min: 0 },
        dueAmount: { type: Number, default: 0, min: 0 },
        currency: { type: String, default: 'BDT', trim: true },
        paymentStatus: {
            type: String,
            enum: ['unpaid', 'partial', 'paid', 'refunded'],
            default: 'unpaid',
        },
        payments: { type: [paymentEntrySchema], default: [] },

        // Status timeline for real-time tracking
        statusHistory: { type: [statusHistorySchema], default: [] },

        // Assignment + remark log
        assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },
        assignedToName: { type: String, default: '' },
        remarks: { type: [remarkEntrySchema], default: [] },
    },
    { timestamps: true, versionKey: false }
);

bookingSchema.index({ user: 1 });
bookingSchema.index({ type: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ assignedTo: 1 });
bookingSchema.index({ createdAt: -1 });

export const Booking = model<IBooking, BookingModel>('Booking', bookingSchema);
