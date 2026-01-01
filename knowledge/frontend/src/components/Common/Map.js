
import React from 'react';
import MapView, { Marker, Polyline, Circle } from 'react-native-maps';

// Re-export specific components we need so consumers don't import react-native-maps directly
export { Marker, Polyline, Circle };
export default MapView;
