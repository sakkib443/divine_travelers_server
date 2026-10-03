/**
 * One-time migration: fill in `locationType` for tours that have it null/empty.
 *
 * Older/seeded tours were saved before locationType was persisted, so the
 * Domestic / International filter on /tour matched none of them. This infers
 * the value from the destination/title: a tour that clearly names a foreign
 * country becomes International; everything else becomes Domestic (the safe
 * majority — the admin can flip any individual one in the edit form, which now
 * saves locationType correctly).
 *
 * Idempotent: only touches tours whose locationType is missing.
 *
 * Run (dev):   npm run migrate:tour-location
 * Run (prod):  node dist/scripts/migrateTourLocationType.js   (after npm run build)
 */

import mongoose from 'mongoose';
import config from '../app/config';
import { Tour } from '../app/modules/tour/tour.model';

// Countries/regions that mark a tour as International when named in the
// destination or title. Everything else is treated as Domestic (Bangladesh).
const FOREIGN = [
    'thailand', 'nepal', 'india', 'malaysia', 'singapore', 'indonesia', 'bali',
    'dubai', 'uae', 'abu dhabi', 'saudi', 'makkah', 'madinah', 'turkey', 'istanbul',
    'maldives', 'sri lanka', 'bhutan', 'vietnam', 'cambodia', 'china', 'hong kong',
    'japan', 'korea', 'egypt', 'qatar', 'bahrain', 'kuwait', 'oman', 'europe',
    'uk', 'london', 'usa', 'america', 'canada', 'australia',
];

const isInternational = (text: string): boolean => {
    const t = (text || '').toLowerCase();
    if (t.includes('bangladesh')) return false; // explicit domestic marker wins
    return FOREIGN.some((c) => t.includes(c));
};

const run = async (): Promise<void> => {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(config.database_url);
    console.log('✅ Connected.\n');

    // Tours with no usable locationType yet.
    const tours = await Tour.find({
        $or: [
            { locationType: { $exists: false } },
            { locationType: null },
            { locationType: '' },
        ],
    });

    console.log(`Tours missing locationType: ${tours.length}`);
    let intl = 0;
    let dom = 0;

    for (const tour of tours) {
        const hint = `${tour.destination || ''} ${tour.destinationBn || ''} ${tour.title || ''}`;
        const value = isInternational(hint) ? 'International' : 'Domestic';
        tour.locationType = value;
        await tour.save();
        if (value === 'International') intl++;
        else dom++;
        console.log(`  • ${(tour.title || '').slice(0, 40)}  →  ${value}`);
    }

    console.log(`\n✅ Done. Set ${dom} Domestic, ${intl} International.`);
    await mongoose.disconnect();
    console.log('🔌 Disconnected.');
};

run().catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
});
