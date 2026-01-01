/**
 * CartItem - Display cart item with exclusions and modifications
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '@styles/theme';
import Card from '@components/Common/Card';
import AllergyBadge from '@components/Common/AllergyBadge';
import { normalizeImageUrl } from '@utils/image';

const { colors, typography, spacing } = theme;

const CartItem = ({
  item,
  onQuantityChange,
  onRemove,
  onEdit,
  onToggleIngredient,
  showExclusions = true
}) => {
  const {
    id,
    name,
    price,
    quantity,
    image,
    exclusions = [],
    specialInstructions,
    allergenWarnings = [],
    menuItem = {}
  } = item;

  const unitPrice = Number(price ?? menuItem.price ?? 0);
  const qty = Number(quantity || 1);
  const itemTotal = unitPrice * qty;
  const [imageUri, setImageUri] = useState(normalizeImageUrl(image || menuItem.image || menuItem.imageUrl));

  useEffect(() => {
    setImageUri(normalizeImageUrl(image || menuItem.image || menuItem.imageUrl));
  }, [image, menuItem.image, menuItem.imageUrl]);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await onRemove?.(id);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <Card style={styles.card}>
      <View style={styles.container}>
        {/* Image */}
        <Image
          source={imageUri ? { uri: imageUri } : require('@assets/images/placeholders/food.png')}
          style={styles.image}
          defaultSource={require('@assets/images/placeholders/food.png')}
          onError={() => setImageUri(null)}
        />

        {/* Content */}
        <View style={styles.content}>
          {/* Name & Price */}
          <View style={styles.header}>
            <View style={styles.nameSection}>
              <Text style={[typography.h5, styles.name]} numberOfLines={1}>
                {name}
              </Text>
              <Text style={[typography.label, styles.price]}>
                ₹{unitPrice.toFixed(2)}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleRemove}
              disabled={isRemoving}
              style={styles.removeButton}
            >
              <Ionicons
                name="close-circle"
                size={24}
                color={isRemoving ? colors.textLight : colors.error}
              />
            </TouchableOpacity>
          </View>

          {/* Ingredient checklist for exclusions */}
          {showExclusions && Array.isArray(menuItem.ingredients) && menuItem.ingredients.length > 0 && (
            <View style={styles.ingredientsContainer}>
              <Text style={[typography.caption, styles.exclusionLabel]}>Ingredients</Text>
              {menuItem.ingredients.map((ingredient) => {
                const isExcluded = exclusions.some((exc) => exc.ingredientId === ingredient.id || exc === ingredient.name);
                return (
                  <TouchableOpacity
                    key={ingredient.id}
                    style={styles.ingredientRow}
                    onPress={() => onToggleIngredient?.(id, ingredient.id, !isExcluded)}
                  >
                    <Ionicons
                      name={isExcluded ? 'checkbox-outline' : 'checkbox'}
                      size={18}
                      color={isExcluded ? colors.textSecondary : colors.primary}
                    />
                    <Text style={[typography.caption, styles.ingredientText]}>{ingredient.name}</Text>
                    {ingredient.isAllergen && <AllergyBadge allergens={[ingredient.name]} size="tiny" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Special Instructions */}
          {specialInstructions && (
            <Text style={[typography.caption, styles.instructions]}>
              📝 {specialInstructions}
            </Text>
          )}

          {/* Allergen Warnings */}
          {allergenWarnings.length > 0 && (
            <AllergyBadge allergens={allergenWarnings} size="small" />
          )}

          {/* Footer - Quantity & Total */}
          <View style={styles.footer}>
            <View style={styles.quantityControl}>
              <TouchableOpacity
                onPress={() => onQuantityChange?.(id, Math.max(1, quantity - 1))}
                style={styles.quantityButton}
              >
                <Ionicons name="remove" size={18} color={colors.primary} />
              </TouchableOpacity>

              <Text style={[typography.label, styles.quantity]}>
                {qty}
              </Text>

              <TouchableOpacity
                onPress={() => onQuantityChange?.(id, quantity + 1)}
                style={styles.quantityButton}
              >
                <Ionicons name="add" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.totalSection}>
              <Text style={[typography.label, styles.totalLabel]}>
                Total:
              </Text>
              <Text style={[typography.h5, styles.total]}>
                ₹{itemTotal.toFixed(2)}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => onEdit?.(item)}
              style={styles.editButton}
            >
              <Ionicons name="pencil" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  container: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: colors.light50,
    flexShrink: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameSection: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    color: colors.text,
  },
  price: {
    color: colors.primary,
    fontWeight: '700',
  },
  removeButton: {
    padding: spacing.xs,
    marginRight: -spacing.xs,
  },
  exclusionsContainer: {
    backgroundColor: colors.light50,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
  },
  exclusionLabel: {
    color: colors.warning,
    fontWeight: '500',
  },
  instructions: {
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  ingredientsContainer: {
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ingredientText: {
    color: colors.text,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  quantityButton: {
    padding: spacing.xs,
  },
  quantity: {
    color: colors.text,
    minWidth: 20,
    textAlign: 'center',
  },
  totalSection: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  totalLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  total: {
    color: colors.primary,
  },
  editButton: {
    padding: spacing.sm,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    paddingLeft: spacing.md,
  },
});

export default CartItem;
