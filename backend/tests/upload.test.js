const request = require('supertest');
const app = require('../src/app');

require('./setup');

describe('Direct Photo Upload API (/api/v1/upload)', () => {
  let userToken;

  beforeEach(async () => {
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Satyam',
        email: 'satyam.2026is22@mnnit.ac.in',
        password: 'Password123',
        phone: '+919876543210',
        campus: {
          university: 'Motilal Nehru National Institute of Technology (MNNIT) Allahabad',
          studentId: '2026IS22'
        }
      });
    userToken = regRes.body.data.token;
  });

  it('should accept direct base64 photos and return saved static URLs', async () => {
    // 1x1 transparent png in base64
    const sampleBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const res = await request(app)
      .post('/api/v1/upload')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        images: [
          { data: sampleBase64, isCover: true },
          { data: sampleBase64, isCover: false }
        ]
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.images).toHaveLength(2);
    expect(res.body.data.images[0].url).toContain('/uploads/');
    expect(res.body.data.images[0].isCover).toBe(true);
    expect(res.body.data.images[1].isCover).toBe(false);
  });

  it('should reject unauthenticated upload requests', async () => {
    const res = await request(app)
      .post('/api/v1/upload')
      .send({
        images: ['data:image/png;base64,...']
      });

    expect(res.status).toBe(401);
  });
});
