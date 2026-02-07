import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/user.model';

export interface AuthRequest extends Request {
    user?: IUser;
}

export const protect = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        let token: string | undefined;

        // Check for token in Authorization header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            res.status(401).json({
                status: 'error',
                message: 'Not authorized. Please login to access this resource.',
            });
            return;
        }

        try {
            // Verify token
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || 'fallback-secret'
            ) as { id: string };

            // Get user from token
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                res.status(401).json({
                    status: 'error',
                    message: 'User no longer exists.',
                });
                return;
            }

            req.user = user;
            next();
        } catch (error) {
            res.status(401).json({
                status: 'error',
                message: 'Invalid or expired token. Please login again.',
            });
            return;
        }
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Authentication error',
        });
    }
};
