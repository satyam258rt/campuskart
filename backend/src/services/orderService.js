const Order = require('../models/Order');
const Resource = require('../models/Resource');
const Cart = require('../models/Cart');
const cartService = require('./cartService');
const paymentService = require('./paymentService');
const ApiError = require('../utils/apiError');

class OrderService {
  /**
   * Checkout: Calculate prices on the backend, validate availability, create order
   */
  async checkout(buyerId, checkoutData) {
    const { pickupOrDelivery, paymentMethod = 'RAZORPAY' } = checkoutData;

    // Validate cart items
    const cart = await cartService.validateCartBeforeCheckout(buyerId);

    // Build order items & recalculate prices strictly on server
    let itemsTotal = 0;
    let securityDepositTotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const resource = await Resource.findById(item.resource._id || item.resource);
      if (!resource) continue;

      let unitPrice = 0;
      let deposit = 0;
      let itemTotal = 0;

      if (item.itemType === 'BUY') {
        unitPrice = resource.price;
        itemTotal = unitPrice * item.quantity;
        itemsTotal += itemTotal;
      } else if (item.itemType === 'RENT') {
        const days = item.rentalDates?.totalDays || 1;
        unitPrice = resource.rentalPricing?.pricePerDay || 0;
        deposit = (resource.rentalPricing?.securityDeposit || 0) * item.quantity;
        const rentalFee = unitPrice * days * item.quantity;
        itemTotal = rentalFee + deposit;
        itemsTotal += rentalFee;
        securityDepositTotal += deposit;
      }

      orderItems.push({
        resource: resource._id,
        title: resource.title,
        itemType: item.itemType,
        quantity: item.quantity,
        unitPrice,
        rentalDetails: item.itemType === 'RENT'
          ? {
              startDate: item.rentalDates.startDate,
              endDate: item.rentalDates.endDate,
              totalDays: item.rentalDates.totalDays,
              securityDeposit: resource.rentalPricing?.securityDeposit || 0
            }
          : undefined,
        seller: resource.owner,
        itemTotal
      });
    }

    const deliveryFee = 0; // Free campus delivery/pickup
    const grandTotal = Math.round((itemsTotal + securityDepositTotal + deliveryFee) * 100) / 100;

    const uniqueOrderId = `CK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const order = new Order({
      orderId: uniqueOrderId,
      buyer: buyerId,
      items: orderItems,
      pricing: {
        itemsTotal,
        securityDepositTotal,
        deliveryFee,
        grandTotal
      },
      paymentStatus: 'PENDING',
      orderStatus: 'PLACED',
      paymentMethod: paymentMethod || 'RAZORPAY',
      pickupOrDelivery: {
        type: pickupOrDelivery?.type || 'CAMPUS_PICKUP',
        location: pickupOrDelivery?.location || 'Main Campus Center',
        contactPhone: pickupOrDelivery?.contactPhone || '',
        instructions: pickupOrDelivery?.instructions || ''
      }
    });

    await order.save();

    // Clear cart after order is staged
    await cartService.clearCart(buyerId);

    // Generate Razorpay payment order
    const gatewayOrder = await paymentService.createGatewayOrder(order);

    return {
      order,
      gatewayOrder
    };
  }

  /**
   * Get user's placed orders
   */
  async getMyOrders(buyerId, query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ buyer: buyerId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('items.seller', 'name email campus phone')
        .populate('items.resource', 'images title condition'),
      Order.countDocuments({ buyer: buyerId })
    ]);

    return { orders, total, page, limit };
  }

  /**
   * Get orders received by seller/lessor
   */
  async getSellerOrders(sellerId, query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ 'items.seller': sellerId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('buyer', 'name email campus phone')
        .populate('items.resource', 'images title condition'),
      Order.countDocuments({ 'items.seller': sellerId })
    ]);

    return { orders, total, page, limit };
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId, userId, userRoles = []) {
    const order = await Order.findById(orderId)
      .populate('buyer', 'name email campus phone avatar')
      .populate('items.seller', 'name email campus phone')
      .populate('items.resource', 'images title condition campus');

    if (!order) throw ApiError.notFound('Order not found');

    const isBuyer = order.buyer._id.toString() === userId.toString();
    const isSeller = order.items.some((i) => i.seller._id.toString() === userId.toString());
    const isAdmin = userRoles.includes('admin') || userRoles.includes('super_admin');

    if (!isBuyer && !isSeller && !isAdmin) {
      throw ApiError.forbidden('You do not have permission to view this order');
    }

    return order;
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId, userId, reason) {
    const order = await Order.findById(orderId);
    if (!order) throw ApiError.notFound('Order not found');

    if (order.buyer.toString() !== userId.toString()) {
      throw ApiError.forbidden('Only the buyer can cancel this order');
    }

    if (['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(order.orderStatus)) {
      throw ApiError.badRequest(`Cannot cancel an order that is already ${order.orderStatus.toLowerCase()}`);
    }

    order.orderStatus = 'CANCELLED';
    order.cancellationReason = reason || 'Cancelled by student';
    await order.save();

    return order;
  }
}

module.exports = new OrderService();
