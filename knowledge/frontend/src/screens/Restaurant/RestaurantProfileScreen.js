import React, { useState, useCallback } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Text,
    SafeAreaView,
    Image,
    Platform,
    ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { logoutUser } from '../../redux/slices/authSlice';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import statsService from '../../services/statsService';
import theme from '../../styles/theme';

const { colors, spacing } = theme;

/**
 * RestaurantProfileScreen - Restaurant owner profile and settings
 */
const RestaurantProfileScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const user = useSelector(state => state.user.profile);
    const [loading, setLoading] = useState(true);
    const [restaurantData, setRestaurantData] = useState(null);

    const [stats, setStats] = useState({
        todayOrders: 0,
        todayRevenue: 0,
        weeklyOrders: 0,
        weeklyRevenue: 0,
        totalOrders: 0,
        totalRevenue: 0,
        rating: 0,
        reviewCount: 0,
    });

    useFocusEffect(
        useCallback(() => {
            loadStats();
        }, [])
    );

    const loadStats = async () => {
        try {
            setLoading(true);
            const data = await statsService.getRestaurantStats();
            setRestaurantData(data.restaurant);
            setStats({
                todayOrders: data.today?.orders || 0,
                todayRevenue: data.today?.revenue || 0,
                weeklyOrders: data.weekly?.orders || 0,
                weeklyRevenue: data.weekly?.revenue || 0,
                totalOrders: data.lifetime?.orders || 0,
                totalRevenue: data.lifetime?.revenue || 0,
                rating: data.rating || 0,
                reviewCount: data.reviewCount || 0,
            });
        } catch (error) {
            console.error('Failed to fetch restaurant stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await dispatch(logoutUser()).unwrap();
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        } catch (error) {
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                <View style={styles.header}>
                    <View style={styles.profileRow}>
                        <View style={styles.avatarContainer}>
                            <Ionicons name="restaurant" size={40} color={colors.white} />
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.restaurantName}>{restaurantData?.name || 'My Restaurant'}</Text>
                            <Text style={styles.ownerName}>
                                {user?.firstName} {user?.lastName}
                            </Text>
                            <View style={styles.ratingRow}>
                                <Ionicons name="star" size={16} color="#FFB800" />
                                <Text style={styles.ratingText}>
                                    {stats.rating} ({stats.reviewCount} reviews)
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    <Text style={styles.sectionTitle}>Today's Performance</Text>
                    <View style={styles.statsRow}>
                        <Card style={styles.statCard}>
                            <Ionicons name="receipt-outline" size={24} color={colors.primary} />
                            <Text style={styles.statValue}>{stats.todayOrders}</Text>
                            <Text style={styles.statLabel}>Orders</Text>
                        </Card>
                        <Card style={styles.statCard}>
                            <Ionicons name="cash-outline" size={24} color={colors.success} />
                            <Text style={styles.statValue}>₹{stats.todayRevenue.toLocaleString()}</Text>
                            <Text style={styles.statLabel}>Revenue</Text>
                        </Card>
                    </View>
                </View>

                {/* Lifetime Stats */}
                <View style={styles.statsContainer}>
                    <Text style={styles.sectionTitle}>Lifetime Stats</Text>
                    <View style={styles.statsRow}>
                        <Card style={styles.statCard}>
                            <Ionicons name="checkmark-done-outline" size={24} color={colors.info} />
                            <Text style={styles.statValue}>{stats.totalOrders.toLocaleString()}</Text>
                            <Text style={styles.statLabel}>Total Orders</Text>
                        </Card>
                        <Card style={styles.statCard}>
                            <Ionicons name="trending-up-outline" size={24} color={colors.success} />
                            <Text style={styles.statValue}>₹{(stats.totalRevenue / 1000).toFixed(0)}K</Text>
                            <Text style={styles.statLabel}>Total Revenue</Text>
                        </Card>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>Restaurant Management</Text>

                    <MenuButton
                        icon="restaurant-outline"
                        title="Restaurant Details"
                        subtitle="Update name, address, hours"
                        onPress={() => console.log('Restaurant Details')}
                    />
                    <MenuButton
                        icon="fast-food-outline"
                        title="Manage Menu"
                        subtitle="Add, edit, or remove items"
                        onPress={() => navigation.navigate('ManageMenu')}
                    />
                    <MenuButton
                        icon="images-outline"
                        title="Photos & Gallery"
                        subtitle="Update restaurant images"
                        onPress={() => console.log('Photos')}
                    />
                    <MenuButton
                        icon="time-outline"
                        title="Operating Hours"
                        subtitle="Set open/close times"
                        onPress={() => console.log('Hours')}
                    />
                </View>

                {/* Settings */}
                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>Settings</Text>

                    <MenuButton
                        icon="notifications-outline"
                        title="Notifications"
                        subtitle="Order alerts & updates"
                        onPress={() => console.log('Notifications')}
                    />
                    <MenuButton
                        icon="card-outline"
                        title="Payment Settings"
                        subtitle="Bank account & payouts"
                        onPress={() => console.log('Payment')}
                    />
                    <MenuButton
                        icon="shield-checkmark-outline"
                        title="Account Security"
                        subtitle="Password & 2FA"
                        onPress={() => console.log('Security')}
                    />
                    <MenuButton
                        icon="help-circle-outline"
                        title="Help & Support"
                        subtitle="FAQs & contact support"
                        onPress={() => console.log('Help')}
                    />
                </View>

                {/* Logout */}
                <View style={styles.logoutContainer}>
                    <Button
                        title="Logout"
                        variant="outline"
                        onPress={handleLogout}
                        fullWidth
                    />
                </View>

                {/* Version */}
                <Text style={styles.versionText}>Restaurant Partner v1.0.0</Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const MenuButton = ({ icon, title, subtitle, onPress }) => (
    <TouchableOpacity style={styles.menuButton} onPress={onPress}>
        <View style={styles.menuIconContainer}>
            <Ionicons name={icon} size={22} color={colors.primary} />
        </View>
        <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>{title}</Text>
            <Text style={styles.menuSubtitle}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        backgroundColor: colors.primary,
        paddingTop: Platform.OS === 'ios' ? 20 : 40,
        paddingBottom: 30,
        paddingHorizontal: spacing.lg,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    profileInfo: {
        flex: 1,
    },
    restaurantName: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.white,
        marginBottom: 2,
    },
    ownerName: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 6,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 13,
        color: colors.white,
        fontWeight: '500',
    },
    statsContainer: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.md,
    },
    statsRow: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        padding: spacing.md,
    },
    statValue: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.text,
        marginTop: spacing.xs,
    },
    statLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 2,
    },
    menuSection: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
    },
    menuButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        padding: spacing.md,
        borderRadius: 12,
        marginBottom: spacing.sm,
    },
    menuIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: colors.light50,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
    },
    menuSubtitle: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 2,
    },
    logoutContainer: {
        padding: spacing.lg,
        paddingTop: spacing.xl,
    },
    versionText: {
        textAlign: 'center',
        fontSize: 12,
        color: colors.textLight,
        paddingBottom: 30,
    },
});

export default RestaurantProfileScreen;
