import { Response } from 'express';
import { validationResult } from 'express-validator';
import { User } from '../models/user.model';
import { AuthRequest } from '../middleware/auth.middleware';

// @desc    Get user profile
// @route   GET /api/v1/profile/me
// @access  Private
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                status: 'error',
                message: 'Not authorized',
            });
            return;
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            res.status(404).json({
                status: 'error',
                message: 'User not found',
            });
            return;
        }

        res.status(200).json({
            status: 'success',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    bio: user.bio,
                    phone: user.phone,
                    location: user.location,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                },
            },
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Error fetching profile',
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/v1/profile/me
// @access  Private
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: errors.array().map(err => err.msg),
            });
            return;
        }

        if (!req.user) {
            res.status(401).json({
                status: 'error',
                message: 'Not authorized',
            });
            return;
        }

        const { name, bio, phone, location, avatar } = req.body;

        // Build update object
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (bio !== undefined) updateData.bio = bio;
        if (phone !== undefined) updateData.phone = phone;
        if (location !== undefined) updateData.location = location;
        if (avatar !== undefined) updateData.avatar = avatar;

        // Update user
        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!user) {
            res.status(404).json({
                status: 'error',
                message: 'User not found',
            });
            return;
        }

        res.status(200).json({
            status: 'success',
            message: 'Profile updated successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    bio: user.bio,
                    phone: user.phone,
                    location: user.location,
                    updatedAt: user.updatedAt,
                },
            },
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Error updating profile',
        });
    }
};
