const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');
const { generateOrderNumber } = require('../utils/helpers'); // Assuming this helper exists

const createOrder = async (req, res, next) => {
  try {
    const { restaurantId, deliveryAddressId, specialInstructions } = req.body;

    // Basic sanity checks to avoid Prisma runtime errors
    if (!restaurantId) {
      return res.status(400).json({ success: false, message: 'restaurantId is required' });
    }
    if (!deliveryAddressId) {
      return res.status(400).json({ success: false, message: 'deliveryAddressId is required' });
    }

    // Get cart (Single Source of Truth)
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: { menuItem: true, exclusions: true }
        }
      }
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Verify address ownership
    const address = await prisma.address.findUnique({ where: { id: deliveryAddressId } });

    if (!address || address.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Invalid delivery address'
      });
    }

    // Get restaurant
    const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Calculate totals from DB data (Secure)
    const subtotal = cart.items.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
    const tax = subtotal * 0.05; // 5% tax
    const deliveryFee = restaurant.deliveryFee || 0;
    const total = subtotal + tax + deliveryFee;

    // Estimate ETA: prep time + travel time (distance/speed)
    const prepMinutes = cart.items.reduce((max, item) => {
      const prep = item.menuItem.preparationTime || 15;
      return Math.max(max, prep);
    }, 15);
    const distanceKm = 5; // placeholder until real distance calc
    const speedKmph = 30; // average urban speed
    const travelMinutes = (distanceKm / speedKmph) * 60;
    const eta = new Date();
    eta.setMinutes(eta.getMinutes() + prepMinutes + travelMinutes);

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerId: req.user.id,
        restaurantId,
        deliveryAddressId,
        status: 'pending',
        subtotal,
        tax,
        deliveryFee,
        total,
        estimatedDeliveryTime: eta,
        paymentMethod: 'razorpay',
        paymentStatus: 'pending',
        specialInstructions,
        items: {
          create: cart.items.map(item => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            priceAtOrder: item.menuItem.price,
            specialInstructions: item.specialInstructions || '',
            exclusions: {
              create: item.exclusions.map(exc => ({
                ingredientId: exc.ingredientId
              }))
            }
          }))
        },
        tracking: {
          create: {
            restaurantLatitude: restaurant.latitude || 37.78825,
            restaurantLongitude: restaurant.longitude || -122.4324,
            customerLatitude: address.latitude || 37.79825,
            customerLongitude: address.longitude || -122.4224,
            status: 'restaurant_to_customer',
            distanceRemaining: 5.0
          }
        }
      },
      include: {
        items: {
          include: {
            menuItem: true,
            exclusions: { include: { ingredient: true } }
          }
        }
      }
    });

    // Clear cart after successful order
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    logger.info(`Order created: ${order.id}`);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      customerId: req.user.id
    };

    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      include: {
        items: { include: { menuItem: true } },
        restaurant: { select: { id: true, name: true } },
        tracking: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.order.count({ where });

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getOrderDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            menuItem: true,
            exclusions: { include: { ingredient: true } }
          }
        },
        restaurant: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true
          }
        },
        deliveryAddress: true,
        tracking: true,
        deliveryAgent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify ownership
    if (order.customerId !== req.user.id && req.user.userType !== 'restaurant' && req.user.userType !== 'delivery_agent') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { menuItem: true } },
        tracking: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify authorization
    if (req.user.userType === 'restaurant') {
      const restaurant = await prisma.restaurant.findUnique({ where: { id: order.restaurantId } });
      if (restaurant.ownerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized'
        });
      }
    } else if (req.user.userType === 'delivery_agent') {
      if (order.deliveryAgentId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized'
        });
      }
    }

    const updatedData = { status };

    // Dynamic ETA Calculation - only if we have valid data
    const baseDistance = order.tracking?.distanceRemaining || 5;
    const speedKmph = 30;

    if (status === 'preparing' || status === 'confirmed') { // Restaurant Accepted
      const prepTime = order.items?.reduce((max, item) => {
        const prep = item.menuItem?.preparationTime || 15;
        return Math.max(max, prep);
      }, 15) || 15;
      const travelTime = (baseDistance / speedKmph) * 60;
      const eta = new Date();
      const totalMinutes = Math.round(prepTime + travelTime);
      if (!isNaN(totalMinutes) && totalMinutes > 0) {
        eta.setMinutes(eta.getMinutes() + totalMinutes);
        updatedData.estimatedDeliveryTime = eta;
      }
    } else if (status === 'picked_up') { // Agent Picked Up
      const distance = order.tracking?.distanceRemaining || baseDistance;
      const travelTime = (distance / speedKmph) * 60;
      const eta = new Date();
      const totalMinutes = Math.round(travelTime);
      if (!isNaN(totalMinutes) && totalMinutes > 0) {
        eta.setMinutes(eta.getMinutes() + totalMinutes);
        updatedData.estimatedDeliveryTime = eta;
      }
    }

    const updated = await prisma.order.update({
      where: { id },
      data: updatedData,
      include: { items: { include: { menuItem: true } } }
    });

    logger.info(`Order status updated: ${id} -> ${status}`);

    res.status(200).json({
      success: true,
      message: 'Order status updated',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.customerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel order in current status'
      });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: 'cancelled' }
    });

    logger.info(`Order cancelled: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

const getRestaurantOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const restaurant = await prisma.restaurant.findFirst({ where: { ownerId: req.user.id } });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    const where = { restaurantId: restaurant.id };

    if (status) {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const orders = await prisma.order.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      include: {
        items: {
          include: {
            menuItem: true,
            exclusions: { include: { ingredient: true } }
          }
        },
        customer: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.order.count({ where });

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getDeliveryAgentOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const where = { deliveryAgentId: req.user.id };

    if (status) {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const orders = await prisma.order.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      include: {
        items: { include: { menuItem: true } },
        restaurant: true,
        deliveryAddress: true,
        tracking: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.order.count({ where });

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getAvailableOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Find orders ready for pickup with no agent assigned
    const where = {
      status: { in: ['ready', 'preparing'] },
      deliveryAgentId: null
    };

    const orders = await prisma.order.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      include: {
        items: true,
        restaurant: {
          select: {
            name: true,
            address: true,
            latitude: true,
            longitude: true
          }
        },
        deliveryAddress: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.order.count({ where });

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const acceptDelivery = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.deliveryAgentId) {
      return res.status(400).json({
        success: false,
        message: 'Order already assigned to another agent'
      });
    }

    // Assign agent but keep current status - agent will mark as picked_up when they have the food
    const updated = await prisma.order.update({
      where: { id },
      data: {
        deliveryAgentId: req.user.id
        // Do not change status yet - agent will use updateOrderStatus when they pick up
      },
      include: {
        restaurant: true,
        deliveryAddress: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Delivery accepted',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderDetails,
  updateOrderStatus,
  cancelOrder,
  getRestaurantOrders,
  getDeliveryAgentOrders,
  getAvailableOrders,
  acceptDelivery
};
