const Cart = require('../models/Cart');
const Resource = require('../models/Resource');
const rentalService = require('./rentalService');
const ApiError = require('../utils/apiError');

class CartService {
  /**
   * Get user's active cart
   */
  async getCart(userId) {
    let cart = await Cart.findOne({ user: userId }).populate({
      path: 'items.resource',
      select: 'title price rentalPricing condition images campus status quantity'
    });

    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    return cart;
  }

  /**
   * Add item to cart
   */
  async addItem(userId, itemData) {
    const { resourceId, itemType = 'BUY', quantity = 1, rentalDates } = itemData;

    const resource = await Resource.findById(resourceId);
    if (!resource || resource.status !== 'ACTIVE') {
      throw ApiError.badRequest('Resource is not available for purchase or rent');
    }

    if (resource.owner.toString() === userId.toString()) {
      throw ApiError.badRequest('You cannot add your own listed resource to your cart');
    }

    let unitPrice = 0;
    let securityDeposit = 0;
    let days = 1;

    if (itemType === 'BUY') {
      if (!['BUY', 'BOTH'].includes(resource.listingType)) {
        throw ApiError.badRequest('This resource is not available for sale');
      }
      unitPrice = resource.price;
      securityDeposit = 0;
    } else if (itemType === 'RENT') {
      if (!['RENT', 'BOTH'].includes(resource.listingType)) {
        throw ApiError.badRequest('This resource is not available for rent');
      }
      if (!rentalDates || !rentalDates.startDate || !rentalDates.endDate) {
        throw ApiError.badRequest('Rental start date and end date are required');
      }

      // Check backend overlap availability
      const check = await rentalService.checkAvailability(
        resourceId,
        rentalDates.startDate,
        rentalDates.endDate
      );
      if (!check.isAvailable) {
        throw ApiError.conflict('Resource is not available for the selected dates');
      }

      unitPrice = check.dailyRate;
      securityDeposit = check.securityDeposit;
      days = check.totalDays;
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if item already exists in cart with same type & dates
    const existingIndex = cart.items.findIndex((item) => {
      const sameResource = item.resource.toString() === resourceId.toString();
      const sameType = item.itemType === itemType;
      if (!sameResource || !sameType) return false;
      if (itemType === 'RENT') {
        const itemStart = new Date(item.rentalDates?.startDate).toISOString().slice(0, 10);
        const reqStart = new Date(rentalDates.startDate).toISOString().slice(0, 10);
        return itemStart === reqStart;
      }
      return true;
    });

    if (existingIndex > -1) {
      if (itemType === 'BUY') {
        cart.items[existingIndex].quantity += Number(quantity);
      } else {
        throw ApiError.badRequest('This rental item is already in your cart');
      }
    } else {
      cart.items.push({
        resource: resourceId,
        itemType,
        quantity: Number(quantity),
        rentalDates: itemType === 'RENT'
          ? {
              startDate: new Date(rentalDates.startDate),
              endDate: new Date(rentalDates.endDate),
              totalDays: days
            }
          : undefined,
        unitPrice,
        securityDeposit,
        itemTotal: itemType === 'BUY' ? unitPrice * quantity : unitPrice * days * quantity + securityDeposit
      });
    }

    cart.calculateTotals();
    await cart.save();

    return this.getCart(userId);
  }

  /**
   * Update item quantity in cart
   */
  async updateItemQuantity(userId, itemId, quantity) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw ApiError.notFound('Cart not found');

    const item = cart.items.id(itemId);
    if (!item) throw ApiError.notFound('Item not found in cart');

    if (quantity <= 0) {
      cart.items.pull(itemId);
    } else {
      item.quantity = Number(quantity);
    }

    cart.calculateTotals();
    await cart.save();

    return this.getCart(userId);
  }

  /**
   * Remove item from cart
   */
  async removeItem(userId, itemId) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw ApiError.notFound('Cart not found');

    cart.items.pull(itemId);
    cart.calculateTotals();
    await cart.save();

    return this.getCart(userId);
  }

  /**
   * Clear cart
   */
  async clearCart(userId) {
    const cart = await Cart.findOne({ user: userId });
    if (cart) {
      cart.items = [];
      cart.subtotal = 0;
      cart.totalDeposit = 0;
      cart.grandTotal = 0;
      await cart.save();
    }
    return { message: 'Cart cleared successfully' };
  }

  /**
   * Validate all cart items before proceeding to checkout
   */
  async validateCartBeforeCheckout(userId) {
    const cart = await this.getCart(userId);
    if (!cart.items || cart.items.length === 0) {
      throw ApiError.badRequest('Your cart is empty');
    }

    const errors = [];

    for (const item of cart.items) {
      const resource = await Resource.findById(item.resource._id || item.resource);
      if (!resource || resource.status !== 'ACTIVE') {
        errors.push(`"${item.resource.title || 'An item'}" is no longer active in the marketplace.`);
        continue;
      }

      if (item.itemType === 'BUY') {
        if (resource.quantity < item.quantity) {
          errors.push(`Insufficient stock for "${resource.title}". Only ${resource.quantity} available.`);
        }
      } else if (item.itemType === 'RENT') {
        const check = await rentalService.checkAvailability(
          resource._id,
          item.rentalDates.startDate,
          item.rentalDates.endDate
        );
        if (!check.isAvailable) {
          errors.push(`"${resource.title}" is no longer available for your selected dates.`);
        }
      }
    }

    if (errors.length > 0) {
      throw ApiError.badRequest('Cart validation failed', errors);
    }

    return cart;
  }
}

module.exports = new CartService();
