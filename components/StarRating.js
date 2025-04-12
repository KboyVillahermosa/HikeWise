import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const StarRating = ({ rating, maxRating = 5, size = 24 }) => {
  // Convert rating to nearest half star
  const roundedRating = Math.round(rating * 2) / 2;
  
  const renderStars = () => {
    const stars = [];
    
    for (let i = 1; i <= maxRating; i++) {
      let iconName = 'star-outline';
      
      if (roundedRating >= i) {
        iconName = 'star';
      } else if (roundedRating === i - 0.5) {
        iconName = 'star-half';
      }
      
      stars.push(
        <Ionicons 
          key={`star-${i}`}
          name={iconName} 
          size={size} 
          color="#FFD700" 
          style={styles.star} 
        />
      );
    }
    
    return stars;
  };
  
  return (
    <View style={styles.container}>
      {renderStars()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 2,
  },
});

export default StarRating;