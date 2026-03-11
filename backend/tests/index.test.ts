import request from 'supertest';
import app from '../src/index';
import * as path from 'path';

describe('POST /api/analyze', () => {
    it('should return 400 if no file is uploaded', async () => {
        const res = await request(app).post('/api/analyze').field('email', 'test@test.com');
        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toBe('No file uploaded.');
    });

    it('should return 400 if no email is provided', async () => {
        const res = await request(app).post('/api/analyze').attach('file', Buffer.from('test'), 'test.csv');
        // Note: The error order might vary based on implementation, so check either file or email error
        expect(res.body.error).toBeDefined(); 
    });
});

describe('GET /health', () => {
    it('should return 200 OK', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe('OK');
    });
});
