import React, { useState, useEffect } from 'react';
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
  Platform
} from 'react-native';
import { 
  Button, 
  Card, 
  Title, 
  Paragraph, 
  ActivityIndicator,
  Divider,
  Text,
  Chip,
  Avatar,
  Surface,
  Caption,
  Subheading,
  IconButton,
  useTheme,
  FAB
} from 'react-native-paper';
import { seedTrails } from '../firebase/seedTrails';
import { getTrails } from '../firebase/firestoreService';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import local assets for easier management
const ASSETS = {
  // Hero and general images
  hero: require('../assets/images/spot3.webp'),
  logo: require('../assets/images/logo2.png'),
  cebuIcon: require('../assets/images/spot2.webp'),
  aboutImage: require('../assets/images/spot1.webp'),
  
  // Individual spot images - replace with your actual images
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

// Cebu hiking facts
const CEBU_FACTS = [
  "Cebu's Osmeña Peak is the highest point on the island, standing at 1,013 meters",
  "Casino Peak offers 360-degree views of Cebu's southern mountains and sea",
  "The Badian mountain range is home to the famous Kawasan Falls",
  "Mt. Naupa's summit provides spectacular sunrise and sunset views",
  "Cebu has over 30 accessible hiking trails for all experience levels",
  "Cebu's mountain trails pass through diverse ecosystems rich in local wildlife"
];

// Featured categories with improved names
const CATEGORIES = [
  { id: 'popular', name: 'Top Rated', icon: 'star' },
  { id: 'easy', name: 'Beginner-Friendly', icon: 'flag-outline' },
  { id: 'scenic', name: 'Scenic Views', icon: 'image-filter-hdr' },
  { id: 'waterfalls', name: 'Waterfall Trails', icon: 'water' },
  { id: 'advanced', name: 'Advanced', icon: 'terrain' },
];

const { width } = Dimensions.get('window');

const HomeScreen = ({ setActiveScreen, setSelectedTrailId, currentUser }) => {
  const theme = useTheme();
  const [trails, setTrails] = useState([]);
  const [featuredTrails, setFeaturedTrails] = useState({});
  const [spotlightTrail, setSpotlightTrail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFact, setActiveFact] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('popular');

  // Mock data presented in a professional way
  const activityStats = {
    trailsExplored: 17,
    totalDistance: 128.5,
    totalElevation: 5240,
    lastActivity: '2 days ago'
  };

  // Cycle through Cebu facts
  useEffect(() => {
    const factInterval = setInterval(() => {
      setActiveFact((prev) => (prev + 1) % CEBU_FACTS.length);
    }, 7000); // Slightly slower rotation for better readability
    
    return () => clearInterval(factInterval);
  }, []);

  // Get image for a specific trail with improved logic
  const getTrailImage = (trail) => {
    if (!trail) return ASSETS.spot1;
    
    // First check if we have a mapping for this trail
    if (TRAIL_IMAGES[trail.id]) {
      return TRAIL_IMAGES[trail.id];
    }
    
    // If it's a remote URL
    if (trail.imageUrl && (trail.imageUrl.startsWith('http://') || trail.imageUrl.startsWith('https://'))) {
      return { uri: trail.imageUrl };
    }
    
    // Deterministic image selection based on trail ID
    if (trail.id) {
      const imageIndex = parseInt(trail.id.replace(/[^\d]/g, '')) % 8;
      const spotKeys = Object.keys(ASSETS).filter(key => key.startsWith('spot'));
      return ASSETS[spotKeys[imageIndex % spotKeys.length] || 'spot1'];
    }
    
    // Fallback
    return ASSETS.spot1;
  };

  const fetchTrails = async () => {
    try {
      setLoading(true);
      const allTrails = await getTrails();
      
      if (allTrails.length > 0) {
        setTrails(allTrails);
        
        // Select a spotlight trail - choose the highest rated one
        const sortedByRating = [...allTrails].sort((a, b) => 
          (b.averageRating || 0) - (a.averageRating || 0)
        );
        setSpotlightTrail(sortedByRating[0]);
        
        // Get trails for different categories with improved logic
        const popular = sortedByRating.slice(0, 6);
        
        const easy = allTrails
          .filter(trail => trail.difficulty.toLowerCase() === 'easy')
          .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
          .slice(0, 6);
        
        const scenic = allTrails
          .filter(trail => trail.description && (
            trail.description.toLowerCase().includes('view') || 
            trail.description.toLowerCase().includes('scenic') ||
            trail.description.toLowerCase().includes('panorama')
          ))
          .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
          .slice(0, 6);
        
        const waterfalls = allTrails
          .filter(trail => trail.description && (
            trail.description.toLowerCase().includes('waterfall') ||
            trail.description.toLowerCase().includes('falls') ||
            trail.description.toLowerCase().includes('cascade')
          ))
          .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
          .slice(0, 6);
          
        const advanced = allTrails
          .filter(trail => trail.difficulty.toLowerCase() === 'difficult')
          .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
          .slice(0, 6);

        setFeaturedTrails({
          popular,
          easy,
          scenic, 
          waterfalls,
          advanced
        });
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

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTrails();
  };

  const handleTrailPress = (trailId) => {
    setSelectedTrailId(trailId);
    setActiveScreen('TrailDetail');
  };

  const handleSeedTrails = async () => {
    try {
      await seedTrails();
      Alert.alert('Success', 'Trail data added successfully!');
      fetchTrails();
    } catch (error) {
      console.error('Error seeding trails:', error);
      Alert.alert('Error', 'Failed to add trail data');
    }
  };

  const renderTrailCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.trailCard} 
      onPress={() => handleTrailPress(item.id)}
      activeOpacity={0.8}
    >
      <Image 
        source={getTrailImage(item)} 
        style={styles.trailCardImage} 
        resizeMode="cover"
      />
      
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.trailCardOverlay}
      >
        <View style={styles.trailCardHeader}>
          <Chip 
            style={[
              styles.difficultyChip,
              item.difficulty.toLowerCase() === 'easy' ? styles.easyChip : 
              item.difficulty.toLowerCase() === 'moderate' ? styles.moderateChip : 
              styles.difficultChip
            ]}
            textStyle={styles.difficultyChipText}
          >
            {item.difficulty}
          </Chip>
          
          {item.averageRating ? (
            <View style={styles.ratingBadge}>
              <MaterialCommunityIcons name="star" size={12} color="#FFD700" />
              <Text style={styles.ratingText}>{item.averageRating.toFixed(1)}</Text>
            </View>
          ) : null}
        </View>
        
        <View style={styles.trailCardContent}>
          <Text style={styles.trailCardName} numberOfLines={1}>{item.name}</Text>
          
          <View style={styles.trailCardDetails}>
            <View style={styles.trailCardDetailItem}>
              <MaterialCommunityIcons name="map-marker" size={14} color="#fff" />
              <Text style={styles.trailCardDetailText} numberOfLines={1}>{item.location}</Text>
            </View>
            
            <View style={styles.trailCardDetailRow}>
              <View style={styles.trailCardDetailItem}>
                <MaterialCommunityIcons name="map-marker-distance" size={14} color="#fff" />
                <Text style={styles.trailCardDetailText}>{item.distance} km</Text>
              </View>
              
              <View style={styles.trailCardDetailItem}>
                <MaterialCommunityIcons name="clock-outline" size={14} color="#fff" />
                <Text style={styles.trailCardDetailText}>{item.estimatedTime}</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Image source={ASSETS.logo} style={styles.loadingLogo} />
        <ActivityIndicator size="large" color="#FC5200" />
        <Text style={styles.loadingText}>Loading Cebu's Premium Hiking Trails...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTitleContainer}>
            <Image source={ASSETS.logo} style={styles.headerLogo} />
            <View style={styles.titleGroup}>
              <Title style={styles.headerTitle}>CEBU TRAILS</Title>
              <Text style={styles.headerTagline}>Explore the Highlands of Queen City of the South</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <IconButton 
              icon="magnify" 
              size={24} 
              color="#555"
              onPress={() => setActiveScreen('Trails')}
            />
            <IconButton 
              icon="bell-outline" 
              size={24} 
              color="#555"
              onPress={() => Alert.alert('Notifications', 'No new notifications')}
            />
          </View>
        </View>
      </View>
      
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#FC5200"]}
            tintColor="#FC5200"
          />
        }
      >
        {/* Activity Stats Section (Professional Strava-inspired) */}
        <Surface style={styles.activityStatsCard}>
          <View style={styles.activityStatsHeader}>
            <View style={styles.activityStatsHeaderLeft}>
              <MaterialCommunityIcons name="chart-timeline-variant" size={20} color="#FC5200" />
              <Text style={styles.activityStatsTitle}>Personal Stats</Text>
            </View>
            <IconButton 
              icon="dots-horizontal" 
              size={20} 
              color="#777"
              onPress={() => {}}
            />
          </View>
          
          <Divider style={styles.statsDivider} />
          
          <View style={styles.activityStatsGrid}>
            <View style={styles.activityStatItem}>
              <Text style={styles.activityStatValue}>{activityStats.trailsExplored}</Text>
              <Text style={styles.activityStatLabel}>Trails</Text>
            </View>
            
            <View style={styles.activityStatItem}>
              <Text style={styles.activityStatValue}>{activityStats.totalDistance}</Text>
              <Text style={styles.activityStatLabel}>km Hiked</Text>
            </View>
            
            <View style={styles.activityStatItem}>
              <Text style={styles.activityStatValue}>{activityStats.totalElevation}</Text>
              <Text style={styles.activityStatLabel}>m Climbed</Text>
            </View>
            
            <View style={styles.activityStatItem}>
              <Text style={styles.activityStatValue}>
                {activityStats.lastActivity}
              </Text>
              <Text style={styles.activityStatLabel}>Last Hike</Text>
            </View>
          </View>
          
          <Button 
            mode="contained" 
            style={styles.startHikeButton}
            icon={({size, color}) => (
              <MaterialCommunityIcons name="hiking" size={size} color={color} />
            )}
            onPress={() => {
              // Navigate to tracking screen
              setActiveScreen('Tracking');
            }}
            labelStyle={styles.startHikeButtonLabel}
          >
            START A HIKE
          </Button>
        </Surface>
        
        {/* Today's Featured Trail */}
        {spotlightTrail && (
          <View style={styles.highlightSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <MaterialCommunityIcons name="fire" size={22} color="#FC5200" />
                <Text style={styles.sectionTitle}>Featured Trail</Text>
              </View>
              <Chip icon="crown" style={styles.featuredChip}>Trending</Chip>
            </View>
            
            <Card style={styles.highlightCard} onPress={() => handleTrailPress(spotlightTrail.id)}>
              <ImageBackground 
                source={getTrailImage(spotlightTrail)} 
                style={styles.highlightImage}
              >
                <LinearGradient 
                  colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)']}
                  style={styles.highlightGradient}
                >
                  <View style={styles.highlightContent}>
                    <View style={styles.highlightTitleRow}>
                      <Title style={styles.highlightTitle}>{spotlightTrail.name}</Title>
                      <View style={styles.highlightRating}>
                        <MaterialCommunityIcons name="star" size={18} color="#FFD700" />
                        <Text style={styles.highlightRatingText}>
                          {spotlightTrail.averageRating ? 
                            spotlightTrail.averageRating.toFixed(1) : '4.5'}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.highlightDetails}>
                      <View style={styles.highlightDetailItem}>
                        <MaterialCommunityIcons name="map-marker" size={16} color="#fff" />
                        <Text style={styles.highlightDetailText}>{spotlightTrail.location}</Text>
                      </View>
                      
                      <View style={styles.highlightMetricsRow}>
                        <View style={styles.highlightMetricItem}>
                          <MaterialCommunityIcons name="map-marker-distance" size={16} color="#fff" />
                          <Text style={styles.highlightMetricText}>{spotlightTrail.distance} km</Text>
                        </View>
                        
                        <View style={styles.highlightMetricItem}>
                          <MaterialCommunityIcons name="arrow-up-bold" size={16} color="#fff" />
                          <Text style={styles.highlightMetricText}>{spotlightTrail.elevationGain} m</Text>
                        </View>
                        
                        <View style={styles.highlightMetricItem}>
                          <MaterialCommunityIcons name="clock-outline" size={16} color="#fff" />
                          <Text style={styles.highlightMetricText}>{spotlightTrail.estimatedTime}</Text>
                        </View>
                        
                        <View style={[
                          styles.difficultyBadge,
                          spotlightTrail.difficulty.toLowerCase() === 'easy' ? styles.easyBadge : 
                          spotlightTrail.difficulty.toLowerCase() === 'moderate' ? styles.moderateBadge : 
                          styles.difficultBadge
                        ]}>
                          <Text style={styles.difficultyText}>{spotlightTrail.difficulty}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              </ImageBackground>
            </Card>
          </View>
        )}
        
        {/* Categories Tabs */}
        <View style={styles.categoriesContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScrollContent}
          >
            {CATEGORIES.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryTab,
                  selectedCategory === category.id && styles.categoryTabActive
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <MaterialCommunityIcons 
                  name={category.icon} 
                  size={18} 
                  color={selectedCategory === category.id ? "#FC5200" : "#666"} 
                />
                <Text 
                  style={[
                    styles.categoryTabText,
                    selectedCategory === category.id && styles.categoryTabTextActive
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Featured Trails Grid */}
        <View style={styles.featuredTrailsSection}>
          <View style={styles.featuredTrailsHeader}>
            <View style={styles.featuredHeaderLeft}>
              <MaterialCommunityIcons 
                name={CATEGORIES.find(c => c.id === selectedCategory)?.icon || 'star'} 
                size={20} 
                color="#333" 
                style={styles.featuredHeaderIcon}
              />
              <Text style={styles.featuredTrailsTitle}>
                {CATEGORIES.find(c => c.id === selectedCategory)?.name}
              </Text>
            </View>
            <Button 
              mode="text" 
              onPress={() => setActiveScreen('Trails')}
              style={styles.viewAllButton}
              labelStyle={styles.viewAllButtonLabel}
              icon="chevron-right"
            >
              View All
            </Button>
          </View>
          
          <View style={styles.trailCardsContainer}>
            {featuredTrails[selectedCategory] && featuredTrails[selectedCategory].length > 0 ? (
              featuredTrails[selectedCategory].map(trail => (
                <View key={trail.id} style={styles.trailCardWrapper}>
                  {renderTrailCard({item: trail})}
                </View>
              ))
            ) : (
              <Surface style={styles.emptyStateContainer}>
                <MaterialCommunityIcons name="hiking" size={40} color="#ccc" />
                <Text style={styles.noTrailsText}>No trails in this category yet</Text>
                <Text style={styles.noTrailsSubtext}>Check back soon for updates</Text>
              </Surface>
            )}
          </View>
        </View>
        
        {/* Cebu Facts Card */}
        <Surface style={styles.factCard}>
          <View style={styles.factCardHeader}>
            <View style={styles.factHeaderLeft}>
              <MaterialCommunityIcons name="lightbulb-outline" size={22} color="#FC5200" />
              <Text style={styles.factCardTitle}>Did You Know?</Text>
            </View>
            <Chip icon="information-outline" style={styles.factChip}>Facts</Chip>
          </View>
          <Divider style={styles.factDivider} />
          <Text style={styles.factCardText}>{CEBU_FACTS[activeFact]}</Text>
        </Surface>
        
        {/* Admin button - only visible for admin, with improved styling */}
        {currentUser?.isAdmin && (
          <Button 
            mode="outlined" 
            onPress={handleSeedTrails}
            style={styles.adminButton}
            icon="database-plus"
          >
            Initialize Trail Data
          </Button>
        )}
      </ScrollView>
      
      {/* Floating Action Button - Professional Strava-style */}
      <FAB
        style={styles.fab}
        icon="plus"
        color="#fff"
        onPress={() => setActiveScreen('Trails')}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Safety and base styles
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  
  // Header styles - Professional
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingTop: 10,
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  titleGroup: {
    flexDirection: 'column',
  },
  headerLogo: {
    width: 34,
    height: 34,
    marginRight: 10,
    borderRadius: 17,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  headerTagline: {
    fontSize: 12,
    color: '#666',
    letterSpacing: 0.2,
  },
  headerActions: {
    flexDirection: 'row',
  },
  
  // Main container
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingLogo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  
  // Activity Stats - Professional Strava-inspired
  activityStatsCard: {
    margin: 16,
    borderRadius: 14,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  activityStatsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 8,
    paddingTop: 14,
    paddingBottom: 10,
  },
  activityStatsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityStatsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  statsDivider: {
    height: 1.5,
    backgroundColor: '#f0f0f0',
  },
  activityStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  activityStatItem: {
    width: '50%',
    padding: 12,
  },
  activityStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FC5200', // Strava orange
    marginBottom: 4,
  },
  activityStatLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  startHikeButton: {
    margin: 16,
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: '#FC5200', // Strava orange
    paddingVertical: 6,
    elevation: 2,
  },
  startHikeButtonLabel: {
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  
  // Highlight Section - Professional
  highlightSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  featuredChip: {
    backgroundColor: '#FFE0D6', // Light orange
    height: 28,
  },
  highlightCard: {
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  highlightImage: {
    height: 220,
    width: '100%',
  },
  highlightGradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  highlightContent: {
    padding: 16,
  },
  highlightTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  highlightTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  highlightRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  highlightRatingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 4,
  },
  highlightDetails: {
    marginTop: 8,
  },
  highlightDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  highlightDetailText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  highlightMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  highlightMetricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  highlightMetricText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  
  // Categories Tabs - Professional
  categoriesContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  categoriesScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  categoryTabActive: {
    backgroundColor: '#FFF0E8', // Very light orange
    borderColor: '#FC5200', // Strava orange
  },
  categoryTabText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  categoryTabTextActive: {
    color: '#FC5200', // Strava orange
    fontWeight: 'bold',
  },
  
  // Featured Trails Grid - Professional
  featuredTrailsSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  featuredTrailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  featuredHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredHeaderIcon: {
    marginRight: 8,
  },
  featuredTrailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllButton: {
    marginRight: -8,
  },
  viewAllButtonLabel: {
    fontSize: 14,
    color: '#FC5200', // Strava orange
    fontWeight: '500',
  },
  trailCardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  trailCardWrapper: {
    width: '48%',
    marginBottom: 16,
  },
  trailCard: {
    borderRadius: 12,
    overflow: 'hidden',
    height: 180,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  trailCardImage: {
    height: '100%',
    width: '100%',
  },
  trailCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  trailCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  difficultyChip: {
    height: 24,
  },
  easyChip: {
    backgroundColor: 'rgba(198, 246, 213, 0.9)',
  },
  moderateChip: {
    backgroundColor: 'rgba(254, 235, 200, 0.9)',
  },
  difficultChip: {
    backgroundColor: 'rgba(254, 215, 215, 0.9)',
  },
  difficultyChipText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
  },
  ratingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 3,
  },
  trailCardContent: {
    padding: 12,
  },
  trailCardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  trailCardDetails: {},
  trailCardDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  trailCardDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trailCardDetailText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  // Empty state styling
  emptyStateContainer: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  noTrailsText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  noTrailsSubtext: {
    textAlign: 'center',
    color: '#999',
    marginTop: 4,
    fontSize: 14,
  },
  
  // Cebu Facts Card - Professional
  factCard: {
    margin: 16,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#fff',
    marginBottom: 32,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  factCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  factHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  factCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  factChip: {
    backgroundColor: '#E3F2FD',
    height: 28,
  },
  factDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginBottom: 12,
  },
  factCardText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#555',
  },
  
  // Other styles
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  easyBadge: {
    backgroundColor: 'rgba(198, 246, 213, 0.9)',
  },
  moderateBadge: {
    backgroundColor: 'rgba(254, 235, 200, 0.9)',
  },
  difficultBadge: {
    backgroundColor: 'rgba(254, 215, 215, 0.9)',
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  adminButton: {
    marginHorizontal: 16,
    marginBottom: 80,
    borderRadius: 8,
    borderColor: '#FC5200',
    borderWidth: 1.5,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#FC5200', // Strava orange
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  }
});

export default HomeScreen;