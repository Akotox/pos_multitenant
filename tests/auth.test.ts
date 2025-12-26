import request from 'supertest';
import app from '../src/index';

describe('Auth Endpoints', () => {
    const uniqueId = Date.now();
    const testTenant = {
        name: `Test Tenant ${uniqueId}`,
        companyName: `Test Company ${uniqueId}`,
        email: `test${uniqueId}@example.com`,
        phone: `1234567890${uniqueId % 10}`,
        password: 'password123',
        address: '123 Test St'
    };

    let tenantId: string;
    let token: string;

    it('should register a new tenant', async () => {
        const res = await request(app)
            .post('/api/v1/auth/register')
            .send(testTenant);

        if (res.status !== 201) {
            console.error('Registration failed:', res.body);
        }
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('user');

        tenantId = res.body.user.tenantId;
    });

    it('should login with the registered user', async () => {
        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: testTenant.email,
                password: testTenant.password
            });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        token = res.body.token;
    });

    it('should fail login with wrong password', async () => {
        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: testTenant.email,
                password: 'wrongpassword'
            });

        expect(res.status).toBe(400); // Back to 400 if that's what the middleware returns, or Check status
    });
});
