
import React, { useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import theme from '../../styles/theme';
import { fetchCart } from '../../redux/slices/cartSlice';
import { navigationRef } from '../../navigation/navigationRef';

const FloatingCart = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { items = [], total = 0, loading } = useSelector(state => state.cart || {});

    useEffect(() => {
        dispatch(fetchCart());
    }, [dispatch]);

    const itemCount = useMemo(() => items.reduce((sum, item) => sum + (item.quantity || 1), 0), [items]);

    const hiddenRoutes = ['Cart', 'Checkout', 'PaymentMethod', 'PaymentConfirmation', 'Profile', 'ProfileScreen'];
    const currentRoute = navigationRef.isReady() ? navigationRef.getCurrentRoute()?.name : undefined;
    const homeAllowed = ['Home', 'HomeStack', 'RestaurantDetail', 'Menu'];
    if (hiddenRoutes.includes(currentRoute)) return null;
    if (currentRoute && !homeAllowed.includes(currentRoute)) return null;
    if (!items.length || itemCount === 0) return null;

    const handlePress = () => {
        if (navigationRef.isReady()) {
            navigationRef.navigate('Cart');
            return;
        }

        let nav = navigation;
        while (nav && !nav.getState?.().routeNames?.includes('Cart')) {
            nav = nav.getParent?.();
        }
        if (nav) {
            nav.dispatch(CommonActions.navigate({ name: 'Cart' }));
        }
    };

    return (
        <TouchableOpacity
            style={[styles.container, loading && styles.loading]}
            onPress={handlePress}
            activeOpacity={0.85}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
            <View style={styles.row}>
                <View style={styles.iconBadge}>
                    <MaterialCommunityIcons name="cart" size={18} color={theme.colors.primary} />
                    <View style={styles.countPill}>
                        <Text style={styles.countText}>{itemCount}</Text>
                    </View>
                </View>
                <Text style={styles.totalText}>₹{(total || 0).toFixed(2)}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 70, // sits closer to tab bar without overlap
        left: 12,
        right: 12,
        backgroundColor: theme.colors.primary,
        borderRadius: 12,
        paddingVertical: 9,
        paddingHorizontal: 12,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 3,
        zIndex: 1000,
    },
    loading: {
        opacity: 0.92,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    iconBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    countPill: {
        backgroundColor: theme.colors.white,
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
        minWidth: 26,
        alignItems: 'center',
    },
    countText: {
        color: theme.colors.primary,
        fontWeight: '700',
        fontSize: 11,
    },
    totalText: {
        color: theme.colors.white,
        fontSize: 15,
        fontWeight: '700',
    },
});

export default FloatingCart;
