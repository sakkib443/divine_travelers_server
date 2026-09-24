/**
 * Seed / repair every page-content section (homepage + About page).
 *
 * Safe by default: sections already in the database are left exactly as they
 * are, and only the missing ones are created from the built-in defaults. So
 * running it on the live server can never wipe content an admin has edited.
 *
 * Run (development):
 *   npm run seed:content            # fill in whatever is missing
 *   npm run seed:content -- --force # reset EVERY section back to defaults
 *
 * Run (production / VPS, after `npm run build`):
 *   node dist/scripts/seedHomeContent.js
 */

import mongoose from 'mongoose';
import config from '../app/config';
import { HomeContent } from '../app/modules/homeContent/homeContent.model';
import {
    HomeContentService,
    HOME_CONTENT_DEFAULTS,
} from '../app/modules/homeContent/homeContent.service';

const run = async (): Promise<void> => {
    const force = process.argv.includes('--force');

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(config.database_url);
    console.log('✅ Connected.\n');

    const all = Object.keys(HOME_CONTENT_DEFAULTS);
    const existingDocs = await HomeContent.find().select('section').lean();
    const existing = new Set(existingDocs.map((d: any) => d.section));
    const missing = all.filter((s) => !existing.has(s));

    if (force) {
        console.log('⚠️  --force: every section will be reset to its default content.');
    }

    console.log(`Sections defined : ${all.length}  (${all.join(', ')})`);
    console.log(`Already in the DB: ${existing.size}`);
    console.log(
        missing.length
            ? `To be created    : ${missing.join(', ')}`
            : 'To be created    : none — everything is already there'
    );

    await HomeContentService.seedDefaults(force);

    const after = await HomeContent.find().select('section updatedAt').lean();
    console.log('\n✅ Done. Sections now in the database:');
    for (const doc of after as any[]) {
        const flag = missing.includes(doc.section) ? ' (created)' : force ? ' (reset)' : '';
        console.log(`   • ${doc.section}${flag}`);
    }

    await mongoose.disconnect();
    console.log('\n🔌 Disconnected.');
};

run().catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
