// ===================================================================
// Divine Travellers - Page Banner Model
// The top banner of each public page (Tour, Hajj & Umrah, …) — one
// document per page, managed from Admin → Website Content → Page Banners.
// ===================================================================

import { Schema, model, Document } from 'mongoose';

export interface IBilingual {
    en: string;
    bn: string;
}

export interface IPageBanner extends Document {
    page: string;            // unique key, e.g. 'tour' | 'hajj-umrah'
    pageLabel: string;       // display name for the admin list
    eyebrow: IBilingual;     // small label above the heading
    heading: IBilingual;     // main heading (plain part)
    headingHighlight: IBilingual; // the coloured word(s) after the heading
    subtitle: IBilingual;    // the line under the heading
    slides: string[];        // background image URLs; >1 auto-rotates
    slideSeconds: number;    // seconds each slide stays before the next
    isActive: boolean;       // off = fall back to the page's built-in banner
    createdAt?: Date;
    updatedAt?: Date;
}

const bilingual = {
    en: { type: String, default: '' },
    bn: { type: String, default: '' },
};

const pageBannerSchema = new Schema<IPageBanner>(
    {
        page: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
        pageLabel: { type: String, default: '' },
        eyebrow: { type: bilingual, default: () => ({ en: '', bn: '' }) },
        heading: { type: bilingual, default: () => ({ en: '', bn: '' }) },
        headingHighlight: { type: bilingual, default: () => ({ en: '', bn: '' }) },
        subtitle: { type: bilingual, default: () => ({ en: '', bn: '' }) },
        slides: { type: [String], default: [] },
        slideSeconds: { type: Number, default: 4, min: 1 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const PageBanner = model<IPageBanner>('PageBanner', pageBannerSchema);
