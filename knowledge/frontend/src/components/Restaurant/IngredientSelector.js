import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Switch } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '@styles/theme';
import Animated, { FadeInUp } from 'react-native-reanimated';

const { colors, typography, spacing } = theme;

/**
 * IngredientSelector Component
 * 
 * Allows users to select which ingredients to exclude from menu item.
 * Shows allergen badges and grouped ingredients by type.
 * 
 * @param {Object} props
 * @param {Array} props.ingredients - [{id, name, allergen, quantity}]
 * @param {Array} props.userAllergies - User's allergy list
 * @param {Function} props.onExclusionsChange - Callback with selected exclusions
 * @param {Function} props.onClose - Callback to close modal
 * @param {Array} props.defaultExclusions - Pre-selected exclusions
 */
export default function IngredientSelector({
  ingredients = [],
  userAllergies = [],
  onExclusionsChange,
  onClose,
  defaultExclusions = [],
}) {
  const [exclusions, setExclusions] = useState(defaultExclusions);
  const [expandedAllergen, setExpandedAllergen] = useState(null);

  // Debug ingredients received
  React.useEffect(() => {
    console.log('=== DEBUG: IngredientSelector ===');
    console.log('Ingredients count:', ingredients.length);
    console.log('Ingredients data:', JSON.stringify(ingredients, null, 2));
  }, [ingredients]);

  // Group ingredients by allergen type
  const groupedIngredients = React.useMemo(() => {
    const groups = {};
    ingredients.forEach((ing) => {
      const key = ing.allergen || 'no-allergen';
      if (!groups[key]) groups[key] = [];
      groups[key].push(ing);
    });
    return groups;
  }, [ingredients]);

  const handleToggleExclusion = (ingredientId) => {
    setExclusions((prev) =>
      prev.includes(ingredientId)
        ? prev.filter((id) => id !== ingredientId)
        : [...prev, ingredientId]
    );
  };

  const handleConfirm = () => {
    onExclusionsChange?.(exclusions);
    onClose?.();
  };

  const handleClear = () => {
    setExclusions([]);
  };

  // Get allergen info - ensure userAllergies is an array
  const safeUserAllergies = Array.isArray(userAllergies) ? userAllergies : [];

  const getUserAllergyItems = () => {
    return ingredients.filter((ing) => safeUserAllergies.includes(ing.allergen));
  };

  const userAllergyItems = getUserAllergyItems();

  return (
    <Animated.View entering={FadeInUp} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[typography.h4, styles.title]}>Customize Ingredients</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Allergy Warning */}
      {userAllergyItems.length > 0 && (
        <View style={styles.allergyWarning}>
          <Ionicons name="warning" size={20} color={colors.error} />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Allergy Alert!</Text>
            <Text style={styles.warningText}>
              This item contains {userAllergyItems.map((i) => i.name).join(', ')}
            </Text>
          </View>
        </View>
      )}

      {/* ScrollView for ingredients */}
      <ScrollView style={styles.ingredientsList} showsVerticalScrollIndicator={false}>
        {Object.entries(groupedIngredients).map(([allergen, items]) => (
          <IngredientGroup
            key={allergen}
            allergen={allergen}
            items={items}
            isExpanded={expandedAllergen === allergen}
            onExpand={() =>
              setExpandedAllergen(expandedAllergen === allergen ? null : allergen)
            }
            exclusions={exclusions}
            onToggleExclusion={handleToggleExclusion}
            userAllergies={userAllergies}
          />
        ))}
      </ScrollView>

      {/* Summary */}
      {exclusions.length > 0 && (
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            {exclusions.length} ingredient{exclusions.length > 1 ? 's' : ''} excluded
          </Text>
        </View>
      )}

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={handleClear}
        >
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.confirmButton]}
          onPress={handleConfirm}
        >
          <Text style={styles.confirmButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

/**
 * IngredientGroup Component
 * Group of ingredients with same allergen type
 */
function IngredientGroup({
  allergen,
  items,
  isExpanded,
  onExpand,
  exclusions,
  onToggleExclusion,
  userAllergies,
}) {
  const allergenName = allergen === 'no-allergen' ? 'Other Ingredients' : allergen;
  const safeAllergies = Array.isArray(userAllergies) ? userAllergies : [];
  const isUserAllergen = safeAllergies.includes(allergen) && allergen !== 'no-allergen';

  return (
    <View style={styles.groupContainer}>
      {/* Group Header */}
      <TouchableOpacity
        style={[styles.groupHeader, isUserAllergen && styles.allergenGroupHeader]}
        onPress={onExpand}
      >
        <View style={styles.groupTitleContainer}>
          {isUserAllergen && (
            <Ionicons name="warning-sharp" size={16} color={colors.error} />
          )}
          <Text
            style={[
              styles.groupTitle,
              isUserAllergen && styles.allergenGroupTitle,
            ]}
          >
            {allergenName}
          </Text>
        </View>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {/* Group Items */}
      {isExpanded && (
        <View style={styles.groupItems}>
          {items.map((item) => {
            const isExcluded = exclusions.includes(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.ingredientItem,
                  isExcluded && styles.excludedItem,
                ]}
                onPress={() => onToggleExclusion(item.id)}
              >
                <View style={styles.ingredientCheckbox}>
                  {isExcluded ? (
                    <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                  ) : (
                    <View style={styles.uncheckedCircle} />
                  )}
                </View>

                <View style={styles.ingredientInfo}>
                  <Text
                    style={[
                      styles.ingredientName,
                      isExcluded && styles.excludedText,
                    ]}
                  >
                    {item.name}
                  </Text>
                  {item.quantity && (
                    <Text style={styles.ingredientQuantity}>
                      {item.quantity}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    color: colors.text,
  },
  allergyWarning: {
    flexDirection: 'row',
    backgroundColor: 'rgba(236, 64, 64, 0.08)',
    margin: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
    gap: spacing.sm,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    ...typography.label,
    color: colors.error,
    fontWeight: '600',
    marginBottom: 4,
  },
  warningText: {
    ...typography.caption,
    color: colors.error,
    lineHeight: 16,
  },
  ingredientsList: {
    maxHeight: 350,
  },
  groupContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.light50,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.light50,
  },
  allergenGroupHeader: {
    backgroundColor: 'rgba(236, 64, 64, 0.05)',
  },
  groupTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  groupTitle: {
    ...typography.label,
    color: colors.text,
    fontWeight: '600',
  },
  allergenGroupTitle: {
    color: colors.error,
  },
  groupItems: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    marginVertical: 4,
  },
  excludedItem: {
    backgroundColor: colors.light50,
  },
  ingredientCheckbox: {
    marginRight: spacing.md,
  },
  uncheckedCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    ...typography.body,
    color: colors.text,
    marginBottom: 2,
  },
  excludedText: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  ingredientQuantity: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  summary: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.light50,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  summaryText: {
    ...typography.label,
    color: colors.text,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: colors.light50,
  },
  clearButtonText: {
    ...typography.label,
    color: colors.text,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  confirmButtonText: {
    ...typography.label,
    color: colors.white,
    fontWeight: '600',
  },
});
