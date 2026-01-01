/**
 * Home Screen - Main customer home screen with featured restaurants and search
 */

import React, { useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  RefreshControl,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '@styles/theme';
import Header from '@components/Common/Header';
import { getImageSource } from '@utils/image';
import Loader from '@components/Common/Loader';
import Card from '@components/Common/Card';
import { fetchRestaurants } from '@redux/slices/restaurantSlice';

const { colors, typography, spacing } = theme;

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { restaurants, loading } = useSelector(state => state.restaurant);
  const { user } = useSelector(state => state.auth);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    dispatch(fetchRestaurants());
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRestaurants();
    setRefreshing(false);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    // Implement search functionality
  };

  const handleRestaurantPress = (restaurant) => {
    navigation.navigate('RestaurantDetail', { restaurantId: restaurant.id });
  };



  const renderRestaurantCard = ({ item }) => (
    <Card
      onPress={() => handleRestaurantPress(item)}
      style={styles.restaurantCard}
    >
      {/* Restaurant Image with fallback */}
      <Image
        source={getImageSource(item.bannerUrl || item.logoUrl, 'restaurant')}
        style={styles.restaurantImage}
        resizeMode="cover"
      />
      <View style={styles.cardContent}>
        <Text style={[typography.h4, styles.restaurantName]}>{item.name}</Text>
        <View style={styles.infoRow}>
          <Ionicons name="star" size={16} color={colors.ratingGold} />
          <Text style={[typography.caption, styles.rating]}>
            {item.rating} ({item.ratingCount || 0})
          </Text>
          <Text style={[typography.caption, styles.distance]}>
            {item.distance || '2.5'} km
          </Text>
        </View>
        <Text style={[typography.caption, styles.cuisines]}>
          {Array.isArray(item.cuisineTypes) ? item.cuisineTypes.join(', ') : (item.cuisineTypes || 'Various Cuisines')}
        </Text>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Header
        title={`Hi, ${user?.firstName}!`}
        subtitle="What would you like to eat?"
        rightIcon={<Ionicons name="notifications-outline" size={24} color={colors.text} />}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Search Bar */}
        <Animated.View entering={SlideInUp} style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search restaurants..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </Animated.View>


        {/* Featured Restaurants */}
        <View style={styles.section}>
          <Text style={[typography.h3, styles.sectionTitle]}>
            Featured Restaurants
          </Text>
        </View>

        {loading ? (
          <Loader visible={true} />
        ) : (
          <FlatList
            data={restaurants}
            renderItem={renderRestaurantCard}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.restaurantsList}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.light50,
    marginBottom: spacing.lg,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    marginLeft: spacing.md,
    fontSize: 16,
    color: colors.text,
  },

  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.text,
  },
  restaurantsList: {
    gap: spacing.lg,
  },
  restaurantCard: {
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  restaurantImage: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  restaurantImagePlaceholder: {
    width: '100%',
    height: 140,
    backgroundColor: colors.light50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    gap: spacing.sm,
  },
  restaurantName: {
    color: colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rating: {
    color: colors.textSecondary,
  },
  distance: {
    color: colors.textLight,
    marginLeft: 'auto',
  },
  cuisines: {
    color: colors.textLight,
  },
});

export default HomeScreen;
