import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const StarRating = ({ 
  rating = 0, 
  editable = false, 
  onRatingChange, 
  size = 24,
  activeColor = "#FFD700",     // Gold color for selected stars
  inactiveColor = "#D3D3D3",   // Light gray for unselected stars
  hoverColor = "#FFC107",      // Amber color for hover effect
  maxStars = 5
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [animatedValues] = useState(
    Array(maxStars).fill(0).map(() => new Animated.Value(1))
  );
  const [initialAnimation] = useState(new Animated.Value(0));

  // Initial "empty stars" animation when component mounts
  useEffect(() => {
    if (editable) {
      // Subtle pulsing animation to draw attention to the stars
      Animated.sequence([
        Animated.delay(500),
        Animated.timing(initialAnimation, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true
        }),
        Animated.timing(initialAnimation, {
          toValue: 0.95,
          duration: 500,
          useNativeDriver: true
        }),
        Animated.timing(initialAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        })
      ]).start();

      // Subtle movement animation for each star
      animatedValues.forEach((value, index) => {
        Animated.sequence([
          Animated.delay(300 + (index * 100)),
          Animated.spring(value, {
            toValue: 1.2,
            friction: 3,
            tension: 40,
            useNativeDriver: true
          }),
          Animated.spring(value, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true
          })
        ]).start();
      });
    }
  }, []);

  // Interactive animation for hover/touch effect
  const animateStar = (index, toValue) => {
    Animated.spring(animatedValues[index], {
      toValue,
      friction: 3,
      tension: 40,
      useNativeDriver: true
    }).start();
  };

  // Handle when user's finger/cursor moves over a star
  const handleStarHover = (hoveredRating) => {
    if (!editable) return;
    
    setHoverRating(hoveredRating);
    
    // Animate stars based on hover state
    animatedValues.forEach((_, index) => {
      if (index < hoveredRating) {
        animateStar(index, 1.2); // Enlarge hovered stars
      } else {
        animateStar(index, 1); // Reset non-hovered stars
      }
    });
  };

  // Handle when user selects a star
  const handleStarPress = (selectedRating) => {
    if (!editable) return;
    
    // If user clicks on the currently selected rating, clear it
    const newRating = selectedRating === rating ? 0 : selectedRating;
    
    // Set the new rating
    onRatingChange(newRating);
    
    // Celebrate with animation for selected stars
    for (let i = 0; i < selectedRating; i++) {
      Animated.sequence([
        Animated.timing(animatedValues[i], {
          toValue: 1.5,  // Big expansion
          duration: 150,
          useNativeDriver: true
        }),
        Animated.timing(animatedValues[i], {
          toValue: 1,
          duration: 150,
          useNativeDriver: true
        })
      ]).start();
    }
  };

  // Determine star color based on state
  const getStarColor = (index) => {
    if (editable && hoverRating > 0) {
      // When hovering
      return index < hoverRating ? hoverColor : inactiveColor;
    } else {
      // Normal state
      return index < rating ? activeColor : inactiveColor;
    }
  };

  // Clear hover state when touch ends
  const handleTouchEnd = () => {
    if (!editable) return;
    setHoverRating(0);
    
    // Reset star sizes
    animatedValues.forEach((_, index) => {
      const targetScale = index < rating ? 1.1 : 1; // Keep selected stars slightly larger
      animateStar(index, targetScale);
    });
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        editable && { opacity: initialAnimation }
      ]}
    >
      {[...Array(maxStars)].map((_, index) => {
        const starIndex = index + 1;
        const isFilled = index < Math.floor(rating);
        const isHalfFilled = index === Math.floor(rating) && rating % 1 > 0;
        
        return (
          <TouchableOpacity
            key={index}
            activeOpacity={editable ? 0.7 : 1}
            onPress={() => handleStarPress(starIndex)}
            onPressIn={() => handleStarHover(starIndex)}
            onPressOut={handleTouchEnd}
            style={styles.starContainer}
            disabled={!editable}
          >
            <Animated.View
              style={{
                transform: [{ scale: animatedValues[index] }]
              }}
            >
              <Ionicons
                name={isFilled ? "star" : isHalfFilled ? "star-half" : "star-outline"}
                size={size}
                color={getStarColor(index)}
                style={[
                  styles.star,
                  editable && styles.editableStar
                ]}
              />
            </Animated.View>
          </TouchableOpacity>
        );
      })}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  starContainer: {
    padding: 6, // Larger touch target
    marginHorizontal: 2, // Space between stars
  },
  star: {
    // Base styling for all stars
  },
  editableStar: {
    // Additional styling for editable stars
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  }
});

export default StarRating;