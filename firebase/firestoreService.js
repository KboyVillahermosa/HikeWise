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
  
  export const getUserProfile = async (userId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        return {
          id: userDocSnap.id,
          ...userDocSnap.data()
        };
      } else {
        console.log("No user profile found with ID:", userId);
        return null;
      }
    } catch (error) {
      console.error("Error getting user profile:", error);
      throw error;
    }
  };
  
  export const updateUserProfile = async (userId, userData) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        // Update existing user document
        await updateDoc(userDocRef, userData);
      } else {
        // Create new user document
        await setDoc(userDocRef, {
          ...userData,
          createdAt: new Date()
        });
      }
      
      return true;
    } catch (error) {
      console.error("Error updating user profile:", error);
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
  
  export const getTrailsById = async (trailIds) => {
    try {
      if (!trailIds || trailIds.length === 0) {
        return [];
      }
      
      const trails = [];
      const trailsCollection = collection(db, 'trails');
      
      // Firestore can only filter with "in" for up to 10 items at a time
      const batchSize = 10;
      
      for (let i = 0; i < trailIds.length; i += batchSize) {
        const batch = trailIds.slice(i, i + batchSize);
        const q = query(trailsCollection, where('__name__', 'in', batch));
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach(doc => {
          trails.push({
            id: doc.id,
            ...doc.data()
          });
        });
      }
      
      return trails;
    } catch (error) {
      console.error("Error getting trails by ID:", error);
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
      await calculateTrailAverageRating(trailId);
      
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
  
  // Update trail's average rating (internal function)
  const calculateTrailAverageRating = async (trailId) => {
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
  
  export const updateTrailRating = async (trailId, rating, userId) => {
    try {
      const trailRef = doc(db, 'trails', trailId);
      const trailDoc = await getDoc(trailRef);
      
      if (!trailDoc.exists()) {
        throw new Error('Trail not found');
      }
      
      const trailData = trailDoc.data();
      const userRatingsRef = collection(db, 'trails', trailId, 'ratings');
      const userRatingRef = doc(userRatingsRef, userId);
      
      // Get the user's previous rating if it exists
      const userRatingDoc = await getDoc(userRatingRef);
      const oldRating = userRatingDoc.exists() ? userRatingDoc.data().rating : 0;
      
      // Save the user's rating
      await setDoc(userRatingRef, {
        rating: rating,
        userId: userId,
        timestamp: serverTimestamp()
      });
      
      // Update the trail's average rating
      const newRatingCount = oldRating > 0 
        ? trailData.ratingCount || 0 
        : (trailData.ratingCount || 0) + 1;
      
      const totalRatingPoints = oldRating > 0
        ? (trailData.averageRating || 0) * (trailData.ratingCount || 0) - oldRating + rating
        : (trailData.averageRating || 0) * (trailData.ratingCount || 0) + rating;
      
      const newAverageRating = totalRatingPoints / newRatingCount;
      
      // Update the trail document
      await updateDoc(trailRef, {
        averageRating: newAverageRating,
        ratingCount: newRatingCount
      });
      
      // Then, update the trail's average rating
      await calculateTrailAverageRating(trailId);
      
      return { success: true };
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