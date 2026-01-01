// backend/src/controllers/ingredient.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');

const allergenTypes = ['peanuts', 'tree_nuts', 'dairy', 'eggs', 'shellfish', 'fish', 'soy', 'wheat', 'sesame'];

const getRestaurantIngredients = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    const ingredients = await prisma.ingredient.findMany({
      where: { restaurantId }
    });

    res.status(200).json({
      success: true,
      data: ingredients
    });
  } catch (error) {
    next(error);
  }
};

const createIngredient = async (req, res, next) => {
  try {
    const { restaurantId, name, allergenType, isVegetarian, isVegan, description } = req.body;

    // Verify restaurant ownership
    const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });

    if (!restaurant || restaurant.ownerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const ingredient = await prisma.ingredient.create({
      data: {
        restaurantId,
        name,
        allergenType,
        isVegetarian,
        isVegan,
        description
      }
    });

    logger.info(`Ingredient created: ${ingredient.id}`);

    res.status(201).json({
      success: true,
      message: 'Ingredient created successfully',
      data: ingredient
    });
  } catch (error) {
    next(error);
  }
};

const updateIngredient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, allergenType, isVegetarian, isVegan, description } = req.body;

    // Verify ownership
    const ingredient = await prisma.ingredient.findUnique({ where: { id } });

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: 'Ingredient not found'
      });
    }

    const restaurant = await prisma.restaurant.findUnique({ where: { id: ingredient.restaurantId } });

    if (restaurant.ownerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const updated = await prisma.ingredient.update({
      where: { id },
      data: {
        name,
        allergenType,
        isVegetarian,
        isVegan,
        description
      }
    });

    logger.info(`Ingredient updated: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Ingredient updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

const deleteIngredient = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ingredient = await prisma.ingredient.findUnique({ where: { id } });

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: 'Ingredient not found'
      });
    }

    const restaurant = await prisma.restaurant.findUnique({ where: { id: ingredient.restaurantId } });

    if (restaurant.ownerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    await prisma.ingredient.delete({ where: { id } });

    logger.info(`Ingredient deleted: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Ingredient deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getAllergenTypes = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: allergenTypes
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRestaurantIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  getAllergenTypes
};
