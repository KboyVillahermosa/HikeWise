import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Card, Title, Paragraph, Chip, IconButton, Button, Dialog, Portal, Modal, Surface } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import StarRating from './StarRating';
import { updateTrailRating } from '../firebase/firestoreService';

const TrailCard = ({ trail, onPress, currentUser, refreshTrails }) => {
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const showRatingModal = () => setRatingModalVisible(true);
  const hideRatingModal = () => setRatingModalVisible(false);

  const handleRatingPress = (rating) => {
    setUserRating(rating);
  };

  const submitRating = async () => {
    if (userRating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting');
      return;
    }

    if (!currentUser) {
      Alert.alert('Login Required', 'You need to be logged in to rate trails');
      hideRatingModal();
      return;
    }

    try {
      setSubmitting(true);
      await updateTrailRating(trail.id, userRating, currentUser.uid);
      Alert.alert('Success', 'Your rating has been submitted!');
      hideRatingModal();
      // Refresh trails data to update the average rating
      if (refreshTrails) refreshTrails();
    } catch (error) {
      console.error('Error submitting rating:', error);
      Alert.alert('Error', 'Failed to submit your rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Card style={styles.card} onPress={onPress}>
        {/* Trail Image */}
        <Card.Cover 
          source={{ uri: trail.imageUrl || 'https://via.placeholder.com/400x200?text=No+Image' }} 
          style={styles.image}
        />
        
        {/* Rate Button Overlay */}
        <TouchableOpacity 
          style={styles.rateButtonContainer}
          onPress={showRatingModal}
        >
          <View style={styles.rateButton}>
            <Ionicons name="star" size={16} color="#fff" />
            <Text style={styles.rateButtonText}>Rate</Text>
          </View>
        </TouchableOpacity>

        <Card.Content style={styles.content}>
          {/* Title and Location */}
          <Title style={styles.title} numberOfLines={1}>{trail.name}</Title>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color="#666" />
            <Text style={styles.location}>{trail.location}</Text>
          </View>
          
          {/* Rating */}
          <View style={styles.ratingRow}>
            <StarRating rating={trail.averageRating || 0} size={18} />
            <Text style={styles.ratingText}>
              {trail.averageRating ? trail.averageRating.toFixed(1) : 'No ratings'} 
              {trail.ratingCount ? ` (${trail.ratingCount})` : ''}
            </Text>
          </View>
          
          {/* Description */}
          <Paragraph style={styles.description} numberOfLines={2}>
            {trail.description}
          </Paragraph>
          
          {/* Details Row */}
          <View style={styles.detailsRow}>
            {/* Difficulty Chip */}
            <Chip 
              mode="outlined"
              style={[
                styles.difficultyChip,
                trail.difficulty.toLowerCase() === 'easy' ? styles.easyChip :
                trail.difficulty.toLowerCase() === 'moderate' ? styles.moderateChip :
                styles.difficultChip
              ]}
              textStyle={[
                styles.chipText,
                trail.difficulty.toLowerCase() === 'easy' ? styles.easyText :
                trail.difficulty.toLowerCase() === 'moderate' ? styles.moderateText :
                styles.difficultText
              ]}
            >
              {trail.difficulty}
            </Chip>
            
            {/* Distance */}
            {trail.distance && (
              <View style={styles.metaInfoItem}>
                <Ionicons name="map-outline" size={16} color="#666" />
                <Text style={styles.metaInfoText}>{trail.distance} km</Text>
              </View>
            )}
            
            {/* Duration */}
            {trail.estimatedTime && (
              <View style={styles.metaInfoItem}>
                <Ionicons name="time-outline" size={16} color="#666" />
                <Text style={styles.metaInfoText}>{trail.estimatedTime}</Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Rating Modal */}
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
              source={{ uri: trail.imageUrl || 'https://via.placeholder.com/400x200?text=No+Image' }}
              style={styles.ratingModalImage}
              resizeMode="cover"
            />
            
            <Text style={styles.ratingModalTrailName}>{trail.name}</Text>
            <Text style={styles.ratingModalInstructions}>Tap a star to rate</Text>
            
            <View style={styles.ratingStarsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleRatingPress(star)}
                  style={styles.ratingStarButton}
                >
                  <Ionicons
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
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  image: {
    height: 180,
  },
  rateButtonContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  rateButtonText: {
    color: '#fff',
    marginLeft: 4,
    fontWeight: '600',
    fontSize: 12,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  difficultyChip: {
    marginRight: 12,
    height: 28,
  },
  easyChip: {
    backgroundColor: '#e6f7ee',
    borderColor: '#38a169',
  },
  moderateChip: {
    backgroundColor: '#fff6e6',
    borderColor: '#dd6b20',
  },
  difficultChip: {
    backgroundColor: '#ffe6e6',
    borderColor: '#e53e3e',
  },
  chipText: {
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
  metaInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  metaInfoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  // Rating Modal Styles
  modalContainer: {
    padding: 20,
    margin: 20,
  },
  ratingModalContent: {
    padding: 20,
    borderRadius: 12,
    elevation: 5,
    backgroundColor: 'white',
  },
  closeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 1,
  },
  ratingModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  ratingModalImage: {
    height: 150,
    borderRadius: 8,
    marginBottom: 16,
  },
  ratingModalTrailName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  ratingModalInstructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  ratingStarsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  ratingStarButton: {
    padding: 4,
  },
  selectedRatingText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  submitButton: {
    marginTop: 8,
  }
});

export default TrailCard;