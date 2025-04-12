import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  FlatList, 
  Image,
  ImageBackground,
  ScrollView,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { seedTrails } from '../firebase/seedTrails';
import { getTrails } from '../firebase/firestoreService';
import { Ionicons } from '@expo/vector-icons';
import StarRating from './StarRating';
import TrailCard from './TrailCard';

const { width } = Dimensions.get('window');

// Carousel images - replace with your own images if needed
const carouselImages = [
  { 
    id: '1',
    image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/17/f8/61/85/received-2413139085598046.jpg?w=1200&h=1200&s=1',
    title: "Discover Cebu's Peaks"
  },
  { 
    id: '2',
    image: 'https://steemitimages.com/DQmWvrxEyGBCvYrssGAc2AGfgkWJwTvJ9tpvYRQU4Ku1MMo/IMG_20180127_053224.jpg',
    title: "Breathtaking Mountain Views"
  },
  { 
    id: '3',
    image: 'https://i.pinimg.com/originals/7e/a0/73/7ea0731c0041387c0c59f33faeecb225.jpg',
    title: "Adventure Awaits You"
  }
];

const HomeScreen = ({ setActiveScreen, setSelectedTrailId }) => {
  const [featuredTrails, setFeaturedTrails] = useState([]);
  const [spotlightTrail, setSpotlightTrail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const carouselRef = useRef(null);

  useEffect(() => {
    const fetchTrails = async () => {
      try {
        setLoading(true);
        const allTrails = await getTrails();
        
        if (allTrails.length > 0) {
          // Get a random trail for the spotlight section
          const randomIndex = Math.floor(Math.random() * allTrails.length);
          setSpotlightTrail(allTrails[randomIndex]);
          
          // Get up to 4 trails (excluding spotlight) to feature
          const otherTrails = allTrails.filter(trail => 
            trail.id !== allTrails[randomIndex].id
          );
          setFeaturedTrails(otherTrails.slice(0, 4));
        }
      } catch (error) {
        console.error('Error fetching trails:', error);
        Alert.alert('Error', 'Failed to load hiking trails');
      } finally {
        setLoading(false);
      }
    };

    fetchTrails();
    
    // Auto-scroll carousel
    const carouselInterval = setInterval(() => {
      if (carouselRef.current) {
        const nextIndex = (activeCarouselIndex + 1) % carouselImages.length;
        carouselRef.current.scrollToIndex({
          index: nextIndex,
          animated: true
        });
        setActiveCarouselIndex(nextIndex);
      }
    }, 5000);
    
    return () => clearInterval(carouselInterval);
  }, [activeCarouselIndex]);

  const handleSeedTrails = async () => {
    try {
      await seedTrails();
      Alert.alert('Success', 'Trail data added successfully!');
    } catch (error) {
      console.error('Error seeding trails:', error);
      Alert.alert('Error', 'Failed to add trail data');
    }
  };

  const handleTrailPress = (trailId) => {
    setSelectedTrailId(trailId);
    setActiveScreen('TrailDetail');
  };

  const renderTrailItem = ({ item }) => (
    <TrailCard 
      trail={item} 
      onPress={() => handleTrailPress(item.id)} 
    />
  );

  const renderCarouselItem = ({ item, index }) => (
    <View style={styles.carouselItemContainer}>
      <ImageBackground 
        source={{ uri: item.image }}
        style={styles.carouselImage}
      >
        <View style={styles.carouselOverlay}>
          <Text style={styles.carouselTitle}>{item.title}</Text>
          
          {index === 1 && (
            <Text style={styles.carouselTagline}>
              Your guide to the most scenic trails in Cebu
            </Text>
          )}
          
          {index === 0 && (
            <TouchableOpacity 
              style={styles.carouselButton}
              onPress={() => setActiveScreen('Trails')}
            >
              <Text style={styles.carouselButtonText}>Explore Trails</Text>
            </TouchableOpacity>
          )}
          
          {index === 2 && (
            <View style={styles.carouselTags}>
              <View style={styles.carouselTag}>
                <Text style={styles.carouselTagText}>Hiking</Text>
              </View>
              <View style={styles.carouselTag}>
                <Text style={styles.carouselTagText}>Adventure</Text>
              </View>
              <View style={styles.carouselTag}>
                <Text style={styles.carouselTagText}>Nature</Text>
              </View>
            </View>
          )}
        </View>
      </ImageBackground>
    </View>
  );

  const renderCarouselDot = (index) => (
    <View 
      key={index}
      style={[
        styles.carouselDot,
        activeCarouselIndex === index && styles.carouselDotActive
      ]} 
    />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3c6e71" />
        <Text style={styles.loadingText}>Loading hiking trails...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Carousel */}
      <View style={styles.carouselContainer}>
        <FlatList
          ref={carouselRef}
          data={carouselImages}
          renderItem={renderCarouselItem}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.floor(
              event.nativeEvent.contentOffset.x / width
            );
            setActiveCarouselIndex(index);
          }}
        />
        <View style={styles.carouselDotsContainer}>
          {carouselImages.map((_, index) => renderCarouselDot(index))}
        </View>
      </View>
      
      {/* Main tagline under carousel */}
      <View style={styles.taglineContainer}>
        <Text style={styles.tagline}>
          Explore the beautiful mountains and trails of Cebu Island
        </Text>
        <View style={styles.taglineDivider} />
      </View>
      
      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name="flag" size={24} color="#3c6e71" />
          <Text style={styles.statNumber}>{featuredTrails.length + (spotlightTrail ? 1 : 0)}</Text>
          <Text style={styles.statLabel}>Trails</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="map" size={24} color="#3c6e71" />
          <Text style={styles.statNumber}>Cebu</Text>
          <Text style={styles.statLabel}>Location</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="compass" size={24} color="#3c6e71" />
          <Text style={styles.statNumber}>All</Text>
          <Text style={styles.statLabel}>Levels</Text>
        </View>
      </View>

      {/* Spotlight Trail */}
      {spotlightTrail && (
        <View style={styles.spotlightContainer}>
          <Text style={styles.sectionTitle}>Spotlight Trail</Text>
          <TouchableOpacity
            style={styles.spotlightCard}
            onPress={() => handleTrailPress(spotlightTrail.id)}
            activeOpacity={0.9}
          >
            <ImageBackground
              source={{ uri: spotlightTrail.imageUrl }}
              style={styles.spotlightImage}
              imageStyle={{ borderRadius: 16 }}
            >
              <View style={styles.spotlightOverlay}>
                <View style={styles.spotlightContent}>
                  <Text style={styles.spotlightName}>{spotlightTrail.name}</Text>
                  <Text style={styles.spotlightLocation}>{spotlightTrail.location}</Text>
                  <View style={styles.spotlightRating}>
                    <StarRating rating={spotlightTrail.averageRating || 0} size={16} />
                    <Text style={styles.spotlightRatingText}>
                      {spotlightTrail.averageRating ? spotlightTrail.averageRating.toFixed(1) : 'No ratings'}
                    </Text>
                  </View>
                  <View style={[
                    styles.spotlightBadge,
                    spotlightTrail.difficulty.toLowerCase() === 'easy' ? styles.easyBadge :
                    spotlightTrail.difficulty.toLowerCase() === 'moderate' ? styles.moderateBadge :
                    styles.difficultBadge
                  ]}>
                    <Text style={styles.spotlightBadgeText}>{spotlightTrail.difficulty}</Text>
                  </View>
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        </View>
      )}

      {/* Featured Trails */}
      {featuredTrails.length > 0 && (
        <View style={styles.featuredContainer}>
          <Text style={styles.sectionTitle}>Featured Trails</Text>
          <FlatList
            data={featuredTrails}
            renderItem={renderTrailItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.trailsList}
            scrollEnabled={false} // Disable scroll since we're in a ScrollView
          />
        </View>
      )}
      
      {/* View All Button */}
      <TouchableOpacity 
        style={styles.viewAllButton}
        onPress={() => setActiveScreen('Trails')}
      >
        <Text style={styles.viewAllButtonText}>View All Hiking Trails</Text>
        <Ionicons name="arrow-forward" size={18} color="#fff" />
      </TouchableOpacity>
      
      {/* App Description */}
      <View style={styles.aboutContainer}>
        <Text style={styles.aboutTitle}>About Cebu Hiking Spots</Text>
        <Text style={styles.aboutText}>
          Explore the beautiful mountains and trails of Cebu Island with our comprehensive 
          guide to the best hiking spots. Get information on trail difficulty, estimated 
          hiking time, and trail conditions to plan your perfect outdoor adventure.
        </Text>
      </View>
      
      {/* Admin button - hidden for regular users */}
      <TouchableOpacity 
        style={styles.adminButton}
        onPress={handleSeedTrails}
      >
        <Text style={styles.adminButtonText}>Initialize Trail Data</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  // Header Carousel
  carouselContainer: {
    height: 250,
    width: '100%',
  },
  carouselItemContainer: {
    width: width,
    height: 250,
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  carouselOverlay: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 20,
    paddingBottom: 40,
  },
  carouselTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
    marginBottom: 8,
  },
  carouselTagline: {
    fontSize: 16,
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 6,
    marginBottom: 8,
  },
  carouselButton: {
    backgroundColor: '#3c6e71',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  carouselButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  carouselTags: {
    flexDirection: 'row',
  },
  carouselTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
  },
  carouselTagText: {
    color: 'white',
    fontWeight: '600',
  },
  carouselDotsContainer: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: 4,
  },
  carouselDotActive: {
    backgroundColor: 'white',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  // Main Tagline
  taglineContainer: {
    alignItems: 'center',
    marginVertical: 24,
    paddingHorizontal: 20,
  },
  tagline: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3c6e71',
    textAlign: 'center',
    marginBottom: 12,
  },
  taglineDivider: {
    width: 60,
    height: 3,
    backgroundColor: '#3c6e71',
    borderRadius: 2,
  },
  // Stats Section
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  // Spotlight Section
  spotlightContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  spotlightCard: {
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
  },
  spotlightImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  spotlightOverlay: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  spotlightContent: {
    marginBottom: 8,
  },
  spotlightName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  spotlightLocation: {
    fontSize: 14,
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  spotlightRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  spotlightRatingText: {
    marginLeft: 6,
    color: 'white',
    fontSize: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  spotlightBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  easyBadge: {
    backgroundColor: '#c6f6d5',
  },
  moderateBadge: {
    backgroundColor: '#feebc8',
  },
  difficultBadge: {
    backgroundColor: '#fed7d7',
  },
  spotlightBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  // Featured Trails
  featuredContainer: {
    paddingHorizontal: 16,
  },
  trailsList: {
    paddingBottom: 8,
  },
  // View All Button
  viewAllButton: {
    backgroundColor: '#3c6e71',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  viewAllButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  // About Section
  aboutContainer: {
    padding: 16,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
  },
  // Admin Button
  adminButton: {
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 30,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  adminButtonText: {
    color: '#666',
    fontSize: 12,
  },
});

export default HomeScreen;