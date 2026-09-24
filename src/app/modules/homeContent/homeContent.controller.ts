// ===================================================================
// Divine Travellers - Home Content Controller
// ===================================================================

import { Request, Response, NextFunction } from 'express';
import { HomeContentService, HOME_CONTENT_DEFAULTS } from './homeContent.service';
import { SectionName } from './homeContent.interface';

// Derived from the DEFAULTS keys so a newly-added section is accepted
// automatically — this list can never drift out of sync with the sections
// that actually exist (which is what silently rejected the About-page ones).
const VALID_SECTIONS = Object.keys(HOME_CONTENT_DEFAULTS) as SectionName[];

const getAllSections = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await HomeContentService.getAllSections();
        res.status(200).json({
            success: true,
            message: 'Home content retrieved successfully',
            data,
        });
    } catch (err) {
        next(err);
    }
};

const getSection = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const section = req.params.section as SectionName;
        if (!VALID_SECTIONS.includes(section)) {
            return res.status(400).json({
                success: false,
                message: `Invalid section. Must be one of: ${VALID_SECTIONS.join(', ')}`,
            });
        }
        const data = await HomeContentService.getSection(section);
        res.status(200).json({
            success: true,
            message: `${section} content retrieved successfully`,
            data,
        });
    } catch (err) {
        next(err);
    }
};

const updateSection = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const section = req.params.section as SectionName;
        if (!VALID_SECTIONS.includes(section)) {
            return res.status(400).json({
                success: false,
                message: `Invalid section. Must be one of: ${VALID_SECTIONS.join(', ')}`,
            });
        }
        const data = await HomeContentService.updateSection(section, req.body);
        res.status(200).json({
            success: true,
            message: `${section} content updated successfully`,
            data,
        });
    } catch (err) {
        next(err);
    }
};

const seedDefaults = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await HomeContentService.seedDefaults();
        res.status(200).json({
            success: true,
            message: 'Home content seeded successfully',
            data,
        });
    } catch (err) {
        next(err);
    }
};

export const HomeContentController = {
    getAllSections,
    getSection,
    updateSection,
    seedDefaults,
};
