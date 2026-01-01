import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '@styles/theme';
import Animated, { FadeInUp } from 'react-native-reanimated';

const { colors, typography, spacing } = theme;

/**
 * AgentInfo Component
 * 
 * Displays delivery agent information card with:
 * - Agent photo
 * - Name and rating
 * - Vehicle info
 * - Call and chat buttons
 * 
 * @param {Object} props
 * @param {Object} props.agent - {id, name, image, rating, phone, vehicle}
 * @param {Function} props.onCall - Callback when call button pressed
 * @param {Function} props.onChat - Callback when chat button pressed
 */
export default function AgentInfo({ agent, onCall, onChat }) {
  if (!agent) {
    return null;
  }

  return (
    <Animated.View entering={FadeInUp} style={styles.container}>
      {/* Agent Photo */}
      <Image
        source={{ uri: agent.image }}
        style={styles.agentImage}
        defaultSource={require('@assets/images/placeholders/avatar.png')}
      />

      {/* Agent Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.nameRatingContainer}>
          <Text style={styles.agentName}>{agent.name}</Text>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={14} color={colors.ratingGold} />
            <Text style={styles.ratingText}>{agent.rating || '4.8'}</Text>
          </View>
        </View>

        {/* Vehicle Info */}
        {agent.vehicle && (
          <View style={styles.vehicleContainer}>
            <Ionicons name="bicycle" size={14} color={colors.textSecondary} />
            <Text style={styles.vehicleText}>{agent.vehicle}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.callButton]}
            onPress={() => onCall?.(agent.id)}
          >
            <Ionicons name="call" size={18} color={colors.white} />
            <Text style={styles.callButtonText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.chatButton]}
            onPress={() => onChat?.(agent.id)}
          >
            <Ionicons name="chatbubble-outline" size={18} color={colors.primary} />
            <Text style={styles.chatButtonText}>Chat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    alignItems: 'center',
  },
  agentImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.light50,
  },
  detailsContainer: {
    flex: 1,
  },
  nameRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  agentName: {
    ...typography.h6,
    color: colors.text,
    fontWeight: '600',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.light50,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingText: {
    ...typography.label,
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  vehicleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  vehicleText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 8,
    gap: spacing.xs,
  },
  callButton: {
    backgroundColor: colors.primary,
  },
  callButtonText: {
    ...typography.label,
    color: colors.white,
    fontWeight: '600',
    fontSize: 12,
  },
  chatButton: {
    backgroundColor: 'rgba(103, 58, 183, 0.08)',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  chatButtonText: {
    ...typography.label,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 12,
  },
});
