import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Team } from '../models/team.model';
import { User } from '../models/user.model';
import crypto from 'crypto';

// @desc    Get my team (or create if none exists)
// @route   GET /api/v1/teams/mine
// @access  Private
export const getMyTeam = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ status: 'error', message: 'Not authorized' });
            return;
        }

        // Find team where user is owner OR member
        let team = await Team.findOne({
            $or: [{ ownerId: req.user._id }, { members: req.user._id }]
        }).populate('members', 'name email avatar').populate('ownerId', 'name email');

        // If no team exists, create a default one for the owner
        if (!team) {
            team = await Team.create({
                name: `${req.user.name}'s Team`,
                ownerId: req.user._id,
                members: [req.user._id], // Owner is automatically a member
            });
            // Re-fetch to populate
            team = await Team.findById(team._id)
                .populate('members', 'name email avatar')
                .populate('ownerId', 'name email');
        }

        res.status(200).json({
            status: 'success',
            data: { team },
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// @desc    Invite member to team
// @route   POST /api/v1/teams/invite
// @access  Private
export const inviteMember = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ status: 'error', message: 'Not authorized' });
            return;
        }

        const { email } = req.body;
        if (!email) {
            res.status(400).json({ status: 'error', message: 'Email is required' });
            return;
        }

        const team = await Team.findOne({ ownerId: req.user._id });
        if (!team) {
            res.status(404).json({ status: 'error', message: 'Team not found' });
            return;
        }

        // Generate invite token
        const token = crypto.randomBytes(20).toString('hex');
        const inviteLink = `http://localhost:3000/join-team/${token}`;

        // Add to invitations list
        team.invitations.push({
            email,
            token,
            status: 'pending',
            createdAt: new Date(),
        });

        await team.save();

        // In a real app, send email here using NodeMailer/Resend
        // For now, return the link for the frontend to display/copy
        res.status(200).json({
            status: 'success',
            message: 'Invitation created',
            data: {
                inviteLink,
                token
            }
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
