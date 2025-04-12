import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import StarRating from './StarRating';

const TrailCard = ({ trail, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Trail Image */}
      {trail.imageUrl ? (
        <Image 
          source={{ uri: trail.imageUrl }} 
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.image, styles.noImage]}>
          <Text style={styles.noImageText}>No Image</Text>
        </View>
      )}

      {/* Trail Info Container */}
      <View style={styles.infoContainer}>
        {/* Title and Location */}
        <View style={styles.headerContainer}>
          <Text style={styles.title} numberOfLines={1}>{trail.name}</Text>
          <Text style={styles.location}>{trail.location}</Text>
        </View>

        {/* Rating */}
        <View style={styles.ratingRow}>
          <StarRating rating={trail.averageRating || 0} size={16} />
          <Text style={styles.ratingText}>
            {trail.averageRating ? trail.averageRating.toFixed(1) : 'No ratings'} 
            {trail.ratingCount ? ` (${trail.ratingCount})` : ''}
          </Text>
        </View>

        {/* Description */}
        <Text style={styles.description} numberOfLines={2}>
          {trail.description}
        </Text>

        {/* Details Row */}
        <View style={styles.detailsRow}>
          {/* Difficulty Badge */}
          <View style={[
            styles.badge,
            trail.difficulty.toLowerCase() === 'easy' ? styles.easyBadge :
            trail.difficulty.toLowerCase() === 'moderate' ? styles.moderateBadge :
            styles.difficultBadge
          ]}>
            <Text style={[
              styles.badgeText,
              trail.difficulty.toLowerCase() === 'easy' ? styles.easyText :
              trail.difficulty.toLowerCase() === 'moderate' ? styles.moderateText :
              styles.difficultText
            ]}>
              {trail.difficulty}
            </Text>
          </View>

          {/* Distance */}
          {trail.distance && (
            <View style={styles.distanceContainer}>
              <Text style={styles.distance}>{trail.distance} km</Text>
            </View>
          )}

          {/* Duration */}
          {trail.estimatedTime && (
            <View style={styles.timeContainer}>
              <Text style={styles.time}>{trail.estimatedTime}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#f5f5f5',
  },
  noImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: '#999',
    fontSize: 16,
  },
  infoContainer: {
    padding: 16,
  },
  headerContainer: {
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#666',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#666',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#444',
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginRight: 10,
  },
  easyBadge: {
    backgroundColor: '#e6f7ee',
  },
  moderateBadge: {
    backgroundColor: '#fff6e6',
  },
  difficultBadge: {
    backgroundColor: '#ffe6e6',
  },
  badgeText: {
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
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  distance: {
    fontSize: 12,
    color: '#666',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: 12,
    color: '#666',
  },
});

export default TrailCard;