// ===================================================================
// Divine Travelers - Settings Service
// Singleton: শুধু একটাই document থাকবে — find করে না পেলে create করবে
// ===================================================================

import { Settings } from './settings.model';
import { ISettings } from './settings.interface';

const DEFAULTS: Partial<ISettings> = {
    contactPhone: 'XXXXXXX',
    contactPhoneAlt: '',
    contactEmail: 'XXXXXXX',
    whatsappNumber: 'XXXXXXX',
    address: 'XXXXXXX',
    addressBn: 'XXXXXXX',

    // Working Hours
    workingDays: 'Sat - Thu: Open',
    workingDaysBn: 'শনি - বৃহঃ: খোলা',
    workingHours: '9:30 AM - 8:30 PM',
    workingHoursBn: 'সকাল ৯:৩০ - রাত ৮:৩০',

    // Map
    mapEmbedUrl: 'https://maps.google.com/maps?q=Bangladesh&t=&z=7&ie=UTF8&iwloc=&output=embed',
    mapLabel: 'XXXXXXX',
    mapLabelBn: 'XXXXXXX',

    // Stats
    countriesCount: '50+',
    happyClientsCount: '10K+',

    social: {
        facebook: 'https://facebook.com/divinetravelers',
        instagram: '',
        twitter: '',
        youtube: '',
        linkedin: '',
        tiktok: '',
    },
};

/**
 * Get the singleton settings document. Create with defaults if missing.
 */
const getSettings = async (): Promise<ISettings> => {
    let doc = await Settings.findOne();
    if (!doc) {
        doc = await Settings.create(DEFAULTS);
    }
    return doc;
};

/**
 * Update settings. Always operates on the singleton.
 */
const updateSettings = async (
    payload: Partial<ISettings>
): Promise<ISettings> => {
    let doc = await Settings.findOne();
    if (!doc) {
        doc = await Settings.create({ ...DEFAULTS, ...payload });
        return doc;
    }
    // Merge social separately so partial updates don't wipe other fields
    if (payload.social) {
        doc.social = { ...doc.social, ...payload.social };
    }
    const { social: _ignore, ...rest } = payload as Record<string, unknown>;
    Object.assign(doc, rest);
    await doc.save();
    return doc;
};

export const SettingsService = { getSettings, updateSettings };
