import { Request, Response } from 'express';
import { PersonalEntry } from '../models/personal-entry.model';
import { AuthRequest } from '../middleware/auth.middleware';

export const createEntry = async (req: AuthRequest, res: Response) => {
    try {
        const { category, subType, content, data, tags, isPinned } = req.body;
        const userId = req.user?._id;

        const entry = new PersonalEntry({
            userId,
            category,
            subType,
            content,
            data,
            tags,
            isPinned
        });

        await entry.save();

        res.status(201).json({
            success: true,
            data: entry
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating entry',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const getEntries = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        const { category } = req.query;

        const filter: any = { userId };
        if (category) {
            filter.category = category;
        }

        const entries = await PersonalEntry.find(filter).sort({ isPinned: -1, createdAt: -1 });

        res.status(200).json({
            success: true,
            data: entries
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching entries',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const updateEntry = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const userId = req.user?._id;

        const entry = await PersonalEntry.findOneAndUpdate(
            { _id: id, userId },
            updateData,
            { new: true, runValidators: true }
        );

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'Entry not found'
            });
        }

        res.status(200).json({
            success: true,
            data: entry
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating entry',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const deleteEntry = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id;

        const entry = await PersonalEntry.findOneAndDelete({ _id: id, userId });

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'Entry not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Entry deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting entry',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
