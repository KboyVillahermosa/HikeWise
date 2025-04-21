import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Alert, 
  FlatList, 
  ScrollView,
  StatusBar,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
  Image,
  RefreshControl,
  Platform,
  Animated
} from 'react-native';
import { 
  Button, 
  Text,
  ActivityIndicator,
  Divider,
  Chip,
  Surface,
  IconButton,
  useTheme,
  FAB
} from 'react-native-paper';
import { seedTrails } from '../firebase/seedTrails';
import { getTrails } from '../firebase/firestoreService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import local assets for easier management
const ASSETS = {
  hero: require('../assets/images/spot3.webp'),
  logo: require('../assets/images/logo2.png'),
  cebuIcon: require('../assets/images/spot2.webp'),
  aboutImage: require('../assets/images/spot1.webp'),
  spot1: require('../assets/images/spot1.webp'),
  spot2: require('../assets/images/spot2.webp'),
  spot3: require('../assets/images/spot1.webp'),
  spot4: require('../assets/images/spot2.webp'),
  spot5: require('../assets/images/spot1.webp'),
  spot6: require('../assets/images/spot2.webp'),
  spot7: require('../assets/images/spot1.webp'),
  spot8: require('../assets/images/spot2.webp'),
};

// Mapping of trail IDs to specific spot images
const TRAIL_IMAGES = {
  'trail1': ASSETS.spot1,
  'trail2': ASSETS.spot2,
  'trail3': ASSETS.spot3,
  'trail4': ASSETS.spot4,
  'trail5': ASSETS.spot5,
  'trail6': ASSETS.spot6,
  'trail7': ASSETS.spot7,
  'trail8': ASSETS.spot8,
};

// Filter categories
const FILTERS = [
  { id: 'all', name: 'All', icon: 'view-dashboard' },
  { id: 'easy', name: 'Easy', icon: 'flag-outline' },
  { id: 'moderate', name: 'Moderate', icon: 'flag' },
  { id: 'difficult', name: 'Hard', icon: 'flag-checkered' },
  { id: 'rating', name: 'Top Rated', icon: 'star' }
];

const { width } = Dimensions.get('window');

const HomeScreen = ({ setActiveScreen, setSelectedTrailId, setCurrentTrail }) => {
  const theme = useTheme();
  const [trails, setTrails] = useState([]);
  const [filteredTrails, setFilteredTrails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [180, 70],
    extrapolate: 'clamp'
  });
  
  const headerTaglineOpacity = scrollY.interpolate({
    inputRange: [0, 40, 70],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp'
  });

  // Get image for a specific trail
  const getTrailImage = (trail) => {
    if (!trail) return ASSETS.spot1;
    
    if (TRAIL_IMAGES[trail.id]) {
      return TRAIL_IMAGES[trail.id];
    }
    
    if (trail.imageUrl && (trail.imageUrl.startsWith('http://') || trail.imageUrl.startsWith('https://'))) {
      return { uri: trail.imageUrl };
    }
    
    return ASSETS.spot1;
  };

  const fetchTrails = async () => {
    try {
      setLoading(true);
      const allTrails = await getTrails();
      
      if (allTrails.length > 0) {
        // Sort trails by rating (highest first)
        const sortedTrails = [...allTrails].sort((a, b) => 
          (b.averageRating || 0) - (a.averageRating || 0)
        );
        
        setTrails(sortedTrails);
        setFilteredTrails(sortedTrails);
      }
    } catch (error) {
      console.error('Error fetching trails:', error);
      Alert.alert('Error', 'Failed to load hiking trails');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrails();
  }, []);
  
  useEffect(() => {
    // Filter trails based on active filter
    if (activeFilter === 'all') {
      setFilteredTrails(trails);
    } else if (activeFilter === 'rating') {
      setFilteredTrails([...trails].sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0)));
    } else {
      setFilteredTrails(
        trails.filter(trail => 
          trail.difficulty.toLowerCase() === activeFilter.toLowerCase()
        )
      );
    }
  }, [activeFilter, trails]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTrails();
  };

  const handleTrailPress = (trail) => {
    setSelectedTrailId(trail.id);
    setCurrentTrail(trail);
    setActiveScreen('TrailDetail');
  };

  const handleStartHike = (trail) => {
    setCurrentTrail(trail);
    setActiveScreen('Tracking');
  };

  const renderTrailItem = ({ item }) => {
    return (
      <Surface style={styles.trailCard}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => handleTrailPress(item)}
        >
          <Image 
            source={getTrailImage(item)} 
            style={styles.trailCardImage} 
            resizeMode="cover"
          />
          
          <View style={styles.trailCardOverlay} />
          
          <View style={styles.trailImageContent}>
            <View style={styles.badgeRow}>
              <View style={[
                styles.difficultyBadge,
                item.difficulty.toLowerCase() === 'easy' ? styles.easyBadge :
                item.difficulty.toLowerCase() === 'moderate' ? styles.moderateBadge :
                styles.difficultBadge
              ]}>
                <Text style={styles.difficultyText}>{item.difficulty}</Text>
              </View>
              
              <View style={styles.ratingContainer}>
                <MaterialCommunityIcons name="star" size={14} color="#FC5200" />
                <Text style={styles.ratingText}>
                  {item.averageRating ? item.averageRating.toFixed(1) : '0.0'}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.trailCardContent}>
            <Text style={styles.trailName} numberOfLines={1}>{item.name}</Text>
            
            <View style={styles.locationRow}>
              <MaterialCommunityIcons name="map-marker" size={12} color="#666" />
              <Text style={styles.locationText} numberOfLines={1}>{item.location}</Text>
            </View>
            
            <View style={styles.trailMetaRow}>
              <View style={styles.trailMetaItem}>
                <MaterialCommunityIcons name="map-marker-distance" size={12} color="#666" />
                <Text style={styles.trailMetaText}>{item.distance} km</Text>
              </View>
              
              <View style={styles.trailMetaItem}>
                <MaterialCommunityIcons name="arrow-up-bold" size={12} color="#666" />
                <Text style={styles.trailMetaText}>{item.elevationGain} m</Text>
              </View>
              
              <View style={styles.trailMetaItem}>
                <MaterialCommunityIcons name="clock-outline" size={12} color="#666" />
                <Text style={styles.trailMetaText}>{item.estimatedTime}</Text>
              </View>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.detailsButton}
                onPress={() => handleTrailPress(item)}
              >
                <MaterialCommunityIcons name="information-outline" size={14} color="#666" />
                <Text style={styles.detailsButtonText}>Details</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.hikeButton}
                onPress={() => handleStartHike(item)}
              >
                <MaterialCommunityIcons name="hiking" size={14} color="#fff" />
                <Text style={styles.hikeButtonText}>Start Hike</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Surface>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FC5200" />
        <Text style={styles.loadingText}>Loading hiking trails...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#FC5200" />
      
      {/* Animated Header */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <LinearGradient
          colors={['#FC5200', '#FF7E45']}
          style={styles.headerGradient}
        >
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>CEBU HIKEWISE</Text>
            
            <IconButton
              icon="magnify"
              color="#fff"
              size={22}
              style={styles.searchButton}
              onPress={() => Alert.alert('Coming Soon', 'Search functionality coming soon!')}
            />
          </View>
          
          <Animated.View style={[styles.headerTagline, { opacity: headerTaglineOpacity }]}>
            <Text style={styles.taglineText}>Premium Hiking Spots</Text>
          </Animated.View>
        </LinearGradient>
      </Animated.View>
      
      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScrollContent}
        >
          {FILTERS.map(filter => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                activeFilter === filter.id && styles.filterChipActive
              ]}
              onPress={() => setActiveFilter(filter.id)}
            >
              <MaterialCommunityIcons 
                name={filter.icon} 
                size={14} 
                color={activeFilter === filter.id ? "#fff" : "#333"} 
              />
              <Text 
                style={[
                  styles.filterChipText,
                  activeFilter === filter.id && styles.filterChipTextActive
                ]}
              >
                {filter.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* Trail List */}
      <Animated.FlatList
        data={filteredTrails}
        keyExtractor={item => item.id}
        renderItem={renderTrailItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        numColumns={2}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#FC5200"]}
            tintColor="#FC5200"
          />
        }
        ListEmptyComponent={
          <Surface style={styles.emptyStateContainer}>
            <MaterialCommunityIcons name="hiking" size={40} color="#ccc" />
            <Text style={styles.noTrailsText}>No trails found</Text>
          </Surface>
        }
      />
      
      {/* FAB for starting a new hike */}
      <FAB
        style={styles.fab}
        icon="hiking"
        color="#fff"
        small
        onPress={() => setActiveScreen('Tracking')}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  // Loading screen
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
  },
  
  // Header styles
  header: {
    width: '100%',
    overflow: 'hidden',
    zIndex: 10,
  },
  headerGradient: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  searchButton: {
    margin: 0,
  },
  headerTagline: {
    marginTop: 12,
  },
  taglineText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  
  // Filters
  filtersContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    zIndex: 5,
  },
  filtersScrollContent: {
    paddingHorizontal: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 30,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#FC5200',
  },
  filterChipText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  
  // Trail List
  listContainer: {
    padding: 8,
    paddingBottom: 70,
  },
  
  // Trail Cards
  trailCard: {
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    backgroundColor: '#fff',
    margin: 8,
    width: (width - 40) / 2, // 2 columns with margin
  },
  trailCardImage: {
    width: '100%',
    height: 120,
  },
  trailCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
    height: 120,
  },
  trailImageContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  easyBadge: {
    backgroundColor: '#C6F6D5',
  },
  moderateBadge: {
    backgroundColor: '#FEEBC8',
  },
  difficultBadge: {
    backgroundColor: '#FED7D7',
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 2,
  },
  trailCardContent: {
    padding: 10,
  },
  trailName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 3,
  },
  trailMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  trailMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 2,
  },
  trailMetaText: {
    fontSize: 10,
    color: '#666',
    marginLeft: 3,
  },
  divider: {
    marginVertical: 8,
    backgroundColor: '#f0f0f0',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  detailsButtonText: {
    fontSize: 10,
    color: '#666',
    marginLeft: 3,
  },
  hikeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FC5200',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  hikeButtonText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '500',
    marginLeft: 3,
  },
  
  // Empty state
  emptyStateContainer: {
    padding: 20,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  noTrailsText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 8,
    fontSize: 14,
  },
  
  // FAB
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#FC5200',
  }
});

export default HomeScreen;