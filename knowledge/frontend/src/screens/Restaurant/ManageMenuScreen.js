import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, ScrollView, Modal, Alert, ActivityIndicator, Image, Platform } from 'react-native';
import { theme } from '@styles/theme';
import Card from '@components/Common/Card';
import Button from '@components/Common/Button';
import ImagePickerButton from '@components/Common/ImagePickerButton';
import Ionicons from '@expo/vector-icons/Ionicons';
import menuService from '@services/menuService';
import restaurantService from '@services/restaurantService';
import ingredientService from '@services/ingredientService';
import uploadService from '@services/uploadService';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

const { colors, typography, spacing } = theme;

// Allergen types for dropdown
const ALLERGEN_TYPES = [
    { value: null, label: 'None' },
    { value: 'dairy', label: '🥛 Dairy' },
    { value: 'eggs', label: '🥚 Eggs' },
    { value: 'peanuts', label: '🥜 Peanuts' },
    { value: 'tree_nuts', label: '🌰 Tree Nuts' },
    { value: 'soy', label: '🫘 Soy' },
    { value: 'wheat', label: '🌾 Wheat/Gluten' },
    { value: 'shellfish', label: '🦐 Shellfish' },
    { value: 'fish', label: '🐟 Fish' },
    { value: 'sesame', label: '🫛 Sesame' },
];

const ManageMenuScreen = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [restaurant, setRestaurant] = useState(null);
    const [restaurantImage, setRestaurantImage] = useState('');

    // Ingredients for the restaurant
    const [allIngredients, setAllIngredients] = useState([]);
    const [selectedIngredientIds, setSelectedIngredientIds] = useState([]);

    // Edit/Add Menu Item State
    const [isModalVisible, setModalVisible] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        name: '',
        price: '',
        description: '',
        category: 'main course',
        isVegetarian: false,
        imageUrl: ''
    });
    const [isSaving, setSaving] = useState(false);

    // Add Ingredient Modal
    const [isIngredientModalVisible, setIngredientModalVisible] = useState(false);
    const [newIngredient, setNewIngredient] = useState({
        name: '',
        allergenType: null
    });

    const fetchRestaurantAndMenu = useCallback(async () => {
        setLoading(true);
        try {
            const resp = await restaurantService.getMyRestaurant();
            const rest = resp.data || resp;
            setRestaurant(rest);
            setRestaurantImage(rest?.imageUrl || rest?.coverImage || rest?.logoUrl || '');
            if (rest?.id) {
                await fetchMenu(rest.id);
                await fetchIngredients(rest.id);
            }
        } catch (error) {
            console.error('Failed to load restaurant/menu', error);
            Alert.alert('Error', 'Unable to load restaurant info');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchMenu = useCallback(async (restaurantId) => {
        try {
            const resp = await menuService.getMenuByRestaurant(restaurantId);
            const items = resp?.items || resp || [];
            const normalized = items.map(item => ({
                ...item,
                ingredients: Array.isArray(item.ingredients)
                    ? item.ingredients.map(ing => ({
                        id: ing?.ingredientId || ing?.ingredient?.id,
                        name: ing?.ingredient?.name || ing?.name || ing,
                        allergenType: ing?.ingredient?.allergenType
                    })).filter(Boolean)
                    : [],
            }));
            setMenuItems(normalized);
        } catch (error) {
            console.error('Failed to load menu', error);
        }
    }, []);

    const fetchIngredients = useCallback(async (restaurantId) => {
        try {
            const resp = await ingredientService.getRestaurantIngredients(restaurantId);
            setAllIngredients(resp?.data || resp || []);
        } catch (error) {
            console.error('Failed to load ingredients', error);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchRestaurantAndMenu();
        }, [fetchRestaurantAndMenu])
    );

    const handleSave = async () => {
        if (!restaurant) {
            Alert.alert('Validation', 'You need to create your restaurant first (Dashboard tab).');
            return;
        }

        if (!formData.name || !formData.price) {
            Alert.alert('Validation', 'Name and Price are required.');
            return;
        }

        setSaving(true);
        try {
            // Format ingredients for API - convert IDs to { ingredientId: id } objects
            const ingredientsPayload = selectedIngredientIds.map(id => ({
                ingredientId: id,
                quantity: '1 serving'
            }));

            console.log('=== DEBUG: Saving Menu Item ===');
            console.log('Selected ingredient IDs:', selectedIngredientIds);
            console.log('Ingredients payload:', ingredientsPayload);
            console.log('Form mode:', formData.id ? 'UPDATE' : 'CREATE');

            if (formData.id) {
                // Update
                await menuService.updateMenuItem(formData.id, {
                    name: formData.name,
                    price: parseFloat(formData.price),
                    description: formData.description,
                    category: formData.category,
                    isVegetarian: formData.isVegetarian,
                    ingredients: ingredientsPayload,
                    imageUrl: formData.imageUrl
                });
                Alert.alert('Success', 'Item updated!');
            } else {
                // Create
                await menuService.createMenuItem({
                    restaurantId: restaurant.id,
                    name: formData.name,
                    price: parseFloat(formData.price),
                    description: formData.description,
                    category: formData.category,
                    isVegetarian: formData.isVegetarian,
                    ingredients: ingredientsPayload,
                    imageUrl: formData.imageUrl
                });
                Alert.alert('Success', 'Item created!');
            }
            setModalVisible(false);
            fetchMenu(restaurant.id);
        } catch (error) {
            console.error('Save Error:', error);
            Alert.alert('Error', 'Failed to save item. ' + (error.response?.data?.message || error.message));
        } finally {
            setSaving(false);
        }
    };

    const openEdit = (item) => {
        // Extract ingredient IDs from the item - they come as MenuItemIngredient objects with nested ingredient
        const ingredientIds = item.ingredients?.map(ing =>
            ing.ingredientId || ing.ingredient?.id || ing.id
        ).filter(Boolean) || [];
        console.log('Opening edit with ingredients:', ingredientIds);
        setSelectedIngredientIds(ingredientIds);

        setFormData({
            id: item.id,
            name: item.name,
            price: String(item.price),
            description: item.description || '',
            category: item.category || 'main course',
            isVegetarian: item.isVegetarian || false,
            imageUrl: item.imageUrl || ''
        });
        setModalVisible(true);
    };

    const openAdd = () => {
        setSelectedIngredientIds([]);
        setFormData({
            id: null,
            name: '',
            price: '',
            description: '',
            category: 'main course',
            isVegetarian: false,
            imageUrl: ''
        });
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        Alert.alert('Delete Item', 'Are you sure you want to delete this item?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await menuService.deleteMenuItem(id);
                        fetchMenu(restaurant.id);
                    } catch (err) {
                        Alert.alert('Error', 'Failed to delete item');
                    }
                }
            }
        ]);
    };

    const handleSaveRestaurant = async () => {
        if (!restaurant?.id) return;
        try {
            await restaurantService.updateRestaurant(restaurant.id, { logoUrl: restaurantImage });
            Alert.alert('Success', 'Restaurant image updated');
            fetchRestaurantAndMenu();
        } catch (err) {
            Alert.alert('Error', 'Failed to update restaurant image');
        }
    };

    // Toggle ingredient selection
    const toggleIngredient = (ingredientId) => {
        setSelectedIngredientIds(prev =>
            prev.includes(ingredientId)
                ? prev.filter(id => id !== ingredientId)
                : [...prev, ingredientId]
        );
    };

    // Add new ingredient
    const handleAddIngredient = async () => {
        if (!newIngredient.name.trim()) {
            Alert.alert('Validation', 'Ingredient name is required.');
            return;
        }

        try {
            await ingredientService.createIngredient({
                restaurantId: restaurant.id,
                name: newIngredient.name.trim(),
                allergenType: newIngredient.allergenType
            });
            setNewIngredient({ name: '', allergenType: null });
            setIngredientModalVisible(false);
            fetchIngredients(restaurant.id);
            Alert.alert('Success', 'Ingredient added!');
        } catch (error) {
            console.error('Add Ingredient Error:', error);
            Alert.alert('Error', 'Failed to add ingredient');
        }
    };

    // Delete ingredient
    const handleDeleteIngredient = async (ingredientId) => {
        Alert.alert('Delete Ingredient', 'This will remove it from all menu items. Continue?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await ingredientService.deleteIngredient(ingredientId);
                        fetchIngredients(restaurant.id);
                        // Remove from selected if present
                        setSelectedIngredientIds(prev => prev.filter(id => id !== ingredientId));
                    } catch (err) {
                        Alert.alert('Error', 'Failed to delete ingredient');
                    }
                }
            }
        ]);
    };

    const getIngredientAllergenLabel = (allergenType) => {
        const found = ALLERGEN_TYPES.find(a => a.value === allergenType);
        return found ? found.label : '';
    };

    const renderItem = ({ item }) => (
        <Card style={styles.menuItem}>
            <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
                <Image
                    source={{ uri: item.imageUrl || 'https://via.placeholder.com/64' }}
                    style={styles.thumb}
                />
                <View style={styles.itemInfo}>
                    <Text style={typography.h4}>{item.name}</Text>
                    <Text style={typography.caption}>{item.category}</Text>
                    <Text style={[typography.body, { color: colors.primary }]}>₹{item.price}</Text>
                    {item.ingredients?.length > 0 && (
                        <View style={styles.ingredientTags}>
                            {item.ingredients.slice(0, 3).map((ing, idx) => (
                                <View key={idx} style={[styles.ingredientTag, ing.allergenType && styles.allergenTag]}>
                                    <Text style={[styles.ingredientTagText, ing.allergenType && styles.allergenTagText]}>
                                        {ing.name}
                                    </Text>
                                </View>
                            ))}
                            {item.ingredients.length > 3 && (
                                <Text style={styles.moreText}>+{item.ingredients.length - 3} more</Text>
                            )}
                        </View>
                    )}
                </View>
                <View style={{ flexDirection: 'row', gap: spacing.xs }}>
                    <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionBtn}>
                        <Ionicons name="pencil" size={18} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
                        <Ionicons name="trash" size={18} color={colors.error} />
                    </TouchableOpacity>
                </View>
            </View>
        </Card>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[typography.h2, styles.title]}>Menu Management</Text>
                <Button title="Add Item" size="small" style={styles.addButton} onPress={openAdd} disabled={!restaurant} />
            </View>

            {restaurant && (
                <Card style={{ marginBottom: spacing.md, gap: spacing.sm }}>
                    <Text style={typography.body}>Restaurant Image</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                        <ImagePickerButton
                            currentImage={restaurantImage}
                            entityType="restaurant"
                            entityId={restaurant.id}
                            imageType="logo"
                            placeholder="Upload Logo"
                            size="medium"
                            onUploadComplete={(url) => {
                                setRestaurantImage(url);
                                Alert.alert('Success', 'Restaurant image uploaded!');
                            }}
                        />
                        <View style={{ flex: 1 }}>
                            <Text style={[typography.caption, { marginBottom: 4 }]}>Or enter URL:</Text>
                            <TextInput
                                style={styles.input}
                                value={restaurantImage}
                                onChangeText={setRestaurantImage}
                                placeholder="https://..."
                            />
                            <Button title="Save URL" size="small" onPress={handleSaveRestaurant} />
                        </View>
                    </View>
                </Card>
            )}

            {!restaurant && !loading && (
                <Text style={{ textAlign: 'center', marginTop: 20 }}>
                    No restaurant yet. Create one from the Dashboard tab first.
                </Text>
            )}

            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} />
            ) : (
                <FlatList
                    data={menuItems}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No items found. Add one!</Text>}
                />
            )}

            {/* Edit/Add Item Modal */}
            <Modal visible={isModalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={[typography.h3, { flex: 1, textAlign: 'center' }]}>
                            {formData.id ? 'Edit Item' : 'New Item'}
                        </Text>
                        <View style={{ width: 24 }} />
                    </View>

                    <ScrollView contentContainerStyle={styles.form}>
                        <Text style={typography.label}>Item Name *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.name}
                            onChangeText={t => setFormData({ ...formData, name: t })}
                            placeholder="e.g. Butter Chicken"
                        />

                        <Text style={typography.label}>Price (₹) *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.price}
                            keyboardType="numeric"
                            onChangeText={t => setFormData({ ...formData, price: t })}
                            placeholder="e.g. 299"
                        />

                        <Text style={typography.label}>Category</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.category}
                            onChangeText={t => setFormData({ ...formData, category: t })}
                            placeholder="e.g. main course, starters"
                        />

                        <Text style={typography.label}>Item Image</Text>
                        <View style={{ alignItems: 'center', marginBottom: spacing.md }}>
                            {formData.id ? (
                                <ImagePickerButton
                                    currentImage={formData.imageUrl}
                                    entityType="menuItem"
                                    entityId={formData.id}
                                    placeholder="Upload Image"
                                    size="large"
                                    onUploadComplete={(url) => {
                                        setFormData({ ...formData, imageUrl: url });
                                        Alert.alert('Success', 'Image uploaded!');
                                    }}
                                />
                            ) : (
                                <View style={{ padding: spacing.md, backgroundColor: colors.light50, borderRadius: 8, alignItems: 'center' }}>
                                    <Ionicons name="information-circle-outline" size={24} color={colors.textSecondary} />
                                    <Text style={[typography.caption, { textAlign: 'center', marginTop: 4 }]}>
                                        Save item first, then you can upload an image
                                    </Text>
                                </View>
                            )}
                        </View>
                        <Text style={[typography.caption, { marginBottom: 4 }]}>Or paste image URL:</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.imageUrl}
                            onChangeText={t => setFormData({ ...formData, imageUrl: t })}
                            placeholder="https://..."
                        />

                        <Text style={typography.label}>Description</Text>
                        <TextInput
                            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                            multiline
                            value={formData.description}
                            onChangeText={t => setFormData({ ...formData, description: t })}
                            placeholder="Describe the dish..."
                        />

                        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
                            <Button
                                title={formData.isVegetarian ? "Veg" : "Non-Veg"}
                                variant={formData.isVegetarian ? "primary" : "secondary"}
                                size="small"
                                onPress={() => setFormData({ ...formData, isVegetarian: !formData.isVegetarian })}
                            />
                            <Text style={{ marginLeft: 10 }}>{formData.isVegetarian ? "Vegetarian Only" : "Contains Meat/Egg"}</Text>
                        </View>

                        {/* Ingredients Section */}
                        <View style={styles.sectionHeader}>
                            <Text style={[typography.h4, { flex: 1 }]}>Ingredients</Text>
                            <TouchableOpacity
                                onPress={() => setIngredientModalVisible(true)}
                                style={styles.addIngredientBtn}
                            >
                                <Ionicons name="add-circle" size={20} color={colors.primary} />
                                <Text style={{ color: colors.primary, marginLeft: 4 }}>Add New</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={[typography.caption, { marginBottom: spacing.sm, color: colors.textSecondary }]}>
                            Select ingredients for this item. Customers can exclude these when ordering.
                        </Text>

                        {allIngredients.length === 0 ? (
                            <Text style={{ textAlign: 'center', color: colors.textSecondary, padding: spacing.md }}>
                                No ingredients yet. Add some to enable customer exclusions.
                            </Text>
                        ) : (
                            <View style={styles.ingredientCheckboxList}>
                                {allIngredients.map(ing => (
                                    <TouchableOpacity
                                        key={ing.id}
                                        style={[
                                            styles.ingredientCheckbox,
                                            selectedIngredientIds.includes(ing.id) && styles.ingredientCheckboxSelected
                                        ]}
                                        onPress={() => toggleIngredient(ing.id)}
                                    >
                                        <Ionicons
                                            name={selectedIngredientIds.includes(ing.id) ? 'checkbox' : 'square-outline'}
                                            size={20}
                                            color={selectedIngredientIds.includes(ing.id) ? colors.primary : colors.textSecondary}
                                        />
                                        <Text style={styles.ingredientCheckboxText}>{ing.name}</Text>
                                        {ing.allergenType && (
                                            <View style={styles.allergenBadge}>
                                                <Text style={styles.allergenBadgeText}>{getIngredientAllergenLabel(ing.allergenType)}</Text>
                                            </View>
                                        )}
                                        <TouchableOpacity
                                            onPress={() => handleDeleteIngredient(ing.id)}
                                            style={{ marginLeft: 'auto', padding: 4 }}
                                        >
                                            <Ionicons name="trash-outline" size={16} color={colors.error} />
                                        </TouchableOpacity>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        <View style={{ height: 20 }} />

                        <Button
                            title={isSaving ? "Saving..." : "Save Item"}
                            onPress={handleSave}
                            disabled={isSaving || !restaurant}
                        />
                        <Button
                            title="Cancel"
                            variant="secondary"
                            onPress={() => setModalVisible(false)}
                            style={{ marginTop: 10 }}
                        />
                    </ScrollView>
                </View>
            </Modal>

            {/* Add Ingredient Modal */}
            <Modal
                visible={isIngredientModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIngredientModalVisible(false)}
            >
                <View style={styles.ingredientModalOverlay}>
                    <View style={styles.ingredientModalContent}>
                        <Text style={[typography.h4, { marginBottom: spacing.md }]}>Add New Ingredient</Text>

                        <Text style={typography.label}>Ingredient Name *</Text>
                        <TextInput
                            style={styles.input}
                            value={newIngredient.name}
                            onChangeText={t => setNewIngredient({ ...newIngredient, name: t })}
                            placeholder="e.g. Mozzarella Cheese"
                        />

                        <Text style={[typography.label, { marginTop: spacing.md }]}>Allergen Type</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: spacing.sm }}>
                            {ALLERGEN_TYPES.map(allergen => (
                                <TouchableOpacity
                                    key={allergen.value || 'none'}
                                    style={[
                                        styles.allergenOption,
                                        newIngredient.allergenType === allergen.value && styles.allergenOptionSelected
                                    ]}
                                    onPress={() => setNewIngredient({ ...newIngredient, allergenType: allergen.value })}
                                >
                                    <Text style={[
                                        styles.allergenOptionText,
                                        newIngredient.allergenType === allergen.value && styles.allergenOptionTextSelected
                                    ]}>
                                        {allergen.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg }}>
                            <Button
                                title="Cancel"
                                variant="secondary"
                                onPress={() => setIngredientModalVisible(false)}
                                style={{ flex: 1 }}
                            />
                            <Button
                                title="Add"
                                onPress={handleAddIngredient}
                                style={{ flex: 1 }}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: spacing.md,
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
    addButton: {
        width: 100,
    },
    list: {
        gap: spacing.md,
        paddingBottom: 20,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    thumb: {
        width: 64,
        height: 64,
        borderRadius: 8,
        backgroundColor: colors.light,
    },
    itemInfo: {
        gap: 4,
        flex: 1,
    },
    ingredientTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
        marginTop: 4,
    },
    ingredientTag: {
        backgroundColor: colors.light50,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    allergenTag: {
        backgroundColor: '#FFF3CD',
        borderWidth: 1,
        borderColor: '#FFE69C',
    },
    ingredientTagText: {
        ...typography.caption,
        fontSize: 10,
        color: colors.textSecondary,
    },
    allergenTagText: {
        color: '#856404',
    },
    moreText: {
        ...typography.caption,
        fontSize: 10,
        color: colors.textLight,
        marginLeft: 4,
    },
    actionBtn: {
        padding: spacing.sm,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: colors.white,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    form: {
        padding: spacing.md,
        gap: spacing.sm,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: spacing.md,
        fontSize: 16,
        marginBottom: spacing.sm,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
    },
    addIngredientBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ingredientCheckboxList: {
        gap: spacing.xs,
    },
    ingredientCheckbox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.sm,
        borderRadius: 8,
        backgroundColor: colors.light50,
        gap: spacing.sm,
    },
    ingredientCheckboxSelected: {
        backgroundColor: colors.primaryLight || '#E8F5E9',
        borderWidth: 1,
        borderColor: colors.primary,
    },
    ingredientCheckboxText: {
        ...typography.body,
        flex: 1,
    },
    allergenBadge: {
        backgroundColor: '#FFF3CD',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    allergenBadgeText: {
        fontSize: 10,
        color: '#856404',
    },
    ingredientModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    ingredientModalContent: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: spacing.lg,
        width: '100%',
        maxWidth: 400,
    },
    allergenOption: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 20,
        backgroundColor: colors.light50,
        marginRight: spacing.sm,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    allergenOptionSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    allergenOptionText: {
        ...typography.caption,
        color: colors.text,
    },
    allergenOptionTextSelected: {
        color: colors.white,
    },
});

export default ManageMenuScreen;

