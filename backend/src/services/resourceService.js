const Resource = require('../models/Resource');
const Category = require('../models/Category');
const User = require('../models/User');
const ApiError = require('../utils/apiError');

class ResourceService {
  /**
   * Seed default campus categories if none exist
   */
  async seedDefaultCategories() {
    const count = await Category.countDocuments();
    if (count > 0) return;

    const defaults = [
      { name: 'Bicycles', description: 'Campus cycles, geared mountain bikes, locks, helmets & ride accessories', icon: 'bicycle', displayOrder: 1 },
      { name: 'Calculators', description: 'Casio fx-991, scientific, graphing, engineering & financial calculators', icon: 'calculator', displayOrder: 2 },
      { name: 'Books', description: 'Textbooks, reference guides, course notes & semester exam materials', icon: 'book', displayOrder: 3 },
      { name: 'Electronics', description: 'Headphones, chargers, USB hubs, keyboards & monitors', icon: 'cpu', displayOrder: 4 },
      { name: 'Lab & Stationery', description: 'Lab coats, drafters, circuit components, pens & notebooks', icon: 'file-text', displayOrder: 5 },
      { name: 'Dorm & Furniture', description: 'Study desks, ergonomic chairs, lamps & room storage', icon: 'armchair', displayOrder: 6 },
      { name: 'Sports Equipment', description: 'Badminton racquets, cricket bats, footballs & fitness gear', icon: 'trophy', displayOrder: 7 },
      { name: 'Other', description: 'Other permitted campus resources and supplies', icon: 'box', displayOrder: 8 }
    ];

    await Category.insertMany(defaults);
  }

  /**
   * Get all active categories
   */
  async getCategories() {
    return Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
  }

  /**
   * Create a new category (Admin)
   */
  async createCategory(categoryData) {
    const existing = await Category.findOne({ name: categoryData.name.trim() });
    if (existing) {
      throw ApiError.conflict('A category with this name already exists');
    }
    return Category.create(categoryData);
  }

  /**
   * Create a new resource listing
   */
  async createResource(ownerId, data) {
    const category = await Category.findById(data.category);
    if (!category || !category.isActive) {
      throw ApiError.badRequest('Selected category does not exist or is inactive');
    }

    const resource = new Resource({
      ...data,
      owner: ownerId,
      status: data.status || 'PENDING_APPROVAL'
    });

    await resource.save();

    // Auto-grant 'seller' or 'lessor' role to student if not present
    const user = await User.findById(ownerId);
    if (user) {
      let roleToAdd = data.listingType === 'RENT' ? 'lessor' : 'seller';
      if (!user.roles.includes(roleToAdd)) {
        user.roles.push(roleToAdd);
        await user.save({ validateBeforeSave: false });
      }
    }

    return resource.populate([
      { path: 'category', select: 'name slug icon' },
      { path: 'owner', select: 'name email campus avatar reputationScore' }
    ]);
  }

  /**
   * Query marketplace resources with filtering, search, and pagination
   */
  async getResources(queryParams = {}) {
    const {
      keyword,
      category,
      listingType,
      condition,
      minPrice,
      maxPrice,
      university,
      campusName,
      status = 'ACTIVE', // Public default is ACTIVE
      sort = 'newest',
      page = 1,
      limit = 12
    } = queryParams;

    const filter = {};

    // Status filter (public users can only view ACTIVE, or specific status if requested by admin)
    if (status) {
      filter.status = status;
    }

    // Keyword search (intelligent matching: title, description, category name, tags, location)
    if (keyword && keyword.trim()) {
      const cleanKeyword = keyword.trim();
      const escaped = cleanKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // Generate singular and plural variants (e.g. cycle <-> cycles, calculator <-> calculators)
      const variants = [escaped];
      if (cleanKeyword.toLowerCase().endsWith('s')) {
        variants.push(cleanKeyword.slice(0, -1).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      } else {
        variants.push(`${escaped}s`);
      }
      const variantPattern = variants.join('|');

      // 1. Check if keyword matches any category (e.g. "cycle" matches category "Cycles")
      const matchingCats = await Category.find({
        $or: [
          { name: { $regex: variantPattern, $options: 'i' } },
          { slug: { $regex: variantPattern, $options: 'i' } }
        ]
      }).select('_id');
      const matchingCatIds = matchingCats.map((c) => c._id);

      // 2. Build broad $or search conditions
      const orConditions = [
        { title: { $regex: variantPattern, $options: 'i' } },
        { description: { $regex: variantPattern, $options: 'i' } },
        { tags: { $in: [new RegExp(variantPattern, 'i')] } },
        { 'campus.pickupLocation': { $regex: variantPattern, $options: 'i' } }
      ];

      // If keyword matches a category, include all listings within that category!
      if (matchingCatIds.length > 0) {
        orConditions.push({ category: { $in: matchingCatIds } });
      }

      // 3. Multi-word token matching (e.g. "hero cycle" or "casio calculator")
      const words = cleanKeyword.split(/\s+/).filter((w) => w.length > 1);
      if (words.length > 1) {
        const wordPattern = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
        orConditions.push({ title: { $regex: wordPattern, $options: 'i' } });
      }

      filter.$or = orConditions;
    }

    // Category filter
    if (category) {
      // Check if ID or Slug
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        filter.category = category;
      } else {
        const cat = await Category.findOne({
          $or: [
            { slug: category },
            { slug: new RegExp(`^${category}`, 'i') },
            { name: new RegExp(`^${category}`, 'i') }
          ]
        });
        if (cat) filter.category = cat._id;
      }
    }

    // Listing Type filter (BUY, RENT, or BOTH)
    if (listingType) {
      if (listingType === 'BUY') {
        filter.listingType = { $in: ['BUY', 'BOTH'] };
      } else if (listingType === 'RENT') {
        filter.listingType = { $in: ['RENT', 'BOTH'] };
      } else {
        filter.listingType = listingType;
      }
    }

    // Condition filter
    if (condition) {
      filter.condition = condition;
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    // Campus location filter
    if (university) {
      filter['campus.university'] = new RegExp(university, 'i');
    }
    if (campusName) {
      filter['campus.campusName'] = new RegExp(campusName, 'i');
    }

    // Sort order
    let sortOptions = { createdAt: -1 };
    if (sort === 'price_asc') sortOptions = { price: 1 };
    else if (sort === 'price_desc') sortOptions = { price: -1 };
    else if (sort === 'popular') sortOptions = { viewsCount: -1 };
    else if (sort === 'newest') sortOptions = { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [resources, total] = await Promise.all([
      Resource.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit))
        .populate('category', 'name slug icon')
        .populate('owner', 'name email campus avatar reputationScore'),
      Resource.countDocuments(filter)
    ]);

    return {
      resources,
      total,
      page: Number(page),
      limit: Number(limit)
    };
  }

  /**
   * Get single resource details
   */
  async getResourceById(id, incrementViews = false) {
    let resource;
    if (incrementViews) {
      resource = await Resource.findByIdAndUpdate(
        id,
        { $inc: { viewsCount: 1 } },
        { new: true }
      );
    } else {
      resource = await Resource.findById(id);
    }

    if (!resource) {
      throw ApiError.notFound('Resource not found');
    }

    return resource.populate([
      { path: 'category', select: 'name slug icon description' },
      { path: 'owner', select: 'name email campus phone avatar reputationScore ratingsCount createdAt' },
      { path: 'moderation.approvedBy', select: 'name' }
    ]);
  }

  /**
   * Get user's own listings
   */
  async getMyListings(ownerId, { status, page = 1, limit = 20 }) {
    const filter = { owner: ownerId };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [resources, total] = await Promise.all([
      Resource.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('category', 'name slug icon'),
      Resource.countDocuments(filter)
    ]);

    return { resources, total, page: Number(page), limit: Number(limit) };
  }

  /**
   * Update listing (with ownership verification)
   */
  async updateResource(resourceId, userId, updateData, userRoles = []) {
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      throw ApiError.notFound('Resource not found');
    }

    const isOwner = resource.owner.toString() === userId.toString();
    const isAdmin = userRoles.includes('admin') || userRoles.includes('super_admin');

    if (!isOwner && !isAdmin) {
      throw ApiError.forbidden('You do not have permission to edit this listing');
    }

    // If changing category, verify category exists
    if (updateData.category) {
      const category = await Category.findById(updateData.category);
      if (!category) throw ApiError.badRequest('Invalid category ID');
    }

    // Apply updates
    Object.assign(resource, updateData);

    // If a rejected listing is updated by owner, re-queue for approval
    if (isOwner && resource.status === 'REJECTED') {
      resource.status = 'PENDING_APPROVAL';
      resource.moderation.rejectionReason = '';
    }

    await resource.save();
    return resource.populate([
      { path: 'category', select: 'name slug icon' },
      { path: 'owner', select: 'name email campus avatar' }
    ]);
  }

  /**
   * Toggle pause/resume listing (ACTIVE <-> INACTIVE)
   */
  async togglePauseResource(resourceId, userId) {
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      throw ApiError.notFound('Resource not found');
    }

    if (resource.owner.toString() !== userId.toString()) {
      throw ApiError.forbidden('Only the listing owner can pause or resume this listing');
    }

    if (resource.status === 'ACTIVE') {
      resource.status = 'INACTIVE';
    } else if (resource.status === 'INACTIVE') {
      resource.status = 'ACTIVE';
    } else {
      throw ApiError.badRequest(`Cannot toggle status for a listing currently in '${resource.status}' status`);
    }

    await resource.save();
    return resource;
  }

  /**
   * Delete listing
   */
  async deleteResource(resourceId, userId, userRoles = []) {
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      throw ApiError.notFound('Resource not found');
    }

    const isOwner = resource.owner.toString() === userId.toString();
    const isAdmin = userRoles.includes('admin') || userRoles.includes('super_admin');

    if (!isOwner && !isAdmin) {
      throw ApiError.forbidden('You do not have permission to delete this listing');
    }

    // Cannot delete if currently reserved or rented
    if (['RESERVED', 'RENTED'].includes(resource.status)) {
      throw ApiError.badRequest(
        `Cannot delete resource while it is actively ${resource.status.toLowerCase()}`
      );
    }

    await Resource.findByIdAndDelete(resourceId);
    return { message: 'Listing deleted successfully' };
  }

  /**
   * Admin: Approve listing
   */
  async approveResource(resourceId, adminId) {
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      throw ApiError.notFound('Resource not found');
    }

    resource.status = 'ACTIVE';
    resource.moderation = {
      approvedBy: adminId,
      approvedAt: new Date(),
      rejectionReason: ''
    };

    await resource.save();
    return resource;
  }

  /**
   * Admin: Reject listing
   */
  async rejectResource(resourceId, adminId, reason) {
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      throw ApiError.notFound('Resource not found');
    }

    resource.status = 'REJECTED';
    resource.moderation = {
      approvedBy: adminId,
      approvedAt: new Date(),
      rejectionReason: reason
    };

    await resource.save();
    return resource;
  }
}

module.exports = new ResourceService();
