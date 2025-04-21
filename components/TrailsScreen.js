import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, Image, 
  StyleSheet, ActivityIndicator, TextInput, Modal,
  ScrollView
} from 'react-native';
import { getLocalTrails, getLocalTopRatedTrails } from '../data/localTrailsData';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import StarRating from './StarRating';
import { Button, Portal, Surface, Title, IconButton, Paragraph, Divider, Chip } from 'react-native-paper';
import BottomNavBar from './BottomNavBar';

const TrailsScreen = ({ navigation, setActiveScreen, setSelectedTrailId }) => {
  const [trails, setTrails] = useState([]);
  const [topRatedTrails, setTopRatedTrails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTrail, setSelectedTrail] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const allTrails = getLocalTrails();
        const topTrails = getLocalTopRatedTrails(5);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setTrails(allTrails);
        setTopRatedTrails(topTrails);
      } catch (error) {
        console.error('Error loading trails:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredTrails = trails.filter(trail => {
    const matchesSearch = trail.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trail.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDifficulty = filter === 'all' || trail.difficulty.toLowerCase() === filter;
    
    return matchesSearch && matchesDifficulty;
  });

  const handleTrailPress = (trail) => {
    setSelectedTrail(trail);
    setDetailModalVisible(true);
  };

  const handleRatePress = (trail) => {
    setSelectedTrail(trail);
    setRatingModalVisible(true);
  };

  const hideDetailModal = () => {
    setDetailModalVisible(false);
  };

  const hideRatingModal = () => {
    setRatingModalVisible(false);
    setUserRating(0);
  };

  const handleRatingPress = (rating) => setUserRating(rating);

  const submitRating = async () => {
    setSubmitting(true);
    try {
      const updatedTrail = {
        ...selectedTrail,
        ratingCount: (selectedTrail.ratingCount || 0) + 1,
        averageRating: (((selectedTrail.averageRating || 0) * (selectedTrail.ratingCount || 0)) + userRating) / 
                      ((selectedTrail.ratingCount || 0) + 1)
      };
      
      const updatedTrails = trails.map(t => t.id === selectedTrail.id ? updatedTrail : t);
      setTrails(updatedTrails);
      
      const newTopRated = getLocalTopRatedTrails(5, updatedTrails);
      setTopRatedTrails(newTopRated);
      
      console.log(`Submitted rating ${userRating} for trail ${selectedTrail.name}`);
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setSubmitting(false);
      hideRatingModal();
    }
  };

  const renderTrailItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.trailCard}
      onPress={() => handleTrailPress(item)}
    >
      <Image source={getImageSource(item)} style={styles.trailImage} />
      
      <View style={styles.trailInfo}>
        <Text style={styles.trailName}>{item.name}</Text>
        <Text style={styles.trailLocation}>{item.location}</Text>
        <View style={styles.ratingRow}>
          <StarRating rating={item.averageRating || 0} size={16} />
          <Text style={styles.ratingText}>
            {item.averageRating ? item.averageRating.toFixed(1) : 'No ratings'} 
            {item.ratingCount ? ` (${item.ratingCount})` : ''}
          </Text>
        </View>
        <View style={styles.trailMeta}>
          <Text style={[
            styles.difficultyBadge, 
            item.difficulty.toLowerCase() === 'easy' ? styles.easyBadge : 
            item.difficulty.toLowerCase() === 'moderate' ? styles.moderateBadge : 
            styles.difficultBadge
          ]}>
            {item.difficulty}
          </Text>
          {item.distance && (
            <Text style={styles.distanceText}>{item.distance} km</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTopRatedSection = () => (
    <View style={styles.topRatedSection}>
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>Most Popular Trails</Text>
        <Chip icon="star" style={styles.featuredChip}>Featured</Chip>
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={topRatedTrails}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.topRatedCard}
            onPress={() => handleTrailPress(item)}
          >
            <Image source={getImageSource(item)} style={styles.topRatedImage} />
            <View style={styles.topRatedOverlay}>
              <Text style={styles.topRatedRank}>
                #{topRatedTrails.findIndex(trail => trail.id === item.id) + 1}
              </Text>
            </View>
            <View style={styles.topRatedContent}>
              <Text style={styles.topRatedName}>{item.name}</Text>
              <View style={styles.topRatedRatingRow}>
                <StarRating rating={item.averageRating || 0} size={14} />
                <Text style={styles.topRatedRatingText}>
                  {item.averageRating ? item.averageRating.toFixed(1) : '-'}
                </Text>
              </View>
              <View style={styles.topRatedMeta}>
                <Text style={[
                  styles.topRatedDifficulty,
                  item.difficulty.toLowerCase() === 'easy' ? styles.easyText : 
                  item.difficulty.toLowerCase() === 'moderate' ? styles.moderateText : 
                  styles.difficultText
                ]}>
                  {item.difficulty}
                </Text>
                <Text style={styles.topRatedDistance}>{item.distance} km</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3c6e71" />
        <Text style={styles.loadingText}>Loading hiking trails...</Text>
      </View>
    );
  }

  const getImageSource = (trail) => {
    if (!trail) return require('../assets/images/icon.png');
    
    // If imageUrl is already a require() result (object from localTrailsData)
    if (typeof trail.imageUrl === 'object' && trail.imageUrl !== null) {
      return trail.imageUrl;
    }
    
    // Use different images based on trail ID or name to ensure variety
    // This creates a deterministic mapping of trails to different images
    if (trail.id) {
      // Use modulo operation to cycle through available images
      const imageIndex = parseInt(trail.id.replace(/[^\d]/g, '')) % 8;
      
      switch(imageIndex) {
        case 0:
          return require('../assets/images/spot1.webp');
        case 1:
          return require('../assets/images/spot2.webp');
        case 2:
          return require('../assets/images/spot2.webp');
        case 3:
          return require('../assets/images/spot2.webp'); 
        case 4:
          return require('../assets/images/spot2.webp');
        case 5:
          return require('../assets/images/spot2.webp');
        case 6: 
          return require('../assets/images/spot2.webp');
        case 7:
          return require('../assets/images/spot2.webp');
        default:
          return require('../assets/images/icon.png');
      }
    }
    
    // Fallback to string path handling
    if (typeof trail.imageUrl === 'string') {
      if (trail.imageUrl.includes('spot1.webp')) {
        return require('../assets/images/spot1.webp');
      } else if (trail.imageUrl.includes('spot2.webp')) {
        return require('../assets/images/spot2.webp');
      } else if (trail.imageUrl.includes('trail')) {
        const trailNum = trail.imageUrl.match(/trail(\d+)/);
        if (trailNum && trailNum[1]) {
          const num = parseInt(trailNum[1]);
          switch(num) {
            case 1:
              return require('../assets/images/spot1.webp');
            case 2:
              return require('../assets/images/spot1.webp');
            case 3:
              return require('../assets/images/spot1.webp');
            case 4:
              return require('../assets/images/spot1.webp');
            case 5:
              return require('../assets/images/spot1.webp');
            case 6:
              return require('../assets/images/spot1.webp');
            default:
              return require('../assets/images/spot1.webp');
          }
        }
      }
    }
    
    // If we can't determine an image, use trail attributes to pick one
    // This helps ensure consistent images for the same trail
    if (trail.difficulty) {
      if (trail.difficulty.toLowerCase() === 'easy') {
        return require('../assets/images/spot2.webp');
      } else if (trail.difficulty.toLowerCase() === 'moderate') {
        return require('../assets/images/spot2.webp');
      } else {
        return require('../assets/images/spot2.webp');
      }
    }
    
    // Final fallback
    return require('../assets/images/icon.png');
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search trails..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'easy' && styles.activeFilter]}
          onPress={() => setFilter('easy')}
        >
          <Text style={[styles.filterText, filter === 'easy' && styles.activeFilterText]}>Easy</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'moderate' && styles.activeFilter]}
          onPress={() => setFilter('moderate')}
        >
          <Text style={[styles.filterText, filter === 'moderate' && styles.activeFilterText]}>Moderate</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'difficult' && styles.activeFilter]}
          onPress={() => setFilter('difficult')}
        >
          <Text style={[styles.filterText, filter === 'difficult' && styles.activeFilterText]}>Difficult</Text>
        </TouchableOpacity>
      </View>
      
      {topRatedTrails.length > 0 && renderTopRatedSection()}
      
      <Text style={styles.sectionTitle}>All Trails</Text>
      <FlatList
        data={filteredTrails}
        keyExtractor={(item) => item.id}
        renderItem={renderTrailItem}
        contentContainerStyle={[styles.trailsList, { paddingBottom: 80 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No trails found. Try a different search.</Text>
        }
      />

      <BottomNavBar activeScreen="Trails" setActiveScreen={setActiveScreen} />

      <Portal>
        <Modal
          visible={detailModalVisible}
          onDismiss={hideDetailModal}
          contentContainerStyle={styles.detailModalContainer}
        >
          {selectedTrail && (
            <Surface style={styles.detailModalContent}>
              <IconButton
                icon="close"
                size={24}
                style={styles.closeButton}
                onPress={hideDetailModal}
              />
              
              <ScrollView showsVerticalScrollIndicator={false}>
                <Image 
                  source={getImageSource(selectedTrail)}
                  style={styles.detailModalImage}
                  resizeMode="cover"
                />
                
                <View style={styles.detailHeaderRow}>
                  <Title style={styles.detailModalTitle}>{selectedTrail.name}</Title>
                  <Button 
                    mode="contained" 
                    onPress={() => {
                      hideDetailModal();
                      handleRatePress(selectedTrail);
                    }}
                    style={styles.rateButton}
                    labelStyle={styles.rateButtonLabel}
                    icon="star"
                  >
                    Rate
                  </Button>
                </View>
                
                <View style={styles.detailLocationRow}>
                  <Ionicons name="location" size={18} color="#666" />
                  <Text style={styles.detailLocation}>{selectedTrail.location}</Text>
                </View>
                
                <View style={styles.ratingStatsRow}>
                  <StarRating rating={selectedTrail.averageRating || 0} size={20} />
                  <Text style={styles.ratingStatsText}>
                    {selectedTrail.averageRating ? selectedTrail.averageRating.toFixed(1) : 'No ratings'} 
                    {selectedTrail.ratingCount ? ` (${selectedTrail.ratingCount} ${selectedTrail.ratingCount === 1 ? 'rating' : 'ratings'})` : ''}
                  </Text>
                </View>
                
                <View style={styles.detailStatsContainer}>
                  <View style={styles.detailStat}>
                    <MaterialCommunityIcons name="arrow-up-bold" size={20} color="#3c6e71" />
                    <Text style={styles.detailStatValue}>{selectedTrail.elevationGain} m</Text>
                    <Text style={styles.detailStatLabel}>Elevation</Text>
                  </View>
                  
                  <View style={styles.detailStatDivider} />
                  
                  <View style={styles.detailStat}>
                    <MaterialCommunityIcons name="map-marker-distance" size={20} color="#3c6e71" />
                    <Text style={styles.detailStatValue}>{selectedTrail.distance} km</Text>
                    <Text style={styles.detailStatLabel}>Distance</Text>
                  </View>
                  
                  <View style={styles.detailStatDivider} />
                  
                  <View style={styles.detailStat}>
                    <MaterialCommunityIcons name="clock-outline" size={20} color="#3c6e71" />
                    <Text style={styles.detailStatValue}>{selectedTrail.estimatedTime}</Text>
                    <Text style={styles.detailStatLabel}>Duration</Text>
                  </View>
                </View>
                
                <View style={styles.difficultyContainer}>
                  <Text style={styles.difficultyLabel}>Difficulty:</Text>
                  <View style={[
                    styles.difficultyBadgeLarge,
                    selectedTrail.difficulty.toLowerCase() === 'easy' ? styles.easyBadge : 
                    selectedTrail.difficulty.toLowerCase() === 'moderate' ? styles.moderateBadge : 
                    styles.difficultBadge
                  ]}>
                    <Text style={[
                      styles.difficultyTextLarge,
                      selectedTrail.difficulty.toLowerCase() === 'easy' ? styles.easyText : 
                      selectedTrail.difficulty.toLowerCase() === 'moderate' ? styles.moderateText : 
                      styles.difficultText
                    ]}>
                      {selectedTrail.difficulty}
                    </Text>
                  </View>
                </View>
                
                <Divider style={styles.divider} />
                
                <Title style={styles.descriptionTitle}>Description</Title>
                <Paragraph style={styles.description}>
                  {selectedTrail.description}
                </Paragraph>
                
                <View style={styles.locationSection}>
                  <Title style={styles.locationTitle}>Location</Title>
                  <View style={styles.locationMapPlaceholder}>
                    <MaterialCommunityIcons name="map" size={40} color="#3c6e71" />
                    <Text style={styles.mapPlaceholderText}>Map View</Text>
                    <Text style={styles.coordinatesText}>
                      Lat: {selectedTrail.coordinates.latitude.toFixed(4)}, 
                      Long: {selectedTrail.coordinates.longitude.toFixed(4)}
                    </Text>
                  </View>
                </View>
                
                <Button 
                  mode="contained" 
                  style={styles.viewRouteButton}
                  icon="map-marker-path"
                >
                  View Full Route
                </Button>
                
                <Button 
                  mode="outlined" 
                  style={styles.startHikeButton}
                  icon="shoe-hiking"
                >
                  Start Hiking
                </Button>
              </ScrollView>
            </Surface>
          )}
        </Modal>
      </Portal>

      <Portal>
        <Modal
          visible={ratingModalVisible}
          onDismiss={hideRatingModal}
          contentContainerStyle={styles.modalContainer}
        >
          <Surface style={styles.ratingModalContent}>
            <IconButton
              icon="close"
              size={24}
              style={styles.closeButton}
              onPress={hideRatingModal}
            />
            
            <Title style={styles.ratingModalTitle}>Rate this Trail</Title>
            <Image 
              source={getImageSource(selectedTrail)}
              style={styles.ratingModalImage}
              resizeMode="cover"
            />
            
            <Text style={styles.ratingModalTrailName}>{selectedTrail?.name}</Text>
            <Text style={styles.ratingModalInstructions}>Tap a star to rate</Text>
            
            <View style={styles.ratingStarsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleRatingPress(star)}
                  style={styles.ratingStarButton}
                >
                  <MaterialCommunityIcons
                    name={userRating >= star ? "star" : "star-outline"}
                    size={36}
                    color={userRating >= star ? "#FFD700" : "#ccc"}
                  />
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.selectedRatingText}>
              {userRating > 0 ? `Your rating: ${userRating}/5` : "Select a rating"}
            </Text>
            
            <Button 
              mode="contained" 
              onPress={submitRating}
              loading={submitting}
              disabled={submitting || userRating === 0}
              style={styles.submitButton}
            >
              Submit Rating
            </Button>
          </Surface>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#e5e5e5',
  },
  activeFilter: {
    backgroundColor: '#3c6e71',
  },
  filterText: {
    color: '#666',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#fff',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  featuredChip: {
    backgroundColor: '#FFF9C4',
  },
  topRatedSection: {
    marginBottom: 20,
  },
  topRatedCard: {
    width: 200,
    height: 220,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  topRatedImage: {
    height: 130,
    width: '100%',
  },
  topRatedOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  topRatedRank: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  topRatedContent: {
    padding: 12,
  },
  topRatedName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333',
  },
  topRatedRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  topRatedRatingText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f39c12',
  },
  topRatedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topRatedDifficulty: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  easyText: {
    color: '#38a169',
  },
  moderateText: {
    color: '#dd6b20',
  },
  difficultText: {
    color: '#e53e3e',
  },
  topRatedDistance: {
    fontSize: 12,
    color: '#666',
  },
  trailsList: {
    paddingBottom: 20,
  },
  trailCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  trailImage: {
    width: 100,
    height: 100,
  },
  trailInfo: {
    flex: 1,
    padding: 12,
  },
  trailName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  trailLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  trailMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
    overflow: 'hidden',
    marginRight: 8,
  },
  easyBadge: {
    backgroundColor: '#c6f6d5',
    color: '#38a169',
  },
  moderateBadge: {
    backgroundColor: '#feebc8',
    color: '#dd6b20',
  },
  difficultBadge: {
    backgroundColor: '#fed7d7',
    color: '#e53e3e',
  },
  distanceText: {
    fontSize: 12,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  
  modalContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 8,
  },
  ratingModalContent: {
    padding: 20,
    alignItems: 'center',
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  ratingModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  ratingModalImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  ratingModalTrailName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  ratingModalInstructions: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  ratingStarsContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  ratingStarButton: {
    marginHorizontal: 5,
  },
  selectedRatingText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  submitButton: {
    marginTop: 10,
  },
  
  detailModalContainer: {
    margin: 0,
    justifyContent: 'flex-end',
    height: '90%',
  },
  detailModalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '100%',
    padding: 0,
  },
  detailModalImage: {
    width: '100%',
    height: 250,
  },
  detailHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  detailModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  rateButton: {
    borderRadius: 20,
    paddingHorizontal: 10,
    backgroundColor: '#FFC107',
  },
  rateButtonLabel: {
    fontSize: 14,
  },
  detailLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  detailLocation: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  ratingStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  ratingStatsText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
  },
  detailStatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
  },
  detailStat: {
    alignItems: 'center',
    flex: 1,
  },
  detailStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 4,
  },
  detailStatLabel: {
    fontSize: 12,
    color: '#666',
  },
  detailStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#ddd',
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  difficultyLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  difficultyBadgeLarge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  difficultyTextLarge: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 16,
    marginHorizontal: 16,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  description: {
    paddingHorizontal: 16,
    lineHeight: 22,
    color: '#333',
    marginBottom: 20,
  },
  locationSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  locationMapPlaceholder: {
    height: 150,
    backgroundColor: '#eee',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  coordinatesText: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
  },
  viewRouteButton: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  startHikeButton: {
    marginHorizontal: 16,
    marginBottom: 30,
    borderRadius: 8,
  }
});

export default TrailsScreen;