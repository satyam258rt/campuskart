const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Category = require('../models/Category');
const Resource = require('../models/Resource');
const Rental = require('../models/Rental');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const Review = require('../models/Review');
const Dispute = require('../models/Dispute');
const Notification = require('../models/Notification');
const Payment = require('../models/Payment');
const Return = require('../models/Return');
const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

const cleanUploadsDirectory = () => {
  try {
    const uploadsDir = path.resolve(__dirname, '../../uploads');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      let removedCount = 0;
      for (const file of files) {
        if (file !== '.gitkeep') {
          const filePath = path.join(uploadsDir, file);
          try {
            if (fs.statSync(filePath).isFile()) {
              fs.unlinkSync(filePath);
              removedCount++;
            }
          } catch (e) {
            // Ignore file lock if in use
          }
        }
      }
      if (removedCount > 0) {
        logger.info(`Cleared ${removedCount} test/temporary files from uploads folder.`);
      }
    }
  } catch (err) {
    logger.warn(`Could not clear uploads directory: ${err.message}`);
  }
};

const seedData = async () => {
  try {
    // 1. Clear all existing data across all collections so user starts with a completely clean marketplace
    await Promise.all([
      Category.deleteMany({}),
      Resource.deleteMany({}),
      User.deleteMany({}),
      Rental.deleteMany({}),
      Order.deleteMany({}),
      Cart.deleteMany({}),
      Wishlist.deleteMany({}),
      Review.deleteMany({}),
      Dispute.deleteMany({}),
      Notification.deleteMany({}),
      Payment.deleteMany({}),
      Return.deleteMany({}),
      AuditLog.deleteMany({})
    ]);

    // Clean uploads directory
    cleanUploadsDirectory();

    logger.info('Marketplace database wiped clean. Re-seeding base categories (Cycles, Calculators, Other) and campus accounts...');

    // 2. Seed the 3 requested categories: Cycles, Calculators, Other
    const categoriesData = [
      {
        name: 'Cycles',
        slug: 'cycles',
        description: 'Campus bicycles, geared mountain bikes, cycle locks, safety helmets & riding accessories',
        icon: 'bicycle',
        displayOrder: 1,
        isActive: true
      },
      {
        name: 'Calculators',
        slug: 'calculators',
        description: 'Scientific fx-991 series, programmable/graphing calculators & engineering calculation tools',
        icon: 'calculator',
        displayOrder: 2,
        isActive: true
      },
      {
        name: 'Other',
        slug: 'other',
        description: 'Other verified campus essentials, lab equipment, electronics & hostel study gear',
        icon: 'box',
        displayOrder: 3,
        isActive: true
      }
    ];

    const seededCategories = await Category.insertMany(categoriesData);
    logger.info(`Seeded ${seededCategories.length} categories: Cycles, Calculators, Other.`);

    // 3. Seed Verified Inside-Campus Users (Strict MNNIT Domain: @mnnit.ac.in)
    // Note: UserSchema.pre('save') automatically hashes passwords with bcrypt
    const studentPassword = 'Password123';
    const adminPassword = 'AdminPassword123';

    // 3a. Inside-Campus Student User (Requested: satyam.2026is22@mnnit.ac.in)
    const studentUser = await User.create({
      name: 'Satyam',
      email: 'satyam.2026is22@mnnit.ac.in',
      password: studentPassword,
      roles: ['student', 'seller', 'lessor'],
      phone: '+91 98765 11111',
      bio: 'MNNIT Student. Active inside-campus resource trader.',
      campus: {
        university: 'Motilal Nehru National Institute of Technology (MNNIT) Allahabad',
        campusName: 'MNNIT Prayagraj',
        studentId: '2026IS22',
        department: 'Information Security / CSE',
        hostelOrAddress: 'SVBH Hostel, MNNIT Campus'
      },
      status: 'active',
      isEmailVerified: true,
      reputationScore: 5.0,
      ratingsCount: 0
    });

    // 3b. Inside-Campus Vendor User
    const vendorUser = await User.create({
      name: 'MNNIT Campus Wheels & Stationery',
      email: 'vendor@mnnit.ac.in',
      password: studentPassword,
      roles: ['vendor', 'seller', 'lessor'],
      phone: '+91 98765 22222',
      bio: 'Official MNNIT campus store providing student cycles, calculators & stationery.',
      campus: {
        university: 'Motilal Nehru National Institute of Technology (MNNIT) Allahabad',
        campusName: 'MNNIT Prayagraj',
        studentId: 'MNNIT-VENDOR-01',
        department: 'Student Activity Centre (SAC)',
        hostelOrAddress: 'SAC Complex, MNNIT Prayagraj'
      },
      vendorDetails: {
        shopName: 'MNNIT Tech & Cycle Bay',
        stallNumber: 'Shop #2, SAC Complex',
        businessPhone: '+91 98765 22222',
        categorySpecialization: ['Cycles', 'Calculators', 'Other'],
        verifiedVendor: true
      },
      status: 'active',
      isEmailVerified: true,
      reputationScore: 5.0,
      ratingsCount: 0
    });

    // 3c. Campus Administrator
    const adminUser = await User.create({
      name: 'MNNIT Administrator',
      email: 'admin@mnnit.ac.in',
      password: adminPassword,
      roles: ['admin', 'super_admin', 'student'],
      phone: '+91 98765 33333',
      bio: 'CampusKart MNNIT platform moderator and Student Welfare Council administrator.',
      campus: {
        university: 'Motilal Nehru National Institute of Technology (MNNIT) Allahabad',
        campusName: 'MNNIT Prayagraj',
        studentId: 'MNNIT-ADMIN-01',
        department: 'Dean Student Welfare Office',
        hostelOrAddress: 'Administrative Building, MNNIT'
      },
      status: 'active',
      isEmailVerified: true
    });

    logger.info('Database initialized with 0 dummy products. Ready for user to insert cycles, calculators, and other products via the UI.');
    logger.info(`Default MNNIT inside-campus accounts ready:`);
    logger.info(`- Student: satyam.2026is22@mnnit.ac.in (Password: Password123)`);
    logger.info(`- Vendor: vendor@mnnit.ac.in (Password: Password123)`);
    logger.info(`- Admin: admin@mnnit.ac.in (Password: AdminPassword123)`);
  } catch (error) {
    logger.error(`Seeding error: ${error.message}`);
  }
};

module.exports = { seedData, cleanUploadsDirectory };
