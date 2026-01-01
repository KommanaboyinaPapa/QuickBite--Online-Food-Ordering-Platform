/**
 * Ingredient Matcher - Match and filter ingredients
 */

/**
 * Check if an item contains specific allergens
 * @param {Array} ingredients - List of ingredient objects
 * @param {Array} userAllergies - User's allergy list
 * @returns {Array} - Matching allergens found in item
 */
export const checkAllergens = (ingredients = [], userAllergies = []) => {
  if (!Array.isArray(ingredients) || !Array.isArray(userAllergies)) {
    return [];
  }

  return ingredients
    .filter(ingredient => 
      ingredient.allergenType && userAllergies.includes(ingredient.allergenType)
    )
    .map(ingredient => ({
      id: ingredient.id,
      name: ingredient.name,
      allergenType: ingredient.allergenType
    }));
};

/**
 * Get ingredients by category
 * @param {Array} ingredients - List of ingredients
 * @param {String} category - Allergen category (dairy, peanuts, etc)
 * @returns {Array} - Ingredients in that category
 */
export const getIngredientsByAllergen = (ingredients = [], allergenType) => {
  return ingredients.filter(ing => ing.allergenType === allergenType);
};

/**
 * Filter out excluded ingredients from total
 * @param {Array} allIngredients - All item ingredients
 * @param {Array} excludedIds - IDs of excluded ingredients
 * @returns {Array} - Remaining ingredients
 */
export const getIncludedIngredients = (allIngredients = [], excludedIds = []) => {
  return allIngredients.filter(ing => !excludedIds.includes(ing.id));
};

/**
 * Get allergen warnings after exclusions
 * @param {Array} ingredients - All item ingredients
 * @param {Array} excludedIds - Excluded ingredient IDs
 * @param {Array} userAllergies - User allergies
 * @returns {Object} - Warnings and safe status
 */
export const getAllergenWarnings = (ingredients = [], excludedIds = [], userAllergies = []) => {
  const includedIngredients = getIncludedIngredients(ingredients, excludedIds);
  const allergens = checkAllergens(includedIngredients, userAllergies);

  return {
    hasAllergens: allergens.length > 0,
    allergens: allergens,
    message: allergens.length > 0
      ? `⚠️ Contains ${allergens.map(a => a.allergenType).join(', ')}`
      : '✓ Safe based on exclusions'
  };
};

/**
 * Suggest ingredients to exclude based on allergies
 * @param {Array} ingredients - Item ingredients
 * @param {Array} userAllergies - User allergies
 * @returns {Array} - Suggested ingredient IDs to exclude
 */
export const suggestExclusions = (ingredients = [], userAllergies = []) => {
  return ingredients
    .filter(ing => ing.allergenType && userAllergies.includes(ing.allergenType))
    .map(ing => ing.id);
};

/**
 * Get ingredient summary text
 * @param {Array} ingredients - Item ingredients
 * @param {Number} maxDisplay - Max to display before "more"
 * @returns {String} - Human readable ingredient list
 */
export const getIngredientSummary = (ingredients = [], maxDisplay = 3) => {
  if (!ingredients.length) return 'No ingredients listed';

  const names = ingredients.map(ing => ing.name);
  if (names.length <= maxDisplay) {
    return names.join(', ');
  }

  return `${names.slice(0, maxDisplay).join(', ')} + ${names.length - maxDisplay} more`;
};

/**
 * Group ingredients by type
 * @param {Array} ingredients - List of ingredients
 * @returns {Object} - Grouped by allergen type
 */
export const groupIngredientsByAllergen = (ingredients = []) => {
  return ingredients.reduce((acc, ing) => {
    const type = ing.allergenType || 'no-allergen';
    if (!acc[type]) acc[type] = [];
    acc[type].push(ing);
    return acc;
  }, {});
};
