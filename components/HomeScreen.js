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
  Image
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
  Banner,
  FAB,
  IconButton,
  useTheme
} from 'react-native-paper';
import { seedTrails } from '../firebase/seedTrails';
import { getTrails } from '../firebase/firestoreService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import TrailCard from './TrailCard';

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
// You'll need to update these IDs with your actual trail IDs from Firebase
const TRAIL_IMAGES = {
  '': ASSETS.spot1,
  '../assets/images/spot1.webp': ASSETS.spot2,
  'trail3': ASSETS.spot3,
  'trail4': ASSETS.spot4,
  'trail5': ASSETS.spot5,
  'trail6': ASSETS.spot6,
  'trail7': ASSETS.spot7,
  'trail8': ASSETS.spot8,
  // Add more as needed
};

// Cebu hiking facts
const CEBU_FACTS = [
  "Cebu's mountainous topography provides diverse hiking landscapes",
  "The island's peaks offer panoramic views of nearby islands",
  "Cebu has trails suitable for both beginners and experienced hikers",
  "Many trails feature cultural and historical landmarks",
  "The tropical climate enables year-round hiking possibilities"
];

const { width } = Dimensions.get('window');

const HomeScreen = ({ setActiveScreen, setSelectedTrailId, currentUser }) => {
  const theme = useTheme();
  const [featuredTrails, setFeaturedTrails] = useState([]);
  const [spotlightTrail, setSpotlightTrail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(true);
  const [activeFact, setActiveFact] = useState(0);

  // Cycle through Cebu facts
  useEffect(() => {
    const factInterval = setInterval(() => {
      setActiveFact((prev) => (prev + 1) % CEBU_FACTS.length);
    }, 5000);
    
    return () => clearInterval(factInterval);
  }, []);

  // Get image for a specific trail - use local asset if available, otherwise use trail's imageUrl
  const getTrailImage = (trail) => {
    if (TRAIL_IMAGES[trail.id]) {
      return TRAIL_IMAGES[trail.id];
    }
    
    // If no matching ID, use default image or trail's imageUrl
    return { uri: trail.imageUrl || '../assets/images/spot2.webp' };
  };

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
  }, []);

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

  // Simple Trail Card without rating functionality
  const SimpleTrailCard = ({ trail }) => (
    <Card style={styles.customTrailCard} onPress={() => handleTrailPress(trail.id)}>
      <Image 
        source={getTrailImage(trail)} 
        style={styles.customTrailImage} 
        resizeMode="cover"
      />
      
      <Card.Content style={styles.customTrailContent}>
        <Title style={styles.customTrailTitle} numberOfLines={1}>{trail.name}</Title>
        
        <View style={styles.customTrailInfoRow}>
          <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
          <Text style={styles.customTrailInfoText} numberOfLines={1}>{trail.location}</Text>
        </View>
        
        <View style={styles.customTrailInfoRow}>
          <View 
            style={[
              styles.difficultyBadge,
              trail.difficulty.toLowerCase() === 'easy' ? styles.easyBadge : 
              trail.difficulty.toLowerCase() === 'moderate' ? styles.moderateBadge : 
              styles.difficultBadge
            ]}
          >
            <Text style={styles.difficultyText}>{trail.difficulty}</Text>
          </View>
          
          <View style={styles.trailMetaContainer}>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="map-marker-distance" size={14} color="#666" />
              <Text style={styles.metaText}>{trail.distance} km</Text>
            </View>
            
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="clock-outline" size={14} color="#666" />
              <Text style={styles.metaText}>{trail.estimatedTime}</Text>
            </View>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Image source={ASSETS.logo} style={styles.loadingLogo} />
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading Cebu's hiking destinations...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#2E5F60" />
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Header */}
        <ImageBackground
          source={ASSETS.hero}
          style={styles.heroBackground}
        >
          <View style={styles.heroOverlay}>
            <Image source={ASSETS.logo} style={styles.logoImage} />
            <Title style={styles.heroTitle}>CEBU HIKING TRAILS</Title>
            <Text style={styles.heroSubtitle}>Explore the Queen City's Natural Wonders</Text>
            <Button 
              mode="contained" 
              onPress={() => setActiveScreen('Trails')}
              style={styles.heroButton}
              icon={({size, color}) => (
                <MaterialCommunityIcons name="hiking" size={size} color={color} />
              )}
            >
              DISCOVER TRAILS
            </Button>
          </View>
        </ImageBackground>

        {/* Rotating Facts */}
        <Surface style={styles.factContainer}>
          <View style={styles.factIconContainer}>
            <MaterialCommunityIcons name="information" size={24} color={theme.colors.primary} />
          </View>
          <Text style={styles.factText}>{CEBU_FACTS[activeFact]}</Text>
        </Surface>

        {/* Stats Section */}
        <Surface style={styles.statsContainer}>
          <View style={styles.statsHeader}>
            <Image source={ASSETS.cebuIcon} style={styles.cebuIcon} />
            <View style={styles.statsHeaderText}>
              <Title style={styles.statsTitle}>Cebu Island</Title>
              <Caption style={styles.statsSubtitle}>Hiking Destination</Caption>
            </View>
          </View>
          <Divider style={styles.statsDivider} />
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="pine-tree" size={24} color={theme.colors.primary} />
              <Title style={styles.statNumber}>{featuredTrails.length + (spotlightTrail ? 1 : 0)}</Title>
              <Caption style={styles.statLabel}>Trails</Caption>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="map-marker-radius" size={24} color={theme.colors.primary} />
              <Title style={styles.statNumber}>Central</Title>
              <Caption style={styles.statLabel}>Visayas</Caption>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="terrain" size={24} color={theme.colors.primary} />
              <Title style={styles.statNumber}>1,013m</Title>
              <Caption style={styles.statLabel}>Highest</Caption>
            </View>
          </View>
        </Surface>

        {/* Why Cebu Section */}
        <View style={styles.whyCebuContainer}>
          <View style={styles.sectionHeader}>
            <Title style={styles.sectionTitle}>Why Hike in Cebu?</Title>
            <Divider style={styles.sectionDivider} />
          </View>
          
          <Card style={styles.whyCebuCard}>
            <Card.Cover source={ASSETS.aboutImage} style={styles.whyCebuImage} />
            <Card.Content style={styles.whyCebuContent}>
              <Paragraph style={styles.whyCebuText}>
                Cebu Island offers diverse hiking experiences with its unique limestone cliffs, 
                tropical forests, and stunning mountain ridges. From the famous Osmeña Peak to 
                the challenging trails of Mt. Manunggal, hikers can enjoy breathtaking 
                panoramic views of the surrounding islands and seas.
              </Paragraph>
              <Paragraph style={styles.whyCebuText}>
                The island's rich biodiversity, cultural heritage, and year-round 
                accessibility make it a premier hiking destination in the Philippines.
                Many trails feature natural springs, waterfalls, and historical landmarks.
              </Paragraph>
              <Button 
                mode="outlined" 
                onPress={() => setActiveScreen('About')}
                style={styles.whyCebuButton}
                icon="information-outline"
              >
                Learn More About Cebu
              </Button>
            </Card.Content>
          </Card>
        </View>

        {/* Spotlight Trail - With Custom Local Image */}
        {spotlightTrail && (
          <View style={styles.spotlightContainer}>
            <View style={styles.sectionHeader}>
              <Title style={styles.sectionTitle}>Featured Destination</Title>
              <Divider style={styles.sectionDivider} />
            </View>
            
            <Card style={styles.spotlightCard} onPress={() => handleTrailPress(spotlightTrail.id)}>
              <ImageBackground 
                source={getTrailImage(spotlightTrail)} 
                style={styles.spotlightBackground}
              >
                <View style={styles.spotlightGradient}>
                  <View style={styles.spotlightContent}>
                    <View style={styles.spotlightHeader}>
                      <Title style={styles.spotlightTitle}>{spotlightTrail.name}</Title>
                      <View 
                        style={[
                          styles.difficultyBadge,
                          spotlightTrail.difficulty.toLowerCase() === 'easy' ? styles.easyBadge : 
                          spotlightTrail.difficulty.toLowerCase() === 'moderate' ? styles.moderateBadge : 
                          styles.difficultBadge
                        ]}
                      >
                        <Text style={styles.difficultyText}>{spotlightTrail.difficulty}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.spotlightDetails}>
                      <View style={styles.spotlightDetail}>
                        <MaterialCommunityIcons name="map-marker" size={16} color="#fff" />
                        <Text style={styles.spotlightDetailText}>{spotlightTrail.location}</Text>
                      </View>
                      
                      <View style={styles.spotlightDetail}>
                        <MaterialCommunityIcons name="map-marker-distance" size={16} color="#fff" />
                        <Text style={styles.spotlightDetailText}>{spotlightTrail.distance} km</Text>
                      </View>
                      
                      <View style={styles.spotlightDetail}>
                        <MaterialCommunityIcons name="clock-outline" size={16} color="#fff" />
                        <Text style={styles.spotlightDetailText}>{spotlightTrail.estimatedTime}</Text>
                      </View>
                    </View>
                    
                    <Paragraph style={styles.spotlightDescription} numberOfLines={2}>
                      {spotlightTrail.description}
                    </Paragraph>
                    
                    <Button 
                      mode="contained" 
                      onPress={() => handleTrailPress(spotlightTrail.id)}
                      style={styles.spotlightButton}
                      icon="arrow-right"
                    >
                      Explore This Trail
                    </Button>
                  </View>
                </View>
              </ImageBackground>
            </Card>
          </View>
        )}

        {/* More Trails Section - With Simple Cards */}
        {featuredTrails.length > 0 && (
          <View style={styles.moreTrailsContainer}>
            <View style={styles.sectionHeader}>
              <Title style={styles.sectionTitle}>More Trails to Explore</Title>
              <Button 
                mode="text" 
                onPress={() => setActiveScreen('Trails')}
                icon="chevron-right"
                style={styles.viewAllButton}
              >
                View All
              </Button>
            </View>
            <Divider style={styles.sectionDivider} />
            
            <View style={styles.customTrailsGrid}>
              {featuredTrails.map((trail) => (
                <SimpleTrailCard key={trail.id} trail={trail} />
              ))}
            </View>
          </View>
        )}
        
        {/* Admin button - only visible for admin */}
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
      
      {/* Floating Action Button */}
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="compass"
        label="Explore"
        onPress={() => setActiveScreen('Trails')}
        color="#fff"
      />
    </>
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
    padding: 20,
  },
  loadingLogo: {
    width: 100,
    height: 100,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  // Hero Header
  heroBackground: {
    height: 380,
    width: '100%',
  },
  heroOverlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoImage: {
    width: 80,
    height: 80,
    marginBottom: 16,
    resizeMode: 'contain',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 1,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.9,
  },
  heroButton: {
    paddingHorizontal: 16,
    borderRadius: 30,
    elevation: 8,
  },
  // Fact Container
  factContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: -25,
    padding: 16,
    borderRadius: 8,
    elevation: 4,
    backgroundColor: '#fff',
    minHeight: 80,
  },
  factIconContainer: {
    marginRight: 16,
  },
  factText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#444',
  },
  // Stats Section
  statsContainer: {
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    backgroundColor: '#fff',
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cebuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  statsHeaderText: {
    flex: 1,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statsSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  statsDivider: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    height: 40,
    width: 1,
    backgroundColor: '#e0e0e0',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  // Why Cebu Section
  whyCebuContainer: {
    marginHorizontal: 16,
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionDivider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
    marginLeft: 12,
  },
  whyCebuCard: {
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 3,
  },
  whyCebuImage: {
    height: 180,
  },
  whyCebuContent: {
    padding: 16,
  },
  whyCebuText: {
    marginBottom: 12,
    lineHeight: 22,
  },
  whyCebuButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  // Spotlight Section
  spotlightContainer: {
    marginHorizontal: 16,
    marginTop: 32,
  },
  spotlightCard: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  spotlightBackground: {
    height: 320,
    justifyContent: 'flex-end',
  },
  spotlightGradient: {
    height: '70%',
    justifyContent: 'flex-end',
    paddingBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  spotlightContent: {
    padding: 16,
  },
  spotlightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  spotlightTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
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
  difficultyText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  spotlightDetails: {
    marginBottom: 16,
  },
  spotlightDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  spotlightDetailText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  spotlightDescription: {
    color: '#fff', 
    marginBottom: 16,
    fontSize: 14,
    lineHeight: 20,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  spotlightButton: {
    borderRadius: 30,
  },
  // More Trails Section - With Custom Cards
  moreTrailsContainer: {
    marginHorizontal: 16,
    marginTop: 32,
    marginBottom: 16,
  },
  viewAllButton: {
    marginRight: -8,
  },
  customTrailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  // Custom Trail Card Styles
  customTrailCard: {
    width: '48%', // Almost half width to fit two cards per row with spacing
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
  },
  customTrailImage: {
    width: '100%',
    height: 140,
  },
  customTrailContent: {
    padding: 12,
  },
  customTrailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  customTrailInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  customTrailInfoText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  trailMetaContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    marginLeft: 4,
    fontSize: 11,
    color: '#666',
  },
  // Admin Button
  adminButton: {
    marginHorizontal: 16,
    marginBottom: 80,
    marginTop: 20,
  },
  // FAB
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 28,
  },
});

export default HomeScreen;