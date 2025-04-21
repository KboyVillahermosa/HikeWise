import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ImageBackground
} from 'react-native';
import {
  Surface,
  Button,
  Divider,
  Avatar,
  Title,
  Caption,
  List,
  Card,
  Paragraph,
  Dialog,
  Portal,
  IconButton,
  Chip
} from 'react-native-paper';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { auth } from '../firebase/config';
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  signOut
} from 'firebase/auth';
import {
  getUserProfile,
  updateUserProfile,
  getTrailsById
} from '../firebase/firestoreService';
import BottomNavBar from './BottomNavBar';

const ProfileScreen = ({ setActiveScreen }) => {
  const currentUser = auth.currentUser;
  
  // User data states
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [favoriteTrails, setFavoriteTrails] = useState([]);
  
  // Edit mode states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [updatedName, setUpdatedName] = useState('');
  const [updatedBio, setUpdatedBio] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Password change states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        
        // Load user profile
        if (currentUser) {
          const profile = await getUserProfile(currentUser.uid);
          setUserProfile(profile);
          setUpdatedName(profile?.displayName || currentUser.displayName || '');
          setUpdatedBio(profile?.bio || '');
          
          // Load favorite trails
          if (profile?.favoriteTrails && profile.favoriteTrails.length > 0) {
            const trails = await getTrailsById(profile.favoriteTrails);
            setFavoriteTrails(trails);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        Alert.alert('Error', 'Failed to load your profile data.');
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [currentUser]);
  
  // Update user profile
  const handleUpdateProfile = async () => {
    try {
      setSaving(true);
      
      const updatedProfile = {
        displayName: updatedName,
        bio: updatedBio
      };
      
      await updateUserProfile(currentUser.uid, updatedProfile);
      
      // Update local state
      setUserProfile(prev => ({
        ...prev,
        ...updatedProfile
      }));
      
      setIsEditingProfile(false);
      Alert.alert('Success', 'Your profile has been updated.');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update your profile.');
    } finally {
      setSaving(false);
    }
  };
  
  // Reauthenticate before changing password
  const reauthenticate = async (currentPassword) => {
    try {
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);
      return true;
    } catch (error) {
      console.error('Reauthentication error:', error);
      return false;
    }
  };
  
  // Change password
  const handleChangePassword = async () => {
    try {
      setPasswordError('');
      setChangingPassword(true);
      
      // Validate inputs
      if (!currentPassword) {
        setPasswordError('Please enter your current password');
        return;
      }
      
      if (!newPassword) {
        setPasswordError('Please enter a new password');
        return;
      }
      
      if (newPassword.length < 6) {
        setPasswordError('New password must be at least 6 characters');
        return;
      }
      
      if (newPassword !== confirmPassword) {
        setPasswordError('New passwords do not match');
        return;
      }
      
      // Reauthenticate user
      const reauthResult = await reauthenticate(currentPassword);
      if (!reauthResult) {
        setPasswordError('Your current password is incorrect');
        return;
      }
      
      // Update password
      await updatePassword(currentUser, newPassword);
      
      // Clear form and close modal
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordModal(false);
      
      Alert.alert(
        'Success',
        'Your password has been changed successfully. Please log in again.',
        [
          {
            text: 'OK',
            onPress: () => signOut(auth)
          }
        ]
      );
    } catch (error) {
      console.error('Password change error:', error);
      setPasswordError(error.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };
  
  // Handle view trail details
  const handleViewTrail = (trailId) => {
    setActiveScreen('TrailDetail');
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FC5200" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header with gradient background */}
        <LinearGradient
          colors={['#FC5200', '#FF7E45']}
          style={styles.headerGradient}
        >
          <View style={styles.avatarSection}>
            <Avatar.Text
              size={80}
              label={(updatedName || currentUser.email || '?').substring(0, 2).toUpperCase()}
              backgroundColor="rgba(255,255,255,0.25)"
              color="#fff"
              style={styles.avatar}
            />
            {!isEditingProfile && (
              <View style={styles.headerInfo}>
                <Title style={styles.name}>
                  {userProfile?.displayName || currentUser.displayName || 'Hiker'}
                </Title>
                <Caption style={styles.email}>{currentUser.email}</Caption>
              </View>
            )}
          </View>
        </LinearGradient>
        
        {/* Profile Bio & Edit Section */}
        <Surface style={styles.bioSection}>
          {!isEditingProfile ? (
            <>
              {userProfile?.bio ? (
                <Paragraph style={styles.bio}>{userProfile.bio}</Paragraph>
              ) : (
                <Paragraph style={styles.emptyBio}>Add a bio to tell others about yourself</Paragraph>
              )}
              <Button
                mode="outlined"
                onPress={() => setIsEditingProfile(true)}
                style={styles.editButton}
                icon="account-edit"
                labelStyle={styles.editButtonLabel}
              >
                Edit Profile
              </Button>
            </>
          ) : (
            <View style={styles.editForm}>
              <TextInput
                style={styles.input}
                placeholder="Display Name"
                value={updatedName}
                onChangeText={setUpdatedName}
              />
              <TextInput
                style={[styles.input, styles.bioInput]}
                placeholder="About me (optional)"
                value={updatedBio}
                onChangeText={setUpdatedBio}
                multiline
                numberOfLines={3}
              />
              <View style={styles.editButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setIsEditingProfile(false)}
                  style={styles.cancelButton}
                  labelStyle={styles.cancelButtonLabel}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleUpdateProfile}
                  loading={saving}
                  disabled={saving}
                  style={styles.saveButton}
                  labelStyle={styles.saveButtonLabel}
                >
                  Save
                </Button>
              </View>
            </View>
          )}
        </Surface>
        
        {/* Stats Card */}
        <Surface style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {userProfile?.favoriteTrails?.length || 0}
              </Text>
              <Text style={styles.statLabel}>Favorite Trails</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {userProfile?.completedTrails?.length || 0}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {userProfile?.ratings?.length || 0}
              </Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
          </View>
        </Surface>
        
        {/* Account Settings Section */}
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <Surface style={styles.settingsCard}>
          <List.Item
            title="Change Password"
            description="Update your account password"
            left={props => <List.Icon {...props} icon="lock-reset" color="#FC5200" />}
            right={props => <List.Icon {...props} icon="chevron-right" color="#757575" />}
            onPress={() => setShowPasswordModal(true)}
            style={styles.listItem}
            titleStyle={styles.listItemTitle}
            descriptionStyle={styles.listItemDescription}
          />
          
          <Divider style={styles.divider} />
          
          <List.Item
            title="Notification Preferences"
            description="Manage your notification settings"
            left={props => <List.Icon {...props} icon="bell-outline" color="#FC5200" />}
            right={props => <List.Icon {...props} icon="chevron-right" color="#757575" />}
            style={styles.listItem}
            titleStyle={styles.listItemTitle}
            descriptionStyle={styles.listItemDescription}
          />
          
          <Divider style={styles.divider} />
          
          <List.Item
            title="Privacy Settings"
            description="Control your privacy options"
            left={props => <List.Icon {...props} icon="shield-account" color="#FC5200" />}
            right={props => <List.Icon {...props} icon="chevron-right" color="#757575" />}
            style={styles.listItem}
            titleStyle={styles.listItemTitle}
            descriptionStyle={styles.listItemDescription}
          />
          
          <Divider style={styles.divider} />
          
          <List.Item
            title="Sign Out"
            description="Log out from your account"
            left={props => <List.Icon {...props} icon="logout" color="#E53935" />}
            onPress={() => signOut(auth)}
            style={styles.listItem}
            titleStyle={styles.listItemTitle}
            descriptionStyle={styles.listItemDescription}
          />
        </Surface>
        
        {/* Favorite Trails Section */}
        {favoriteTrails.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Favorite Trails</Text>
            <View style={styles.favoritesList}>
              {favoriteTrails.map(trail => (
                <Card
                  key={trail.id}
                  style={styles.favoriteCard}
                  onPress={() => handleViewTrail(trail.id)}
                >
                  <Card.Cover
                    source={{ uri: trail.imageUrl || 'https://via.placeholder.com/400x200?text=No+Image' }}
                    style={styles.favoriteImage}
                  />
                  <Card.Title
                    title={trail.name}
                    titleStyle={styles.cardTitle}
                    subtitle={trail.location}
                    subtitleStyle={styles.cardSubtitle}
                    right={(props) => (
                      <View style={styles.cardRight}>
                        <View style={[
                          styles.difficultyBadge,
                          trail.difficulty.toLowerCase() === 'easy' ? styles.easyBadge :
                          trail.difficulty.toLowerCase() === 'moderate' ? styles.moderateBadge :
                          styles.hardBadge
                        ]}>
                          <Text style={styles.difficultyText}>{trail.difficulty}</Text>
                        </View>
                        <View style={styles.ratingContainer}>
                          <MaterialCommunityIcons name="star" size={14} color="#FC5200" />
                          <Text style={styles.ratingText}>
                            {trail.averageRating ? trail.averageRating.toFixed(1) : '0.0'}
                          </Text>
                        </View>
                      </View>
                    )}
                  />
                  <Card.Actions style={styles.cardActions}>
                    <Button 
                      mode="text" 
                      onPress={() => handleViewTrail(trail.id)}
                      color="#FC5200"
                      labelStyle={styles.viewDetailsLabel}
                    >
                      View Details
                    </Button>
                    <Button 
                      mode="contained" 
                      onPress={() => setActiveScreen('Tracking')}
                      style={styles.hikeButton}
                      labelStyle={styles.hikeButtonLabel}
                    >
                      Start Hike
                    </Button>
                  </Card.Actions>
                </Card>
              ))}
            </View>
          </>
        )}
        
        {/* Password Change Modal */}
        <Portal>
          <Dialog
            visible={showPasswordModal}
            onDismiss={() => setShowPasswordModal(false)}
            style={styles.dialog}
          >
            <Dialog.Title style={styles.dialogTitle}>Change Password</Dialog.Title>
            <Dialog.Content>
              <TextInput
                style={styles.passwordInput}
                placeholder="Current Password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
              />
              <TextInput
                style={styles.passwordInput}
                placeholder="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : null}
            </Dialog.Content>
            <Dialog.Actions>
              <Button
                onPress={() => setShowPasswordModal(false)}
                disabled={changingPassword}
                color="#757575"
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleChangePassword}
                loading={changingPassword}
                disabled={changingPassword}
                style={styles.updatePasswordButton}
                labelStyle={styles.updatePasswordLabel}
              >
                Update
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </ScrollView>
      
      {/* Bottom Nav Bar */}
      <BottomNavBar activeScreen="Profile" setActiveScreen={setActiveScreen} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    paddingBottom: 90, // Space for bottom nav
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  
  // Header with gradient
  headerGradient: {
    padding: 24,
    paddingTop: 40,
    paddingBottom: 30,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    elevation: 4,
    shadowColor: 'rgba(0,0,0,0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  headerInfo: {
    marginLeft: 20,
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  email: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  
  // Bio section
  bioSection: {
    marginHorizontal: 16,
    marginTop: -20,
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  bio: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 16,
  },
  emptyBio: {
    fontSize: 15,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  editButton: {
    alignSelf: 'flex-start',
    borderColor: '#FC5200',
    borderWidth: 1,
  },
  editButtonLabel: {
    color: '#FC5200',
    fontSize: 13,
    fontWeight: '500',
  },
  
  // Edit form
  editForm: {
    width: '100%',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  bioInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  cancelButton: {
    marginRight: 12,
    borderColor: '#ccc',
  },
  cancelButtonLabel: {
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#FC5200',
  },
  saveButtonLabel: {
    color: '#fff',
    fontWeight: '500',
  },
  
  // Stats card
  statsCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FC5200',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  
  // Section titles
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  
  // Settings card
  settingsCard: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  listItem: {
    padding: 8,
    backgroundColor: '#fff',
  },
  listItemTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  listItemDescription: {
    fontSize: 13,
    color: '#777',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  
  // Favorites section
  favoritesList: {
    paddingHorizontal: 16,
  },
  favoriteCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  favoriteImage: {
    height: 140,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 16,
    marginBottom: 4,
  },
  easyBadge: {
    backgroundColor: '#c6f6d5',
  },
  moderateBadge: {
    backgroundColor: '#feebc8',
  },
  hardBadge: {
    backgroundColor: '#fed7d7',
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 4,
  },
  cardActions: {
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  viewDetailsLabel: {
    fontSize: 12,
    color: '#FC5200',
  },
  hikeButton: {
    backgroundColor: '#FC5200',
  },
  hikeButtonLabel: {
    fontSize: 12,
    color: '#fff',
  },
  
  // Password dialog
  dialog: {
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  dialogTitle: {
    color: '#333',
    fontWeight: 'bold',
  },
  passwordInput: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  errorText: {
    color: '#E53935',
    marginTop: 8,
    fontSize: 14,
  },
  updatePasswordButton: {
    backgroundColor: '#FC5200',
  },
  updatePasswordLabel: {
    color: '#fff',
  }
});

export default ProfileScreen;