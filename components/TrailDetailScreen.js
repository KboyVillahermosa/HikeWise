import React, { useState, useEffect } from 'react';
import { 
  View, Text, ScrollView, Image, TouchableOpacity, 
  StyleSheet, Alert, ActivityIndicator, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  getTrailById, rateTrail, getTrailRatings, 
  getUserTrailRating, addToFavorites, removeFromFavorites 
} from '../firebase/firestoreService';
import StarRating from './StarRating';
import { auth } from '../firebase/config';

const TrailDetailScreen = ({ trailId, setActiveScreen }) => {
  const [trail, setTrail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [ratings, setRatings] = useState([]);
  const [showRatingInput, setShowRatingInput] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);
  
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchTrailData = async () => {
      try {
        setLoading(true);
        const trailData = await getTrailById(trailId);
        if (!trailData) {
          Alert.alert('Error', 'Trail not found');
          setActiveScreen('Trails');
          return;
        }
        
        setTrail(trailData);
        
        // Get all ratings for this trail
        const trailRatings = await getTrailRatings(trailId);
        setRatings(trailRatings);
        
        // Get current user's rating if they've rated this trail
        if (currentUser) {
          const userRatingData = await getUserTrailRating(trailId, currentUser.uid);
          if (userRatingData) {
            setUserRating(userRatingData.rating);
            setUserComment(userRatingData.comment || '');
          }
          
          // Check if trail is in user's favorites
          const userDoc = await getUserProfile(currentUser.uid);
          if (userDoc && userDoc.favoriteTrails) {
            setIsFavorite(userDoc.favoriteTrails.includes(trailId));
          }
        }
      } catch (error) {
        console.error('Error fetching trail data:', error);
        Alert.alert('Error', 'Failed to load trail information');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrailData();
  }, [trailId]);

  const handleSubmitRating = async () => {
    if (!currentUser) {
      Alert.alert('Sign In Required', 'Please sign in to rate this trail');
      return;
    }
    
    if (userRating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting');
      return;
    }
    
    try {
      setSubmittingRating(true);
      await rateTrail(trailId, currentUser.uid, userRating, userComment);
      
      // Refresh trail data and ratings after submitting
      const trailData = await getTrailById(trailId);
      setTrail(trailData);
      
      const trailRatings = await getTrailRatings(trailId);
      setRatings(trailRatings);
      
      setShowRatingInput(false);
      Alert.alert('Success', 'Your rating has been submitted!');
    } catch (error) {
      console.error('Error submitting rating:', error);
      Alert.alert('Error', 'Failed to submit your rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  const toggleFavorite = async () => {
    if (!currentUser) {
      Alert.alert('Sign In Required', 'Please sign in to save favorites');
      return;
    }
    
    try {
      setLoadingFavorite(true);
      
      if (isFavorite) {
        await removeFromFavorites(currentUser.uid, trailId);
        setIsFavorite(false);
      } else {
        await addToFavorites(currentUser.uid, trailId);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorites');
    } finally {
      setLoadingFavorite(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3c6e71" />
        <Text>Loading trail information...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => setActiveScreen('Trails')}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      
      {trail.imageUrl ? (
        <Image source={{ uri: trail.imageUrl }} style={styles.headerImage} />
      ) : (
        <View style={[styles.headerImage, styles.placeholderImage]}>
          <Ionicons name="image-outline" size={60} color="#c5c5c5" />
        </View>
      )}
      
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <View style={styles.headerInfo}>
            <Text style={styles.trailName}>{trail.name}</Text>
            <Text style={styles.trailLocation}>{trail.location}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={toggleFavorite}
            disabled={loadingFavorite}
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={28} 
              color={isFavorite ? "#e53e3e" : "#666"} 
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.ratingRow}>
          <StarRating rating={trail.averageRating || 0} size={20} />
          <Text style={styles.ratingText}>
            {trail.averageRating ? trail.averageRating.toFixed(1) : 'No ratings'} 
            {trail.ratingCount ? ` (${trail.ratingCount})` : ''}
          </Text>
        </View>
        
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Ionicons name="trending-up" size={20} color="#3c6e71" />
            <Text style={styles.detailText}>{trail.elevationGain || 0} m gain</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Ionicons name="map" size={20} color="#3c6e71" />
            <Text style={styles.detailText}>{trail.distance || 0} km</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Ionicons name="time" size={20} color="#3c6e71" />
            <Text style={styles.detailText}>{trail.estimatedTime || 'N/A'}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <View style={[
              styles.difficultyBadge, 
              trail.difficulty.toLowerCase() === 'easy' ? styles.easyBadge : 
              trail.difficulty.toLowerCase() === 'moderate' ? styles.moderateBadge : 
              styles.difficultBadge
            ]}>
              <Text style={styles.difficultyText}>{trail.difficulty}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{trail.description}</Text>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <TouchableOpacity 
              style={styles.rateButton}
              onPress={() => setShowRatingInput(!showRatingInput)}
            >
              <Text style={styles.rateButtonText}>
                {userRating > 0 ? 'Edit Rating' : 'Rate This Trail'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {showRatingInput && (
            <View style={styles.ratingInputContainer}>
              <Text style={styles.ratingInputLabel}>Your Rating:</Text>
              <StarRating 
                rating={userRating} 
                editable={true}
                onRatingChange={setUserRating}
                size={32}
              />
              
              <TextInput
                style={styles.commentInput}
                placeholder="Write a comment (optional)"
                value={userComment}
                onChangeText={setUserComment}
                multiline
              />
              
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleSubmitRating}
                disabled={submittingRating}
              >
                <Text style={styles.submitButtonText}>
                  {submittingRating ? 'Submitting...' : 'Submit Rating'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          
          {ratings.length > 0 ? (
            ratings.map(rating => (
              <View key={rating.id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <StarRating rating={rating.rating} size={16} />
                  <Text style={styles.reviewDate}>
                    {rating.timestamp ? new Date(rating.timestamp.toDate()).toLocaleDateString() : 'Recently'}
                  </Text>
                </View>
                {rating.comment ? (
                  <Text style={styles.reviewComment}>{rating.comment}</Text>
                ) : null}
              </View>
            ))
          ) : (
            <Text style={styles.noReviewsText}>Be the first to review this trail!</Text>
          )}
        </View>
      </View>
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
  headerImage: {
    width: '100%',
    height: 250,
  },
  placeholderImage: {
    backgroundColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerInfo: {
    flex: 1,
  },
  trailName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  trailLocation: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  favoriteButton: {
    padding: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  difficultyBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
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
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  rateButton: {
    backgroundColor: '#3c6e71',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  rateButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  ratingInputContainer: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  ratingInputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  commentInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#3c6e71',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  reviewItem: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
  },
  reviewComment: {
    fontSize: 14,
    color: '#333',
  },
  noReviewsText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
  },
});

export default TrailDetailScreen;