/**
 * Bootstrap the first admin user.
 *
 * The app has no public register route and every /api/users route requires an
 * authenticated admin, so a fresh database has no way in. This script creates
 * that first account directly, reusing the compiled Mongoose model so the
 * pre-save hook hashes the password and all schema defaults apply.
 *
 * Run it from the project root (uses DATABASE_URL from .env):
 *
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='your-password' node create-admin.js
 *
 * Optional: ADMIN_FIRST_NAME, ADMIN_LAST_NAME, ADMIN_PHONE.
 * Re-running with an existing email resets that account's password.
 */
require('dotenv').config();
const mongoose = require('mongoose');

const { DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
const FIRST = process.env.ADMIN_FIRST_NAME || 'Admin';
const LAST = process.env.ADMIN_LAST_NAME || 'User';
const PHONE = process.env.ADMIN_PHONE || '01700000000';

if (!DATABASE_URL) { console.error('✗ DATABASE_URL is not set (check .env)'); process.exit(1); }
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('✗ ADMIN_EMAIL and ADMIN_PASSWORD are required.\n');
  console.error("  ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='your-password' node create-admin.js");
  process.exit(1);
}
if (ADMIN_PASSWORD.length < 8) { console.error('✗ ADMIN_PASSWORD must be at least 8 characters.'); process.exit(1); }

(async () => {
  await mongoose.connect(DATABASE_URL);
  console.log('✓ connected to', mongoose.connection.name);

  const { User } = require('./dist/app/modules/user/user.model');

  let user = await User.findOne({ email: ADMIN_EMAIL }).select('+password');
  if (user) {
    user.password = ADMIN_PASSWORD;   // pre-save hook re-hashes it
    user.role = 'admin';
    user.status = 'active';
    user.isDeleted = false;
    await user.save();
    console.log('✓ existing user updated — password reset, role set to admin');
  } else {
    user = await User.create({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,       // pre-save hook hashes it
      firstName: FIRST,
      lastName: LAST,
      phone: PHONE,
      role: 'admin',
      status: 'active',
      isEmailVerified: true,
      isDeleted: false,
    });
    console.log('✓ admin created');
  }

  console.log('  email:', user.email, '| role:', user.role, '| status:', user.status);
  await mongoose.disconnect();
})().catch((e) => { console.error('✗ failed:', e.message); process.exit(1); });
