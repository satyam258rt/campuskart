const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Category = require('../src/models/Category');
const Resource = require('../src/models/Resource');
const Rental = require('../src/models/Rental');
const Order = require('../src/models/Order');

require('./setup');

describe('CampusKart Complete Backend Integration Test', () => {
  let student1, token1;
  let student2, token2;
  let admin, adminToken;
  let category;
  let rentalResource;
  let buyResource;

  beforeEach(async () => {
    // Student 1 (Lessor / Seller)
    student1 = await User.create({
      name: 'Dev Sharma',
      email: 'dev@campus.edu',
      password: 'Password123',
      roles: ['student', 'seller', 'lessor'],
      campus: { university: 'Apex', campusName: 'Main', studentId: 'S1-001' }
    });
    token1 = student1.generateAuthToken();

    // Student 2 (Renter / Buyer)
    student2 = await User.create({
      name: 'Ananya Rao',
      email: 'ananya@campus.edu',
      password: 'Password123',
      roles: ['student'],
      campus: { university: 'Apex', campusName: 'Main', studentId: 'S2-002' }
    });
    token2 = student2.generateAuthToken();

    // Admin
    admin = await User.create({
      name: 'Super Admin',
      email: 'admin@campus.edu',
      password: 'Password123',
      roles: ['student', 'admin', 'super_admin'],
      campus: { university: 'Apex', campusName: 'Main', studentId: 'ADM-001' }
    });
    adminToken = admin.generateAuthToken();

    // Category
    category = await Category.create({ name: 'Lab Gear', slug: 'lab-gear' });

    // Rental Resource (Active)
    rentalResource = await Resource.create({
      title: 'Digital Storage Oscilloscope 100MHz',
      description: 'Dual channel DSO for signal processing lab experiments.',
      category: category._id,
      owner: student1._id,
      listingType: 'RENT',
      rentalPricing: {
        pricePerDay: 50,
        securityDeposit: 1000,
        minDurationDays: 1,
        maxDurationDays: 14
      },
      condition: 'LIKE_NEW',
      images: [{ url: 'https://example.com/dso.jpg' }],
      campus: { university: 'Apex', campusName: 'Main', pickupLocation: 'Lab 302' },
      status: 'ACTIVE'
    });

    // Buy Resource (Active)
    buyResource = await Resource.create({
      title: 'Engineering Mathematics - Kreyszig 10th Ed',
      description: 'Standard textbook for advanced engineering math.',
      category: category._id,
      owner: student1._id,
      listingType: 'BUY',
      price: 500,
      quantity: 5,
      condition: 'GOOD',
      images: [{ url: 'https://example.com/math.jpg' }],
      campus: { university: 'Apex', campusName: 'Main', pickupLocation: 'Hostel A' },
      status: 'ACTIVE'
    });
  });

  describe('1. Rental Overlap Prevention', () => {
    it('should allow reserving resource for available dates', async () => {
      const res = await request(app)
        .post('/api/v1/rentals')
        .set('Authorization', `Bearer ${token2}`)
        .send({
          resourceId: rentalResource._id.toString(),
          startDate: '2026-11-10',
          endDate: '2026-11-15'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rental.status).toBe('RESERVED');
      expect(res.body.data.rental.dailyRate).toBe(50);
      expect(res.body.data.rental.securityDeposit).toBe(1000);
    });

    it('should strictly reject overlapping rental reservations on the backend', async () => {
      // First reservation: Nov 10 to Nov 15
      await request(app)
        .post('/api/v1/rentals')
        .set('Authorization', `Bearer ${token2}`)
        .send({
          resourceId: rentalResource._id.toString(),
          startDate: '2026-11-10',
          endDate: '2026-11-15'
        });

      // Second reservation attempt with overlapping dates: Nov 12 to Nov 18
      const overlapRes = await request(app)
        .post('/api/v1/rentals')
        .set('Authorization', `Bearer ${token2}`)
        .send({
          resourceId: rentalResource._id.toString(),
          startDate: '2026-11-12',
          endDate: '2026-11-18'
        });

      expect(overlapRes.status).toBe(409);
      expect(overlapRes.body.success).toBe(false);
      expect(overlapRes.body.message).toContain('already booked');
    });

    it('should allow reservation for adjacent, non-overlapping dates', async () => {
      // Nov 10 to Nov 15
      await request(app)
        .post('/api/v1/rentals')
        .set('Authorization', `Bearer ${token2}`)
        .send({
          resourceId: rentalResource._id.toString(),
          startDate: '2026-11-10',
          endDate: '2026-11-15'
        });

      // Nov 16 to Nov 20 (Non-overlapping)
      const validRes = await request(app)
        .post('/api/v1/rentals')
        .set('Authorization', `Bearer ${token2}`)
        .send({
          resourceId: rentalResource._id.toString(),
          startDate: '2026-11-16',
          endDate: '2026-11-20'
        });

      expect(validRes.status).toBe(201);
      expect(validRes.body.success).toBe(true);
    });
  });

  describe('2. Cart & Wishlist', () => {
    it('should add items to cart and calculate correct totals breakdown', async () => {
      // Add buy item
      const buyRes = await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${token2}`)
        .send({
          resourceId: buyResource._id.toString(),
          itemType: 'BUY',
          quantity: 2
        });

      expect(buyRes.status).toBe(200);
      expect(buyRes.body.data.cart.subtotal).toBe(1000); // 500 * 2

      // Add rental item (3 days: Nov 20 to Nov 23)
      const rentRes = await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${token2}`)
        .send({
          resourceId: rentalResource._id.toString(),
          itemType: 'RENT',
          rentalDates: {
            startDate: '2026-11-20',
            endDate: '2026-11-23'
          }
        });

      expect(rentRes.status).toBe(200);
      // subtotal = 1000 + (50 * 3) = 1150
      // totalDeposit = 1000
      // grandTotal = 2150
      expect(rentRes.body.data.cart.subtotal).toBe(1150);
      expect(rentRes.body.data.cart.totalDeposit).toBe(1000);
      expect(rentRes.body.data.cart.grandTotal).toBe(2150);
    });

    it('should toggle item in wishlist', async () => {
      const addRes = await request(app)
        .post(`/api/v1/wishlist/toggle/${buyResource._id.toString()}`)
        .set('Authorization', `Bearer ${token2}`);

      expect(addRes.status).toBe(200);
      expect(addRes.body.data.isAdded).toBe(true);

      const getRes = await request(app)
        .get('/api/v1/wishlist')
        .set('Authorization', `Bearer ${token2}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.data.wishlist.resources.length).toBe(1);
    });
  });

  describe('3. Order Checkout & Payment Signature Verification', () => {
    beforeEach(async () => {
      // Add item to cart
      await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${token2}`)
        .send({
          resourceId: buyResource._id.toString(),
          itemType: 'BUY',
          quantity: 1
        });
    });

    it('should stage order via checkout and verify payment idempotently', async () => {
      // Checkout
      const checkoutRes = await request(app)
        .post('/api/v1/orders/checkout')
        .set('Authorization', `Bearer ${token2}`)
        .send({
          pickupOrDelivery: {
            type: 'CAMPUS_PICKUP',
            location: 'Central Library Desk',
            contactPhone: '+919876543210'
          }
        });

      expect(checkoutRes.status).toBe(201);
      expect(checkoutRes.body.data.order.paymentStatus).toBe('PENDING');
      const order = checkoutRes.body.data.order;
      const gatewayOrder = checkoutRes.body.data.gatewayOrder;

      // Verify payment with HMAC signature
      const verifyRes = await request(app)
        .post('/api/v1/payments/verify')
        .set('Authorization', `Bearer ${token2}`)
        .send({
          orderId: order.orderId,
          razorpay_order_id: gatewayOrder.gatewayOrderId,
          razorpay_payment_id: 'pay_test_12345',
          razorpay_signature: 'mock_test_signature_valid'
        });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.data.order.paymentStatus).toBe('PAID');
      expect(verifyRes.body.data.order.orderStatus).toBe('CONFIRMED');

      // Idempotency: verify calling it again succeeds without duplicate side effects
      const repeatRes = await request(app)
        .post('/api/v1/payments/verify')
        .set('Authorization', `Bearer ${token2}`)
        .send({
          orderId: order.orderId,
          razorpay_order_id: gatewayOrder.gatewayOrderId,
          razorpay_payment_id: 'pay_test_12345',
          razorpay_signature: 'mock_test_signature_valid'
        });

      expect(repeatRes.status).toBe(200);
      expect(repeatRes.body.message).toContain('already verified');
    });
  });

  describe('4. Return Management & Security Deposit Settlement', () => {
    let rental;

    beforeEach(async () => {
      rental = await Rental.create({
        resource: rentalResource._id,
        renter: student2._id,
        owner: student1._id,
        startDate: new Date('2026-10-01'),
        endDate: new Date('2026-10-05'),
        totalDays: 4,
        dailyRate: 50,
        rentalFee: 200,
        securityDeposit: 1000,
        totalAmount: 1200,
        status: 'ACTIVE'
      });
    });

    it('should process return request, lessor inspection and deposit settlement', async () => {
      // 1. Renter submits return request
      const returnReqRes = await request(app)
        .post('/api/v1/returns/request')
        .set('Authorization', `Bearer ${token2}`)
        .send({
          rentalId: rental._id.toString(),
          notes: 'Returning in great shape at lab counter'
        });

      expect(returnReqRes.status).toBe(201);
      const returnId = returnReqRes.body.data.returnDoc._id;

      // 2. Lessor inspects item condition
      const inspectRes = await request(app)
        .put(`/api/v1/returns/${returnId}/inspect`)
        .set('Authorization', `Bearer ${token1}`)
        .send({
          itemCondition: 'GOOD',
          damageFee: 0
        });

      expect(inspectRes.status).toBe(200);
      expect(inspectRes.body.data.returnDoc.status).toBe('APPROVED');

      // 3. Lessor settles deposit and makes resource active again
      const settleRes = await request(app)
        .post(`/api/v1/returns/${returnId}/settle`)
        .set('Authorization', `Bearer ${token1}`);

      expect(settleRes.status).toBe(200);
      expect(settleRes.body.data.returnDoc.status).toBe('SETTLED');

      // Verify resource is active again
      const updatedResource = await Resource.findById(rentalResource._id);
      expect(updatedResource.status).toBe('ACTIVE');
    });
  });

  describe('5. Admin Dashboard & Governance', () => {
    it('should return complete dashboard metrics to admin', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.totalUsers).toBeGreaterThanOrEqual(3);
      expect(res.body.data.totalResources).toBeGreaterThanOrEqual(2);
    });

    it('should allow admin to suspend user and record audit log', async () => {
      const suspendRes = await request(app)
        .patch(`/api/v1/admin/users/${student2._id.toString()}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'suspended' });

      expect(suspendRes.status).toBe(200);
      expect(suspendRes.body.data.user.status).toBe('suspended');

      // Check audit log
      const auditRes = await request(app)
        .get('/api/v1/admin/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(auditRes.status).toBe(200);
      const log = auditRes.body.data.find(
        (l) => l.action === 'UPDATE_USER_STATUS' && l.targetId === student2._id.toString()
      );
      expect(log).toBeDefined();
    });
  });
});
