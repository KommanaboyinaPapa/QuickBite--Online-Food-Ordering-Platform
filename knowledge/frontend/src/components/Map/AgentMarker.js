import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, Polyline, Circle } from '@components/Common/Map';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '@styles/theme';
import Animated, { FadeIn } from 'react-native-reanimated';

const { colors } = theme;
const { width } = Dimensions.get('window');

/**
 * AgentMap Component
 * 
 * Displays live tracking map with:
 * - Agent current location marker
 * - Customer location marker
 * - Restaurant location marker
 * - Route polyline
 * - Radius circles
 * 
 * @param {Object} props
 * @param {Object} props.agentLocation - {latitude, longitude}
 * @param {Object} props.customerLocation - {latitude, longitude}
 * @param {Object} props.restaurantLocation - {latitude, longitude}
 * @param {Array} props.route - Array of {latitude, longitude} points
 * @param {Object} props.agent - Agent info {name, image}
 */
export default function AgentMap({
  agentLocation,
  customerLocation,
  restaurantLocation,
  route = [],
  agent,
  onAgentPress,
}) {
  const mapRef = React.useRef(null);
  const [region, setRegion] = React.useState(null);

  React.useEffect(() => {
    if (agentLocation) {
      const initialRegion = {
        latitude: agentLocation.latitude,
        longitude: agentLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      setRegion(initialRegion);
      mapRef.current?.animateToRegion(initialRegion, 300);
    }
  }, [agentLocation]);

  if (!region) {
    return <View style={styles.container} />;
  }

  return (
    <Animated.View entering={FadeIn} style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        showsUserLocation={false}
        showsCompass
        showsScale
      >
        {/* Route Polyline */}
        {route.length > 0 && (
          <Polyline
            coordinates={route}
            strokeColor={colors.primary}
            strokeWidth={3}
            lineDashPattern={[5, 5]}
            geodesic
          />
        )}

        {/* Restaurant Location */}
        {restaurantLocation && (
          <>
            <Circle
              center={restaurantLocation}
              radius={50}
              fillColor="rgba(244, 67, 54, 0.1)"
              strokeColor={colors.error}
              strokeWidth={2}
            />
            <Marker
              coordinate={restaurantLocation}
              title="Restaurant"
              description="Order pickup location"
            >
              <View style={styles.restaurantMarker}>
                <Ionicons name="restaurant" size={20} color={colors.white} />
              </View>
            </Marker>
          </>
        )}

        {/* Customer Location */}
        {customerLocation && (
          <>
            <Circle
              center={customerLocation}
              radius={50}
              fillColor="rgba(76, 175, 80, 0.1)"
              strokeColor={colors.success}
              strokeWidth={2}
            />
            <Marker
              coordinate={customerLocation}
              title="Delivery Location"
              description="Your location"
            >
              <View style={styles.customerMarker}>
                <Ionicons name="pin" size={20} color={colors.white} />
              </View>
            </Marker>
          </>
        )}

        {/* Agent Location */}
        {agentLocation && (
          <Marker
            coordinate={agentLocation}
            title={agent?.name || 'Delivery Agent'}
            description="Current location"
            onPress={onAgentPress}
            tracksViewChanges={false}
          >
            <View style={styles.agentMarkerContainer}>
              <View style={styles.agentMarker}>
                <Ionicons name="bicycle" size={24} color={colors.white} />
              </View>
              <View style={styles.agentMarkerTail} />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Map Controls Info */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
          <Text style={styles.legendText}>Restaurant</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendText}>Agent</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
          <Text style={styles.legendText}>Delivery</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.light50,
  },
  map: {
    flex: 1,
  },
  restaurantMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  customerMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  agentMarkerContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  agentMarker: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  agentMarkerTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.primary,
    position: 'absolute',
    top: 38,
  },
  legendContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
});
