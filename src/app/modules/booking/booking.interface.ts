import { Model, Types } from 'mongoose';

export type TBookingType = 'tour' | 'hajj';
export type TBookingStatus = 'pending' | 'processing' | 'confirmed' | 'cancelled' | 'rejected';
export type TPaymentMethod = 'cash' | 'bkash' | 'nagad' | 'rocket' | 'card' | 'bank' | 'other';
export type TPaymentStatus = 'unpaid' | 'partial' | 'paid' | 'refunded';

// One entry in a booking's status timeline (for real-time tracking)
export interface IStatusHistoryEntry {
    status: TBookingStatus;
    note?: string;
    at: Date;
}

// One remark in a booking's running history log
export interface IRemarkEntry {
    text: string;
    authorId: Types.ObjectId;
    authorName: string;
    at: Date;
}

// One recorded payment (manual/office cash entry, or future gateway payment)
export interface IPaymentEntry {
    amount: number;
    method: TPaymentMethod;
    reference?: string;
    note?: string;
    at: Date;
    recordedBy?: string;
}

export interface IBooking {
    user: Types.ObjectId;
    type: TBookingType;

    // Public tracking code (e.g. AV-1A2B3C4D) — used on the /track page
    trackingId?: string;

    // Service reference (name of tour / package)
    serviceName: string;
    serviceId?: string;

    // Contact info
    name: string;
    email: string;
    phone: string;

    // Type-specific fields (flexible)
    // Free-form per-type extras (schema is Mixed). Mostly scalars typed into the
    // booking form; an uploaded-document list may also be parked here
    // until an admin approves and the application file opens.
    details: Record<string, unknown>;

    // Admin
    status: TBookingStatus;
    adminNote?: string;

    // Payment / financial
    amount: number;          // total quoted amount for this booking
    paidAmount: number;      // sum of all recorded payments
    dueAmount: number;       // max(0, amount - paidAmount)
    currency: string;        // e.g. BDT
    paymentStatus: TPaymentStatus;
    payments: IPaymentEntry[];

    // Status timeline — every status change is appended here
    statusHistory: IStatusHistoryEntry[];

    // Assignment — which admin this booking is assigned to + remark log
    assignedTo?: Types.ObjectId | null;
    assignedToName: string;
    remarks: IRemarkEntry[];

    createdAt?: Date;
    updatedAt?: Date;
}

export interface BookingModel extends Model<IBooking> {}
