// ===================================================================
// One-off migration: fix the brand spelling in DB content.
// Replaces "Travelers" -> "Travellers" (and "TRAVELERS"/"divinetravelers")
// in every STRING value across every collection, leaving ObjectId, Date,
// numbers and booleans untouched.
//
//   Local : node fix-travellers.js
//   Prod  : DATABASE_URL="<prod uri>" node fix-travellers.js
//           (or run it on the server where .env points at the prod DB)
//
// Safe to run multiple times (idempotent — "Travellers" won't match again).
// ===================================================================

require('dotenv').config();
const mongoose = require('mongoose');

const URI = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/aerovista';

// Replace only the single-L brand spelling; never touches "Travellers".
function fixString(s) {
    return s
        .split('TRAVELERS').join('TRAVELLERS')
        .split('Travelers').join('Travellers')
        .split('divinetravelers').join('divinetravellers');
}

// Recursively walk a value, returning [newValue, changed].
// Only strings are rewritten; ObjectId/Date/Buffer/number/bool pass through.
function walk(value) {
    if (typeof value === 'string') {
        const next = fixString(value);
        return [next, next !== value];
    }
    if (Array.isArray(value)) {
        let changed = false;
        const out = value.map((v) => {
            const [nv, c] = walk(v);
            if (c) changed = true;
            return nv;
        });
        return [out, changed];
    }
    // Plain object (but NOT special BSON types like ObjectId/Date/Buffer)
    if (
        value &&
        typeof value === 'object' &&
        !(value instanceof Date) &&
        !(value._bsontype) &&
        !Buffer.isBuffer(value) &&
        Object.getPrototypeOf(value) === Object.prototype
    ) {
        let changed = false;
        for (const k of Object.keys(value)) {
            const [nv, c] = walk(value[k]);
            if (c) { value[k] = nv; changed = true; }
        }
        return [value, changed];
    }
    return [value, false];
}

(async () => {
    await mongoose.connect(URI);
    const db = mongoose.connection.db;
    console.log('Connected:', URI.replace(/\/\/[^@]*@/, '//***@'));

    const collections = await db.listCollections().toArray();
    let totalDocs = 0;

    for (const { name } of collections) {
        const col = db.collection(name);
        const docs = await col.find({}).toArray();
        let changedInCol = 0;

        for (const doc of docs) {
            const id = doc._id;
            const [nextDoc, changed] = walk(doc);
            if (changed) {
                nextDoc._id = id; // never rewrite _id
                await col.replaceOne({ _id: id }, nextDoc);
                changedInCol++;
            }
        }
        if (changedInCol) console.log(`  ${name}: updated ${changedInCol} doc(s)`);
        totalDocs += changedInCol;
    }

    console.log(totalDocs ? `\nDone — ${totalDocs} document(s) fixed.` : '\nNothing to fix — already clean.');
    await mongoose.disconnect();
})().catch((e) => { console.error('Migration failed:', e); process.exit(1); });
