import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/user.model';
import { Task } from '../models/task.model';
import { logger } from '../utils/logger';

dotenv.config();

const seedData = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/auth-dashboard';
        await mongoose.connect(mongoUri);
        logger.info('✅ MongoDB connected');

        // Clear existing data
        await User.deleteMany({});
        await Task.deleteMany({});
        logger.info('🗑️  Cleared existing data');

        // Create demo users
        const demoUsers = [
            {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'Password123',
                bio: 'Full-stack developer passionate about building great products',
                phone: '+1234567890',
                location: 'San Francisco, CA',
            },
            {
                name: 'Jane Smith',
                email: 'jane@example.com',
                password: 'Password123',
                bio: 'Product manager with 5 years of experience',
                phone: '+0987654321',
                location: 'New York, NY',
            },
        ];

        const users = await User.create(demoUsers);
        logger.info(`✅ Created ${users.length} demo users`);

        // Create demo tasks for first user
        const demoTasks = [
            {
                title: 'Complete project documentation',
                description: 'Write comprehensive documentation for the new API endpoints',
                status: 'in-progress',
                priority: 'high',
                userId: users[0]._id,
                tags: ['documentation', 'api'],
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            },
            {
                title: 'Review pull requests',
                description: 'Review and merge pending pull requests from team members',
                status: 'pending',
                priority: 'medium',
                userId: users[0]._id,
                tags: ['code-review', 'teamwork'],
                dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
            },
            {
                title: 'Update dependencies',
                description: 'Update all npm packages to their latest versions',
                status: 'completed',
                priority: 'low',
                userId: users[0]._id,
                tags: ['maintenance'],
            },
            {
                title: 'Design new landing page',
                description: 'Create mockups for the new marketing landing page',
                status: 'pending',
                priority: 'high',
                userId: users[0]._id,
                tags: ['design', 'marketing'],
                dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
            },
            {
                title: 'Fix authentication bug',
                description: 'Investigate and fix the JWT token expiration issue',
                status: 'in-progress',
                priority: 'high',
                userId: users[0]._id,
                tags: ['bug', 'security'],
            },
        ];

        const tasks = await Task.create(demoTasks);
        logger.info(`✅ Created ${tasks.length} demo tasks`);

        logger.info('\n📋 Demo Credentials:');
        logger.info('Email: john@example.com | Password: Password123');
        logger.info('Email: jane@example.com | Password: Password123');

        process.exit(0);
    } catch (error) {
        logger.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedData();
