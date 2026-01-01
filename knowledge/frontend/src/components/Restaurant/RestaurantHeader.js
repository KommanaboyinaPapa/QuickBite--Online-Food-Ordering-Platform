import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '@styles/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { normalizeImageUrl } from '@utils/image';

const { colors, typography, spacing } = theme;

/**
 * RestaurantHeader Component
 * 
 * Displays restaurant information banner with:
 * - Banner image
 * - Restaurant name, rating, address
 * - Delivery info (time, fee, minimum order)
 * - Cuisine tags
 * - Share and favorite buttons
 * 
 * @param {Object} props
 * @param {Object} props.restaurant - Restaurant data
 * @param {Function} props.onFavorite - Callback when favorite toggled
 * @param {Function} props.onShare - Callback when share pressed
 */
export default function RestaurantHeader({ restaurant, onFavorite, onShare }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageUri, setImageUri] = useState(normalizeImageUrl(restaurant.bannerUrl || restaurant.logoUrl));

  useEffect(() => {
    setImageUri(normalizeImageUrl(restaurant.bannerUrl || restaurant.logoUrl));
  }, [restaurant.bannerUrl, restaurant.logoUrl]);

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    onFavorite?.();
  };

  const handleShare = () => {
    onShare?.();
  };

  return (
    <Animated.View entering={FadeInDown} style={styles.container}>
      {/* Banner Image */}
      <View style={styles.bannerContainer}>
        <Image
          source={imageUri ? { uri: imageUri } : require('@assets/images/placeholders/restaurant-banner.png')}
          style={styles.bannerImage}
          defaultSource={require('@assets/images/placeholders/restaurant-banner.png')}
          onError={() => setImageUri(null)}
        />
        
        {/* Overlay with buttons */}
        <View style={styles.bannerOverlay}>
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={handleFavorite}
          >
            <Ionicons 
              name={isFavorite ? 'heart' : 'heart-outline'} 
              size={28} 
              color={isFavorite ? colors.error : colors.white}
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.shareButton}
            onPress={handleShare}
          >
            <Ionicons name="share-social" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Rating Badge */}
        {restaurant.rating && (
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={16} color={colors.ratingGold} />
            <Text style={styles.ratingText}>{restaurant.rating}</Text>
          </View>
        )}

        {/* Closed Overlay */}
        {!restaurant.isOpen && (
          <View style={styles.closedOverlay}>
            <Text style={styles.closedText}>Closed</Text>
          </View>
        )}
      </View>

      {/* Restaurant Info */}
      <View style={styles.infoContainer}>
        <View style={styles.nameContainer}>
          <Text style={[typography.h3, styles.name]}>{restaurant.name}</Text>
          {restaurant.rating && (
            <Text style={styles.reviews}>
              {restaurant.rating} • {restaurant.reviews || 0} reviews
            </Text>
          )}
        </View>

        {/* Cuisine Tags */}
        {restaurant.cuisines && restaurant.cuisines.length > 0 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.cuisinesScroll}
          >
            {restaurant.cuisines.map((cuisine, index) => (
              <View key={index} style={styles.cuisineTag}>
                <Text style={styles.cuisineText}>{cuisine}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Address */}
        <View style={styles.addressContainer}>
          <Ionicons name="location" size={16} color={colors.textSecondary} />
          <Text style={styles.addressText} numberOfLines={2}>
            {restaurant.address || 'Address not available'}
          </Text>
        </View>

        {/* Delivery Info */}
        <View style={styles.deliveryInfoContainer}>
          <DeliveryInfoItem
            icon="timer"
            label={`${restaurant.estimatedDeliveryTime || '30-40'} min`}
          />
          <DeliveryInfoItem
            icon="cash"
            label={`₹${restaurant.deliveryFee || 0} delivery`}
          />
          <DeliveryInfoItem
            icon="basket"
            label={`₹${restaurant.minimumOrder || 0} min`}
          />
        </View>

        {/* Description */}
        {restaurant.description && (
          <Text style={styles.description} numberOfLines={3}>
            {restaurant.description}
          </Text>
        )}

        {/* Divider */}
        <View style={styles.divider} />
      </View>
    </Animated.View>
  );
}

/**
 * DeliveryInfoItem Component
 * Small info item with icon and label
 */
function DeliveryInfoItem({ icon, label }) {
  return (
    <View style={styles.deliveryInfoItem}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <Text style={styles.deliveryInfoLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    marginBottom: spacing.lg,
  },
  bannerContainer: {
    position: 'relative',
    height: 200,
    width: '100%',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.light50,
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  favoriteButton: {
    alignSelf: 'flex-end',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    ...typography.label,
    color: colors.text,
    fontWeight: '600',
  },
  closedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closedText: {
    ...typography.h4,
    color: colors.white,
    fontWeight: '700',
  },
  infoContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  nameContainer: {
    marginBottom: spacing.sm,
  },
  name: {
    color: colors.text,
    marginBottom: 4,
  },
  reviews: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  cuisinesScroll: {
    marginVertical: spacing.sm,
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
  },
  cuisineTag: {
    backgroundColor: colors.light50,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: spacing.sm,
  },
  cuisineText: {
    ...typography.label,
    color: colors.textSecondary,
    fontSize: 12,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  addressText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  deliveryInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.md,
    paddingVertical: spacing.md,
  },
  deliveryInfoItem: {
    alignItems: 'center',
    gap: 6,
  },
  deliveryInfoLabel: {
    ...typography.label,
    color: colors.text,
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
});
