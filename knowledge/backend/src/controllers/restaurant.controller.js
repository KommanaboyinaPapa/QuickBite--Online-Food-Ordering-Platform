// backend/src/controllers/restaurant.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');
const { calculateDistance } = require('../utils/helpers');

const listRestaurants = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, cuisineType } = req.query;
    const skip = (page - 1) * limit;

    // Use contains for String comparison (SQLite)
    const where = cuisineType ? { cuisineTypes: { contains: cuisineType } } : {};

    const restaurants = await prisma.restaurant.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      include: {
        owner: { select: { firstName: true, lastName: true } }
      }
    });

    // Parse cuisineTypes for frontend compatibility
    const processedRestaurants = restaurants.map(r => ({
      ...r,
      cuisineTypes: typeof r.cuisineTypes === 'string' ? JSON.parse(r.cuisineTypes) : (r.cuisineTypes || [])
    }));

    const total = await prisma.restaurant.count({ where });

    res.status(200).json({
      success: true,
      data: processedRestaurants,
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

const getRestaurantDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        menuItems: {
          select: {
            id: true, name: true, price: true, imageUrl: true, rating: true, category: true
          }
        },
        reviews: {
          select: {
            id: true, rating: true, comment: true, createdAt: true, user: { select: { firstName: true } }
          },
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // Parse cuisineTypes
    if (restaurant.cuisineTypes && typeof restaurant.cuisineTypes === 'string') {
      try {
        restaurant.cuisineTypes = JSON.parse(restaurant.cuisineTypes);
      } catch (e) {
        restaurant.cuisineTypes = [];
      }
    }

    res.status(200).json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    next(error);
  }
};

const searchRestaurants = async (req, res, next) => {
  try {
    const { query, latitude, longitude, radius = 5 } = req.query;

    const restaurants = await prisma.restaurant.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { cuisineTypes: { contains: query } } // Using contains for String
        ]
      },
      include: {
        owner: { select: { firstName: true } }
      }
    });

    const processedRestaurants = restaurants.map(r => ({
      ...r,
      cuisineTypes: r.cuisineTypes ? JSON.parse(r.cuisineTypes) : []
    }));

    // Filter by distance if coordinates provided
    if (latitude && longitude) {
      const filtered = processedRestaurants.filter(r => {
        if (!r.latitude || !r.longitude) return true;
        const distance = calculateDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          r.latitude,
          r.longitude
        );
        return distance <= parseFloat(radius);
      });
      return res.status(200).json({
        success: true,
        data: filtered
      });
    }

    res.status(200).json({
      success: true,
      data: processedRestaurants
    });
  } catch (error) {
    next(error);
  }
};

// ... keep getNearbyRestaurants unchanged but verify it doesn't return cuisineTypes explicitly ...
// Actually, getNearbyRestaurants returns `nearby` which are restaurants. We should parse them too.
const getNearbyRestaurants = async (req, res, next) => {
  try {
    const { latitude, longitude, radius = 5 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude required' });
    }

    const restaurants = await prisma.restaurant.findMany({
      where: { isOpen: true },
      include: { owner: { select: { firstName: true } } }
    });

    const nearby = restaurants
      .map(r => ({
        ...r,
        cuisineTypes: r.cuisineTypes ? JSON.parse(r.cuisineTypes) : [],
        distance: r.latitude && r.longitude ? calculateDistance(
          parseFloat(latitude), parseFloat(longitude), r.latitude, r.longitude
        ) : null
      }))
      .filter(r => r.distance && r.distance <= parseFloat(radius))
      .sort((a, b) => a.distance - b.distance);

    res.status(200).json({ success: true, data: nearby });
  } catch (error) {
    next(error);
  }
};

// Normalize cuisineTypes from array, JSON string, or comma string to array
const normalizeCuisineTypes = (cuisineTypes) => {
  if (Array.isArray(cuisineTypes)) return cuisineTypes;
  if (!cuisineTypes) return [];
  // If it's already a JSON string, try parse; otherwise fall back to comma split
  if (typeof cuisineTypes === 'string') {
    try {
      const parsed = JSON.parse(cuisineTypes);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {
      // not JSON, continue to comma split
    }
    return cuisineTypes.split(',').map(c => c.trim()).filter(Boolean);
  }
  return [];
};

const createRestaurant = async (req, res, next) => {
  try {
    const { name, description, cuisineTypes, address, phone, latitude, longitude, minimumOrder, deliveryFee } = req.body;

    const normalizedCuisineTypes = normalizeCuisineTypes(cuisineTypes);

    const restaurant = await prisma.restaurant.create({
      data: {
        ownerId: req.user.id,
        name,
        description,
        cuisineTypes: normalizedCuisineTypes,
        address,
        phone,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        minimumOrder: parseFloat(minimumOrder) || 0,
        deliveryFee: parseFloat(deliveryFee) || 0
      }
    });

    logger.info(`Restaurant created: ${restaurant.id}`);

    res.status(201).json({
      success: true,
      message: 'Restaurant created successfully',
      data: restaurant
    });
  } catch (error) {
    next(error);
  }
};

const updateRestaurant = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const restaurant = await prisma.restaurant.findUnique({ where: { id } });

    if (!restaurant || restaurant.ownerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const body = { ...req.body };

    // Map imageUrl from client to existing schema fields
    if (body.imageUrl && !body.logoUrl) {
      body.logoUrl = body.imageUrl;
      delete body.imageUrl;
    }

    if (body.cuisineTypes !== undefined) {
      body.cuisineTypes = normalizeCuisineTypes(body.cuisineTypes);
    }

    const updated = await prisma.restaurant.update({
      where: { id },
      data: body
    });

    logger.info(`Restaurant updated: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Restaurant updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

const getRestaurantStats = async (req, res, next) => {
  try {
    const { id } = req.params;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        orders: {
          select: {
            id: true,
            total: true,
            status: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      }
    });

    if (!restaurant || restaurant.ownerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const totalOrders = restaurant.orders.length;
    const completedOrders = restaurant.orders.filter(o => o.status === 'delivered').length;
    const totalRevenue = restaurant.orders.reduce((sum, o) => sum + o.total, 0);
    const avgRating = restaurant.reviews.length > 0
      ? restaurant.reviews.reduce((sum, r) => sum + r.rating, 0) / restaurant.reviews.length
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        completedOrders,
        totalRevenue,
        avgRating,
        reviewCount: restaurant.reviews.length
      }
    });
  } catch (error) {
    next(error);
  }
};

const getRestaurantMenu = async (req, res, next) => {
  try {
    const { id } = req.params;

    const menuItems = await prisma.menuItem.findMany({
      where: { restaurantId: id, isAvailable: true },
      include: {
        ingredients: {
          include: { ingredient: true }
        }
      }
    });

    const categories = [...new Set(menuItems.map(item => item.category))].map(cat => ({
      id: cat,
      name: cat
    }));

    res.status(200).json({
      success: true,
      data: {
        items: menuItems,
        categories
      }
    });
  } catch (error) {
    next(error);
  }
};

const getMyRestaurant = async (req, res, next) => {
  try {
    const restaurant = await prisma.restaurant.findFirst({
      where: { ownerId: req.user.id }
    });

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'No restaurant found for this user' });
    }

    res.status(200).json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listRestaurants,
  getRestaurantDetails,
  searchRestaurants,
  getNearbyRestaurants,
  createRestaurant,
  updateRestaurant,
  getRestaurantStats,
  getRestaurantMenu,
  getMyRestaurant
};
