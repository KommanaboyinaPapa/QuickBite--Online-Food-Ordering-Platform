/**
 * Utility functions for normalizing and handling images
 * Supports: Google Drive, Google Photos, Unsplash, Pexels, direct URLs
 */

// Placeholder images for fallback (using free Unsplash images)
const PLACEHOLDER_IMAGES = {
  restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
  food: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
  person: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
  default: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop'
};

// Cuisine-specific food images for better fallbacks
const CUISINE_FOOD_IMAGES = {
  italian: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
  pizza: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
  chinese: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
  asian: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=400&h=300&fit=crop',
  mexican: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop',
  indian: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop',
  burgers: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
  american: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
  sushi: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop',
  japanese: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop',
  thai: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400&h=300&fit=crop',
  mediterranean: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop',
  salad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
  dessert: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=300&fit=crop',
  drinks: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop',
  coffee: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop',
  breakfast: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
  seafood: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=400&h=300&fit=crop'
};

/**
 * Normalize external image URLs to direct-loadable format
 */
export const normalizeImageUrl = (url) => {
  if (!url) return null;
  const trimmed = url.trim();

  // Already a data URL
  if (trimmed.startsWith('data:')) return trimmed;

  // Convert Google Drive share links to direct view links
  const driveFileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([^/\?]+)/i);
  if (driveFileMatch && driveFileMatch[1]) {
    return `https://drive.google.com/uc?export=view&id=${driveFileMatch[1]}`;
  }

  // Convert Drive links with ?id=XYZ
  const driveIdMatch = trimmed.match(/[?&]id=([^&]+)/i);
  if (trimmed.includes('drive.google.com') && driveIdMatch && driveIdMatch[1]) {
    return `https://drive.google.com/uc?export=view&id=${driveIdMatch[1]}`;
  }

  // Google Photos - extract photo ID and convert
  if (trimmed.includes('lh3.googleusercontent.com') || trimmed.includes('photos.google.com')) {
    // Already a direct Google Photos URL
    if (trimmed.includes('lh3.googleusercontent.com')) {
      // Add size parameter if not present
      if (!trimmed.includes('=')) {
        return `${trimmed}=w800`;
      }
      return trimmed;
    }
  }

  // Unsplash - ensure proper sizing
  if (trimmed.includes('unsplash.com') && !trimmed.includes('?')) {
    return `${trimmed}?w=400&h=300&fit=crop`;
  }

  // Prefer https over http
  if (trimmed.startsWith('http://')) {
    return trimmed.replace('http://', 'https://');
  }

  return trimmed;
};

/**
 * Get a placeholder image by type
 */
export const getPlaceholderImage = (type = 'default') => {
  return PLACEHOLDER_IMAGES[type] || PLACEHOLDER_IMAGES.default;
};

/**
 * Get a food image based on cuisine type (for fallback purposes)
 * @param {string|string[]} cuisineType - Cuisine type or array of types
 * @returns {string} URL of a relevant food image
 */
export const getFoodImageByCuisine = (cuisineType) => {
  if (!cuisineType) return PLACEHOLDER_IMAGES.food;

  // Handle array of cuisine types
  const types = Array.isArray(cuisineType) ? cuisineType : [cuisineType];

  for (const type of types) {
    const key = type.toLowerCase().trim();
    if (CUISINE_FOOD_IMAGES[key]) {
      return CUISINE_FOOD_IMAGES[key];
    }
  }

  return PLACEHOLDER_IMAGES.food;
};

/**
 * Get image source with fallback
 * Returns an object suitable for React Native Image source prop
 */
export const getImageSource = (url, fallbackType = 'default') => {
  const normalizedUrl = normalizeImageUrl(url);

  if (normalizedUrl) {
    return { uri: normalizedUrl };
  }

  return { uri: getPlaceholderImage(fallbackType) };
};

/**
 * Get food image source with cuisine-aware fallback
 * @param {string} url - Primary image URL
 * @param {string|string[]} cuisineType - Cuisine type for fallback selection
 * @returns {object} Image source object for React Native
 */
export const getFoodImageSource = (url, cuisineType) => {
  const normalizedUrl = normalizeImageUrl(url);

  if (normalizedUrl) {
    return { uri: normalizedUrl };
  }

  return { uri: getFoodImageByCuisine(cuisineType) };
};

/**
 * Check if URL is a valid image URL
 */
export const isValidImageUrl = (url) => {
  if (!url) return false;
  const trimmed = url.trim().toLowerCase();

  // Check for common image extensions
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  if (imageExtensions.some(ext => trimmed.includes(ext))) {
    return true;
  }

  // Check for known image hosting services
  const imageServices = [
    'unsplash.com',
    'pexels.com',
    'drive.google.com',
    'lh3.googleusercontent.com',
    'images.unsplash.com',
    'cloudinary.com',
    'imgur.com',
    'via.placeholder.com'
  ];

  return imageServices.some(service => trimmed.includes(service));
};

export default {
  normalizeImageUrl,
  getPlaceholderImage,
  getFoodImageByCuisine,
  getImageSource,
  getFoodImageSource,
  isValidImageUrl
};

