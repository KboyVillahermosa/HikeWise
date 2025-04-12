import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, Image, 
  StyleSheet, ActivityIndicator, TextInput 
} from 'react-native';
import { getTrails, getTopRatedTrails } from '../firebase/firestoreService';
import { Ionicons } from '@expo/vector-icons';
import StarRating from './StarRating';

const TrailsScreen = ({ navigation, setActiveScreen }) => {
  const [trails, setTrails] = useState([]);
  const [topRatedTrails, setTopRatedTrails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'easy', 'moderate', 'difficult'

  useEffect(() => {
    const fetchTrails = async () => {
      try {
        setLoading(true);
        const allTrails = await getTrails();
        const topTrails = await getTopRatedTrails(3);
        
        setTrails(allTrails);
        setTopRatedTrails(topTrails);
      } catch (error) {
        console.error('Error fetching trails:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrails();
  }, []);

  const filteredTrails = trails.filter(trail => {
    const matchesSearch = trail.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trail.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDifficulty = filter === 'all' || trail.difficulty.toLowerCase() === filter;
    
    return matchesSearch && matchesDifficulty;
  });

  const handleTrailPress = (trail) => {
    // We'll create this screen later
    setActiveScreen('TrailDetail');
    // Pass the trail ID to the detail screen
    // (You'll need to adapt this to your navigation system)
  };

  const renderTrailItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.trailCard}
      onPress={() => handleTrailPress(item)}
    >
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.trailImage} />
      ) : (
        <View style={[styles.trailImage, styles.placeholderImage]}>
          <Ionicons name="image-outline" size={40} color="#c5c5c5" />
        </View>
      )}
      
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
      <Text style={styles.sectionTitle}>Top Rated Trails</Text>
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
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.topRatedImage} />
            ) : (
              <View style={[styles.topRatedImage, styles.placeholderImage]}>
                <Ionicons name="image-outline" size={40} color="#c5c5c5" />
              </View>
            )}
            <Text style={styles.topRatedName}>{item.name}</Text>
            <StarRating rating={item.averageRating || 0} size={14} />
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
        contentContainerStyle={styles.trailsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No trails found. Try a different search.</Text>
        }
      />
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  topRatedSection: {
    marginBottom: 20,
  },
  topRatedCard: {
    width: 160,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  topRatedImage: {
    height: 100,
    width: '100%',
  },
  topRatedName: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 4,
    fontSize: 14,
    fontWeight: 'bold',
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
  placeholderImage: {
    backgroundColor: '#f1f1f1',
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default TrailsScreen;