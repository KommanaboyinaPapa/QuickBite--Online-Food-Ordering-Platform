import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text as RNText,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { fetchRestaurantDetails, fetchRestaurantMenu } from '../../redux/slices/restaurantSlice';
import { addToCart } from '../../redux/slices/cartSlice';
import { queueItemForAI } from '../../redux/slices/aiSlice';
import RestaurantHeader from '../../components/Restaurant/RestaurantHeader';
import MenuItemCard from '../../components/Restaurant/MenuItemCard';
import ReviewCard from '../../components/Restaurant/ReviewCard';
import Header from '../../components/Common/Header';
import Button from '../../components/Common/Button';
import theme from '../../styles/theme';

/**
 * RestaurantDetailScreen - Full restaurant details with menu and reviews
 * 
 * Features:
 * - Restaurant header with info and banner
 * - Menu items organized by category
 * - Category tabs for easy navigation
 * - Search bar to filter menu items
 * - Customer reviews section
 * - Add items to cart
 * - Restaurant info (hours, location, ratings)
 */
const RestaurantDetailScreen = ({ route, navigation }) => {
  const { restaurantId } = route.params;
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [showReviews, setShowReviews] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const dispatch = useDispatch();

  // Get restaurant from Redux or find in list
  const restaurant = useSelector(state => {
    return state.restaurant.selectedRestaurant?.id === restaurantId
      ? state.restaurant.selectedRestaurant
      : state.restaurant.restaurants.find(r => r.id === restaurantId);
  });

  useEffect(() => {
    if (restaurantId) {
      dispatch(fetchRestaurantDetails(restaurantId));
      dispatch(fetchRestaurantMenu(restaurantId));
    }
  }, [dispatch, restaurantId]);

  const menu = useSelector(state => state.restaurant.menu);
  const categories = menu?.categories || [];
  const items = menu?.items || [];
  const reviews = restaurant?.reviews || [];

  // Get items for selected category or search results
  const selectedCategoryName = categories[selectedCategory]?.id;

  // Memoize display items to prevent unnecessary re-renders
  const displayItems = useMemo(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      return items.filter(item =>
        item.name?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
      );
    }
    return items.filter(item => item.category === selectedCategoryName);
  }, [items, searchQuery, selectedCategoryName]);

  const isSearching = searchQuery.trim().length > 0;

  if (!restaurant) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialCommunityIcons name="loading" size={32} color={theme.colors.primary} />
      </View>
    );
  }

  const handleAddToCart = (item) => {
    dispatch(addToCart({
      menuItemId: item.id,
      quantity: 1,
      specialInstructions: item.specialInstructions,
    }));
  };

  const handleItemPress = (menuItem) => {
    navigation.navigate('Menu', { restaurantId, initialItemId: menuItem?.id });
  };

  const renderMenuItem = ({ item }) => (
    <MenuItemCard
      item={item}
      onPress={() => handleItemPress(item)}
      onAddToCart={() => handleAddToCart(item)}
      onAskAI={(menuItem) => {
        dispatch(queueItemForAI(menuItem));
      }}
    />
  );

  const renderReviewCard = ({ item }) => (
    <ReviewCard review={item} />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Navigation */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowReviews(!showReviews)}>
          <MaterialCommunityIcons
            name={showReviews ? 'close' : 'star'}
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Restaurant Header */}
        <RestaurantHeader restaurant={restaurant} />

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <MaterialCommunityIcons
              name="magnify"
              size={20}
              color={theme.colors.textSecondary}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search menu items..."
              placeholderTextColor={theme.colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialCommunityIcons
                  name="close-circle"
                  size={18}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Menu Category Tabs - hide when searching */}
        {!isSearching && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
            contentContainerStyle={styles.categoryContent}
          >
            {categories.map((category, index) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryTab,
                  selectedCategory === index && styles.categoryTabActive,
                ]}
                onPress={() => setSelectedCategory(index)}
              >
                <MaterialCommunityIcons
                  name={getCategoryIcon(category.name)}
                  size={18}
                  color={selectedCategory === index ? theme.colors.white : theme.colors.primary}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Search Results Label */}
        {isSearching && (
          <View style={styles.searchResultsLabel}>
            <RNText style={styles.searchResultsText}>
              {displayItems.length} result{displayItems.length !== 1 ? 's' : ''} for "{searchQuery}"
            </RNText>
          </View>
        )}

        {/* Menu Items for Selected Category or Search Results */}
        <View style={styles.itemsSection}>
          <FlatList
            data={displayItems}
            keyExtractor={item => item.id}
            renderItem={renderMenuItem}
            scrollEnabled={false}
            contentContainerStyle={styles.itemsList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                  name={isSearching ? "magnify-close" : "hamburger"}
                  size={32}
                  color={theme.colors.textTertiary}
                />
                <RNText style={styles.emptyText}>
                  {isSearching ? "No items found" : "No items in this category"}
                </RNText>
              </View>
            }
          />
        </View>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <MaterialCommunityIcons
                name="star"
                size={20}
                color={theme.colors.warning}
              />
              <RNText style={styles.reviewsTitle}>Customer Reviews</RNText>
              <RNText style={styles.reviewCount}>({reviews.length})</RNText>
            </View>
            <FlatList
              data={reviews.slice(0, 3)}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderReviewCard}
              scrollEnabled={false}
              contentContainerStyle={styles.reviewsList}
            />
            {reviews.length > 3 && (
              <Button
                title="View All Reviews"
                variant="secondary"
                onPress={() => setShowReviews(true)}
              />
            )}
          </View>
        )}

        {/* Info Section */}
        <View style={styles.infoSection}>
          <InfoRow
            icon="clock-outline"
            label="Hours"
            value={restaurant.hours || '10 AM - 11 PM'}
          />
          <InfoRow
            icon="map-marker-outline"
            label="Location"
            value={restaurant.location || 'City Center'}
          />
          <InfoRow
            icon="phone-outline"
            label="Contact"
            value={restaurant.phone || '+1 234 567 8900'}
          />
        </View>
      </ScrollView>

      {/* Reviews Modal */}
      <Modal
        visible={showReviews}
        animationType="slide"
        onRequestClose={() => setShowReviews(false)}
      >
        <SafeAreaView style={styles.reviewModal}>
          <View style={styles.reviewModalHeader}>
            <RNText style={styles.reviewModalTitle}>All Reviews</RNText>
            <TouchableOpacity onPress={() => setShowReviews(false)}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </View>
          <FlatList
            data={reviews}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderReviewCard}
            contentContainerStyle={styles.reviewsListFull}
          />
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
};

/**
 * InfoRow component for displaying restaurant info
 */
const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <MaterialCommunityIcons
      name={icon}
      size={20}
      color={theme.colors.primary}
      style={styles.infoIcon}
    />
    <View style={styles.infoText}>
      <RNText style={styles.infoLabel}>{label}</RNText>
      <RNText style={styles.infoValue}>{value}</RNText>
    </View>
  </View>
);

/**
 * Get icon for menu category
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
  return iconMap[categoryName.toLowerCase()] || 'food';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.screenPadding,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  content: {
    paddingBottom: theme.spacing.lg,
  },
  categoryScroll: {
    backgroundColor: theme.colors.white,
    paddingVertical: theme.spacing.md,
  },
  categoryContent: {
    paddingHorizontal: theme.spacing.screenPadding,
    gap: theme.spacing.sm,
  },
  categoryTab: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  categoryTabActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  itemsSection: {
    paddingHorizontal: theme.spacing.screenPadding,
    paddingVertical: theme.spacing.lg,
  },
  itemsList: {
    gap: theme.spacing.md,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: theme.spacing.sm,
    fontSize: 14,
    color: theme.colors.textTertiary,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.screenPadding,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.white,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.text,
    paddingVertical: 4,
  },
  searchResultsLabel: {
    paddingHorizontal: theme.spacing.screenPadding,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
  },
  searchResultsText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  reviewsSection: {
    paddingHorizontal: theme.spacing.screenPadding,
    paddingVertical: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  reviewsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  reviewsTitle: {
    marginLeft: theme.spacing.sm,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  reviewCount: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  reviewsList: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  reviewsListFull: {
    paddingHorizontal: theme.spacing.screenPadding,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
  },
  reviewModal: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  reviewModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.screenPadding,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  reviewModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  infoSection: {
    paddingHorizontal: theme.spacing.screenPadding,
    paddingVertical: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  infoIcon: {
    marginRight: theme.spacing.md,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },
});

export default RestaurantDetailScreen;
