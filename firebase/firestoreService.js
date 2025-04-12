import { collection, doc, getDoc, setDoc, updateDoc, getDocs, 
  addDoc, query, where, orderBy, limit as firestoreLimit, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

// User profile functions
export const saveUserProfile = async (userId, userData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, userData, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
};

// Trail functions
export const getTrails = async () => {
  try {
    const trailsCollection = collection(db, 'trails');
    const snapshot = await getDocs(trailsCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting trails:', error);
    throw error;
  }
};

export const getTopRatedTrails = async (limitCount = 5) => {
  try {
    const trailsCollection = collection(db, 'trails');
    const q = query(
      trailsCollection, 
      orderBy('averageRating', 'desc'), 
      firestoreLimit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting top rated trails:', error);
    throw error;
  }
};

export const getTrailById = async (trailId) => {
  try {
    const trailRef = doc(db, 'trails', trailId);
    const snapshot = await getDoc(trailRef);
    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting trail:', error);
    throw error;
  }
};

// Rating functions
export const rateTrail = async (trailId, userId, rating, comment = '') => {
  try {
    // First, add the rating to the ratings collection
    const ratingData = {
      trailId,
      userId,
      rating,
      comment,
      timestamp: serverTimestamp()
    };
    
    // Check if user already rated this trail
    const ratingsCollection = collection(db, 'ratings');
    const q = query(ratingsCollection, 
      where('trailId', '==', trailId), 
      where('userId', '==', userId)
    );
    const existingRatings = await getDocs(q);
    
    // If the user has already rated, update their rating
    if (!existingRatings.empty) {
      const existingRatingDoc = existingRatings.docs[0];
      await updateDoc(doc(db, 'ratings', existingRatingDoc.id), ratingData);
    } else {
      // Otherwise, create a new rating
      await addDoc(ratingsCollection, ratingData);
    }
    
    // Then, update the trail's average rating
    await updateTrailRating(trailId);
    
    return true;
  } catch (error) {
    console.error('Error rating trail:', error);
    throw error;
  }
};

// Get all ratings for a trail
export const getTrailRatings = async (trailId) => {
  try {
    const ratingsCollection = collection(db, 'ratings');
    const q = query(
      ratingsCollection, 
      where('trailId', '==', trailId),
      orderBy('timestamp', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting trail ratings:', error);
    throw error;
  }
};

// Get a user's rating for a specific trail
export const getUserTrailRating = async (trailId, userId) => {
  try {
    const ratingsCollection = collection(db, 'ratings');
    const q = query(
      ratingsCollection, 
      where('trailId', '==', trailId),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting user trail rating:', error);
    throw error;
  }
};

// Update trail's average rating
const updateTrailRating = async (trailId) => {
  try {
    const ratings = await getTrailRatings(trailId);
    if (ratings.length === 0) return;
    
    const sum = ratings.reduce((total, rating) => total + rating.rating, 0);
    const average = sum / ratings.length;
    
    const trailRef = doc(db, 'trails', trailId);
    await updateDoc(trailRef, {
      averageRating: average,
      ratingCount: ratings.length
    });
  } catch (error) {
    console.error('Error updating trail rating:', error);
    throw error;
  }
};

// Favorites management
export const addToFavorites = async (userId, trailId) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      favoriteTrails: arrayUnion(trailId)
    });
    return true;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
};

export const removeFromFavorites = async (userId, trailId) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      favoriteTrails: arrayRemove(trailId)
    });
    return true;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
};

export const getUserFavorites = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists() && userSnap.data().favoriteTrails) {
      const favoriteIds = userSnap.data().favoriteTrails;
      
      // If no favorites, return empty array
      if (favoriteIds.length === 0) return [];
      
      // Get all the trail data for the favorite IDs
      const trails = [];
      for (const id of favoriteIds) {
        const trail = await getTrailById(id);
        if (trail) trails.push(trail);
      }
      return trails;
    }
    return [];
  } catch (error) {
    console.error('Error getting user favorites:', error);
    throw error;
  }
};