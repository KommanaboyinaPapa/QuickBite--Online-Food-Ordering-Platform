// backend/src/controllers/review.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');

const createReview = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { rating, comment } = req.body;

    // Get order
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify ownership
    if (order.customerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Check if already reviewed
    const existingReview = await prisma.review.findFirst({
      where: { orderId }
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Order already reviewed'
      });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        orderId,
        restaurantId: order.restaurantId,
        userId: req.user.id,
        rating,
        comment
      }
    });

    // Update restaurant rating
    const allReviews = await prisma.review.findMany({
      where: { restaurantId: order.restaurantId }
    });

    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.restaurant.update({
      where: { id: order.restaurantId },
      data: {
        rating: avgRating,
        ratingCount: allReviews.length
      }
    });

    logger.info(`Review created: ${review.id}`);

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review
    });
  } catch (error) {
    next(error);
  }
};

const getRestaurantReviews = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const reviews = await prisma.review.findMany({
      where: { restaurantId },
      skip: parseInt(skip),
      take: parseInt(limit),
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            profileImage: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.review.count({ where: { restaurantId } });

    res.status(200).json({
      success: true,
      data: reviews,
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

const getOrderReview = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const review = await prisma.review.findFirst({
      where: { orderId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            profileImage: true
          }
        }
      }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    // Get review
    const review = await prisma.review.findUnique({ where: { id: reviewId } });

    if (!review || review.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Update review
    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: rating || review.rating,
        comment: comment || review.comment
      }
    });

    // Update restaurant rating
    const allReviews = await prisma.review.findMany({
      where: { restaurantId: review.restaurantId }
    });

    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.restaurant.update({
      where: { id: review.restaurantId },
      data: {
        rating: avgRating
      }
    });

    logger.info(`Review updated: ${reviewId}`);

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    // Get review
    const review = await prisma.review.findUnique({ where: { id: reviewId } });

    if (!review || review.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const restaurantId = review.restaurantId;

    // Delete review
    await prisma.review.delete({ where: { id: reviewId } });

    // Update restaurant rating
    const allReviews = await prisma.review.findMany({
      where: { restaurantId }
    });

    if (allReviews.length > 0) {
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await prisma.restaurant.update({
        where: { id: restaurantId },
        data: {
          rating: avgRating,
          ratingCount: allReviews.length
        }
      });
    } else {
      await prisma.restaurant.update({
        where: { id: restaurantId },
        data: {
          rating: 0,
          ratingCount: 0
        }
      });
    }

    logger.info(`Review deleted: ${reviewId}`);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getRestaurantReviews,
  getOrderReview,
  updateReview,
  deleteReview
};
