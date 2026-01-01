// backend/src/controllers/user.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');

const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { allergyProfile: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, profileImage } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        firstName,
        lastName,
        profileImage
      }
    });

    logger.info(`Profile updated: ${user.id}`);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const getAddresses = async (req, res, next) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id }
    });

    res.status(200).json({
      success: true,
      data: addresses
    });
  } catch (error) {
    next(error);
  }
};

const addAddress = async (req, res, next) => {
  try {
    const { street, city, postalCode, latitude, longitude, addressType, isDefault } = req.body;

    // If marking as default, unset others
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: req.user.id,
        street,
        city,
        postalCode,
        latitude,
        longitude,
        addressType,
        isDefault: isDefault || false
      }
    });

    logger.info(`Address added: ${address.id}`);

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: address
    });
  } catch (error) {
    next(error);
  }
};

const updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { street, city, postalCode, latitude, longitude, addressType, isDefault } = req.body;

    // Verify ownership
    const address = await prisma.address.findUnique({ where: { id } });

    if (!address || address.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // If marking as default, unset others
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id, id: { not: id } },
        data: { isDefault: false }
      });
    }

    const updatedAddress = await prisma.address.update({
      where: { id },
      data: {
        street,
        city,
        postalCode,
        latitude,
        longitude,
        addressType,
        isDefault
      }
    });

    logger.info(`Address updated: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      data: updatedAddress
    });
  } catch (error) {
    next(error);
  }
};

const deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const address = await prisma.address.findUnique({ where: { id } });

    if (!address || address.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    await prisma.address.delete({ where: { id } });

    logger.info(`Address deleted: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getAllergies = async (req, res, next) => {
  try {
    const allergyProfile = await prisma.allergyProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!allergyProfile) {
      return res.status(404).json({
        success: false,
        message: 'Allergy profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: allergyProfile
    });
  } catch (error) {
    next(error);
  }
};

const updateAllergies = async (req, res, next) => {
  try {
    const { allergies, dietaryRestrictions, healthConditions, spicePreference } = req.body;

    const allergyProfile = await prisma.allergyProfile.update({
      where: { userId: req.user.id },
      data: {
        allergies: allergies || [],
        dietaryRestrictions: dietaryRestrictions || [],
        healthConditions: healthConditions || [],
        spicePreference
      }
    });

    logger.info(`Allergies updated: ${req.user.id}`);

    res.status(200).json({
      success: true,
      message: 'Allergy profile updated successfully',
      data: allergyProfile
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getAllergies,
  updateAllergies
};
