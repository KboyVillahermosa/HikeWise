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
  ActivityIndicator
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
        <ActivityIndicator size="large" color="#3c6e71" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header}>
        <View style={styles.avatarSection}>
          <Avatar.Text
            size={80}
            label={(updatedName || currentUser.email || '?').substring(0, 2).toUpperCase()}
            backgroundColor="#3c6e71"
            color="#fff"
          />
          {!isEditingProfile && (
            <View style={styles.headerInfo}>
              <Title style={styles.name}>
                {userProfile?.displayName || currentUser.displayName || 'Hiker'}
              </Title>
              <Caption style={styles.email}>{currentUser.email}</Caption>
              {userProfile?.bio && (
                <Paragraph style={styles.bio}>{userProfile.bio}</Paragraph>
              )}
            </View>
          )}
        </View>
        
        {isEditingProfile ? (
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
              >
                Save
              </Button>
            </View>
          </View>
        ) : (
          <Button
            mode="outlined"
            onPress={() => setIsEditingProfile(true)}
            style={styles.editButton}
            icon="account-edit"
          >
            Edit Profile
          </Button>
        )}
      </Surface>
      
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
      
      <List.Section style={styles.section}>
        <List.Subheader style={styles.sectionTitle}>Account Settings</List.Subheader>
        
        <Surface style={styles.settingsCard}>
          <List.Item
            title="Change Password"
            description="Update your account password"
            left={props => <List.Icon {...props} icon="lock-reset" color="#3c6e71" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setShowPasswordModal(true)}
            style={styles.listItem}
          />
          
          <Divider />
          
          <List.Item
            title="Notification Preferences"
            description="Manage your notification settings"
            left={props => <List.Icon {...props} icon="bell-outline" color="#3c6e71" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            style={styles.listItem}
          />
          
          <Divider />
          
          <List.Item
            title="Privacy Settings"
            description="Control your privacy options"
            left={props => <List.Icon {...props} icon="shield-account" color="#3c6e71" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            style={styles.listItem}
          />
          
          <Divider />
          
          <List.Item
            title="Sign Out"
            description="Log out from your account"
            left={props => <List.Icon {...props} icon="logout" color="#e53e3e" />}
            onPress={() => signOut(auth)}
            style={styles.listItem}
          />
        </Surface>
      </List.Section>
      
      {favoriteTrails.length > 0 && (
        <List.Section style={styles.section}>
          <List.Subheader style={styles.sectionTitle}>Favorite Trails</List.Subheader>
          
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
                  subtitle={trail.location}
                  right={(props) => (
                    <View style={[
                      styles.difficultyBadge,
                      trail.difficulty.toLowerCase() === 'easy' ? styles.easyBadge :
                      trail.difficulty.toLowerCase() === 'moderate' ? styles.moderateBadge :
                      styles.hardBadge
                    ]}>
                      <Text style={styles.difficultyText}>{trail.difficulty}</Text>
                    </View>
                  )}
                />
              </Card>
            ))}
          </View>
        </List.Section>
      )}
      
      {/* Password Change Modal */}
      <Portal>
        <Dialog
          visible={showPasswordModal}
          onDismiss={() => setShowPasswordModal(false)}
          style={styles.dialog}
        >
          <Dialog.Title>Change Password</Dialog.Title>
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
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleChangePassword}
              loading={changingPassword}
              disabled={changingPassword}
            >
              Update
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  header: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
    elevation: 2,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerInfo: {
    marginLeft: 16,
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  bio: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    lineHeight: 20,
  },
  editButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    borderColor: '#3c6e71',
    borderWidth: 1,
  },
  editForm: {
    marginTop: 16,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
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
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#3c6e71',
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
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
    backgroundColor: '#ddd',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3c6e71',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 16,
  },
  settingsCard: {
    marginHorizontal: 16,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
  },
  listItem: {
    padding: 8,
    backgroundColor: '#fff',
  },
  favoritesList: {
    marginHorizontal: 16,
  },
  favoriteCard: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
  },
  favoriteImage: {
    height: 120,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 16,
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
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  dialog: {
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  passwordInput: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  errorText: {
    color: '#e53e3e',
    marginTop: 8,
    fontSize: 14,
  },
});

export default ProfileScreen;