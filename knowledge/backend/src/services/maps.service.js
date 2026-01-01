// backend/src/services/maps.service.js
const axios = require('axios');
const logger = require('../utils/logger');

/**
 * OpenStreetMap & Nominatim Service for geolocation
 */
class MapsService {
  constructor() {
    this.nominatimBaseURL = 'https://nominatim.openstreetmap.org';
    this.osrmBaseURL = 'https://router.project-osrm.org';
  }

  async getCoordinatesFromAddress(street, city, postalCode) {
    try {
      const query = `${street}, ${city}, ${postalCode}`;

      const response = await axios.get(`${this.nominatimBaseURL}/search`, {
        params: {
          q: query,
          format: 'json',
          limit: 1
        },
        headers: {
          'User-Agent': 'FoodOrderApp'
        }
      });

      if (response.data.length === 0) {
        return {
          success: false,
          error: 'Address not found'
        };
      }

      const result = response.data[0];

      logger.info(`Coordinates found for address: ${query}`);
      return {
        success: true,
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        displayName: result.display_name
      };
    } catch (error) {
      logger.error(`Failed to get coordinates: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getAddressFromCoordinates(latitude, longitude) {
    try {
      const response = await axios.get(`${this.nominatimBaseURL}/reverse`, {
        params: {
          lat: latitude,
          lon: longitude,
          format: 'json'
        },
        headers: {
          'User-Agent': 'FoodOrderApp'
        }
      });

      const address = response.data.address;

      logger.info(`Address found for coordinates: ${latitude}, ${longitude}`);
      return {
        success: true,
        street: address.road || address.way,
        city: address.city || address.town,
        postalCode: address.postcode,
        displayName: response.data.display_name
      };
    } catch (error) {
      logger.error(`Failed to get address: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getDistance(lat1, lon1, lat2, lon2) {
    try {
      const response = await axios.get(
        `${this.osrmBaseURL}/route/v1/driving/${lon1},${lat1};${lon2},${lat2}`,
        {
          params: {
            overview: 'false'
          }
        }
      );

      if (response.data.routes.length === 0) {
        return {
          success: false,
          error: 'Route not found'
        };
      }

      const route = response.data.routes[0];
      const distanceKm = route.distance / 1000;
      const durationSeconds = route.duration;
      const durationMinutes = Math.ceil(durationSeconds / 60);

      logger.info(`Distance calculated: ${distanceKm.toFixed(2)} km, ${durationMinutes} mins`);
      return {
        success: true,
        distanceKm: parseFloat(distanceKm.toFixed(2)),
        durationMinutes,
        durationSeconds
      };
    } catch (error) {
      logger.error(`Failed to calculate distance: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getNearbyRestaurants(latitude, longitude, radiusKm = 5) {
    try {
      // This would use a spatial database query in production
      // For demo, return placeholder
      logger.info(`Nearby restaurants query: ${latitude}, ${longitude}`);
      return {
        success: true,
        message: 'Use database spatial queries (ST_DWithin in PostGIS) for better performance'
      };
    } catch (error) {
      logger.error(`Failed to find nearby restaurants: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new MapsService();
