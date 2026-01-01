/**
 * MenuItemCard - Display menu item with ingredients and customization
 */

import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Animated as RNAnimated, Easing } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '@styles/theme';
import Card from '@components/Common/Card';
import AllergyBadge from '@components/Common/AllergyBadge';
import IngredientTag from '@components/Common/IngredientTag';
import { normalizeImageUrl, getFoodImageByCuisine } from '@utils/image';

const { colors, typography, spacing } = theme;

const MenuItemCard = ({
  item,
  onPress,
  onAddToCart,
  onAskAI,
  userAllergies = [],
  index = 0,
  showIngredientsPreview = true,
  cuisineType = null
}) => {
  const {
    id,
    name,
    description,
    price,
    image,
    rating,
    ratingCount,
    ingredients = [],
    vegetarian,
    vegan,
    spiceLevel
  } = item;

  // Get cuisine-aware fallback image
  const fallbackImage = getFoodImageByCuisine(cuisineType || item.cuisineType || item.category);
  const [imageUri, setImageUri] = useState(normalizeImageUrl(image || item.imageUrl) || fallbackImage);

  const [isAdding, setIsAdding] = useState(false);
  const aiScale = React.useRef(new RNAnimated.Value(1)).current;
  const aiSentOpacity = React.useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    const normalized = normalizeImageUrl(image || item.imageUrl);
    setImageUri(normalized || fallbackImage);
  }, [image, item.imageUrl, fallbackImage]);

  // Check for allergen warnings
  const allergenWarnings = ingredients.filter(ing =>
    ing.allergenType && userAllergies.includes(ing.allergenType)
  );

  const handleAddToCart = useCallback(async () => {
    setIsAdding(true);
    try {
      await onAddToCart?.(item);
    } finally {
      setIsAdding(false);
    }
  }, [onAddToCart, item]);

  const handlePress = useCallback(() => {
    onPress?.(item);
  }, [onPress, item]);

  const handleAskAI = useCallback(() => {
    RNAnimated.sequence([
      RNAnimated.timing(aiScale, { toValue: 1.2, duration: 120, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
      RNAnimated.timing(aiScale, { toValue: 1, duration: 120, useNativeDriver: true, easing: Easing.in(Easing.ease) }),
    ]).start();

    RNAnimated.sequence([
      RNAnimated.timing(aiSentOpacity, { toValue: 1, duration: 120, useNativeDriver: true }),
      RNAnimated.delay(600),
      RNAnimated.timing(aiSentOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();

    onAskAI?.(item);
  }, [onAskAI, item, aiScale, aiSentOpacity]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handlePress}
      >
        <Card style={styles.card}>
          {/* Image & Badges */}
          <View style={styles.imageSection}>
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              onError={() => setImageUri(fallbackImage)}
            />

            {/* Badges */}
            <View style={styles.badgesContainer}>
              {vegetarian && (
                <View style={[styles.badge, { backgroundColor: colors.success }]}>
                  <Ionicons name="leaf" size={12} color={colors.white} />
                </View>
              )}
              {vegan && (
                <View style={[styles.badge, { backgroundColor: colors.success }]}>
                  <Text style={styles.badgeText}>V</Text>
                </View>
              )}
            </View>

            {/* Rating Badge */}
            {rating > 0 && (
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color={colors.ratingGold} />
                <Text style={styles.ratingBadgeText}>{rating}</Text>
              </View>
            )}
          </View>

          {/* Info Section */}
          <View style={styles.infoSection}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.titleSection}>
                <Text style={[typography.h5, styles.title]} numberOfLines={1}>
                  {name}
                </Text>
                <Text style={[typography.caption, styles.description]} numberOfLines={2}>
                  {description}
                </Text>
              </View>

              <Text style={[typography.h5, styles.price]}>
                ₹{price}
              </Text>
            </View>

            {/* Ingredients Preview */}

            {onAskAI && (
              <TouchableOpacity
                style={styles.aiButton}
                onPress={handleAskAI}
              >
                <RNAnimated.View style={{ transform: [{ scale: aiScale }], flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="sparkles" size={22} color={colors.secondary} />
                  <RNAnimated.Text style={[styles.aiSentText, { opacity: aiSentOpacity }]}>Sent</RNAnimated.Text>
                </RNAnimated.View>
              </TouchableOpacity>
            )}
            {showIngredientsPreview && ingredients.length > 0 && (
              <View style={styles.ingredientsRow}>
                {ingredients.slice(0, 2).map((ing, idx) => (
                  <IngredientTag
                    key={ing.id}
                    ingredient={ing}
                    size="small"
                    showAllergen={userAllergies.includes(ing.allergenType)}
                  />
                ))}
                {ingredients.length > 2 && (
                  <Text style={[typography.caption, styles.moreIngredients]}>
                    +{ingredients.length - 2}
                  </Text>
                )}
              </View>
            )}

            {/* Allergen Warning */}
            {allergenWarnings.length > 0 && (
              <View style={styles.warningContainer}>
                <AllergyBadge
                  allergens={allergenWarnings}
                  size="small"
                />
              </View>
            )}

            {/* Meta & Action */}
            <View style={styles.footer}>
              <View style={styles.metaItems}>
                {ratingCount > 0 && (
                  <Text style={[typography.caption, styles.metaText]}>
                    ({ratingCount} reviews)
                  </Text>
                )}
                {spiceLevel && (
                  <Text style={[typography.caption, styles.metaText]}>
                    {spiceLevel === 'mild' && '🌶️'}
                    {spiceLevel === 'medium' && '🌶️🌶️'}
                    {spiceLevel === 'spicy' && '🌶️🌶️🌶️'}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.addButton, isAdding && styles.addButtonDisabled]}
                onPress={handleAddToCart}
                disabled={isAdding}
              >
                <Ionicons
                  name="add-circle"
                  size={24}
                  color={isAdding ? colors.textLight : colors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  card: {
    flexDirection: 'row',
    overflow: 'hidden',
  },
  imageSection: {
    position: 'relative',
    width: 120,
    height: 120,
    backgroundColor: colors.light50,
    flexShrink: 0,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  badgesContainer: {
    position: 'absolute',
    bottom: spacing.xs,
    left: spacing.xs,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  ratingBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  infoSection: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  header: {
    gap: spacing.xs,
  },
  titleSection: {
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.text,
  },
  description: {
    color: colors.textSecondary,
    height: 32,
  },
  price: {
    color: colors.primary,
    fontWeight: '700',
  },
  ingredientsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginVertical: spacing.xs,
  },
  moreIngredients: {
    color: colors.textLight,
    fontWeight: '600',
    paddingLeft: spacing.xs,
  },
  warningContainer: {
    marginVertical: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  metaItems: {
    flex: 1,
    gap: spacing.xs,
  },
  metaText: {
    color: colors.textLight,
  },
  addButton: {
    padding: spacing.xs,
  },
  aiButton: {
    padding: spacing.sm,
  },
  aiSentText: {
    marginLeft: 6,
    color: colors.secondary,
    fontWeight: '700',
    fontSize: 12,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
});

export default MenuItemCard;
