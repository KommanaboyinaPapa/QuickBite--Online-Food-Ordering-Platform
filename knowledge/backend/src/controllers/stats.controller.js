// backend/src/controllers/stats.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');

/**
 * Get restaurant owner stats
 */
const getRestaurantStats = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Get user's restaurant
        const restaurant = await prisma.restaurant.findFirst({
            where: { ownerId: userId }
        });

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found'
            });
        }

        // Get today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Today's stats
        const todayOrders = await prisma.order.findMany({
            where: {
                restaurantId: restaurant.id,
                createdAt: { gte: today, lt: tomorrow },
                status: { notIn: ['cancelled'] }
            }
        });

        const todayOrderCount = todayOrders.length;
        const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.total || 0), 0);

        // Total lifetime stats
        const allOrders = await prisma.order.findMany({
            where: {
                restaurantId: restaurant.id,
                status: { notIn: ['cancelled'] }
            }
        });

        const totalOrders = allOrders.length;
        const totalRevenue = allOrders.reduce((sum, order) => sum + (order.total || 0), 0);

        // Get restaurant rating
        const reviews = await prisma.review.findMany({
            where: { restaurantId: restaurant.id }
        });

        const rating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;
        const reviewCount = reviews.length;

        // This week's stats
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)

        const weekOrders = await prisma.order.findMany({
            where: {
                restaurantId: restaurant.id,
                createdAt: { gte: weekStart },
                status: { notIn: ['cancelled'] }
            }
        });

        const weeklyOrders = weekOrders.length;
        const weeklyRevenue = weekOrders.reduce((sum, order) => sum + (order.total || 0), 0);

        // Pending orders count
        const pendingOrders = await prisma.order.count({
            where: {
                restaurantId: restaurant.id,
                status: { in: ['pending', 'confirmed', 'preparing'] }
            }
        });

        res.status(200).json({
            success: true,
            data: {
                restaurant: {
                    id: restaurant.id,
                    name: restaurant.name
                },
                today: {
                    orders: todayOrderCount,
                    revenue: todayRevenue
                },
                weekly: {
                    orders: weeklyOrders,
                    revenue: weeklyRevenue
                },
                lifetime: {
                    orders: totalOrders,
                    revenue: totalRevenue
                },
                rating: parseFloat(rating.toFixed(1)),
                reviewCount,
                pendingOrders
            }
        });
    } catch (error) {
        logger.error('Error fetching restaurant stats:', error);
        next(error);
    }
};

/**
 * Get delivery agent stats
 */
const getDeliveryAgentStats = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Get today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Today's completed deliveries
        const todayDeliveries = await prisma.order.findMany({
            where: {
                deliveryAgentId: userId,
                status: 'delivered',
                updatedAt: { gte: today, lt: tomorrow }
            }
        });

        const todayDeliveryCount = todayDeliveries.length;

        // Calculate earnings (assume delivery fee per order)
        const DELIVERY_FEE_PER_ORDER = 50; // Base delivery fee
        const todayEarnings = todayDeliveries.reduce((sum, order) => {
            return sum + (order.deliveryFee || DELIVERY_FEE_PER_ORDER);
        }, 0);

        // Tips (if tracked in order)
        const todayTips = todayDeliveries.reduce((sum, order) => {
            return sum + (order.tip || 0);
        }, 0);

        // This week's stats
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());

        const weekDeliveries = await prisma.order.findMany({
            where: {
                deliveryAgentId: userId,
                status: 'delivered',
                updatedAt: { gte: weekStart }
            }
        });

        const weeklyDeliveryCount = weekDeliveries.length;
        const weeklyEarnings = weekDeliveries.reduce((sum, order) => {
            return sum + (order.deliveryFee || DELIVERY_FEE_PER_ORDER) + (order.tip || 0);
        }, 0);

        // Total lifetime stats
        const allDeliveries = await prisma.order.findMany({
            where: {
                deliveryAgentId: userId,
                status: 'delivered'
            }
        });

        const totalDeliveries = allDeliveries.length;
        const totalEarnings = allDeliveries.reduce((sum, order) => {
            return sum + (order.deliveryFee || DELIVERY_FEE_PER_ORDER) + (order.tip || 0);
        }, 0);

        // Calculate rating from delivered orders
        const ordersWithRating = await prisma.order.findMany({
            where: {
                deliveryAgentId: userId,
                deliveryRating: { not: null }
            },
            select: { deliveryRating: true }
        });

        const rating = ordersWithRating.length > 0
            ? ordersWithRating.reduce((sum, o) => sum + o.deliveryRating, 0) / ordersWithRating.length
            : 4.5; // Default rating

        // Calculate completion rate
        const allAssignedOrders = await prisma.order.count({
            where: { deliveryAgentId: userId }
        });

        const completedOrders = await prisma.order.count({
            where: {
                deliveryAgentId: userId,
                status: 'delivered'
            }
        });

        const completionRate = allAssignedOrders > 0
            ? Math.round((completedOrders / allAssignedOrders) * 100)
            : 100;

        // Active delivery (current order being delivered)
        const activeDelivery = await prisma.order.findFirst({
            where: {
                deliveryAgentId: userId,
                status: { in: ['picked_up', 'ready'] }
            },
            include: {
                restaurant: { select: { name: true, address: true } },
                deliveryAddress: true
            }
        });

        res.status(200).json({
            success: true,
            data: {
                today: {
                    deliveries: todayDeliveryCount,
                    earnings: todayEarnings,
                    tips: todayTips,
                    hoursOnline: 0 // Would need to track login/logout times
                },
                weekly: {
                    deliveries: weeklyDeliveryCount,
                    earnings: weeklyEarnings
                },
                lifetime: {
                    deliveries: totalDeliveries,
                    earnings: totalEarnings
                },
                rating: parseFloat(rating.toFixed(1)),
                completionRate,
                activeDelivery: activeDelivery ? {
                    orderId: activeDelivery.id,
                    restaurant: activeDelivery.restaurant?.name,
                    address: activeDelivery.deliveryAddress
                } : null
            }
        });
    } catch (error) {
        logger.error('Error fetching delivery agent stats:', error);
        next(error);
    }
};

module.exports = {
    getRestaurantStats,
    getDeliveryAgentStats
};
