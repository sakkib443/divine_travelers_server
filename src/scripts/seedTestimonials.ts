/**
 * Seed script: Insert 4 sample Bangladeshi testimonials (approved)
 * Run: npx ts-node src/scripts/seedTestimonials.ts
 */

import mongoose from 'mongoose';
import config from '../app/config';
import { Testimonial } from '../app/modules/testimonial/testimonial.model';
import { User } from '../app/modules/user/user.model';

const samples = [
    {
        name: 'Rahim Ahmed',
        role: 'Business Owner, Dhaka',
        rating: 5,
        message:
            'Divine Travelers made my Singapore business visa hassle-free. Their team handled every detail with professionalism. Got my visa approved within 7 days. Highly recommended for any Bangladeshi traveler!',
        avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&q=80',
        isFeatured: true,
    },
    {
        name: 'ফারহানা ইসলাম',
        role: 'শিক্ষার্থী, চট্টগ্রাম',
        rating: 5,
        message:
            'অস্ট্রেলিয়া স্টুডেন্ট ভিসার জন্য Divine Travelers কে ধন্যবাদ। ডকুমেন্ট প্রসেসিং থেকে শুরু করে সম্পূর্ণ গাইডলাইন তারা দিয়েছে। সবচেয়ে ভালো লাগলো বাংলায় কথা বলার সুযোগ। অসাধারণ সার্ভিস!',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&q=80',
        isFeatured: true,
    },
    {
        name: 'Md. Karim Hossain',
        role: 'IT Professional, Sylhet',
        rating: 5,
        message:
            'I applied for a Canada work permit through Divine Travelers. Their step-by-step guidance and document checklist made everything so easy. The 24/7 WhatsApp support was a lifesaver. Thank you Divine Travelers team!',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80',
        isFeatured: false,
    },
    {
        name: 'নুসরাত জাহান',
        role: 'গৃহিণী, ঢাকা',
        rating: 5,
        message:
            'পরিবারসহ মালয়েশিয়া ট্যুরের ভিসা Divine Travelers থেকে নিয়েছি। সম্পূর্ণ পরিবারের ৫ জনের ভিসা মাত্র ১০ দিনে হয়ে গেলো। প্রাইসও খুবই reasonable ছিল। আমি অবশ্যই আবার তাদের সার্ভিস নিব।',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&q=80',
        isFeatured: false,
    },
];

async function seed() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(config.database_url);
        console.log('✅ Connected\n');

        // Find an existing user to attach as the testimonial author.
        // Prefer an admin; fall back to any user.
        let user = await User.findOne({ role: 'admin' });
        if (!user) user = await User.findOne();
        if (!user) {
            console.error(
                '❌ No user found in database. Please create a user first, then re-run this script.'
            );
            process.exit(1);
        }
        console.log(`👤 Attaching testimonials to user: ${user.email}\n`);

        // Avoid re-inserting if these exact names already exist
        const existingNames = await Testimonial.distinct('name', {
            name: { $in: samples.map((s) => s.name) },
        });

        let inserted = 0;
        for (const s of samples) {
            if (existingNames.includes(s.name)) {
                console.log(`⏭️  Skipping "${s.name}" — already exists`);
                continue;
            }
            await Testimonial.create({
                user: user._id,
                name: s.name,
                role: s.role,
                rating: s.rating,
                message: s.message,
                avatar: s.avatar,
                status: 'approved',
                isFeatured: s.isFeatured,
            });
            console.log(`✅ Inserted: ${s.name}`);
            inserted += 1;
        }

        console.log(`\n🎉 Done. Inserted ${inserted} testimonials.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed error:', err);
        process.exit(1);
    }
}

seed();
