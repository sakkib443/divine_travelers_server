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
        tagText: { en: 'OUR SERVICES', bn: 'আমাদের সেবা' },
        heading: { en: 'WHAT WE', bn: 'আমরা যা' },
        headingHighlight: { en: 'OFFER', bn: 'অফার করি' },
        description: { en: 'Comprehensive travel and immigration solutions tailored to your needs', bn: 'আপনার প্রয়োজন অনুযায়ী সম্পূর্ণ ভ্রমণ ও ইমিগ্রেশন সমাধান' },
        items: [
            {
                title: { en: 'Flight Booking', bn: 'ফ্লাইট বুকিং' },
                subtitle: { en: 'Air Travel', bn: 'বিমান ভ্রমণ' },
                description: { en: 'Best deals on domestic and international flights', bn: 'দেশি ও আন্তর্জাতিক ফ্লাইটে সেরা ডিল' },
                icon: 'LuPlane',
                image: 'https://images.pexels.com/photos/46148/aircraft-jet-landing-cloud-46148.jpeg?auto=compress&cs=tinysrgb&w=800',
                color: '#EF8C2C',
                stats: { en: '5K+ Booked', bn: '৫K+ বুকড' },
                href: '/contact',
                order: 2,
                isActive: true,
            },
            {
                title: { en: 'Tour Packages', bn: 'ট্যুর প্যাকেজ' },
                subtitle: { en: 'Adventure', bn: 'অ্যাডভেঞ্চার' },
                description: { en: 'Curated tour packages for unforgettable travel experiences', bn: 'অবিস্মরণীয় ভ্রমণ অভিজ্ঞতার জন্য পরিকল্পিত ট্যুর প্যাকেজ' },
                icon: 'LuMapPin',
                image: 'https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=800',
                color: '#8B5CF6',
                stats: { en: '500+ Tours', bn: '৫০০+ ট্যুর' },
                href: '/tour',
                order: 4,
                isActive: true,
            },
            {
                title: { en: 'Hajj & Umrah', bn: 'হজ্জ ও উমরাহ' },
                subtitle: { en: 'Pilgrimage', bn: 'তীর্থযাত্রা' },
                description: { en: 'Complete Hajj and Umrah packages with guided services', bn: 'গাইডেড সেবাসহ সম্পূর্ণ হজ্জ ও উমরাহ প্যাকেজ' },
                icon: 'LuMoon',
                image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&fit=crop',
                color: '#F59E0B',
                stats: { en: '1K+ Pilgrims', bn: '১K+ হাজী' },
                href: '/hajj-umrah',
                order: 5,
                isActive: true,
            },
        ],
        bottomCTAText: { en: 'View All Services', bn: 'সব সেবা দেখুন' },
        bottomCTALink: '/contact',
        isActive: true,
    },
    consultation: {
        tagText: { en: 'IMMIGRATION CONSULTING', bn: 'ইমিগ্রেশন কনসাল্টিং' },
        heading: { en: 'EXPERT IMMIGRATION', bn: 'বিশেষজ্ঞ ইমিগ্রেশন' },
        headingHighlight: { en: 'CONSULTING', bn: 'কনসাল্টিং' },
        headingEnd: { en: 'SERVICE', bn: 'সেবা' },
        description: { en: 'Get professional guidance from our experienced travel consultants for a smooth journey.', bn: 'মসৃণ ভ্রমণের জন্য আমাদের অভিজ্ঞ ট্রাভেল পরামর্শদাতাদের কাছ থেকে পেশাদার নির্দেশনা পান।' },
        experienceTitle: { en: '10+ Years Of Experience', bn: '১০+ বছরের অভিজ্ঞতা' },
        experienceDesc: { en: 'Our team of experts has over a decade of experience in immigration consulting, ensuring you get the best guidance.', bn: 'আমাদের বিশেষজ্ঞ দল ইমিগ্রেশন কনসাল্টিং এ এক দশকেরও বেশি অভিজ্ঞতা রাখে।' },
        experienceImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&h=200&fit=crop',
        mainImage1: '/images/img01.png',
        mainImage2: '/images/img02.png',
        ctaText: { en: 'Explore More', bn: 'আরও জানুন' },
        ctaLink: '/contact',
        agentCount: '200+',
        agentLabel: { en: 'Real Agents', bn: 'এজেন্ট' },
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
    'title', 'subtitle', 'description', 'icon', 'image', 'color', 'stats', 'href', 'order', 'isActive',
] as const;

const WHY_CHOOSE_CARD_FIELDS = ['title', 'description', 'icon', 'color', 'order'] as const;

const STAT_ITEM_FIELDS = ['value', 'label', 'color', 'order'] as const;
const NOTICE_ITEM_FIELDS = ['en', 'bn'] as const;

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
    consultation: [
        'tagText', 'heading', 'headingHighlight', 'headingEnd', 'description',
        'experienceTitle', 'experienceDesc', 'experienceImage', 'mainImage1',
        'mainImage2', 'ctaText', 'ctaLink', 'agentCount', 'agentLabel', 'isActive',
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
