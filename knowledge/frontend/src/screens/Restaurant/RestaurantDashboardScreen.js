import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { theme } from '@styles/theme';
import Card from '@components/Common/Card';
import Button from '@components/Common/Button';
import Ionicons from '@expo/vector-icons/Ionicons';
import restaurantService from '../../services/restaurantService';
import statsService from '../../services/statsService';

const { colors, typography, spacing } = theme;

const RestaurantDashboardScreen = () => {
    const [stats, setStats] = useState({
        todayOrders: 0,
        todaySales: 0,
        weeklyOrders: 0,
        weeklySales: 0,
        rating: 0,
        reviewCount: 0,
        pendingOrders: 0
    });
    const [loading, setLoading] = useState(true);
    const [restaurant, setRestaurant] = useState(null);
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [createForm, setCreateForm] = useState({
        name: '',
        description: '',
        cuisineTypes: '',
        address: '',
        phone: '',
        minimumOrder: '',
        deliveryFee: '',
    });
    const [isCreating, setCreating] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        description: '',
        phone: '',
        location: '',
        hours: ''
    });
    const [isSaving, setSaving] = useState(false);

    React.useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            // 1. Get My Restaurant
            const myRest = await restaurantService.getMyRestaurant();
            setRestaurant(myRest.data);

            // 2. Get Real Stats from new stats API
            try {
                const statsData = await statsService.getRestaurantStats();
                setStats({
                    todayOrders: statsData.today?.orders || 0,
                    todaySales: statsData.today?.revenue || 0,
                    weeklyOrders: statsData.weekly?.orders || 0,
                    weeklySales: statsData.weekly?.revenue || 0,
                    rating: statsData.rating || 0,
                    reviewCount: statsData.reviewCount || 0,
                    pendingOrders: statsData.pendingOrders || 0
                });
            } catch (statsError) {
                console.log('Stats fetch error:', statsError);
                // Use defaults
            }
        } catch (error) {
            console.error('Dashboard Load Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditPress = () => {
        setEditForm({
            name: restaurant.name,
            description: restaurant.description || '',
            phone: restaurant.phone || '',
            location: restaurant.location || '',
            hours: restaurant.hours || ''
        });
        setEditModalVisible(true);
    };

    const handleSaveProfile = async () => {
        if (!editForm.name) {
            Alert.alert('Error', 'Name is required');
            return;
        }
        setSaving(true);
        try {
            await restaurantService.updateRestaurant(restaurant.id, editForm);
            Alert.alert('Success', 'Profile updated!');
            setEditModalVisible(false);
            loadDashboard(); // Refresh
        } catch (error) {
            console.error('Update Error:', error);
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <View style={[styles.container, { justifyContent: 'center' }]}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
    );

    const handleCreateRestaurant = async () => {
        if (!createForm.name || !createForm.address) {
            Alert.alert('Missing info', 'Name and address are required');
            return;
        }

        setCreating(true);
        try {
            const payload = {
                name: createForm.name,
                description: createForm.description,
                cuisineTypes: createForm.cuisineTypes
                    ? createForm.cuisineTypes.split(',').map(c => c.trim()).filter(Boolean)
                    : [],
                address: createForm.address,
                phone: createForm.phone,
                minimumOrder: createForm.minimumOrder || 0,
                deliveryFee: createForm.deliveryFee || 0,
            };

            await restaurantService.createRestaurant(payload);
            Alert.alert('Success', 'Restaurant created!');
            await loadDashboard();
        } catch (error) {
            console.error('Create restaurant error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Could not create restaurant');
        } finally {
            setCreating(false);
        }
    };

    if (!restaurant) return (
        <ScrollView style={styles.container} contentContainerStyle={styles.emptyContent}>
            <Text style={[typography.h2, styles.title]}>Create Your Restaurant</Text>
            <Text style={[typography.body, { marginBottom: spacing.lg }]}>Fill in the basics to start taking orders.</Text>

            <View style={styles.formGroup}>
                <Text style={typography.label}>Restaurant Name *</Text>
                <TextInput
                    style={styles.input}
                    value={createForm.name}
                    onChangeText={t => setCreateForm({ ...createForm, name: t })}
                    placeholder="e.g. Spice Route"
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={typography.label}>Description</Text>
                <TextInput
                    style={[styles.input, { height: 70 }]}
                    multiline
                    value={createForm.description}
                    onChangeText={t => setCreateForm({ ...createForm, description: t })}
                    placeholder="Short summary about your cuisine"
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={typography.label}>Cuisine Types (comma separated)</Text>
                <TextInput
                    style={styles.input}
                    value={createForm.cuisineTypes}
                    onChangeText={t => setCreateForm({ ...createForm, cuisineTypes: t })}
                    placeholder="Indian, Chinese"
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={typography.label}>Address *</Text>
                <TextInput
                    style={styles.input}
                    value={createForm.address}
                    onChangeText={t => setCreateForm({ ...createForm, address: t })}
                    placeholder="123 MG Road, Bengaluru"
                />
            </View>

            <View style={styles.formRow}>
                <View style={{ flex: 1 }}>
                    <Text style={typography.label}>Phone</Text>
                    <TextInput
                        style={styles.input}
                        value={createForm.phone}
                        keyboardType="phone-pad"
                        onChangeText={t => setCreateForm({ ...createForm, phone: t })}
                        placeholder="+91 98765 43210"
                    />
                </View>
            </View>

            <View style={styles.formRow}>
                <View style={{ flex: 1 }}>
                    <Text style={typography.label}>Minimum Order (₹)</Text>
                    <TextInput
                        style={styles.input}
                        value={String(createForm.minimumOrder)}
                        keyboardType="numeric"
                        onChangeText={t => setCreateForm({ ...createForm, minimumOrder: t })}
                        placeholder="0"
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={typography.label}>Delivery Fee (₹)</Text>
                    <TextInput
                        style={styles.input}
                        value={String(createForm.deliveryFee)}
                        keyboardType="numeric"
                        onChangeText={t => setCreateForm({ ...createForm, deliveryFee: t })}
                        placeholder="0"
                    />
                </View>
            </View>

            <Button
                title={isCreating ? 'Creating...' : 'Create Restaurant'}
                onPress={handleCreateRestaurant}
                disabled={isCreating}
                style={{ marginTop: spacing.lg }}
            />
        </ScrollView>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.headerRow}>
                <Text style={[typography.h2, styles.title]}>{restaurant.name} Dashboard</Text>
                <TouchableOpacity onPress={handleEditPress}>
                    <Ionicons name="settings-sharp" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.statsGrid}>
                <Card style={styles.statCard}>
                    <Ionicons name="cart" size={24} color={colors.primary} />
                    <Text style={typography.h3}>{stats.todayOrders}</Text>
                    <Text style={typography.caption}>Today's Orders</Text>
                </Card>

                <Card style={styles.statCard}>
                    <Ionicons name="cash" size={24} color={colors.green} />
                    <Text style={typography.h3}>₹{stats.todaySales?.toFixed(2)}</Text>
                    <Text style={typography.caption}>Today's Sales</Text>
                </Card>

                <Card style={styles.statCard}>
                    <Ionicons name="star" size={24} color={colors.ratingGold} />
                    <Text style={typography.h3}>{stats.rating}</Text>
                    <Text style={typography.caption}>Rating</Text>
                </Card>

                <Card style={styles.statCard}>
                    <Ionicons name="time" size={24} color={colors.warning} />
                    <Text style={typography.h3}>{stats.pendingOrders}</Text>
                    <Text style={typography.caption}>Pending Orders</Text>
                </Card>
            </View>

            <Text style={[typography.h3, styles.sectionTitle]}>Recent Activity</Text>
            <Card style={styles.activityCard}>
                <Text style={typography.body}>System Online</Text>
                <Text style={typography.caption}>Just now</Text>
            </Card>

            {/* Edit Profile Modal */}
            <Modal visible={isEditModalVisible} animationType="slide" onRequestClose={() => setEditModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <Text style={[typography.h2, styles.modalTitle]}>Edit Profile</Text>
                    <ScrollView contentContainerStyle={styles.form}>
                        <Text style={typography.label}>Restaurant Name *</Text>
                        <TextInput
                            style={styles.input}
                            value={editForm.name}
                            onChangeText={t => setEditForm({ ...editForm, name: t })}
                        />

                        <Text style={typography.label}>Description</Text>
                        <TextInput
                            style={[styles.input, { height: 60 }]}
                            multiline
                            value={editForm.description}
                            onChangeText={t => setEditForm({ ...editForm, description: t })}
                        />

                        <Text style={typography.label}>Location</Text>
                        <TextInput
                            style={styles.input}
                            value={editForm.location}
                            onChangeText={t => setEditForm({ ...editForm, location: t })}
                        />

                        <Text style={typography.label}>Phone</Text>
                        <TextInput
                            style={styles.input}
                            value={editForm.phone}
                            keyboardType="phone-pad"
                            onChangeText={t => setEditForm({ ...editForm, phone: t })}
                        />

                        <Text style={typography.label}>Hours</Text>
                        <TextInput
                            style={styles.input}
                            value={editForm.hours}
                            onChangeText={t => setEditForm({ ...editForm, hours: t })}
                            placeholder="e.g. 10 AM - 10 PM"
                        />

                        <View style={{ height: 20 }} />
                        <Button
                            title={isSaving ? "Saving..." : "Save Changes"}
                            onPress={handleSaveProfile}
                            disabled={isSaving}
                        />
                        <Button
                            title="Cancel"
                            variant="secondary"
                            style={{ marginTop: 10 }}
                            onPress={() => setEditModalVisible(false)}
                        />
                    </ScrollView>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.md,
    },
    emptyContent: {
        padding: spacing.lg,
        gap: spacing.md,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
        paddingRight: spacing.sm
    },
    title: {
        color: colors.text,
        flex: 1,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        alignItems: 'center',
        gap: spacing.sm,
        padding: spacing.md,
    },
    sectionTitle: {
        marginBottom: spacing.md,
        color: colors.text,
    },
    activityCard: {
        marginBottom: spacing.sm,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: colors.white,
        padding: spacing.xl,
    },
    modalTitle: {
        marginBottom: spacing.xl,
        textAlign: 'center',
    },
    form: {
        gap: spacing.md,
    },
    formGroup: {
        gap: spacing.xs,
    },
    formRow: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: spacing.md,
        fontSize: 16,
    }
});

export default RestaurantDashboardScreen;
