import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '@styles/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { colors, typography, spacing } = theme;

/**
 * OrderTracker Component
 * 
 * Timeline-based order status tracker showing:
 * - Order status progression (pending → confirmed → preparing → ready → picked_up → in_delivery → delivered)
 * - Current status highlight
 * - Timeline line connecting statuses
 * 
 * @param {Object} props
 * @param {String} props.currentStatus - Current order status
 * @param {Array} props.statusHistory - [{status, timestamp, details}]
 * @param {String} props.estimatedTime - Estimated delivery time
 */
export default function OrderTracker({
  currentStatus = 'pending',
  statusHistory = [],
  estimatedTime,
}) {
  const statuses = [
    { key: 'pending', label: 'Order Placed', icon: 'checkmark-circle' },
    { key: 'confirmed', label: 'Confirmed', icon: 'clipboard-checkmark' },
    { key: 'preparing', label: 'Preparing', icon: 'flame' },
    { key: 'ready', label: 'Ready', icon: 'checkmark-done-circle' },
    { key: 'picked_up', label: 'Picked Up', icon: 'bag-handle' },
    { key: 'in_delivery', label: 'On the Way', icon: 'bicycle' },
    { key: 'delivered', label: 'Delivered', icon: 'home' },
  ];

  const getCurrentStatusIndex = () => {
    return statuses.findIndex((s) => s.key === currentStatus);
  };

  const currentStatusIndex = getCurrentStatusIndex();

  const getStatusTimestamp = (status) => {
    const history = statusHistory.find((h) => h.status === status);
    return history?.timestamp;
  };

  const formatTime = (timeString) => {
    if (!timeString) return null;
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Animated.View entering={FadeInDown} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[typography.h4, styles.title]}>Order Status</Text>
        {estimatedTime && (
          <View style={styles.estimatedTimeContainer}>
            <Ionicons name="timer" size={16} color={colors.primary} />
            <Text style={styles.estimatedTimeText}>{estimatedTime}</Text>
          </View>
        )}
      </View>

      {/* Timeline */}
      <View style={styles.timeline}>
        {statuses.map((status, index) => {
          const isActive = index <= currentStatusIndex;
          const isCurrentStatus = index === currentStatusIndex;
          const timestamp = getStatusTimestamp(status.key);

          return (
            <View key={status.key} style={styles.statusItem}>
              {/* Timeline Line */}
              {index < statuses.length - 1 && (
                <View
                  style={[
                    styles.timelineLine,
                    isActive && styles.timelineLineActive,
                  ]}
                />
              )}

              {/* Status Dot and Content */}
              <View style={styles.statusContent}>
                {/* Dot */}
                <View
                  style={[
                    styles.statusDot,
                    isActive && styles.statusDotActive,
                    isCurrentStatus && styles.statusDotCurrent,
                  ]}
                >
                  {isActive && (
                    <Ionicons
                      name={status.icon}
                      size={16}
                      color={isCurrentStatus ? colors.white : colors.primary}
                    />
                  )}
                </View>

                {/* Label and Time */}
                <View style={styles.statusLabel}>
                  <Text
                    style={[
                      styles.statusLabelText,
                      isActive && styles.statusLabelTextActive,
                      isCurrentStatus && styles.statusLabelTextCurrent,
                    ]}
                  >
                    {status.label}
                  </Text>
                  {timestamp && (
                    <Text style={styles.statusTime}>{formatTime(timestamp)}</Text>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* Current Status Message */}
      {currentStatusIndex >= 0 && (
        <View style={styles.statusMessage}>
          <View style={styles.messageIcon}>
            <Ionicons name="information-circle" size={20} color={colors.primary} />
          </View>
          <Text style={styles.messageText}>
            {statuses[currentStatusIndex].label} •{' '}
            {getStatusTimestamp(statuses[currentStatusIndex].key)
              ? formatTime(getStatusTimestamp(statuses[currentStatusIndex].key))
              : 'Just now'}
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginVertical: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.text,
  },
  estimatedTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(103, 58, 183, 0.08)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 6,
  },
  estimatedTimeText: {
    ...typography.label,
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  timeline: {
    marginVertical: spacing.md,
  },
  statusItem: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  timelineLine: {
    position: 'absolute',
    left: 15,
    top: 32,
    width: 2,
    height: 60,
    backgroundColor: colors.light50,
  },
  timelineLineActive: {
    backgroundColor: colors.primary,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  statusDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.light50,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDotActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(103, 58, 183, 0.1)',
  },
  statusDotCurrent: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusLabel: {
    flex: 1,
    paddingTop: spacing.xs,
  },
  statusLabelText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  statusLabelTextActive: {
    color: colors.text,
    fontWeight: '600',
  },
  statusLabelTextCurrent: {
    color: colors.primary,
    fontWeight: '700',
  },
  statusTime: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  statusMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(103, 58, 183, 0.05)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  messageIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageText: {
    ...typography.body,
    color: colors.primary,
    flex: 1,
    fontWeight: '500',
  },
});
