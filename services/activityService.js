import { firebase } from '../firebase/config';

export const saveActivity = async (userId, activityData) => {
  try {
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    
    const activityRef = await firebase.firestore()
      .collection('activities')
      .add({
        userId,
        ...activityData,
        createdAt: timestamp
      });
      
    return activityRef.id;
  } catch (error) {
    console.error('Error saving activity:', error);
    throw error;
  }
};

export const getActivities = async (userId) => {
  try {
    const snapshot = await firebase.firestore()
      .collection('activities')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
      
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting activities:', error);
    throw error;
  }
};