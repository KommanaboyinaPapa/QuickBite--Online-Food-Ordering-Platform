import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Text,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart } from '../../redux/slices/cartSlice';
import { queueItemForAI } from '../../redux/slices/aiSlice';
import MenuItemCard from '../../components/Restaurant/MenuItemCard';
import IngredientSelector from '../../components/Restaurant/IngredientSelector';
import Header from '../../components/Common/Header';
import Button from '../../components/Common/Button';
import theme from '../../styles/theme';

/**
 * MenuScreen - Full menu with filtering and search
 * 
 * Features:
 * - Display all menu items with images and details
 * - Filter by category
 * - Search by item name or ingredients
 * - Ingredient selection modal
 * - Add to cart functionality
 * - Price and rating display
 */
const MenuScreen = ({ route, navigation }) => {
  const { restaurantId, initialItemId } = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemExclusions, setItemExclusions] = useState([]);

  const dispatch = useDispatch();
  const menu = useSelector(state => state.restaurant.menu);
  const restaurant = useSelector(state => state.restaurant.selectedRestaurant);
  const userAllergies = useSelector(state => state.user.allergies || []);

  const categories = menu?.categories || [];
  const items = menu?.items || [];

  // Debug menu data
  useEffect(() => {
    console.log('=== DEBUG: Menu Data ===');
    console.log('Total items:', items.length);
    if (items.length > 0) {
      console.log('First item:', items[0]?.name);
      console.log('First item has ingredients?:', !!items[0]?.ingredients);
      console.log('First item ingredients count:', items[0]?.ingredients?.length || 0);
      console.log('First item full data:', JSON.stringify(items[0], null, 2));
    }
  }, [items]);

  // Auto-open modal if navigated with initialItemId
  useEffect(() => {
    if (initialItemId && items.length > 0) {
      const item = items.find(i => i.id === initialItemId);
      if (item) {
        setSelectedItem(item);
        setItemQuantity(1);
        setItemExclusions([]);
        setShowIngredientModal(true);
      }
    }
  }, [initialItemId, items]);

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' ||
      item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleItemPress = (item) => {
    console.log('=== DEBUG: Item Clicked ===');
    console.log('Item name:', item?.name);
    console.log('Item has ingredients?:', !!item?.ingredients);
    console.log('Ingredients count:', item?.ingredients?.length || 0);
    console.log('Full item data:', JSON.stringify(item, null, 2));

    setSelectedItem(item);
    setItemQuantity(1);
    setItemExclusions([]);
    setShowIngredientModal(true);
  };

  const handleAddToCart = () => {
    if (!selectedItem) return;

    dispatch(addToCart({
      menuItemId: selectedItem.id,
      quantity: itemQuantity,
      exclusions: itemExclusions,
    }));

    setShowIngredientModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header
        title={restaurant?.name || 'Menu'}
        subtitle={`${items.length} items available`}
        onBackPress={() => navigation.goBack()}
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons
          name="magnify"
          size={20}
          color={theme.colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search menu items..."
          placeholderTextColor={theme.colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialCommunityIcons
              name="close"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContent}
      >
        <TouchableOpacity
          style={[
            styles.categoryButton,
            selectedCategory === 'all' && styles.categoryButtonActive,
          ]}
          onPress={() => setSelectedCategory('all')}
        >
          <MaterialCommunityIcons
            name="menu"
            size={16}
            color={selectedCategory === 'all' ? theme.colors.white : theme.colors.primary}
          />
        </TouchableOpacity>
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <MaterialCommunityIcons
              name={getCategoryIcon(category.name)}
              size={16}
              color={selectedCategory === category.id ? theme.colors.white : theme.colors.primary}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Menu Items List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.itemsList}
      >
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <MenuItemCard
              key={item.id}
              item={item}
              onPress={() => handleItemPress(item)}
              onAddToCart={() => {
                // Quick add with quantity 1
                dispatch(addToCart({
                  menuItemId: item.id,
                  quantity: 1,
                }));
              }}
              onAskAI={(menuItem) => {
                dispatch(queueItemForAI(menuItem));
              }}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="magnify"
              size={48}
              color={theme.colors.textTertiary}
            />
            <Text style={styles.emptyText}>No items found</Text>
          </View>
        )}
      </ScrollView>

      {/* Item Details Modal */}
      <Modal
        visible={showIngredientModal}
        animationType="slide"
        onRequestClose={() => setShowIngredientModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowIngredientModal(false)}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Customize Item</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            {/* Item Preview */}
            <View style={styles.itemPreview}>
              <View style={styles.itemImagePlaceholder}>
                <MaterialCommunityIcons
                  name="food"
                  size={32}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{selectedItem?.name}</Text>
                <Text style={styles.itemPrice}>
                  ₹{selectedItem?.price.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Quantity Selector */}
            <View style={styles.quantityContainer}>
              <Text style={styles.sectionTitle}>Quantity</Text>
              <View style={styles.quantityButtons}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                >
                  <MaterialCommunityIcons name="minus" size={20} color={theme.colors.primary} />
                </TouchableOpacity>
                <Text style={styles.quantityValue}>{itemQuantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setItemQuantity(itemQuantity + 1)}
                >
                  <MaterialCommunityIcons name="plus" size={20} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Ingredients */}
            <View style={styles.ingredientsContainer}>
              <Text style={styles.sectionTitle}>Ingredients</Text>
              <Text style={styles.ingredientsText}>
                Tap to exclude ingredients you don't want
              </Text>
              <IngredientSelector
                ingredients={
                  selectedItem?.ingredients?.map(ing => {
                    // Handle both nested ingredient object (backend) and direct properties (fallback)
                    const base = ing.ingredient || ing;
                    return {
                      id: base.id || ing.ingredientId || ing.id,
                      name: base.name || ing.name || 'Unknown Ingredient',
                      allergen: base.allergenType || base.allergen || ing.allergenType || 'no-allergen',
                      quantity: ing.quantity || '1'
                    };
                  }) || []
                }
                userAllergies={userAllergies}
                onExclusionsChange={setItemExclusions}
              />
            </View>

            {/* Total Price */}
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalPrice}>
                ₹{(selectedItem?.price * itemQuantity).toFixed(2)}
              </Text>
            </View>
          </ScrollView>

          {/* Add to Cart Button */}
          <View style={styles.modalFooter}>
            <Button
              title="Add to Cart"
              onPress={handleAddToCart}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

/**
 * Get icon for category
 */
const getCategoryIcon = (categoryName) => {
  const iconMap = {
    appetizers: 'food-variant',
    'main course': 'silverware-fork-knife',
    desserts: 'cake-variant',
    beverages: 'glass-mug',
    salads: 'leaf',
    soups: 'water-pot',
  };
  return iconMap[categoryName?.toLowerCase()] || 'food';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    marginHorizontal: theme.spacing.screenPadding,
    marginVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    fontSize: 14,
    color: theme.colors.text,
  },
  categoryScroll: {
    backgroundColor: theme.colors.white,
    paddingVertical: theme.spacing.sm,
  },
  categoryContent: {
    paddingHorizontal: theme.spacing.screenPadding,
    gap: theme.spacing.sm,
  },
  categoryButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  categoryButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  itemsList: {
    paddingHorizontal: theme.spacing.screenPadding,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
  },
  emptyContainer: {
    paddingVertical: 100,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textTertiary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.screenPadding,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  modalContent: {
    paddingHorizontal: theme.spacing.screenPadding,
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  itemPreview: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  itemImagePlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  quantityContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  quantityButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.lg,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    minWidth: 40,
    textAlign: 'center',
  },
  ingredientsContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: theme.spacing.md,
  },
  ingredientsText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: theme.spacing.md,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  modalFooter: {
    paddingHorizontal: theme.spacing.screenPadding,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});

export default MenuScreen;
