import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '@styles/theme';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';

const { colors, typography, spacing } = theme;

/**
 * ReviewCard Component
 * 
 * Displays a single review with:
 * - User avatar and name
 * - Rating stars
 * - Review text
 * - Review date
 * - Helpful/Unhelpful buttons
 * 
 * @param {Object} props
 * @param {Object} props.review - {id, userName, userImage, rating, text, date, helpful}
 * @param {Function} props.onHelpful - Callback when helpful button pressed
 * @param {Function} props.onUnhelpful - Callback when unhelpful button pressed
 */
export default function ReviewCard({
  review,
  onHelpful,
  onUnhelpful,
}) {
  const [isHelpful, setIsHelpful] = React.useState(false);
  const [isUnhelpful, setIsUnhelpful] = React.useState(false);

  const handleHelpful = () => {
    setIsHelpful(!isHelpful);
    setIsUnhelpful(false);
    onHelpful?.(review.id);
  };

  const handleUnhelpful = () => {
    setIsUnhelpful(!isUnhelpful);
    setIsHelpful(false);
    onUnhelpful?.(review.id);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <Animated.View layout={Layout.springify()} style={styles.container}>
      {/* User Info */}
      <View style={styles.userContainer}>
        <Image
          source={{ uri: review.userImage }}
          style={styles.avatar}
          defaultSource={require('@assets/images/placeholders/avatar.png')}
        />

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{review.userName}</Text>
          <Text style={styles.dateText}>{formatDate(review.date)}</Text>
        </View>

        {/* Rating Stars */}
        <View style={styles.ratingContainer}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Ionicons
              key={i}
              name={i < review.rating ? 'star' : 'star-outline'}
              size={16}
              color={colors.ratingGold}
            />
          ))}
        </View>
      </View>

      {/* Review Text */}
      <Text style={styles.reviewText} numberOfLines={4}>
        {review.text}
      </Text>

      {/* Helpful Buttons */}
      <View style={styles.helpfulContainer}>
        <Text style={styles.helpfulLabel}>Was this helpful?</Text>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.helpButton, isHelpful && styles.helpButtonActive]}
            onPress={handleHelpful}
          >
            <Ionicons
              name="thumbs-up"
              size={16}
              color={isHelpful ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.helpButtonText,
                isHelpful && styles.helpButtonTextActive,
              ]}
            >
              Helpful
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.helpButton, isUnhelpful && styles.helpButtonActive]}
            onPress={handleUnhelpful}
          >
            <Ionicons
              name="thumbs-down"
              size={16}
              color={isUnhelpful ? colors.error : colors.textSecondary}
            />
            <Text
              style={[
                styles.helpButtonText,
                isUnhelpful && styles.helpButtonTextActive,
              ]}
            >
              Not Helpful
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.light50,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...typography.label,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  dateText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 3,
  },
  reviewText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  helpfulContainer: {
    paddingTopMargin: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  helpfulLabel: {
    ...typography.label,
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  helpButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  helpButtonActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(103, 58, 183, 0.05)',
  },
  helpButtonText: {
    ...typography.label,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  helpButtonTextActive: {
    color: colors.primary,
  },
});
