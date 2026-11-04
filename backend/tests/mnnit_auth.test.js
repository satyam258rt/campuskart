const request = require('supertest');
const app = require('../src/app');
const config = require('../src/config/env');
const User = require('../src/models/User');

require('./setup');

describe('Strict MNNIT Email Verification (@mnnit.ac.in)', () => {
  beforeAll(() => {
    // Force strict campus verification and set allowed domain exclusively to mnnit.ac.in
    config.campusEmail.required = true;
    config.campusEmail.allowedDomains = ['mnnit.ac.in'];
  });

  const validMnnitStudent = {
    name: 'Satyam',
    email: 'satyam.2026is22@mnnit.ac.in',
    password: 'Password123',
    phone: '+919876543210',
    campus: {
      university: 'Motilal Nehru National Institute of Technology (MNNIT) Allahabad',
      campusName: 'MNNIT Prayagraj',
      studentId: '2026IS22',
      department: 'Information Security / CSE',
      hostelOrAddress: 'SVBH Hostel'
    }
  };

  it('should successfully register and login with satyam.2026is22@mnnit.ac.in', async () => {
    // 1. Register Satyam
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send(validMnnitStudent);

    expect(regRes.status).toBe(201);
    expect(regRes.body.success).toBe(true);
    expect(regRes.body.data.user.email).toBe('satyam.2026is22@mnnit.ac.in');
    expect(regRes.body.data.user.name).toBe('Satyam');
    expect(regRes.body.data.token).toBeDefined();

    // 2. Login with Satyam
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'satyam.2026is22@mnnit.ac.in',
        password: 'Password123'
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.data.token).toBeDefined();
    expect(loginRes.body.data.user.email).toBe('satyam.2026is22@mnnit.ac.in');
  });

  it('should REJECT registration with gmail.com domain', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        ...validMnnitStudent,
        email: 'satyam.external@gmail.com',
        campus: { ...validMnnitStudent.campus, studentId: '2026IS99' }
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Access restricted: Only inside-campus students are permitted');
    expect(res.body.message).toContain('@mnnit.ac.in');
  });

  it('should REJECT registration with another college domain (e.g. campus.edu)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        ...validMnnitStudent,
        email: 'other.student@campus.edu',
        campus: { ...validMnnitStudent.campus, studentId: 'OTHER001' }
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Access restricted: Only inside-campus students are permitted');
    expect(res.body.message).toContain('@mnnit.ac.in');
  });

  it('should REJECT login attempt with non-mnnit domain even if user somehow existed in db', async () => {
    // Force create a user with non-mnnit email directly in db
    await User.create({
      name: 'External Person',
      email: 'external@gmail.com',
      password: 'Password123',
      status: 'active',
      isEmailVerified: true
    });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'external@gmail.com',
        password: 'Password123'
      });

    expect(loginRes.status).toBe(401);
    expect(loginRes.body.success).toBe(false);
    expect(loginRes.body.message).toContain('Access Denied');
    expect(loginRes.body.message).toContain('@mnnit.ac.in');
  });
});
