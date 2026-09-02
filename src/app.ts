// ===================================================================
// Divine Travelers - Main Application File
// Express app setup with all routes and middleware
// মূল এপ্লিকেশন ফাইল - সব routes এবং middleware এখানে connect হয়েছে
// ===================================================================

import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import { UPLOAD_DIR, PUBLIC_PATH } from './app/utils/fileStorage';

// ==================== Middleware Imports ====================
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFoundHandler from './app/middlewares/notFoundHandler';
import config from './app/config';

// ==================== Route Imports ====================
import { AuthRoutes } from './app/modules/auth/auth.routes';
import { UserRoutes } from './app/modules/user/user.routes';
import { uploadRoutes } from './app/modules/upload/upload.routes';
import { BlogRoutes } from './app/modules/blog/blog.routes';
import { TourRoutes } from './app/modules/tour/tour.routes';
import { HajjUmrahRoutes } from './app/modules/hajjUmrah/hajjUmrah.routes';
import { PdfExtractRoutes } from './app/modules/pdfExtract/pdfExtract.routes';
import { BookingRoutes } from './app/modules/booking/booking.routes';
import { TestimonialRoutes } from './app/modules/testimonial/testimonial.routes';
import { SettingsRoutes } from './app/modules/settings/settings.routes';
import { HomeContentRoutes } from './app/modules/homeContent/homeContent.routes';
import { LegalPolicyRoutes } from './app/modules/legalPolicy/legalPolicy.routes';
import { AnalyticsRoutes } from './app/modules/analytics/analytics.routes';
import { InquiryRoutes } from './app/modules/inquiry/inquiry.routes';

// ==================== App Initialization ====================
const app: Application = express();

// ==================== Global Middlewares ====================
// JSON body parser. `verify` stashes the raw bytes so the WhatsApp webhook can
// validate Meta's X-Hub-Signature-256 (does not alter parsing for other routes).
app.use(
  express.json({
    limit: '10mb',
    verify: (req, _res, buf) => {
      (req as unknown as { rawBody?: Buffer }).rawBody = buf;
    },
  })
);

// URL encoded parser
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser (for refresh token)
app.use(cookieParser());

// CORS configuration - supports multiple origins for production
const allowedOrigins = [
  config.frontend_url,
  'http://localhost:3000',
  'https://visapro.vercel.app',
  'https://divinetravelers.com',
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all origins in production for API
      }
    },
    credentials: true, // Allow cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ==================== Static Files (Uploads) ====================
// আপলোড করা ছবি/ফাইল এখান থেকেই সার্ভ হয়। ফাইলনেমে timestamp + random
// hash থাকে বলে একই URL-এর কনটেন্ট কখনো বদলায় না — তাই immutable + ১ বছর
// cache নিরাপদ, আর এতে বারবার একই ছবি ডাউনলোড হয় না।
app.use(
  PUBLIC_PATH,
  express.static(UPLOAD_DIR, {
    maxAge: '1y',
    immutable: true,
    // ডিরেক্টরি লিস্টিং বা লুকানো ফাইল সার্ভ করতে দেওয়া হবে না।
    index: false,
    dotfiles: 'ignore',
    setHeaders: (res) => {
      // আপলোড করা ফাইল ব্রাউজার যেন নিজের ইচ্ছেমতো HTML/JS ধরে না চালায়।
      res.setHeader('X-Content-Type-Options', 'nosniff');
    },
  })
);

// ==================== Health Check Route ====================
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: '🚀 Divine Travelers API Server is running!',
    version: '1.0.0',
    environment: config.env,
    timestamp: new Date().toISOString(),
  });
});

// ==================== API Health Check ====================
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy',
    uptime: process.uptime(),
  });
});

// ==================== API Routes ====================
// Authentication routes (public)
app.use('/api/auth', AuthRoutes);

// User routes (authenticated)
app.use('/api/users', UserRoutes);

// Upload routes (authenticated)
app.use('/api/upload', uploadRoutes);

// Blog routes (blog posts and comments)
app.use('/api/blogs', BlogRoutes);

// Tour routes
app.use('/api/tours', TourRoutes);

// Hajj & Umrah routes
app.use('/api/hajj-umrah', HajjUmrahRoutes);

// PDF Extract routes (admin ticket generator)
app.use('/api/pdf-extract', PdfExtractRoutes);

// Ticket CRUD routes (save/edit/list tickets)
import { TicketRoutes } from './app/modules/ticket/ticket.routes';
app.use('/api/tickets', TicketRoutes);

// Booking routes (tour / hajj)
app.use('/api/bookings', BookingRoutes);

// Testimonial routes (user reviews on homepage)
app.use('/api/testimonials', TestimonialRoutes);

// Settings routes (site contact/social — singleton, admin-controlled)
app.use('/api/settings', SettingsRoutes);

// Home Content routes (homepage sections — admin-controlled)
app.use('/api/home-content', HomeContentRoutes);

// Legal Policy routes (Privacy & Refund policies — admin-controlled)
app.use('/api/legal-policies', LegalPolicyRoutes);

// Analytics routes (admin dashboard financial & booking stats)
app.use('/api/analytics', AnalyticsRoutes);

// Inquiry routes (generic service-inquiry queue — flight booking etc.)
app.use('/api/inquiries', InquiryRoutes);


// ==================== Error Handling ====================
// 404 Not Found handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(globalErrorHandler);

export default app;
