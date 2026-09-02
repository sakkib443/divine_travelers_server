// ===================================================================
// Divine Travelers - User Model
// MongoDB User Schema with Mongoose - Seller Permissions Enabled
// ===================================================================

import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import config from '../../config';
import { IUser, IUserMethods, UserModel } from './user.interface';

/**
 * Seller Permissions Schema
 * Admin থেকে control হবে - প্রতিটি seller এর কি কি feature available
 */
const sellerPermissionsSchema = new Schema(
  {
    // Product Types - কি কি বিক্রি করতে পারবে
    canSellWebTemplates: { type: Boolean, default: false },
    canSellGraphics: { type: Boolean, default: false },
    canSellVideoTemplates: { type: Boolean, default: false },
    canSellUIKits: { type: Boolean, default: false },
    canSellAppTemplates: { type: Boolean, default: false },
    canSellSoftware: { type: Boolean, default: false },
    canSellCourses: { type: Boolean, default: false },
    canSellAudio: { type: Boolean, default: false },
    canSellPhotos: { type: Boolean, default: false },
    canSellFonts: { type: Boolean, default: false },

    // Advanced Features
    canCreateBundles: { type: Boolean, default: false },
    canRunSales: { type: Boolean, default: false },
    canViewAnalytics: { type: Boolean, default: true },
    canWithdrawEarnings: { type: Boolean, default: true },
    canAccessAPI: { type: Boolean, default: false },
  },
  { _id: false }
);

/**
 * Seller Profile Schema
 * Only for users with role = 'seller'
 */
const sellerProfileSchema = new Schema(
  {
    storeName: {
      type: String,
      required: true,
      maxlength: [100, 'Store name cannot exceed 100 characters'],
    },
    storeSlug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    storeDescription: {
      type: String,
      maxlength: [1000, 'Store description cannot exceed 1000 characters'],
      default: '',
    },
    storeLogo: {
      type: String,
      default: '',
    },
    storeBanner: {
      type: String,
      default: '',
    },

    // Verification & Status
    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date },

    // Statistics (auto-updated)
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalSales: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    totalProducts: { type: Number, default: 0 },
    totalCourses: { type: Number, default: 0 },

    // Commission & Payout
    commissionRate: { type: Number, default: 20, min: 0, max: 100 }, // 20% default
    pendingEarnings: { type: Number, default: 0 },
    withdrawnEarnings: { type: Number, default: 0 },

    // Permissions (Admin controlled)
    permissions: {
      type: sellerPermissionsSchema,
      default: () => ({}),
    },

    // Payout Information
    payoutMethod: {
      type: String,
      enum: ['bkash', 'nagad', 'bank', 'paypal', ''],
      default: '',
    },
    payoutDetails: {
      accountNumber: { type: String, default: '' },
      accountName: { type: String, default: '' },
      bankName: { type: String, default: '' },
      branchName: { type: String, default: '' },
      routingNumber: { type: String, default: '' },
    },
  },
  { _id: false }
);

/**
 * User Schema Definition
 * User collection এর structure এখানে define করা হয়েছে
 */
const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    // ==================== Basic Info ====================
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Password default এ query result এ আসবে না
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },

    // ==================== Extended Profile Fields ====================
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },
    address: {
      type: String,
      maxlength: [200, 'Address cannot exceed 200 characters'],
      default: '',
    },
    city: {
      type: String,
      maxlength: [100, 'City cannot exceed 100 characters'],
      default: '',
    },
    country: {
      type: String,
      maxlength: [100, 'Country cannot exceed 100 characters'],
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    company: {
      type: String,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
      default: '',
    },
    jobTitle: {
      type: String,
      maxlength: [100, 'Job title cannot exceed 100 characters'],
      default: '',
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: {
        values: ['male', 'female', 'other', ''],
        message: '{VALUE} is not a valid gender',
      },
      default: '',
    },
    socialLinks: {
      facebook: { type: String, default: '' },
      twitter: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      github: { type: String, default: '' },
      instagram: { type: String, default: '' },
      youtube: { type: String, default: '' },
      dribbble: { type: String, default: '' },
      behance: { type: String, default: '' },
    },
    skills: {
      type: [String],
      default: [],
    },
    languages: {
      type: [String],
      default: [],
    },

    // ==================== Role & Status ====================
    role: {
      type: String,
      enum: {
        values: ['admin'],
        message: '{VALUE} is not a valid role',
      },
      default: 'admin',
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'blocked', 'pending'],
        message: '{VALUE} is not a valid status',
      },
      default: 'pending',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },

    // ==================== Seller Profile ====================
    sellerProfile: {
      type: sellerProfileSchema,
      default: null,
    },

    // ==================== Statistics ====================
    totalPurchases: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    totalCoursesEnrolled: {
      type: Number,
      default: 0,
    },
    totalCoursesCompleted: {
      type: Number,
      default: 0,
    },

    // ==================== Buyer/Student Specific ====================
    enrolledCourses: [{
      type: Schema.Types.ObjectId,
      ref: 'Course',
    }],
    completedCourses: [{
      type: Schema.Types.ObjectId,
      ref: 'Course',
    }],
    certificates: [{
      type: Schema.Types.ObjectId,
      ref: 'Certificate',
    }],
    purchasedProducts: [{
      type: Schema.Types.ObjectId,
      ref: 'Product',
    }],

    // ==================== Password Reset ====================
    passwordResetToken: String,
    passwordResetExpires: Date,
    passwordChangedAt: Date,

    // ==================== Activity ====================
    lastLoginAt: Date,
  },
  {
    timestamps: true, // createdAt, updatedAt auto add হবে
    toJSON: {
      virtuals: true,
      transform: function (doc, ret: Record<string, unknown>) {
        delete ret.password; // JSON এ password থাকবে না
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ==================== Indexes ====================
// Search performance বাড়ানোর জন্য indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ 'sellerProfile.storeSlug': 1 }, { sparse: true });
userSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });

// ==================== Virtual Fields ====================
// fullName virtual field - firstName + lastName
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// ==================== Pre-Save Middleware ====================
// Password hash করা save এর আগে
userSchema.pre('save', async function (next) {
  // Password modify হলেই hash করবো
  if (!this.isModified('password')) {
    return next();
  }

  // Password hash করা
  this.password = await bcrypt.hash(this.password, config.bcrypt_salt_rounds);

  // Password change time update
  if (!this.isNew) {
    this.passwordChangedAt = new Date(Date.now() - 1000);
  }

  next();
});

// Deleted users কে query থেকে বাদ দেওয়া
userSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

userSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

// ==================== Instance Methods ====================
// Password compare করার method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// JWT issue এর পর password change হয়েছে কিনা
userSchema.methods.isPasswordChangedAfterJwtIssued = function (
  jwtTimestamp: number
): boolean {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(
      this.passwordChangedAt.getTime() / 1000
    );
    return jwtTimestamp < changedTimestamp;
  }
  return false;
};

// ==================== Static Methods ====================
// Email দিয়ে user খুঁজে বের করা (password সহ)
userSchema.statics.findByEmail = async function (email: string) {
  return await this.findOne({ email }).select('+password');
};

// User exist করে কিনা
userSchema.statics.isUserExists = async function (email: string) {
  const user = await this.findOne({ email });
  return !!user;
};

// ==================== Export Model ====================
export const User = model<IUser, UserModel>('User', userSchema);
