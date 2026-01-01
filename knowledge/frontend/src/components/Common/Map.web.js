/**
 * Web Map Component using Leaflet with OpenStreetMap (FREE)
 * This provides real maps on web without Google Maps API key
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';

// Marker component for web - collects position data
export const Marker = ({ coordinate, title, pinColor, children }) => {
    // This is handled by the parent MapView
    return null;
};

export const Polyline = () => null;
export const Circle = () => null;

const MapView = ({ style, children, region, initialRegion }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);

    // Extract markers from children
    const markers = React.Children.toArray(children)
        .filter(child => child?.type === Marker)
        .map(child => ({
            coordinate: child.props.coordinate,
            title: child.props.title || '',
            pinColor: child.props.pinColor || 'blue'
        }));

    useEffect(() => {
        // Only run on web
        if (Platform.OS !== 'web') return;

        // Dynamically load Leaflet CSS and JS
        const loadLeaflet = async () => {
            // Add Leaflet CSS if not already added
            if (!document.getElementById('leaflet-css')) {
                const link = document.createElement('link');
                link.id = 'leaflet-css';
                link.rel = 'stylesheet';
                link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                document.head.appendChild(link);
            }

            // Wait for Leaflet to be available
            if (!window.L) {
                await new Promise((resolve) => {
                    const script = document.createElement('script');
                    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
                    script.onload = resolve;
                    document.body.appendChild(script);
                });
            }

            // Initialize map
            if (mapRef.current && !mapInstanceRef.current && window.L) {
                const center = region || initialRegion || { latitude: 37.78825, longitude: -122.4324 };

                mapInstanceRef.current = window.L.map(mapRef.current).setView(
                    [center.latitude, center.longitude],
                    15
                );

                // Add OpenStreetMap tiles (FREE, no API key needed!)
                window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(mapInstanceRef.current);

                // Add markers
                updateMarkers();
            }
        };

        loadLeaflet();

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Update markers when they change
    const updateMarkers = () => {
        if (!mapInstanceRef.current || !window.L) return;

        // Clear existing markers
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        // Add new markers
        markers.forEach(({ coordinate, title, pinColor }) => {
            if (coordinate?.latitude && coordinate?.longitude) {
                // Create custom colored marker
                const markerIcon = window.L.divIcon({
                    className: 'custom-marker',
                    html: `<div style="
            background-color: ${pinColor || 'blue'};
            width: 24px;
            height: 24px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          "></div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 24]
                });

                const marker = window.L.marker(
                    [coordinate.latitude, coordinate.longitude],
                    { icon: markerIcon }
                ).addTo(mapInstanceRef.current);

                if (title) {
                    marker.bindPopup(title);
                }

                markersRef.current.push(marker);
            }
        });

        // Fit bounds if multiple markers
        if (markersRef.current.length > 1) {
            const group = window.L.featureGroup(markersRef.current);
            mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
        }
    };

    // Update markers when children change
    useEffect(() => {
        updateMarkers();
    }, [markers.length]);

    // Update view when region changes
    useEffect(() => {
        if (mapInstanceRef.current && region) {
            mapInstanceRef.current.setView([region.latitude, region.longitude]);
        }
    }, [region?.latitude, region?.longitude]);

    if (Platform.OS !== 'web') {
        return <View style={[style, styles.container]} />;
    }

    return (
        <div
            ref={mapRef}
            style={{
                width: '100%',
                height: '100%',
                ...StyleSheet.flatten(style)
            }}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default MapView;
