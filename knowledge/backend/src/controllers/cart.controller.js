// backend/src/controllers/cart.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');

const getCart = async (req, res, next) => {
  try {
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            menuItem: {
              include: {
                ingredients: true, // expose full ingredient list for UI toggles
              },
            },
            exclusions: { include: { ingredient: true } },
          },
        },
      },
    });

    if (!cart) {
      return res.status(200).json({
        success: true,
        data: {
          id: null,
          userId: req.user.id,
          items: [],
          total: 0
        }
      });
    }

    // Calculate totals
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.menuItem.price * item.quantity,
      0,
    );
    const tax = subtotal * 0.05; // simple 5% tax placeholder
    const deliveryFee = 0; // can be overridden by restaurant delivery fee later
    const total = subtotal + tax + deliveryFee;

    res.status(200).json({
      success: true,
      data: {
        ...cart,
        subtotal,
        tax,
        deliveryFee,
        total,
      }
    });
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const { menuItemId, quantity = 1, specialInstructions } = req.body;

    // Get menu item and restaurant
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId },
      include: { restaurant: true }
    });

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Check or create cart
    let cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: req.user.id,
          restaurantId: menuItem.restaurantId
        }
      });
    }

    // If cart has items from different restaurant, clear it
    if (cart.restaurantId !== menuItem.restaurantId) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      cart = await prisma.cart.update({
        where: { id: cart.id },
        data: { restaurantId: menuItem.restaurantId }
      });
    }

    // Check if item already in cart
    let cartItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, menuItemId }
    });

    if (cartItem) {
      // Update quantity
      cartItem = await prisma.cartItem.update({
        where: { id: cartItem.id },
        data: { quantity: cartItem.quantity + quantity }
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          menuItemId,
          userId: req.user.id,
          quantity,
          specialInstructions
        }
      });
    }

    logger.info(`Item added to cart: ${cartItem.id}`);

    res.status(201).json({
      success: true,
      message: 'Item added to cart',
      data: cartItem
    });
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity, specialInstructions } = req.body;

    // Verify ownership
    const cartItem = await prisma.cartItem.findUnique({ where: { id: itemId } });

    if (!cartItem || cartItem.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const updated = await prisma.cartItem.update({
      where: { id: itemId },
      data: {
        quantity: quantity || cartItem.quantity,
        specialInstructions: specialInstructions || cartItem.specialInstructions
      }
    });

    logger.info(`Cart item updated: ${itemId}`);

    res.status(200).json({
      success: true,
      message: 'Cart item updated',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    // Verify ownership
    const cartItem = await prisma.cartItem.findUnique({ where: { id: itemId } });

    if (!cartItem || cartItem.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    await prisma.cartItem.delete({ where: { id: itemId } });

    logger.info(`Cart item removed: ${itemId}`);

    res.status(200).json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });

    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    logger.info(`Cart cleared for user: ${req.user.id}`);

    res.status(200).json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (error) {
    next(error);
  }
};

const addExclusions = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { ingredientIds } = req.body;

    // Verify ownership
    const cartItem = await prisma.cartItem.findUnique({ where: { id: itemId } });

    if (!cartItem || cartItem.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Create exclusions
    await prisma.cartItemExclusion.createMany({
      data: ingredientIds.map(ingredientId => ({
        cartItemId: itemId,
        ingredientId
      })),
      skipDuplicates: true
    });

    logger.info(`Exclusions added to cart item: ${itemId}`);

    res.status(201).json({
      success: true,
      message: 'Exclusions added'
    });
  } catch (error) {
    next(error);
  }
};

const setExclusions = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { ingredientIds = [] } = req.body;

    // Verify ownership
    const cartItem = await prisma.cartItem.findUnique({ where: { id: itemId } });

    if (!cartItem || cartItem.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Replace exclusions: remove existing, then add the desired set
    await prisma.cartItemExclusion.deleteMany({ where: { cartItemId: itemId } });

    if (ingredientIds.length > 0) {
      await prisma.cartItemExclusion.createMany({
        data: ingredientIds.map(ingredientId => ({ cartItemId: itemId, ingredientId })),
        skipDuplicates: true,
      });
    }

    logger.info(`Exclusions set for cart item: ${itemId}`);

    res.status(200).json({
      success: true,
      message: 'Exclusions updated'
    });
  } catch (error) {
    next(error);
  }
};

const removeExclusions = async (req, res, next) => {
  try {
    const { itemId, ingredientId } = req.params;

    // Verify ownership
    const cartItem = await prisma.cartItem.findUnique({ where: { id: itemId } });

    if (!cartItem || cartItem.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    await prisma.cartItemExclusion.deleteMany({
      where: {
        cartItemId: itemId,
        ingredientId
      }
    });

    logger.info(`Exclusion removed from cart item: ${itemId}`);

    res.status(200).json({
      success: true,
      message: 'Exclusion removed'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  addExclusions,
  setExclusions,
  removeExclusions
};
