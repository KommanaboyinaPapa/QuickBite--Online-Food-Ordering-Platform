/**
 * Allergen & Ingredient Checking Utilities
 * Check for user allergies and validate menu items
 */

import { ALLERGENS } from './constants';

/**
 * Check if menu item contains user allergens
 */
export const checkAllergenWarnings = (menuItem, userAllergies = []) => {
  if (!menuItem || !menuItem.ingredients) return [];

  const warnings = [];
  
  menuItem.ingredients.forEach((ingredient) => {
    if (ingredient.allergenType && userAllergies.includes(ingredient.allergenType)) {
      warnings.push({
        ingredientId: ingredient.id,
        ingredientName: ingredient.name,
        allergenType: ingredient.allergenType,
        severity: 'high',
      });
    }
  });

  return warnings;
};

/**
 * Check if all cart items are safe for user
 */
export const validateCartForAllergies = (cartItems = [], userAllergies = []) => {
  const issues = [];

  cartItems.forEach((item) => {
    if (!item.ingredients) return;

    const itemIssues = [];
    item.ingredients.forEach((ingredient) => {
      if (ingredient.allergenType && userAllergies.includes(ingredient.allergenType)) {
        const isExcluded = item.exclusions?.some(e => e.ingredientId === ingredient.id);
        
        if (!isExcluded) {
          itemIssues.push({
            ingredientId: ingredient.id,
            ingredientName: ingredient.name,
            allergenType: ingredient.allergenType,
          });
        }
      }
    });

    if (itemIssues.length > 0) {
      issues.push({
        cartItemId: item.id,
        menuItemName: item.name,
        allergens: itemIssues,
      });
    }
  });

  return issues;
};

/**
 * Get ingredients that can be excluded to avoid allergens
 */
export const getExcludableIngredientsForAllergy = (menuItem, allergenType) => {
  if (!menuItem || !menuItem.ingredients) return [];

  return menuItem.ingredients.filter(
    ingredient => ingredient.allergenType === allergenType
  );
};

/**
 * Check if user has specific allergen
 */
export const userHasAllergen = (userAllergies = [], allergenType) => {
  return userAllergies.includes(allergenType);
};

/**
 * Get all unique allergens in menu
 */
export const getMenuAllergens = (menuItems = []) => {
  const allergenSet = new Set();

  menuItems.forEach((item) => {
    if (item.ingredients) {
      item.ingredients.forEach((ingredient) => {
        if (ingredient.allergenType) {
          allergenSet.add(ingredient.allergenType);
        }
      });
    }
  });

  return Array.from(allergenSet);
};

/**
 * Get allergen severity level
 */
export const getAllergenSeverity = (allergenType) => {
  const severeAllergens = ['peanuts', 'tree_nuts', 'shellfish', 'fish'];
  
  if (severeAllergens.includes(allergenType)) {
    return 'critical';
  }
  
  return 'moderate';
};

/**
 * Format allergen for display with icon/color
 */
export const formatAllergenDisplay = (allergenType) => {
  const allergenInfo = {
    peanuts: {
      name: 'Peanuts',
      emoji: '🥜',
      color: '#FF6B35',
    },
    tree_nuts: {
      name: 'Tree Nuts',
      emoji: '🌰',
      color: '#FF8C5A',
    },
    dairy: {
      name: 'Dairy',
      emoji: '🥛',
      color: '#FF6B9D',
    },
    eggs: {
      name: 'Eggs',
      emoji: '🥚',
      color: '#FFC75F',
    },
    shellfish: {
      name: 'Shellfish',
      emoji: '🦐',
      color: '#FF4444',
    },
    fish: {
      name: 'Fish',
      emoji: '🐟',
      color: '#5E60CE',
    },
    soy: {
      name: 'Soy',
      emoji: '🫘',
      color: '#8B4513',
    },
    wheat: {
      name: 'Wheat',
      emoji: '🌾',
      color: '#D4A574',
    },
    sesame: {
      name: 'Sesame',
      emoji: '🌱',
      color: '#97B632',
    },
    mustard: {
      name: 'Mustard',
      emoji: '🍯',
      color: '#F4C430',
    },
  };

  return allergenInfo[allergenType] || {
    name: allergenType,
    emoji: '⚠️',
    color: '#8C8C8C',
  };
};

/**
 * Match user preferences with menu items
 */
export const filterMenuByPreferences = (menuItems = [], userPreferences = {}) => {
  const {
    allergies = [],
    dietaryRestrictions = [],
    cuisinePreferences = [],
  } = userPreferences;

  return menuItems.filter((item) => {
    // Check allergens
    if (allergies.length > 0) {
      const hasAllergen = item.ingredients?.some(
        ing => ing.allergenType && allergies.includes(ing.allergenType)
      );
      if (hasAllergen) return false;
    }

    // Check dietary restrictions
    if (dietaryRestrictions.length > 0) {
      const isVegan = dietaryRestrictions.includes('vegan');
      const isVegetarian = dietaryRestrictions.includes('vegetarian');

      if (isVegan && !item.isVegan) return false;
      if (isVegetarian && !item.isVegetarian) return false;
    }

    return true;
  });
};

export default {
  checkAllergenWarnings,
  validateCartForAllergies,
  getExcludableIngredientsForAllergy,
  userHasAllergen,
  getMenuAllergens,
  getAllergenSeverity,
  formatAllergenDisplay,
  filterMenuByPreferences,
};
