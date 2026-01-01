// backend/src/utils/helpers.js
const { v4: uuidv4 } = require('uuid');

const generateId = () => uuidv4();

const generateOrderNumber = () => {
  return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  // Haversine formula to calculate distance between two coordinates
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const calculateETA = (distanceInKm) => {
  // Average speed: 15 km/h for delivery
  const timeInHours = distanceInKm / 15;
  const timeInMinutes = Math.ceil(timeInHours * 60);
  return timeInMinutes;
};

const formatPrice = (price) => {
  return parseFloat(price).toFixed(2);
};

const getCurrentTimestamp = () => {
  return new Date().toISOString();
};

const hashPassword = async (password) => {
  const bcrypt = require('bcrypt');
  return bcrypt.hash(password, 10);
};

const comparePassword = async (password, hash) => {
  const bcrypt = require('bcrypt');
  return bcrypt.compare(password, hash);
};

module.exports = {
  generateId,
  generateOrderNumber,
  calculateDistance,
  calculateETA,
  formatPrice,
  getCurrentTimestamp,
  hashPassword,
  comparePassword
};
