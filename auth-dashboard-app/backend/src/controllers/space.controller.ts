import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Space } from '../models/space.model';
import { User } from '../models/user.model';
import crypto from 'crypto';

// @desc    Create a new space
// @route   POST /api/v1/spaces
// @access  Private
export const createSpace = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        console.log('Creating space, user:', req.user?._id); // DEBUG
        if (!req.user) {
            console.log('User not authorized for create space'); // DEBUG
            res.status(401).json({ status: 'error', message: 'Not authorized' });
            return;
        }

        const { name, description } = req.body;
        console.log('Space data:', { name, description }); // DEBUG

        const space = await Space.create({
            name,
            description,
            owner: req.user._id,
            members: [req.user._id], // Owner is automatically a member
        });

        console.log('Space created:', space._id); // DEBUG

        // Set as current space for the user
        await User.findByIdAndUpdate(req.user._id, { currentSpace: space._id });

        res.status(201).json({
            status: 'success',
            data: { space },
        });
    } catch (error: any) {
        console.error('Error creating space:', error); // DEBUG
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// @desc    Get all spaces for the user
// @route   GET /api/v1/spaces
// @access  Private
export const getMySpaces = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ status: 'error', message: 'Not authorized' });
            return;
        }

        const spaces = await Space.find({ members: req.user._id });

        res.status(200).json({
            status: 'success',
            results: spaces.length,
            data: { spaces },
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// @desc    Get single space
// @route   GET /api/v1/spaces/:id
// @access  Private
export const getSpace = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ status: 'error', message: 'Not authorized' });
            return;
        }

        const space = await Space.findOne({ _id: req.params.id, members: req.user._id })
            .populate('owner', 'name email avatar')
            .populate('members', 'name email avatar');

        if (!space) {
            res.status(404).json({ status: 'error', message: 'Space not found' });
            return;
        }

        res.status(200).json({
            status: 'success',
            data: { space },
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// @desc    Switch current space
// @route   POST /api/v1/spaces/switch
// @access  Private
export const switchSpace = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ status: 'error', message: 'Not authorized' });
            return;
        }

        const { spaceId } = req.body;

        // Verify user is member of this space
        const space = await Space.findOne({ _id: spaceId, members: req.user._id });
        if (!space) {
            res.status(404).json({ status: 'error', message: 'Space not found or not a member' });
            return;
        }

        // Update user's current space
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { currentSpace: space._id },
            { new: true }
        );

        res.status(200).json({
            status: 'success',
            data: { user },
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// @desc    Invite member to space
// @route   POST /api/v1/spaces/:id/invite
// @access  Private
export const inviteToSpace = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ status: 'error', message: 'Not authorized' });
            return;
        }

        const { email } = req.body;
        const spaceId = req.params.id;

        const space = await Space.findOne({ _id: spaceId, members: req.user._id });
        if (!space) {
            res.status(404).json({ status: 'error', message: 'Space not found' });
            return;
        }

        // Generate invite link (mock)
        const token = crypto.randomBytes(20).toString('hex');
        const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/join-space?token=${token}&spaceId=${space._id}`;

        res.status(200).json({
            status: 'success',
            data: {
                inviteLink,
                message: `Invite link generated for ${email}`
            },
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// @desc    Update space
// @route   PUT /api/v1/spaces/:id
// @access  Private
export const updateSpace = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, description, statuses } = req.body;
        const space = await Space.findOneAndUpdate(
            { _id: req.params.id, owner: req.user!._id },
            { name, description, statuses },
            { new: true }
        );

        if (!space) {
            res.status(404).json({ status: 'error', message: 'Space not found or unauthorized' });
            return;
        }

        res.status(200).json({ status: 'success', data: { space } });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// @desc    Delete space
// @route   DELETE /api/v1/spaces/:id
// @access  Private
export const deleteSpace = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        console.log('Deleting space:', req.params.id, 'User:', req.user?._id); // DEBUG
        const space = await Space.findOneAndDelete({ _id: req.params.id, owner: req.user!._id });

        if (!space) {
            console.log('Delete failed: Space not found or unauthorized'); // DEBUG
            res.status(404).json({ status: 'error', message: 'Space not found or unauthorized' });
            return;
        }

        console.log('Space deleted successfully'); // DEBUG
        res.status(200).json({ status: 'success', message: 'Space deleted' });
    } catch (error: any) {
        console.error('Delete space error:', error); // DEBUG
        res.status(500).json({ status: 'error', message: error.message });
    }
};
