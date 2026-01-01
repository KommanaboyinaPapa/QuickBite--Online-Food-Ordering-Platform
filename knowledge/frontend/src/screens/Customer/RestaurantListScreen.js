import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Text,
  Image,
  Platform,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import RestaurantCard from '../../components/Restaurant/RestaurantCard';
import Card from '../../components/Common/Card';
import theme from '../../styles/theme';
import { getImageSource } from '../../utils/image';

const { colors, spacing } = theme;

/**
 * RestaurantListScreen - Premium restaurant search & discovery
 */
const RestaurantListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const restaurants = useSelector(state => state.restaurant.restaurants);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [refreshing, setRefreshing] = useState(false);

  // Cuisines with icons and colors
  const cuisines = [
    { id: 'all', name: 'All', icon: 'apps', color: colors.primary },
    { id: 'Indian', name: 'Indian', icon: 'flame', color: '#FF6B35' },
    { id: 'Chinese', name: 'Chinese', icon: 'restaurant', color: '#E53935' },
    { id: 'Italian', name: 'Italian', icon: 'pizza', color: '#43A047' },
    { id: 'Mexican', name: 'Mexican', icon: 'leaf', color: '#FB8C00' },
    { id: 'Thai', name: 'Thai', icon: 'nutrition', color: '#8E24AA' },
    { id: 'Fast Food', name: 'Fast Food', icon: 'fast-food', color: '#FDD835' },
  ];

  // Sort options
  const sortOptions = [
    { id: 'featured', label: 'Featured', icon: 'star' },
    { id: 'rating', label: 'Top Rated', icon: 'heart' },
    { id: 'distance', label: 'Nearest', icon: 'location' },
    { id: 'deliveryTime', label: 'Fastest', icon: 'time' },
  ];

  // Filter and sort restaurants
  const filteredRestaurants = React.useMemo(() => {
    let filtered = (restaurants || []).filter(r => {
      const restaurantCuisines = r.cuisines || r.cuisineTypes || [];
      const matchesSearch = r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurantCuisines.some(c => c?.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCuisine = selectedCuisine === 'all' ||
        restaurantCuisines.includes(selectedCuisine);

      return matchesSearch && matchesCuisine;
    });

    switch (sortBy) {
      case 'rating':
        return filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'distance':
        return filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      case 'deliveryTime':
        return filtered.sort((a, b) => (a.deliveryTime || 0) - (b.deliveryTime || 0));
      default:
        return filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }
  }, [restaurants, searchQuery, selectedCuisine, sortBy]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const handleRestaurantPress = useCallback((restaurant) => {
    navigation.navigate('RestaurantDetail', { restaurantId: restaurant.id });
  }, [navigation]);

  const renderRestaurantCard = useCallback(({ item, index }) => (
    <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
      <Card style={styles.restaurantCard} onPress={() => handleRestaurantPress(item)}>
        {/* Restaurant Image */}
        <View style={styles.imageContainer}>
          <Image
            source={getImageSource(item.bannerUrl || item.logoUrl, 'restaurant')}
            style={styles.restaurantImage}
          />
          {/* Dark overlay at bottom */}
          <View style={styles.imageGradient} />
          {/* Rating badge */}
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#FFB800" />
            <Text style={styles.ratingText}>{item.rating?.toFixed(1) || '4.5'}</Text>
          </View>
          {/* Delivery time badge */}
          <View style={styles.timeBadge}>
            <Ionicons name="time-outline" size={12} color={colors.white} />
            <Text style={styles.timeText}>{item.deliveryTime || '30'} min</Text>
          </View>
        </View>

        {/* Restaurant Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.restaurantName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.cuisineText} numberOfLines={1}>
            {(item.cuisineTypes || item.cuisines || ['Various']).join(' • ')}
          </Text>

          {/* Tags row */}
          <View style={styles.tagsRow}>
            {item.freeDelivery && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>Free Delivery</Text>
              </View>
            )}
            <View style={[styles.tag, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="checkmark-circle" size={12} color={colors.success} />
              <Text style={[styles.tagText, { color: colors.success }]}>Open</Text>
            </View>
          </View>
        </View>
      </Card>
    </Animated.View>
  ), [handleRestaurantPress]);

  return (
    <View style={styles.container}>
      {/* Premium Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Discover</Text>
          <Text style={styles.headerSubtitle}>Find your favorite restaurants</Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Modern Search Bar */}
      <Animated.View entering={FadeInDown.delay(100)} style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search restaurants, cuisines..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* Cuisine Filter Pills */}
      <Animated.View entering={FadeInRight.delay(200)}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.cuisineScroll}
          contentContainerStyle={styles.cuisineContent}
        >
          {cuisines.map((cuisine, index) => (
            <TouchableOpacity
              key={cuisine.id}
              style={[
                styles.cuisinePill,
                selectedCuisine === cuisine.id && { backgroundColor: cuisine.color },
              ]}
              onPress={() => setSelectedCuisine(cuisine.id)}
            >
              <Ionicons
                name={cuisine.icon}
                size={16}
                color={selectedCuisine === cuisine.id ? colors.white : cuisine.color}
              />
              <Text style={[
                styles.cuisineLabel,
                selectedCuisine === cuisine.id && { color: colors.white }
              ]}>
                {cuisine.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        {sortOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.sortChip,
              sortBy === option.id && styles.sortChipActive,
            ]}
            onPress={() => setSortBy(option.id)}
          >
            <Ionicons
              name={option.icon}
              size={14}
              color={sortBy === option.id ? colors.white : colors.textSecondary}
            />
            <Text style={[
              styles.sortLabel,
              sortBy === option.id && { color: colors.white }
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Restaurant List */}
      <FlatList
        data={filteredRestaurants}
        keyExtractor={item => item.id}
        renderItem={renderRestaurantCard}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={64} color={colors.textLight} />
            <Text style={styles.emptyTitle}>No restaurants found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your search or filters</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.light50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchWrapper: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light50,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: spacing.xs,
  },
  cuisineScroll: {
    backgroundColor: colors.white,
    paddingBottom: spacing.md,
  },
  cuisineContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  cuisinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    backgroundColor: colors.light50,
    gap: 6,
  },
  cuisineLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: colors.light50,
    gap: 4,
  },
  sortChipActive: {
    backgroundColor: colors.primary,
  },
  sortLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: 100,
  },
  restaurantCard: {
    padding: 0,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 160,
    position: 'relative',
  },
  restaurantImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  ratingText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  timeBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  timeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  infoContainer: {
    padding: spacing.md,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  cuisineText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
});

export default RestaurantListScreen;
