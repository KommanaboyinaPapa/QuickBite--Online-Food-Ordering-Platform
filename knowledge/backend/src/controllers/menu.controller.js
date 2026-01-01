// backend/src/controllers/menu.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');

const getMenuByRestaurant = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const { category } = req.query;

    const where = { restaurantId };
    if (category) {
      where.category = category;
    }

    const menuItems = await prisma.menuItem.findMany({
      where,
      include: {
        ingredients: {
          include: { ingredient: true }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: menuItems
    });
  } catch (error) {
    next(error);
  }
};

const getMenuItemDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const menuItem = await prisma.menuItem.findUnique({
      where: { id },
      include: {
        ingredients: {
          include: { ingredient: true }
        }
      }
    });

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    next(error);
  }
};

const createMenuItem = async (req, res, next) => {
  try {
    const { restaurantId, name, description, price, category, isVegetarian, isVegan, spiceLevel, preparationTime, ingredients } = req.body;
    
    console.log('Create menu item received ingredients:', ingredients);

    // Determine restaurant: prefer provided id, otherwise use the current owner's restaurant
    const restaurant = restaurantId
      ? await prisma.restaurant.findUnique({ where: { id: restaurantId } })
      : await prisma.restaurant.findFirst({ where: { ownerId: req.user.id } });

    if (!restaurant) {
      return res.status(400).json({
        success: false,
        message: 'No restaurant found for this owner'
      });
    }

    if (restaurant.ownerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const ingredientCreates = Array.isArray(ingredients)
      ? ingredients
          .map(ing => {
            if (ing && typeof ing === 'object' && ing.ingredientId) {
              return { ingredientId: ing.ingredientId, quantity: ing.quantity };
            }
            return null;
          })
          .filter(Boolean)
      : [];

    const menuItem = await prisma.menuItem.create({
      data: {
        restaurantId: restaurant.id,
        name,
        description,
        price: parseFloat(price),
        category,
        isVegetarian,
        isVegan,
        spiceLevel,
        preparationTime: preparationTime ? parseInt(preparationTime) : null,
        ingredients: ingredientCreates.length ? { create: ingredientCreates } : undefined
      },
      include: { ingredients: { include: { ingredient: true } } }
    });

    logger.info(`Menu item created: ${menuItem.id}`);

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: menuItem
    });
  } catch (error) {
    next(error);
  }
};

const updateMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, isVegetarian, isVegan, spiceLevel, preparationTime, isAvailable, ingredients } = req.body;

    // Verify ownership
    const menuItem = await prisma.menuItem.findUnique({ where: { id } });

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    const restaurant = await prisma.restaurant.findUnique({ where: { id: menuItem.restaurantId } });

    if (restaurant.ownerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Update ingredients if provided
    console.log('Update ingredients received:', ingredients);
    if (ingredients !== undefined) {
      // Delete existing ingredients
      await prisma.menuItemIngredient.deleteMany({ where: { menuItemId: id } });
      
      // Only create new ones if array has items
      if (Array.isArray(ingredients) && ingredients.length > 0) {
        const ingredientData = ingredients
          .filter(ing => ing && ing.ingredientId)
          .map(ing => ({
            menuItemId: id,
            ingredientId: ing.ingredientId,
            quantity: ing.quantity || '1 serving'
          }));
        
        console.log('Creating ingredient links:', ingredientData);
        if (ingredientData.length > 0) {
          await prisma.menuItemIngredient.createMany({ data: ingredientData });
        }
      }
    }

    const updated = await prisma.menuItem.update({
      where: { id },
      data: {
        name,
        description,
        price: price ? parseFloat(price) : undefined,
        category,
        isVegetarian,
        isVegan,
        spiceLevel,
        preparationTime: preparationTime ? parseInt(preparationTime) : null,
        isAvailable
      },
      include: { ingredients: { include: { ingredient: true } } }
    });

    logger.info(`Menu item updated: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Menu item updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

const deleteMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const menuItem = await prisma.menuItem.findUnique({ where: { id } });

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    const restaurant = await prisma.restaurant.findUnique({ where: { id: menuItem.restaurantId } });

    if (restaurant.ownerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    await prisma.menuItem.delete({ where: { id } });

    logger.info(`Menu item deleted: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getMenuCategories = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    const categories = await prisma.menuItem.findMany({
      where: { restaurantId },
      distinct: ['category'],
      select: { category: true }
    });

    const uniqueCategories = categories.map(c => c.category);

    res.status(200).json({
      success: true,
      data: uniqueCategories
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMenuByRestaurant,
  getMenuItemDetails,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getMenuCategories
};
