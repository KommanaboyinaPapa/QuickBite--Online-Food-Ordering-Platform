import React, { useState, useCallback } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Text,
    SafeAreaView,
    Switch,
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
 * DeliveryAgentProfileScreen - Delivery agent profile and earnings
 */
const DeliveryAgentProfileScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const user = useSelector(state => state.user.profile);

    const [isOnline, setIsOnline] = useState(true);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        todayEarnings: 0,
        todayDeliveries: 0,
        todayTips: 0,
        todayHours: 0,
        weeklyEarnings: 0,
        weeklyDeliveries: 0,
        totalDeliveries: 0,
        totalEarnings: 0,
        rating: 4.5,
        completionRate: 100,
    });

    useFocusEffect(
        useCallback(() => {
            loadStats();
        }, [])
    );

    const loadStats = async () => {
        try {
            setLoading(true);
            const data = await statsService.getDeliveryAgentStats();
            setStats({
                todayEarnings: data.today?.earnings || 0,
                todayDeliveries: data.today?.deliveries || 0,
                todayTips: data.today?.tips || 0,
                todayHours: data.today?.hoursOnline || 0,
                weeklyEarnings: data.weekly?.earnings || 0,
                weeklyDeliveries: data.weekly?.deliveries || 0,
                totalDeliveries: data.lifetime?.deliveries || 0,
                totalEarnings: data.lifetime?.earnings || 0,
                rating: data.rating || 4.5,
                completionRate: data.completionRate || 100,
            });
        } catch (error) {
            console.error('Failed to fetch delivery stats:', error);
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

    const toggleOnlineStatus = () => {
        setIsOnline(!isOnline);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                <View style={[styles.header, isOnline ? styles.headerOnline : styles.headerOffline]}>
                    {/* Online/Offline Toggle */}
                    <View style={styles.statusToggle}>
                        <Text style={styles.statusLabel}>{isOnline ? 'Online' : 'Offline'}</Text>
                        <Switch
                            value={isOnline}
                            onValueChange={toggleOnlineStatus}
                            trackColor={{ false: colors.light400, true: colors.success }}
                            thumbColor={colors.white}
                        />
                    </View>

                    <View style={styles.profileRow}>
                        <View style={styles.avatarContainer}>
                            <Ionicons name="person" size={40} color={colors.white} />
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.userName}>
                                {user?.firstName} {user?.lastName}
                            </Text>
                            <Text style={styles.userPhone}>{user?.phone || user?.email}</Text>
                            <View style={styles.badgeRow}>
                                <View style={styles.badge}>
                                    <Ionicons name="star" size={12} color="#FFB800" />
                                    <Text style={styles.badgeText}>{stats.rating}</Text>
                                </View>
                                <View style={styles.badge}>
                                    <Ionicons name="checkmark-circle" size={12} color={colors.success} />
                                    <Text style={styles.badgeText}>{stats.completionRate}%</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Today's Earnings */}
                <View style={styles.statsContainer}>
                    <Text style={styles.sectionTitle}>Today's Earnings</Text>
                    <Card style={styles.earningsCard}>
                        <View style={styles.earningsMain}>
                            <Text style={styles.earningsAmount}>
                                ₹{stats.todayEarnings.toLocaleString()}
                            </Text>
                            <Text style={styles.earningsLabel}>Total Earnings</Text>
                        </View>
                        <View style={styles.earningsBreakdown}>
                            <View style={styles.earningsItem}>
                                <Ionicons name="bicycle-outline" size={20} color={colors.primary} />
                                <Text style={styles.earningsValue}>{stats.todayDeliveries}</Text>
                                <Text style={styles.earningsItemLabel}>Deliveries</Text>
                            </View>
                            <View style={styles.earningsItem}>
                                <Ionicons name="gift-outline" size={20} color={colors.warning} />
                                <Text style={styles.earningsValue}>₹{stats.todayTips}</Text>
                                <Text style={styles.earningsItemLabel}>Tips</Text>
                            </View>
                            <View style={styles.earningsItem}>
                                <Ionicons name="time-outline" size={20} color={colors.info} />
                                <Text style={styles.earningsValue}>{stats.todayHours}h</Text>
                                <Text style={styles.earningsItemLabel}>Online</Text>
                            </View>
                        </View>
                    </Card>
                </View>

                {/* Weekly Stats */}
                <View style={styles.statsContainer}>
                    <Text style={styles.sectionTitle}>This Week</Text>
                    <View style={styles.statsRow}>
                        <Card style={styles.statCard}>
                            <Ionicons name="wallet-outline" size={24} color={colors.success} />
                            <Text style={styles.statValue}>₹{stats.weeklyEarnings.toLocaleString()}</Text>
                            <Text style={styles.statLabel}>Earnings</Text>
                        </Card>
                        <Card style={styles.statCard}>
                            <Ionicons name="checkmark-done-outline" size={24} color={colors.primary} />
                            <Text style={styles.statValue}>{stats.weeklyDeliveries}</Text>
                            <Text style={styles.statLabel}>Deliveries</Text>
                        </Card>
                    </View>
                </View>

                {/* Lifetime Achievement */}
                <View style={styles.statsContainer}>
                    <Text style={styles.sectionTitle}>Your Journey</Text>
                    <Card style={styles.achievementCard}>
                        <View style={styles.achievementRow}>
                            <Ionicons name="trophy-outline" size={32} color={colors.warning} />
                            <View style={styles.achievementInfo}>
                                <Text style={styles.achievementValue}>
                                    {stats.totalDeliveries.toLocaleString()}
                                </Text>
                                <Text style={styles.achievementLabel}>Total Deliveries Completed</Text>
                            </View>
                        </View>
                    </Card>
                </View>

                {/* Menu Options */}
                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>Account Settings</Text>

                    <MenuButton
                        icon="document-text-outline"
                        title="Delivery History"
                        subtitle="View all past deliveries"
                        onPress={() => console.log('History')}
                    />
                    <MenuButton
                        icon="cash-outline"
                        title="Earnings History"
                        subtitle="Detailed payment records"
                        onPress={() => console.log('Earnings')}
                    />
                    <MenuButton
                        icon="car-outline"
                        title="Vehicle Details"
                        subtitle="Update vehicle info"
                        onPress={() => console.log('Vehicle')}
                    />
                    <MenuButton
                        icon="documents-outline"
                        title="Documents"
                        subtitle="ID, license, insurance"
                        onPress={() => console.log('Documents')}
                    />
                    <MenuButton
                        icon="notifications-outline"
                        title="Notifications"
                        subtitle="Order alert preferences"
                        onPress={() => console.log('Notifications')}
                    />
                    <MenuButton
                        icon="help-circle-outline"
                        title="Help & Support"
                        subtitle="FAQs & contact"
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
                <Text style={styles.versionText}>Delivery Partner v1.0.0</Text>
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
        paddingTop: Platform.OS === 'ios' ? 20 : 40,
        paddingBottom: 24,
        paddingHorizontal: spacing.lg,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerOnline: {
        backgroundColor: colors.success,
    },
    headerOffline: {
        backgroundColor: colors.textSecondary,
    },
    statusToggle: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: spacing.md,
        gap: spacing.sm,
    },
    statusLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.white,
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
    userName: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.white,
    },
    userPhone: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
        marginBottom: 8,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.white,
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
    earningsCard: {
        padding: spacing.lg,
    },
    earningsMain: {
        alignItems: 'center',
        marginBottom: spacing.lg,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    earningsAmount: {
        fontSize: 36,
        fontWeight: '800',
        color: colors.success,
    },
    earningsLabel: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 4,
    },
    earningsBreakdown: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    earningsItem: {
        alignItems: 'center',
    },
    earningsValue: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        marginTop: 4,
    },
    earningsItemLabel: {
        fontSize: 11,
        color: colors.textSecondary,
        marginTop: 2,
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
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
        marginTop: spacing.xs,
    },
    statLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 2,
    },
    achievementCard: {
        padding: spacing.lg,
    },
    achievementRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    achievementInfo: {
        flex: 1,
    },
    achievementValue: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.text,
    },
    achievementLabel: {
        fontSize: 13,
        color: colors.textSecondary,
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

export default DeliveryAgentProfileScreen;
