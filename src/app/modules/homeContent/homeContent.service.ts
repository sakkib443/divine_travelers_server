// ===================================================================
// Divine Travelers - Home Content Service
// CRUD for homepage section content — section-based singleton documents
// ===================================================================

import { HomeContent } from './homeContent.model';
import { IHomeContent, SectionName } from './homeContent.interface';

// ─── Default Data (current hardcoded values) ──────────────────────────

const DEFAULTS: Record<SectionName, any> = {
    hero: {
        badgeText: { en: 'Open: Sat–Thu | 9:30am–8:30pm', bn: 'খোলা: শনি–বৃহঃ | সকাল ৯:৩০–রাত ৮:৩০' },
        heading: { en: 'YOUR JOURNEY STARTS WITH DIVINE TRAVELERS', bn: 'আপনার যাত্রা শুরু হোক Divine Travelers দিয়ে' },
        ctaButton1Text: { en: 'Contact for booking', bn: 'বুকিং এর জন্য যোগাযোগ' },
        ctaButton1Link: '/contact',
        ctaButton2Text: { en: 'Ask a question', bn: 'প্রশ্ন করুন' },
        // 'whatsapp' = open WhatsApp on the number from Settings, so the number
        // lives in exactly one place. Any other value is used as a plain link.
        ctaButton2Link: 'whatsapp',
        whatsappMessage: {
            en: 'I need help with tour/travel services',
            bn: 'ট্যুর/ভ্রমণ সম্পর্কে জানতে চাই',
        },
        slides: [
            { image: '/hero.jpg', order: 0 },
            { image: '/2.jpg', order: 1 },
            { image: '/3.jpg', order: 2 },
            { image: '/4.jpg', order: 3 },
        ],
        slideSeconds: 4,
        isActive: true,
    },
    services: {
        tagText: { en: 'Our Services', bn: 'আমাদের সেবা' },
        heading: { en: 'Everything You Need for', bn: 'আপনার স্বপ্নের যাত্রার জন্য' },
        headingHighlight: { en: 'Your Journey', bn: 'সেরা সেবা' },
        description: { 
            en: 'From curated tour packages to Hajj, Umrah, and flight bookings — Divine Travelers covers every step of your journey with trusted expertise.', 
            bn: 'ট্যুর প্যাকেজ থেকে শুরু করে হজ্জ, উমরাহ ও ফ্লাইট বুকিং — Divine Travelers-এ আপনার প্রতিটি ভ্রমণের প্রয়োজন পূরণ করা হয় বিশ্বস্ততার সাথে।' 
        },
        items: [
            {
                id: 'tour',
                title: { en: 'Tour Packages', bn: 'ট্যুর প্যাকেজ' },
                subtitle: { en: '', bn: '' },
                description: { en: '', bn: '' },
                icon: '',
                image: '/images/tour-service.jpg',
                color: '#E64266',
                stats: { en: '', bn: '' },
                href: '/tour',
                order: 1,
                isActive: true,
            },
            {
                id: 'hajj',
                title: { en: 'Hajj', bn: 'হজ্জ' },
                subtitle: { en: '', bn: '' },
                description: { en: '', bn: '' },
                icon: '',
                image: '/images/hajj-service.jpg',
                color: '#F59E0B',
                stats: { en: '', bn: '' },
                href: '/hajj-umrah?type=hajj',
                order: 2,
                isActive: true,
            },
            {
                id: 'umrah',
                title: { en: 'Umrah', bn: 'উমরাহ' },
                subtitle: { en: '', bn: '' },
                description: { en: '', bn: '' },
                icon: '',
                image: '/images/ummrah-service.jpg',
                color: '#10B981',
                stats: { en: '', bn: '' },
                href: '/hajj-umrah?type=umrah',
                order: 3,
                isActive: true,
            },
            {
                id: 'flight',
                title: { en: 'Flight', bn: 'ফ্লাইট' },
                subtitle: { en: '', bn: '' },
                description: { en: '', bn: '' },
                icon: '',
                image: '/images/flight-service.jpg',
                color: '#3B82F6',
                stats: { en: '', bn: '' },
                href: '/flight',
                order: 4,
                isActive: true,
            },
        ],
        bottomCTAText: { en: 'View All Services', bn: 'সব সেবা দেখুন' },
        bottomCTALink: '/contact',
        isActive: true,
    },
    about: {
        heading: { en: 'Divine Travelers is the best way to find travel tours. Let\'s make the most memorable adventures.', bn: 'ডিভাইন ট্রাভেলার্স হলো ট্যুর খুঁজে পাওয়ার সেরা উপায়। চলুন সবচেয়ে স্মরণীয় অ্যাডভেঞ্চার তৈরি করি।' },
        description: { en: 'Divine Travelers is an incredible way to have an adventurous outdoor experience of world renowned destinations while traveling with comfort and sleeping soundly in the best accommodations.', bn: 'ডিভাইন ট্রাভেলার্স হলো বিশ্ববিখ্যাত গন্তব্যগুলোতে আরামদায়ক ভ্রমণ এবং সেরা আবাসনে নিশ্চিন্তে রাত্রিযাপন করার মাধ্যমে একটি রোমাঞ্চকর আউটডোর অভিজ্ঞতা অর্জনের অবিশ্বাস্য উপায়।' },
        image1: '/hero.jpg',
        image2: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80',
        features: [
            { icon: 'LuGlobe', value: '2018', title: { en: 'The First Trip We Operated', bn: 'প্রথম ট্রিপ যা আমরা পরিচালনা করেছি' }, subtitle: { en: 'We are in this industry for more than 6 years!', bn: 'আমরা ৬ বছরেরও বেশি সময় ধরে এই শিল্পে আছি!' }, order: 1 },
            { icon: 'LuMap', value: '50+', title: { en: 'Locations Worldwide', bn: 'বিশ্বব্যাপী গন্তব্য' }, subtitle: { en: 'With more than 50 locations for your choices', bn: 'আপনার পছন্দের জন্য ৫০টিরও বেশি গন্তব্য' }, order: 2 }
        ],
        isActive: true,
    },
    whyChooseUs: {
        tagText: { en: 'WHY DIVINE TRAVELERS', bn: 'কেন ডিভাইন ট্রাভেলার্স' },
        heading: { en: 'WHY CHOOSE', bn: 'কেন বাছবেন' },
        headingHighlight: { en: 'US', bn: 'আমাদের' },
        description: { en: 'We provide comprehensive immigration and travel services with a proven track record of success.', bn: 'আমরা সফলতার প্রমাণিত ট্র্যাক রেকর্ড সহ ব্যাপক ইমিগ্রেশন ও ভ্রমণ সেবা প্রদান করি।' },
        cards: [
            { title: { en: 'Fast Processing', bn: 'দ্রুত প্রসেসিং' }, description: { en: 'Quick and efficient booking processing with minimal waiting time.', bn: 'ন্যূনতম অপেক্ষার সময়ে দ্রুত ও কার্যকর বুকিং প্রসেসিং।' }, icon: 'LuRocket', color: '#EF8C2C', order: 1 },
            { title: { en: '24/7 Support', bn: '২৪/৭ সাপোর্ট' }, description: { en: 'Round-the-clock customer support for all your queries.', bn: 'আপনার সকল প্রশ্নের জন্য সার্বক্ষণিক কাস্টমার সাপোর্ট।' }, icon: 'LuHeadphones', color: '#10B981', order: 2 },
            { title: { en: 'Affordable Prices', bn: 'সাশ্রয়ী মূল্য' }, description: { en: 'Competitive pricing with no hidden charges.', bn: 'কোনো লুকানো চার্জ ছাড়াই প্রতিযোগিতামূলক মূল্য।' }, icon: 'LuWallet', color: '#8B5CF6', order: 3 },
        ],
        stats: [
            { value: '10+', label: { en: 'Years Experience', bn: 'বছরের অভিজ্ঞতা' }, color: '#1D7EDD', order: 1 },
            { value: '10K+', label: { en: 'Trips Arranged', bn: 'ট্রিপ সম্পন্ন' }, color: '#EF8C2C', order: 2 },
            { value: '98%', label: { en: 'Success Rate', bn: 'সাফল্যের হার' }, color: '#10B981', order: 3 },
            { value: '50+', label: { en: 'Countries Covered', bn: 'দেশ কভারেজ' }, color: '#8B5CF6', order: 4 },
            { value: '24/7', label: { en: 'Customer Support', bn: 'কাস্টমার সাপোর্ট' }, color: '#3590CF', order: 5 },
        ],
        isActive: true,
    },
    noticeBoard: {
        isActive: true,
        notices: [
            {
                en: "Welcome to Divine Travelers! Enjoy a 10% discount on all Hajj packages booked this month.",
                bn: "ডিভাইন ট্রাভেলার্সে আপনাকে স্বাগতম! এই মাসে বুক করা সকল হজ প্যাকেজে ১০% ছাড় উপভোগ করুন।"
            },
            {
                en: "Special offer: Free Dubai visa with our premium Dubai tour package.",
                bn: "বিশেষ অফার: আমাদের প্রিমিয়াম দুবাই ট্যুর প্যাকেজের সাথে ফ্রি দুবাই ভিসা।"
            },
            {
                en: "Flight ticket prices are dropping! Book your next flight with us for the best rates.",
                bn: "ফ্লাইট টিকিটের দাম কমছে! সেরা রেটে আপনার পরবর্তী ফ্লাইট বুক করুন আমাদের সাথে।"
            }
        ]
    }
};

// ─── Field whitelists (per section) ───────────────────────────────────
// The `data` field is Schema.Types.Mixed, so Mongoose performs no shape
// validation. To prevent mass-assignment of arbitrary properties from the
// raw request body, we copy ONLY the fields defined in each section's schema.

const SERVICE_ITEM_FIELDS = [
    'id', 'title', 'subtitle', 'description', 'icon', 'image', 'color', 'stats', 'href', 'order', 'isActive',
] as const;

const WHY_CHOOSE_CARD_FIELDS = ['title', 'description', 'icon', 'color', 'order'] as const;

const STAT_ITEM_FIELDS = ['value', 'label', 'color', 'order'] as const;
const NOTICE_ITEM_FIELDS = ['en', 'bn'] as const;
const ABOUT_FEATURE_FIELDS = ['icon', 'value', 'title', 'subtitle', 'order'] as const;

// One background picture behind the hero
const HERO_SLIDE_FIELDS = ['image', 'order'] as const;

const SECTION_FIELDS: Record<SectionName, readonly string[]> = {
    // Mirrors what the Hero renders: a background image slider, the badge and
    // heading, and two buttons.
    // `videoUrl` is gone — the Hero has never rendered a video, so the field only
    // ever saved a value nothing read. The search card's wording is not here
    // either: it is driven by the tour data, not by page content.
    hero: [
        'slides', 'slideSeconds',
        'badgeText', 'heading',
        'ctaButton1Text', 'ctaButton1Link',
        'ctaButton2Text', 'ctaButton2Link', 'whatsappMessage',
        'isActive',
    ],
    services: [
        'tagText', 'heading', 'headingHighlight', 'description', 'items',
        'bottomCTAText', 'bottomCTALink', 'isActive',
    ],
    about: [
        'heading', 'description', 'image1', 'image2', 'features', 'isActive',
    ],
    whyChooseUs: [
        'tagText', 'heading', 'headingHighlight', 'description', 'cards', 'stats', 'isActive',
    ],
    noticeBoard: [
        'isActive', 'notices',
    ],
};

// Pick only the allowed keys from a plain object.
const pickFields = (input: any, allowed: readonly string[]): Record<string, any> => {
    const out: Record<string, any> = {};
    if (!input || typeof input !== 'object') return out;
    for (const key of allowed) {
        if (input[key] !== undefined) {
            out[key] = input[key];
        }
    }
    return out;
};

// Sanitize each item of an array against the allowed item fields.
const pickItems = (value: any, allowed: readonly string[]): Record<string, any>[] => {
    if (!Array.isArray(value)) return [];
    return value.map((item) => pickFields(item, allowed));
};

/**
 * Build an explicit, whitelisted data object for a section. Only fields
 * defined in that section's schema are copied from the raw input; nested
 * array items are likewise restricted to their own allowed fields.
 */
const sanitizeSectionData = (section: SectionName, input: any): Record<string, any> => {
    const data = pickFields(input, SECTION_FIELDS[section]);

    if (section === 'hero') {
        if (data.slides !== undefined) {
            // Drop blank rows: the editor adds an empty one when you click
            // "Add by URL", and an empty slide would render as a black panel.
            data.slides = pickItems(data.slides, HERO_SLIDE_FIELDS)
                .filter((s) => s.image)
                .map((s, i) => ({ ...s, order: i }));
        }
    }
    if (section === 'services' && data.items !== undefined) {
        data.items = pickItems(data.items, SERVICE_ITEM_FIELDS);
    }
    if (section === 'about' && data.features !== undefined) {
        data.features = pickItems(data.features, ABOUT_FEATURE_FIELDS);
    }
    if (section === 'whyChooseUs') {
        if (data.cards !== undefined) data.cards = pickItems(data.cards, WHY_CHOOSE_CARD_FIELDS);
        if (data.stats !== undefined) data.stats = pickItems(data.stats, STAT_ITEM_FIELDS);
    }
    if (section === 'noticeBoard') {
        if (data.notices !== undefined) data.notices = pickItems(data.notices, NOTICE_ITEM_FIELDS);
    }

    return data;
};

// ─── Get all sections ─────────────────────────────────────────────────
const getAllSections = async (): Promise<IHomeContent[]> => {
    let docs = await HomeContent.find().lean();

    // Auto-seed missing sections
    const existing = new Set(docs.map((d: any) => d.section));
    const missing = (Object.keys(DEFAULTS) as SectionName[]).filter(
        (s) => !existing.has(s)
    );

    if (missing.length > 0) {
        const toInsert = missing.map((s) => ({ section: s, data: DEFAULTS[s] }));
        await HomeContent.insertMany(toInsert);
        docs = await HomeContent.find().lean();
    }

    return docs as IHomeContent[];
};

// ─── Get single section ───────────────────────────────────────────────
const getSection = async (section: SectionName): Promise<IHomeContent> => {
    let doc = await HomeContent.findOne({ section });
    if (!doc) {
        doc = await HomeContent.create({ section, data: DEFAULTS[section] || {} });
    }
    return doc;
};

// ─── Update section ───────────────────────────────────────────────────
const updateSection = async (
    section: SectionName,
    input: any
): Promise<IHomeContent> => {
    // Whitelist: only fields defined in this section's schema are persisted.
    const data = sanitizeSectionData(section, input);

    let doc = await HomeContent.findOne({ section });
    if (!doc) {
        doc = await HomeContent.create({ section, data });
        return doc;
    }
    doc.data = data as IHomeContent['data'];
    doc.markModified('data');
    await doc.save();
    return doc;
};

// ─── Seed all defaults ────────────────────────────────────────────────
const seedDefaults = async (): Promise<IHomeContent[]> => {
    const sections = Object.keys(DEFAULTS) as SectionName[];
    for (const section of sections) {
        const exists = await HomeContent.findOne({ section });
        if (!exists) {
            await HomeContent.create({ section, data: DEFAULTS[section] });
        }
    }
    return HomeContent.find().lean() as unknown as IHomeContent[];
};

export const HomeContentService = {
    getAllSections,
    getSection,
    updateSection,
    seedDefaults,
};
