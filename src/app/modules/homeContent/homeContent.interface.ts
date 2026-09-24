// ===================================================================
// Divine Travellers - Home Content Interface
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
    id: string;
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

// About Section
export interface IAboutFeature {
    icon: string;
    value: string;
    title: IBilingualText;
    subtitle: IBilingualText;
    order: number;
}

export interface IAboutData {
    heading: IBilingualText;
    description: IBilingualText;
    image1: string;
    image2: string;
    features: IAboutFeature[];
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

// ─── About page sections ─────────────────────────────────────────────
// Each About-page block is its own section document so an admin can edit
// (and hide) them independently, exactly like the homepage sections.

// Founder / owner message
export interface IAboutFounderData {
    eyebrow: IBilingualText;
    heading: IBilingualText;
    name: IBilingualText;
    title: IBilingualText;
    photo: string;
    message: IBilingualText;
    isActive: boolean;
}

// One team member card
export interface ITeamMember {
    name: IBilingualText;
    role: IBilingualText;
    photo: string;
    order: number;
}

export interface IAboutTeamData {
    eyebrow: IBilingualText;
    heading: IBilingualText;
    description: IBilingualText;
    members: ITeamMember[];
    isActive: boolean;
}

// "Why choose us" value card (About page)
export interface IAboutValueCard {
    icon: string;
    title: IBilingualText;
    description: IBilingualText;
    order: number;
}

export interface IAboutWhyData {
    eyebrow: IBilingualText;
    heading: IBilingualText;
    description: IBilingualText;
    cards: IAboutValueCard[];
    isActive: boolean;
}

// Closing call-to-action band
export interface IAboutCtaData {
    heading: IBilingualText;
    description: IBilingualText;
    button1Text: IBilingualText;
    button1Link: string;
    button2Text: IBilingualText;
    button2Link: string;
    isActive: boolean;
}

// Section types
export type SectionName =
    | 'hero'
    | 'services'
    | 'about'
    | 'whyChooseUs'
    | 'noticeBoard'
    // About page
    | 'aboutFounder'
    | 'aboutTeam'
    | 'aboutWhy'
    | 'aboutCta';

// Main document
export interface IHomeContent extends Document {
    section: SectionName;
    data:
        | IHeroData
        | IServicesData
        | IAboutData
        | IWhyChooseData
        | INoticeBoardData
        | IAboutFounderData
        | IAboutTeamData
        | IAboutWhyData
        | IAboutCtaData;
    createdAt: Date;
    updatedAt: Date;
}

export type HomeContentModel = Model<IHomeContent>;
