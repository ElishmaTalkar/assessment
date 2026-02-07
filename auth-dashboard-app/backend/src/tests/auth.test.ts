import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server';
import { User } from '../models/user.model';

// Jest timeout to handle DB operations
jest.setTimeout(30000);

describe('Auth API', () => {
    beforeEach(async () => {
        await User.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('POST /api/v1/auth/signup', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/api/v1/auth/signup')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'Password123'
                });
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('status', 'success');
            expect(res.body.data).toHaveProperty('accessToken');
            expect(res.body.data).toHaveProperty('refreshToken');
        });

        it('should not register user with existing email', async () => {
            await request(app)
                .post('/api/v1/auth/signup')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'Password123'
                });

            const res = await request(app)
                .post('/api/v1/auth/signup')
                .send({
                    name: 'Test User 2',
                    email: 'test@example.com',
                    password: 'Password123'
                });
            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toContain('Email already registered');
        });
    });

    describe('POST /api/v1/auth/login', () => {
        beforeEach(async () => {
            await request(app)
                .post('/api/v1/auth/signup')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'Password123'
                });
        });

        it('should login with correct credentials', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'Password123'
                });
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('status', 'success');
            expect(res.body.data).toHaveProperty('accessToken');
        });

        it('should not login with incorrect password', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'WrongPassword'
                });
            expect(res.statusCode).toEqual(401);
        });
    });
});
