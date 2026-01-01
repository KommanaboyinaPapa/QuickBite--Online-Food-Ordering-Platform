/**
 * RestaurantCard - Display individual restaurant with rating
 */

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { theme } from '@styles/theme';
import Card from '@components/Common/Card';

const { colors, typography, spacing } = theme;

const RestaurantCard = ({ 
  restaurant, 
  onPress, 
  index = 0,
  showDistance = true,
  showDeliveryFee = true 
}) => {
  const {
    id,
    name,
    image,
    rating,
    reviewCount,
    distance,
    deliveryFee,
    deliveryTime,
    cuisines,
    isOpen,
    badge
  } = restaurant;

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 100)}
      style={styles.container}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onPress?.(restaurant)}
      >
        <Card style={styles.card}>
          {/* Image Container */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: image }}
              style={styles.image}
              defaultSource={require('@assets/images/placeholders/restaurant.png')}
            />
            
            {/* Status Badge */}
            {!isOpen && (
              <View style={styles.closedOverlay}>
                <Text style={styles.closedText}>Closed</Text>
              </View>
            )}

            {badge && (
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            )}

            {/* Delivery Badge */}
            <View style={styles.deliveryBadge}>
              <Ionicons name="bicycle" size={14} color={colors.white} />
              <Text style={styles.deliveryText}>{deliveryTime}</Text>
            </View>
          </View>

          {/* Info Container */}
          <View style={styles.infoContainer}>
            {/* Name & Rating Row */}
            <View style={styles.headerRow}>
              <View style={styles.nameSection}>
                <Text style={[typography.h4, styles.name]} numberOfLines={1}>
                  {name}
                </Text>
              </View>
              
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color={colors.ratingGold} />
                <Text style={[typography.caption, styles.rating]}>
                  {rating}
                </Text>
                <Text style={[typography.caption, styles.reviewCount]}>
                  ({reviewCount})
                </Text>
              </View>
            </View>

            {/* Cuisines */}
            <Text style={[typography.caption, styles.cuisines]} numberOfLines={1}>
              {cuisines?.join(' • ')}
            </Text>

            {/* Footer Row */}
            <View style={styles.footerRow}>
              {showDistance && (
                <View style={styles.metaItem}>
                  <Ionicons name="location" size={13} color={colors.textSecondary} />
                  <Text style={[typography.caption, styles.metaText]}>
                    {distance} km
                  </Text>
                </View>
              )}

              {showDeliveryFee && (
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons 
                    name="package-variant" 
                    size={13} 
                    color={colors.textSecondary} 
                  />
                  <Text style={[typography.caption, styles.metaText]}>
                    ₹{deliveryFee}
                  </Text>
                </View>
              )}

              {!isOpen && (
                <View style={styles.disabledMeta}>
                  <Text style={[typography.caption, { color: colors.error }]}>
                    Not Available
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  card: {
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 160,
    backgroundColor: colors.light50,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  closedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closedText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  badge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
  },
  badgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  deliveryBadge: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  deliveryText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  infoContainer: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  nameSection: {
    flex: 1,
  },
  name: {
    color: colors.text,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.light50,
    borderRadius: 4,
  },
  rating: {
    color: colors.text,
    fontWeight: '600',
  },
  reviewCount: {
    color: colors.textLight,
  },
  cuisines: {
    color: colors.textSecondary,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    color: colors.textSecondary,
  },
  disabledMeta: {
    marginLeft: 'auto',
  },
});

export default RestaurantCard;
