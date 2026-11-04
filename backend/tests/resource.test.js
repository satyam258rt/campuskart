const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Category = require('../src/models/Category');
const Resource = require('../src/models/Resource');

require('./setup');

describe('CampusKart Resources & Marketplace Module', () => {
  let studentUser;
  let studentToken;
  let otherStudentToken;
  let adminUser;
  let adminToken;
  let bookCategory;
  let electronicsCategory;

  beforeEach(async () => {
    // Create Student 1
    studentUser = await User.create({
      name: 'Rohan Mehra',
      email: 'rohan.mehra@campus.edu',
      password: 'Password123',
      roles: ['student'],
      campus: {
        university: 'Apex Institute of Technology',
        campusName: 'Main Campus',
        studentId: 'AIT-2024-ME01',
        pickupLocation: 'Library Ground Floor'
      }
    });
    studentToken = studentUser.generateAuthToken();

    // Create Student 2
    const otherUser = await User.create({
      name: 'Priya Patel',
      email: 'priya.patel@campus.edu',
      password: 'Password123',
      roles: ['student'],
      campus: {
        university: 'Apex Institute of Technology',
        campusName: 'Main Campus',
        studentId: 'AIT-2024-CS09',
        pickupLocation: 'Hostel Block C'
      }
    });
    otherStudentToken = otherUser.generateAuthToken();

    // Create Admin
    adminUser = await User.create({
      name: 'Campus Admin',
      email: 'admin@campuskart.edu',
      password: 'Password123',
      roles: ['student', 'admin'],
      campus: {
        university: 'Apex Institute of Technology',
        campusName: 'Main Campus',
        studentId: 'ADMIN-001'
      }
    });
    adminToken = adminUser.generateAuthToken();

    // Create Categories
    bookCategory = await Category.create({
      name: 'Textbooks',
      slug: 'textbooks',
      description: 'Engineering and science textbooks'
    });

    electronicsCategory = await Category.create({
      name: 'Lab Devices',
      slug: 'lab-devices',
      description: 'Calculators and measurement instruments'
    });
  });

  describe('GET /api/v1/categories', () => {
    it('should return list of active categories', async () => {
      const res = await request(app).get('/api/v1/categories');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.categories)).toBe(true);
      expect(res.body.data.categories.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('POST /api/v1/resources (Create Listing)', () => {
    it('should create a sale listing in PENDING_APPROVAL status', async () => {
      const payload = {
        title: 'Engineering Mechanics - Hibbeler 14th Edition',
        description: 'Hardcover textbook in mint condition with formulas sheet included.',
        category: bookCategory._id.toString(),
        listingType: 'BUY',
        price: 450,
        quantity: 1,
        condition: 'LIKE_NEW',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c',
            isCover: true
          }
        ],
        campus: {
          university: 'Apex Institute of Technology',
          campusName: 'Main Campus',
          pickupLocation: 'Central Library Lounge'
        }
      };

      const res = await request(app)
        .post('/api/v1/resources')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.resource.title).toBe(payload.title);
      expect(res.body.data.resource.status).toBe('PENDING_APPROVAL');
      expect(res.body.data.resource.owner).toBeDefined();

      // Check that student role gained 'seller'
      const updatedUser = await User.findById(studentUser._id);
      expect(updatedUser.roles).toContain('seller');
    });

    it('should create a rental listing with valid rental pricing', async () => {
      const rentalPayload = {
        title: 'Texas Instruments TI-84 Plus CE Graphing Calculator',
        description: 'Rechargeable scientific graphing calculator, ideal for advanced calculus.',
        category: electronicsCategory._id.toString(),
        listingType: 'RENT',
        rentalPricing: {
          pricePerDay: 30,
          securityDeposit: 500,
          minDurationDays: 3,
          maxDurationDays: 30
        },
        quantity: 1,
        condition: 'GOOD',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd',
            isCover: true
          }
        ],
        campus: {
          university: 'Apex Institute of Technology',
          campusName: 'Main Campus',
          pickupLocation: 'Robotics Lab, 2nd Floor'
        }
      };

      const res = await request(app)
        .post('/api/v1/resources')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(rentalPayload);

      expect(res.status).toBe(201);
      expect(res.body.data.resource.listingType).toBe('RENT');
      expect(res.body.data.resource.rentalPricing.pricePerDay).toBe(30);
      expect(res.body.data.resource.rentalPricing.securityDeposit).toBe(500);

      const updatedUser = await User.findById(studentUser._id);
      expect(updatedUser.roles).toContain('lessor');
    });

    it('should reject listing if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/v1/resources')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Too short'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Marketplace Moderation & Approval Flow', () => {
    let resourceId;

    beforeEach(async () => {
      const resource = await Resource.create({
        title: 'Arduino Starter Kit with 50 Components',
        description: 'Complete microcontroller development kit for embedded systems lab.',
        category: electronicsCategory._id,
        owner: studentUser._id,
        listingType: 'BUY',
        price: 800,
        condition: 'GOOD',
        images: [{ url: 'https://example.com/arduino.jpg', isCover: true }],
        campus: {
          university: 'Apex Institute of Technology',
          campusName: 'Main Campus',
          pickupLocation: 'Electronics Workshop'
        },
        status: 'PENDING_APPROVAL'
      });
      resourceId = resource._id.toString();
    });

    it('should NOT display PENDING_APPROVAL resource in public marketplace listings', async () => {
      const res = await request(app).get('/api/v1/resources');

      expect(res.status).toBe(200);
      const found = res.body.data.find((item) => item._id === resourceId);
      expect(found).toBeUndefined();
    });

    it('should allow admin to approve resource, making it publicly ACTIVE', async () => {
      const approveRes = await request(app)
        .put(`/api/v1/resources/${resourceId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(approveRes.status).toBe(200);
      expect(approveRes.body.data.resource.status).toBe('ACTIVE');

      // Now verify public search returns it
      const publicRes = await request(app).get('/api/v1/resources');
      expect(publicRes.status).toBe(200);
      const found = publicRes.body.data.find((item) => item._id === resourceId);
      expect(found).toBeDefined();
      expect(found.title).toContain('Arduino Starter Kit');
    });

    it('should allow admin to reject resource with feedback reason', async () => {
      const rejectRes = await request(app)
        .put(`/api/v1/resources/${resourceId}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Item images are too blurry. Please upload clear photos.' });

      expect(rejectRes.status).toBe(200);
      expect(rejectRes.body.data.resource.status).toBe('REJECTED');
      expect(rejectRes.body.data.resource.moderation.rejectionReason).toContain('blurry');
    });

    it('should forbid non-admin from approving listings', async () => {
      const res = await request(app)
        .put(`/api/v1/resources/${resourceId}/approve`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('Search, Filtering & Sorting', () => {
    beforeEach(async () => {
      // Create approved active resources
      await Resource.create([
        {
          title: 'Algorithms 4th Edition - Sedgewick',
          description: 'Comprehensive computer algorithms in Java.',
          category: bookCategory._id,
          owner: studentUser._id,
          listingType: 'BUY',
          price: 350,
          condition: 'LIKE_NEW',
          images: [{ url: 'https://example.com/book1.jpg' }],
          campus: { university: 'Apex', campusName: 'Main Campus', pickupLocation: 'Desk' },
          status: 'ACTIVE'
        },
        {
          title: 'Digital Multimeter Aneng AN8008',
          description: 'True RMS digital multimeter with probes.',
          category: electronicsCategory._id,
          owner: studentUser._id,
          listingType: 'RENT',
          price: 0,
          rentalPricing: { pricePerDay: 25, securityDeposit: 200, minDurationDays: 1, maxDurationDays: 7 },
          condition: 'NEW',
          images: [{ url: 'https://example.com/meter.jpg' }],
          campus: { university: 'Apex', campusName: 'Main Campus', pickupLocation: 'Desk' },
          status: 'ACTIVE'
        },
        {
          title: 'Operating System Concepts - Silberschatz Dinosaur Book',
          description: 'Classic OS concepts with Unix examples.',
          category: bookCategory._id,
          owner: studentUser._id,
          listingType: 'BUY',
          price: 600,
          condition: 'GOOD',
          images: [{ url: 'https://example.com/os.jpg' }],
          campus: { university: 'Apex', campusName: 'Main Campus', pickupLocation: 'Desk' },
          status: 'ACTIVE'
        }
      ]);
    });

    it('should filter resources by category', async () => {
      const res = await request(app)
        .get(`/api/v1/resources?category=${bookCategory._id.toString()}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      res.body.data.forEach((r) => {
        expect(r.category._id).toBe(bookCategory._id.toString());
      });
    });

    it('should filter resources by listingType (BUY vs RENT)', async () => {
      const rentRes = await request(app).get('/api/v1/resources?listingType=RENT');
      expect(rentRes.status).toBe(200);
      expect(rentRes.body.data.length).toBe(1);
      expect(rentRes.body.data[0].title).toContain('Multimeter');

      const buyRes = await request(app).get('/api/v1/resources?listingType=BUY');
      expect(buyRes.status).toBe(200);
      expect(buyRes.body.data.length).toBe(2);
    });

    it('should filter resources by price range', async () => {
      const res = await request(app).get('/api/v1/resources?minPrice=400&maxPrice=700');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].title).toContain('Operating System');
    });

    it('should filter resources by condition', async () => {
      const res = await request(app).get('/api/v1/resources?condition=NEW');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].condition).toBe('NEW');
    });
  });

  describe('Listing Ownership & Lifecycle Management', () => {
    let ownedResource;

    beforeEach(async () => {
      ownedResource = await Resource.create({
        title: 'Wireless Ergonomic Mouse Logitech MX Master 3S',
        description: 'Super fast scrolling, Bluetooth and USB dongle included.',
        category: electronicsCategory._id,
        owner: studentUser._id,
        listingType: 'BUY',
        price: 3200,
        condition: 'LIKE_NEW',
        images: [{ url: 'https://example.com/mouse.jpg' }],
        campus: { university: 'Apex', campusName: 'Main Campus', pickupLocation: 'Hostel B' },
        status: 'ACTIVE'
      });
    });

    it('should allow owner to update listing details', async () => {
      const res = await request(app)
        .put(`/api/v1/resources/${ownedResource._id}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          price: 2900,
          description: 'Updated price: special discount for first-year batch.'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.resource.price).toBe(2900);
      expect(res.body.data.resource.description).toContain('Updated price');
    });

    it('should forbid other students from updating someone else listing', async () => {
      const res = await request(app)
        .put(`/api/v1/resources/${ownedResource._id}`)
        .set('Authorization', `Bearer ${otherStudentToken}`)
        .send({
          price: 100
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('permission');
    });

    it('should allow owner to toggle pause (ACTIVE <-> INACTIVE)', async () => {
      // Pause
      const pauseRes = await request(app)
        .patch(`/api/v1/resources/${ownedResource._id}/toggle-pause`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(pauseRes.status).toBe(200);
      expect(pauseRes.body.data.resource.status).toBe('INACTIVE');

      // Resume
      const resumeRes = await request(app)
        .patch(`/api/v1/resources/${ownedResource._id}/toggle-pause`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(resumeRes.status).toBe(200);
      expect(resumeRes.body.data.resource.status).toBe('ACTIVE');
    });

    it('should allow owner to delete listing', async () => {
      const res = await request(app)
        .delete(`/api/v1/resources/${ownedResource._id}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);

      const check = await Resource.findById(ownedResource._id);
      expect(check).toBeNull();
    });
  });
});
