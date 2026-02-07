import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    logger.error('Error:', err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map((e: any) => e.message);
        res.status(400).json({
            status: 'error',
            message: 'Validation failed',
            errors,
        });
        return;
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        res.status(400).json({
            status: 'error',
            message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
        });
        return;
    }

    // Mongoose cast error
    if (err.name === 'CastError') {
        res.status(400).json({
            status: 'error',
            message: 'Invalid ID format',
        });
        return;
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        res.status(401).json({
            status: 'error',
            message: 'Invalid token',
        });
        return;
    }

    if (err.name === 'TokenExpiredError') {
        res.status(401).json({
            status: 'error',
            message: 'Token expired',
        });
        return;
    }

    // Default error
    res.status(err.statusCode || 500).json({
        status: 'error',
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
