import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, SafeAreaView, Text, Modal } from 'react-native';
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import Navbar from './components/Navbar';
import BottomNavBar from './components/BottomNavBar';
import HomeScreen from './components/HomeScreen';
import AboutScreen from './components/AboutScreen';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import TrailsScreen from './components/TrailsScreen';
import TrailDetailScreen from './components/TrailDetailScreen';
import ProfileScreen from './components/ProfileScreen';
import TrackingScreen from './components/TrackingScreen';
import Post from './components/Post';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#3c6e71',
    accent: '#f7a072',
    background: '#f5f5f5',
    surface: '#ffffff',
    text: '#333333',
  },
};

export default function App() {
  const [activeScreen, setActiveScreen] = useState('Login');
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [selectedTrailId, setSelectedTrailId] = useState(null);
  const [selectedTrail, setSelectedTrail] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        setActiveScreen('Home');
      } else {
        setActiveScreen('Login');
      }
      if (initializing) setInitializing(false);
    });

    // Cleanup subscription
    return unsubscribe;
  }, [initializing]);

  if (initializing) {
    // You could show a loading screen here
    return null;
  }

  const renderScreen = () => {
    if (!user) {
      // Auth screens
      switch(activeScreen) {
        case 'Login':
          return <LoginScreen setActiveScreen={setActiveScreen} />;
        case 'Register':
          return <RegisterScreen setActiveScreen={setActiveScreen} />;
        default:
          return <LoginScreen setActiveScreen={setActiveScreen} />;
      }
    } else {
      // App screens for logged in users
      switch(activeScreen) {
        case 'Home':
          return (
            <HomeScreen 
              setActiveScreen={setActiveScreen} 
              setSelectedTrailId={setSelectedTrailId}
              setCurrentTrail={setSelectedTrail}
            />
          );
        case 'About':
          return <AboutScreen />;
        case 'Trails':
          return (
            <TrailsScreen 
              setActiveScreen={setActiveScreen}
              setSelectedTrailId={setSelectedTrailId}
            />
          );
        case 'TrailDetail':
          return (
            <TrailDetailScreen 
              trailId={selectedTrailId}
              setActiveScreen={setActiveScreen}
            />
          );
        case 'Profile':
          return <ProfileScreen setActiveScreen={setActiveScreen} />;
        case 'Tracking':
          return (
            <TrackingScreen 
              setActiveScreen={setActiveScreen} 
              currentTrail={selectedTrail}
            />
          );
        default:
          return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text>Screen not found</Text>
            </View>
          );
      }
    }
  };

  const handleCreatePostPress = () => {
    setShowPostModal(true);
  };

  // Only show navbar if user is logged in
  const showNavbar = user !== null;

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={styles.container}>
        {showNavbar && (
          <Navbar 
            activeScreen={activeScreen} 
            setActiveScreen={setActiveScreen} 
            user={user}
            handleLogout={() => auth.signOut()}
          />
        )}
        <View style={styles.content}>
          {renderScreen()}
        </View>
        <Modal
          visible={showPostModal}
          animationType="slide"
          onRequestClose={() => setShowPostModal(false)}
        >
          <View style={{ flex: 1 }}>
            <Post onClose={() => setShowPostModal(false)} />
          </View>
        </Modal>
        {user && (
          <BottomNavBar 
            activeScreen={activeScreen} 
            setActiveScreen={setActiveScreen} 
            onCreatePostPress={handleCreatePostPress}
          />
        )}
        <StatusBar style="light" />
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
});