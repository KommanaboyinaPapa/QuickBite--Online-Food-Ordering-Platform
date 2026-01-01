import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '@styles/theme';
import Animated, { FadeInUp } from 'react-native-reanimated';

const { colors, typography, spacing } = theme;

/**
 * DeliveryEstimate Component
 * 
 * Displays estimated delivery time with:
 * - Current time
 * - Estimated arrival time
 * - Remaining minutes
 * - Distance remaining
 * 
 * @param {Object} props
 * @param {String} props.estimatedTime - ISO timestamp of estimated arrival
 * @param {Number} props.distanceRemaining - Remaining distance in km
 * @param {Number} props.speedKmh - Current speed in km/h
 */
export default function DeliveryEstimate({
  estimatedTime,
  distanceRemaining,
  speedKmh = 0,
}) {
  const [timeRemaining, setTimeRemaining] = React.useState(0);

  React.useEffect(() => {
    if (!estimatedTime) return;

    const updateTime = () => {
      const now = new Date();
      const estimated = new Date(estimatedTime);
      const diffMs = estimated - now;
      const diffMinutes = Math.max(0, Math.ceil(diffMs / 60000));
      setTimeRemaining(diffMinutes);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [estimatedTime]);

  const formatEstimatedTime = () => {
    if (!estimatedTime) return 'Calculating...';
    const date = new Date(estimatedTime);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getTimeStatus = () => {
    if (timeRemaining <= 0) return { status: 'Arriving now', color: colors.success };
    if (timeRemaining <= 5) return { status: 'Almost there', color: colors.primary };
    if (timeRemaining <= 15) return { status: 'On the way', color: colors.primary };
    return { status: 'On the way', color: colors.primary };
  };

  const timeStatus = getTimeStatus();

  return (
    <Animated.View entering={FadeInUp} style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={[typography.h6, styles.title]}>Estimated Arrival</Text>
        <View style={[styles.statusBadge, { backgroundColor: `${timeStatus.color}15` }]}>
          <Text style={[styles.statusText, { color: timeStatus.color }]}>
            {timeStatus.status}
          </Text>
        </View>
      </View>

      <View style={styles.estimateRow}>
        <View style={styles.timeBlock}>
          <Ionicons name="time" size={20} color={colors.primary} />
          <View style={styles.timeContent}>
            <Text style={styles.timeLabel}>Arriving by</Text>
            <Text style={styles.timeValue}>{formatEstimatedTime()}</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.durationBlock}>
          <Ionicons name="hourglass" size={20} color={colors.primary} />
          <View style={styles.durationContent}>
            <Text style={styles.durationLabel}>In</Text>
            <Text style={styles.durationValue}>
              {timeRemaining <= 0 ? 'Now' : `${timeRemaining} min`}
            </Text>
          </View>
        </View>
      </View>

      {/* Distance and Speed Info */}
      <View style={styles.infoRow}>
        {distanceRemaining !== undefined && (
          <View style={styles.infoBlock}>
            <View style={styles.infoIcon}>
              <Ionicons name="map" size={16} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.infoLabel}>Distance</Text>
              <Text style={styles.infoValue}>
                {distanceRemaining.toFixed(1)} km
              </Text>
            </View>
          </View>
        )}

        {speedKmh > 0 && (
          <View style={styles.infoBlock}>
            <View style={styles.infoIcon}>
              <Ionicons name="speedometer" size={16} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.infoLabel}>Speed</Text>
              <Text style={styles.infoValue}>{speedKmh.toFixed(0)} km/h</Text>
            </View>
          </View>
        )}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBar,
              { width: `${Math.max(0, Math.min(100, (15 - timeRemaining) / 15 * 100))}%` },
            ]}
          />
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
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    ...typography.label,
    fontSize: 12,
    fontWeight: '600',
  },
  estimateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.light50,
    borderRadius: 10,
    gap: spacing.md,
  },
  timeBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  timeContent: {
    flex: 1,
  },
  timeLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  timeValue: {
    ...typography.h6,
    color: colors.text,
    fontWeight: '700',
  },
  separator: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  durationBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  durationContent: {
    flex: 1,
  },
  durationLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  durationValue: {
    ...typography.h6,
    color: colors.primary,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  infoBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.light50,
    borderRadius: 8,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(103, 58, 183, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    ...typography.label,
    color: colors.text,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: spacing.md,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: colors.light50,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
});
