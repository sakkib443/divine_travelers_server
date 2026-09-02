// ===================================================================
// Divine Travelers - Home Content Interface
// হোম পেজের প্রতিটি সেকশনের content admin dashboard থেকে manage হবে
// ===================================================================

import { Document, Model } from 'mongoose';

// Bilingual text helper
export interface IBilingualText {
    en: string;
    bn: string;
}

// Hero Section
export interface IHeroData {
    badgeText: IBilingualText;
    heading: IBilingualText;
    ctaButton1Text: IBilingualText;
    ctaButton1Link: string;
    ctaButton2Text: IBilingualText;
    ctaButton2Link: string;
    videoUrl: string;
    isActive: boolean;
}

// Service Item
export interface IServiceItem {
    title: IBilingualText;
    subtitle: IBilingualText;
    description: IBilingualText;
    icon: string;
    image: string;
    color: string;
    stats: IBilingualText;
    href: string;
    order: number;
    isActive: boolean;
}

// Services Section
export interface IServicesData {
    tagText: IBilingualText;
    heading: IBilingualText;
    headingHighlight: IBilingualText;
    description: IBilingualText;
    items: IServiceItem[];
    bottomCTAText: IBilingualText;
    bottomCTALink: string;
    isActive: boolean;
}

// Consultation Section
export interface IConsultationData {
    tagText: IBilingualText;
    heading: IBilingualText;
    headingHighlight: IBilingualText;
    headingEnd: IBilingualText;
    description: IBilingualText;
    experienceTitle: IBilingualText;
    experienceDesc: IBilingualText;
    experienceImage: string;
    mainImage1: string;
    mainImage2: string;
    ctaText: IBilingualText;
    ctaLink: string;
    agentCount: string;
    agentLabel: IBilingualText;
    isActive: boolean;
}

// Why Choose Us Card
export interface IWhyChooseCard {
    title: IBilingualText;
    description: IBilingualText;
    icon: string;
    color: string;
    order: number;
}

// Stat Item
export interface IStatItem {
    value: string;
    label: IBilingualText;
    color: string;
    order: number;
}

// Why Choose Us Section
export interface IWhyChooseData {
    tagText: IBilingualText;
    heading: IBilingualText;
    headingHighlight: IBilingualText;
    description: IBilingualText;
    cards: IWhyChooseCard[];
    stats: IStatItem[];
    isActive: boolean;
}

// Notice Board Item
export interface INoticeItem {
    en: string;
    bn: string;
}

// Notice Board Section
export interface INoticeBoardData {
    isActive: boolean;
    notices: INoticeItem[];
}

// Section types
export type SectionName = 'hero' | 'services' | 'consultation' | 'whyChooseUs' | 'noticeBoard';

// Main document
export interface IHomeContent extends Document {
    section: SectionName;
    data: IHeroData | IServicesData | IConsultationData | IWhyChooseData | INoticeBoardData;
    createdAt: Date;
    updatedAt: Date;
}

export type HomeContentModel = Model<IHomeContent>;
