// ===================================================================
// Divine Travellers - Page Banner Service
// Defaults mirror each page's current built-in banner, so nothing is
// ever missing — a page with no saved banner auto-seeds from here.
// ===================================================================

import { PageBanner, IPageBanner } from './pageBanner.model';
import AppError from '../../utils/AppError';

type BannerDefault = Omit<IPageBanner, keyof import('mongoose').Document | 'createdAt' | 'updatedAt'>;

export const BANNER_DEFAULTS: Record<string, BannerDefault> = {
    tour: {
        page: 'tour',
        pageLabel: 'Tour Packages',
        eyebrow: { en: 'Discover Amazing Places', bn: 'আশ্চর্যজনক জায়গা আবিষ্কার করুন' },
        heading: { en: 'Explore The', bn: 'বিশ্ব' },
        headingHighlight: { en: 'World', bn: 'ঘুরে দেখুন' },
        subtitle: {
            en: 'Handcrafted tour packages designed for unforgettable experiences.',
            bn: 'অবিস্মরণীয় অভিজ্ঞতার জন্য হস্তশিল্পে তৈরি ট্যুর প্যাকেজ।',
        },
        slides: [
            'https://images.pexels.com/photos/1078983/pexels-photo-1078983.jpeg?auto=compress&cs=tinysrgb&w=1200',
            'https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=800',
        ],
        slideSeconds: 4,
        isActive: true,
    },
    'hajj-umrah': {
        page: 'hajj-umrah',
        pageLabel: 'Hajj & Umrah',
        eyebrow: { en: 'Your Sacred Journey Begins Here', bn: 'আপনার পবিত্র যাত্রা এখান থেকে শুরু' },
        heading: { en: 'Hajj &', bn: 'হজ্জ ও' },
        headingHighlight: { en: 'Umrah', bn: 'ওমরাহ' },
        subtitle: {
            en: 'Embark on a life-changing pilgrimage with our expertly crafted packages.',
            bn: 'আমাদের বিশেষজ্ঞদের দ্বারা তৈরি প্যাকেজের মাধ্যমে জীবন পরিবর্তনকারী তীর্থযাত্রায় বের হন।',
        },
        slides: ['https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1920&q=80'],
        slideSeconds: 4,
        isActive: true,
    },
};

const PAGES = Object.keys(BANNER_DEFAULTS);

// Only these fields may be written from the admin form.
const ALLOWED = [
    'pageLabel', 'eyebrow', 'heading', 'headingHighlight',
    'subtitle', 'slides', 'slideSeconds', 'isActive',
] as const;

const sanitize = (input: any): Record<string, unknown> => {
    const out: Record<string, unknown> = {};
    if (!input || typeof input !== 'object') return out;
    for (const key of ALLOWED) {
        if (input[key] !== undefined) out[key] = input[key];
    }
    // Slides must be a clean array of non-empty strings.
    if (out.slides !== undefined) {
        out.slides = Array.isArray(out.slides)
            ? (out.slides as unknown[]).filter((s) => typeof s === 'string' && s.trim()).map((s) => (s as string).trim())
            : [];
    }
    return out;
};

// All banners (admin list). Auto-seeds any missing page.
const getAllBanners = async (): Promise<IPageBanner[]> => {
    const existing = await PageBanner.find().lean();
    const have = new Set(existing.map((d: any) => d.page));
    const missing = PAGES.filter((p) => !have.has(p));
    if (missing.length) {
        await PageBanner.insertMany(missing.map((p) => BANNER_DEFAULTS[p]));
        return PageBanner.find().lean() as unknown as IPageBanner[];
    }
    return existing as unknown as IPageBanner[];
};

// One page's banner (public read). Auto-seeds from defaults if absent.
const getBanner = async (page: string): Promise<IPageBanner | null> => {
    const key = (page || '').toLowerCase();
    let doc = await PageBanner.findOne({ page: key });
    if (!doc && BANNER_DEFAULTS[key]) {
        doc = await PageBanner.create(BANNER_DEFAULTS[key]);
    }
    return doc;
};

// Admin: update (upsert) a page's banner. Whitelisted fields only.
const updateBanner = async (page: string, input: any): Promise<IPageBanner> => {
    const key = (page || '').toLowerCase();
    const data = sanitize(input);

    let doc = await PageBanner.findOne({ page: key });
    if (!doc) {
        doc = await PageBanner.create({ ...(BANNER_DEFAULTS[key] || { page: key }), ...data, page: key });
        return doc;
    }
    Object.assign(doc, data);
    await doc.save();
    return doc;
};

// Admin: reset a page's banner to its built-in defaults.
const resetBanner = async (page: string): Promise<IPageBanner> => {
    const key = (page || '').toLowerCase();
    if (!BANNER_DEFAULTS[key]) throw new AppError(404, 'Unknown page banner');
    const doc = await PageBanner.findOneAndUpdate(
        { page: key },
        { $set: BANNER_DEFAULTS[key] },
        { new: true, upsert: true }
    );
    return doc as IPageBanner;
};

// Create any missing banners (startup/seed).
const seedDefaults = async (): Promise<void> => {
    for (const p of PAGES) {
        const exists = await PageBanner.findOne({ page: p });
        if (!exists) await PageBanner.create(BANNER_DEFAULTS[p]);
    }
};

export const PageBannerService = {
    getAllBanners,
    getBanner,
    updateBanner,
    resetBanner,
    seedDefaults,
};
