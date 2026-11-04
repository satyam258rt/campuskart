const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');

require('./setup');

describe('CampusKart Authentication Module', () => {
  const testStudent = {
    name: 'Aarav Sharma',
    email: 'aarav.2026is01@mnnit.ac.in',
    password: 'Password123',
    phone: '+919876543210',
    campus: {
      university: 'Apex Institute of Technology',
      campusName: 'Main Campus',
      studentId: 'AIT-2024-CS042',
      department: 'Computer Science & Engineering',
      hostelOrAddress: 'Hostel Block B, Room 204'
    }
  };

  describe('POST /api/v1/auth/register', () => {
    it('should register a new campus student successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testStudent);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe(testStudent.email);
      expect(res.body.data.user.name).toBe(testStudent.name);
      expect(res.body.data.user.roles).toContain('student');
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.password).toBeUndefined(); // Password must not be returned
    });

    it('should reject registration if email is invalid', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          ...testStudent,
          email: 'not-an-email'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject registration if password lacks numbers or letters', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          ...testStudent,
          password: 'onlyletters'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Password must contain at least one letter and one number');
    });

    it('should reject duplicate registration with same email', async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send(testStudent);

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testStudent);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send(testStudent);
    });

    it('should log in successfully with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testStudent.email,
          password: testStudent.password
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe(testStudent.email);
    });

    it('should fail login when password is wrong', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testStudent.email,
          password: 'WrongPassword999'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid email or password');
    });

    it('should fail login when user does not exist', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'unknown@mnnit.ac.in',
          password: 'Password123'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject login if account is suspended', async () => {
      await User.findOneAndUpdate(
        { email: testStudent.email },
        { status: 'suspended' }
      );

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testStudent.email,
          password: testStudent.password
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('suspended');
    });
  });

  describe('GET /api/v1/auth/me (Protected Route)', () => {
    let token;

    beforeEach(async () => {
      const reg = await request(app)
        .post('/api/v1/auth/register')
        .send(testStudent);
      token = reg.body.data.token;
    });

    it('should return user profile when valid bearer token is provided', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testStudent.email);
      expect(res.body.data.user.name).toBe(testStudent.name);
    });

    it('should reject request without bearer token', async () => {
      const res = await request(app).get('/api/v1/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject request with an invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid.token.signature');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/auth/profile', () => {
    let token;

    beforeEach(async () => {
      const reg = await request(app)
        .post('/api/v1/auth/register')
        .send(testStudent);
      token = reg.body.data.token;
    });

    it('should update profile successfully', async () => {
      const res = await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Aarav S. Sharma',
          bio: 'Final year CS student interested in AI and robotics',
          phone: '+919999988888'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.name).toBe('Aarav S. Sharma');
      expect(res.body.data.user.bio).toBe('Final year CS student interested in AI and robotics');
      expect(res.body.data.user.phone).toBe('+919999988888');
    });
  });

  describe('Password Management Flow', () => {
    let token;

    beforeEach(async () => {
      const reg = await request(app)
        .post('/api/v1/auth/register')
        .send(testStudent);
      token = reg.body.data.token;
    });

    it('should allow user to change password when providing correct current password', async () => {
      const res = await request(app)
        .put('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'Password123',
          newPassword: 'NewStrongPassword456'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify login with new password
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testStudent.email,
          password: 'NewStrongPassword456'
        });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.data.token).toBeDefined();
    });

    it('should reject password change when current password is wrong', async () => {
      const res = await request(app)
        .put('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'WrongCurrentPassword1',
          newPassword: 'NewStrongPassword456'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should generate reset token via forgot-password and reset successfully', async () => {
      const forgotRes = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: testStudent.email });

      expect(forgotRes.status).toBe(200);
      expect(forgotRes.body.data.devResetToken).toBeDefined();

      const resetToken = forgotRes.body.data.devResetToken;

      const resetRes = await request(app)
        .post(`/api/v1/auth/reset-password/${resetToken}`)
        .send({ password: 'ResetPassword789' });

      expect(resetRes.status).toBe(200);
      expect(resetRes.body.success).toBe(true);

      // Verify login with freshly reset password
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testStudent.email,
          password: 'ResetPassword789'
        });

      expect(loginRes.status).toBe(200);
    });
  });

  describe('Role-Based Authorization (RBAC)', () => {
    let studentToken;

    beforeEach(async () => {
      const reg = await request(app)
        .post('/api/v1/auth/register')
        .send(testStudent);
      studentToken = reg.body.data.token;
    });

    it('should forbid a regular student from accessing admin endpoints', async () => {
      const res = await request(app)
        .get('/api/v1/auth/admin-only')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Access denied');
    });

    it('should grant access to admin endpoints when user has admin role', async () => {
      // Elevate user role to admin
      await User.findOneAndUpdate(
        { email: testStudent.email },
        { roles: ['student', 'admin'] }
      );

      // Re-login to get updated token
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testStudent.email,
          password: testStudent.password
        });

      const adminToken = loginRes.body.data.token;

      const res = await request(app)
        .get('/api/v1/auth/admin-only')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.authorized).toBe(true);
    });
  });
});
