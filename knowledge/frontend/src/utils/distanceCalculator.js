/**
 * Distance Calculator - Calculate distances between locations
 */

const EARTH_RADIUS_KM = 6371;

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {Number} lat1 - First latitude
 * @param {Number} lon1 - First longitude
 * @param {Number} lat2 - Second latitude
 * @param {Number} lon2 - Second longitude
 * @returns {Number} - Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
};

/**
 * Convert degrees to radians
 * @param {Number} degrees - Angle in degrees
 * @returns {Number} - Angle in radians
 */
const toRad = degrees => {
  return (degrees * Math.PI) / 180;
};

/**
 * Format distance for display
 * @param {Number} distanceKm - Distance in km
 * @returns {String} - Formatted distance string
 */
export const formatDistance = distanceKm => {
  if (distanceKm < 1) {
    return `${(distanceKm * 1000).toFixed(0)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
};

/**
 * Estimate delivery time based on distance
 * @param {Number} distanceKm - Distance in km
 * @param {Number} baseTime - Base preparation time in minutes
 * @returns {Object} - Min and max estimated times
 */
export const estimateDeliveryTime = (distanceKm, baseTime = 30) => {
  // Average delivery speed: 30 km/h in city, 20 km/h in slow areas
  const avgSpeed = 25;
  const deliveryMinutes = Math.round((distanceKm / avgSpeed) * 60);
  
  return {
    min: baseTime + Math.round(deliveryMinutes * 0.9),
    max: baseTime + Math.round(deliveryMinutes * 1.1),
    formatted: `${baseTime + Math.round(deliveryMinutes * 0.9)}-${baseTime + Math.round(deliveryMinutes * 1.1)} mins`
  };
};

/**
 * Sort locations by distance
 * @param {Array} locations - Array of location objects with lat/lon
 * @param {Number} centerLat - Reference latitude
 * @param {Number} centerLon - Reference longitude
 * @returns {Array} - Sorted by distance (closest first)
 */
export const sortByDistance = (locations = [], centerLat, centerLon) => {
  return [...locations].sort((a, b) => {
    const distA = calculateDistance(centerLat, centerLon, a.latitude || a.lat, a.longitude || a.lon);
    const distB = calculateDistance(centerLat, centerLon, b.latitude || b.lat, b.longitude || b.lon);
    return distA - distB;
  });
};

/**
 * Filter locations within radius
 * @param {Array} locations - Array of location objects
 * @param {Number} centerLat - Reference latitude
 * @param {Number} centerLon - Reference longitude
 * @param {Number} radiusKm - Search radius in kilometers
 * @returns {Array} - Locations within radius
 */
export const filterByRadius = (locations = [], centerLat, centerLon, radiusKm = 5) => {
  return locations.filter(location => {
    const dist = calculateDistance(
      centerLat,
      centerLon,
      location.latitude || location.lat,
      location.longitude || location.lon
    );
    return dist <= radiusKm;
  });
};

/**
 * Calculate average location (center point)
 * @param {Array} locations - Array of coordinates
 * @returns {Object} - Center point {lat, lon}
 */
export const calculateCenterPoint = (locations = []) => {
  if (!locations.length) return { lat: 0, lon: 0 };

  const sum = locations.reduce(
    (acc, loc) => ({
      lat: acc.lat + (loc.latitude || loc.lat || 0),
      lon: acc.lon + (loc.longitude || loc.lon || 0)
    }),
    { lat: 0, lon: 0 }
  );

  return {
    lat: sum.lat / locations.length,
    lon: sum.lon / locations.length
  };
};

/**
 * Calculate bearing between two points
 * @param {Number} lat1 - First latitude
 * @param {Number} lon1 - First longitude
 * @param {Number} lat2 - Second latitude
 * @param {Number} lon2 - Second longitude
 * @returns {Number} - Bearing in degrees (0-360)
 */
export const calculateBearing = (lat1, lon1, lat2, lon2) => {
  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  const bearing = Math.atan2(y, x);
  return ((toRad(bearing) + 360) % 360);
};
