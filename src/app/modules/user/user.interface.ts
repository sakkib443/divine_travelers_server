// ===================================================================
// Divine Travelers LMS - User Interface
// User মডেলের TypeScript interface definitions
// ===================================================================

import { Model, Types } from 'mongoose';

/**
 * User Role Types
 * admin - System administrator with full access
 * (superadmin logs in from .env and also carries the 'admin' role)
 */
export type TUserRole = 'admin';

/**
 * User Status Types
 * active - Normal active user
 * blocked - Blocked by admin
 * pending - Awaiting email verification
 */
export type TUserStatus = 'active' | 'blocked' | 'pending';

/**
 * Seller Permissions - Admin থেকে control হবে
 * প্রতিটি seller এর জন্য আলাদা আলাদা permissions থাকবে
 */
export interface ISellerPermissions {
  // Product Types - কি কি বিক্রি করতে পারবে
  canSellWebTemplates: boolean;      // Website Templates (HTML, React, WordPress)
  canSellGraphics: boolean;          // Graphics & Design (Logo, Flyer, Banner)
  canSellVideoTemplates: boolean;    // Video Templates (After Effects, Premiere)
  canSellUIKits: boolean;            // UI/UX Kits (Figma, XD, Sketch)
  canSellAppTemplates: boolean;      // App Templates (Flutter, React Native)
  canSellSoftware: boolean;          // Software & Scripts (PHP, JS, Python)
  canSellCourses: boolean;           // Online Courses
  canSellAudio: boolean;             // Audio & Music (Tracks, SFX)
  canSellPhotos: boolean;            // Stock Photos
  canSellFonts: boolean;             // Fonts & Typography

  // Advanced Features
  canCreateBundles: boolean;         // Create bundle packages
  canRunSales: boolean;              // Run discount sales on own products
  canViewAnalytics: boolean;         // View detailed sales analytics
  canWithdrawEarnings: boolean;      // Withdraw earnings to bank/wallet
  canAccessAPI: boolean;             // Access seller API (for developers)
}

/**
 * Seller Profile - Seller specific information
 */
export interface ISellerProfile {
  storeName: string;                 // Store/Shop name
  storeSlug: string;                 // URL slug (unique)
  storeDescription?: string;         // Store description
  storeLogo?: string;                // Store logo image
  storeBanner?: string;              // Store banner image

  // Verification & Status
  isVerified: boolean;               // Admin verified seller
  verifiedAt?: Date;                 // Verification date

  // Statistics (auto-updated)
  rating: number;                    // Average rating (1-5)
  totalSales: number;                // Total products/courses sold
  totalEarnings: number;             // Total earnings in BDT
  totalProducts: number;             // Total products listed
  totalCourses: number;              // Total courses created

  // Commission & Payout
  commissionRate: number;            // Platform commission % (default 20%)
  pendingEarnings: number;           // Pending payout amount
  withdrawnEarnings: number;         // Total withdrawn amount

  // Permissions (Admin controlled)
  permissions: ISellerPermissions;

  // Payout Information
  payoutMethod?: 'bkash' | 'nagad' | 'bank' | 'paypal';
  payoutDetails?: {
    accountNumber?: string;
    accountName?: string;
    bankName?: string;
    branchName?: string;
    routingNumber?: string;
  };
}

/**
 * IUser - Main User Interface
 * Database এ যে format এ user data save হবে
 */
export interface IUser {
  _id?: Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;  // Mandatory phone number
  avatar?: string;
  coverImage?: string;  // Profile cover image
  role: TUserRole;
  status: TUserStatus;
  isEmailVerified: boolean;
  isDeleted: boolean;

  // ==================== Extended Profile Fields ====================
  bio?: string;           // Short biography
  address?: string;       // Street address
  city?: string;          // City name
  country?: string;       // Country name
  website?: string;       // Personal/company website
  company?: string;       // Company/organization name
  jobTitle?: string;      // Job designation
  dateOfBirth?: Date;     // Birth date
  gender?: 'male' | 'female' | 'other' | '';

  // Social media links
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    github?: string;
    instagram?: string;
    youtube?: string;
    dribbble?: string;
    behance?: string;
  };

  // Skills/expertise
  skills?: string[];
  languages?: string[];   // Languages spoken

  // ==================== Seller Profile (Only for sellers) ====================
  sellerProfile?: ISellerProfile;

  // ==================== Buyer/Student Fields ====================
  enrolledCourses?: Types.ObjectId[];   // Courses enrolled
  completedCourses?: Types.ObjectId[];  // Courses completed
  certificates?: Types.ObjectId[];      // Earned certificates
  purchasedProducts?: Types.ObjectId[]; // Products purchased

  // Statistics - Auto updated
  totalPurchases: number;
  totalSpent: number;
  totalCoursesEnrolled: number;         // Total courses enrolled
  totalCoursesCompleted: number;        // Total courses completed

  // Password reset fields
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  passwordChangedAt?: Date;

  // Timestamps
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * IUserMethods - Instance Methods
 * User document এর উপর যে methods call করা যাবে
 */
export interface IUserMethods {
  // Password compare করার জন্য method
  comparePassword(candidatePassword: string): Promise<boolean>;

  // JWT token তৈরি করার পর password change হয়েছে কিনা check
  isPasswordChangedAfterJwtIssued(jwtTimestamp: number): boolean;
}

/**
 * UserModel - Static Methods
 * User.method() এভাবে call করা যাবে এমন methods
 */
export interface UserModel extends Model<IUser, object, IUserMethods> {
  // Email দিয়ে user খুঁজে বের করা (password সহ)
  findByEmail(email: string): Promise<IUser & IUserMethods>;

  // User exist করে কিনা check
  isUserExists(email: string): Promise<boolean>;
}

/**
 * IUserFilters - Query Filters
 * User list filter করার জন্য
 */
export interface IUserFilters {
  searchTerm?: string;
  email?: string;
  role?: TUserRole;
  status?: TUserStatus;
}
