import { Response } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { AuthRequest } from '../middleware/auth.middleware';

// Generate Access Token (15m)
const generateAccessToken = (id: string): string => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback-secret', {
        expiresIn: '15m',
    });
};

// Generate Refresh Token (7d)
const generateRefreshToken = (id: string): string => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback-secret', {
        expiresIn: '7d',
    });
};

// @desc    Register new user
// @route   POST /api/v1/auth/signup
// @access  Public
export const signup = async (req: AuthRequest, res: Response): Promise<void> => {
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

        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({
                status: 'error',
                message: 'Email already registered',
            });
            return;
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
        });

        // Generate tokens
        const accessToken = generateAccessToken(user._id.toString());
        const refreshToken = generateRefreshToken(user._id.toString());

        // Save refresh token
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        res.status(201).json({
            status: 'success',
            message: 'User registered successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    createdAt: user.createdAt,
                },
                accessToken,
                refreshToken,
            },
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Error creating user',
        });
    }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req: AuthRequest, res: Response): Promise<void> => {
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

        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            res.status(401).json({
                status: 'error',
                message: 'Invalid email or password',
            });
            return;
        }

        // Check password
        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
            res.status(401).json({
                status: 'error',
                message: 'Invalid email or password',
            });
            return;
        }

        // Generate tokens
        const accessToken = generateAccessToken(user._id.toString());
        const refreshToken = generateRefreshToken(user._id.toString());

        // Save refresh token
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            status: 'success',
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    bio: user.bio,
                    phone: user.phone,
                    location: user.location,
                },
                accessToken,
                refreshToken,
            },
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Error logging in',
        });
    }
};

// @desc    Refresh Access Token
// @route   POST /api/v1/auth/refresh-token
// @access  Public
export const refreshToken = async (req: AuthRequest, res: Response): Promise<void> => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        res.status(401).json({ status: 'error', message: 'Refresh token required' });
        return;
    }

    try {
        // Verify token
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'fallback-secret') as { id: string };

        // Find user and check if refresh token matches
        const user = await User.findById(decoded.id).select('+refreshToken');

        if (!user || user.refreshToken !== refreshToken) {
            res.status(403).json({ status: 'error', message: 'Invalid refresh token' });
            return;
        }

        // Generate new access token
        const accessToken = generateAccessToken(user._id.toString());

        res.status(200).json({
            status: 'success',
            data: {
                accessToken,
            },
        });
    } catch (error: any) {
        res.status(403).json({
            status: 'error',
            message: 'Invalid refresh token',
        });
    }
};

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private (Optional)
export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (req.user) {
            // Nullify refresh token in DB
            await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
        }
        res.status(200).json({
            status: 'success',
            message: 'Logged out successfully',
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: 'Error logging out',
        });
    }
};

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                status: 'error',
                message: 'Not authorized',
            });
            return;
        }

        res.status(200).json({
            status: 'success',
            data: {
                user: {
                    id: req.user._id,
                    name: req.user.name,
                    email: req.user.email,
                    avatar: req.user.avatar,
                    bio: req.user.bio,
                    phone: req.user.phone,
                    location: req.user.location,
                    createdAt: req.user.createdAt,
                },
            },
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Error fetching user',
        });
    }
};
