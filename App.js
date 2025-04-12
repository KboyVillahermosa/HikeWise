import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import Navbar from './components/Navbar';
import HomeScreen from './components/HomeScreen';
import AboutScreen from './components/AboutScreen';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import TrailsScreen from './components/TrailsScreen';
import TrailDetailScreen from './components/TrailDetailScreen';

export default function App() {
  const [activeScreen, setActiveScreen] = useState('Login');
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [selectedTrailId, setSelectedTrailId] = useState(null);

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
        default:
          return <HomeScreen setActiveScreen={setActiveScreen} />;
      }
    }
  };

  // Only show navbar if user is logged in
  const showNavbar = user !== null;

  return (
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
      <StatusBar style="light" />
    </SafeAreaView>
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
