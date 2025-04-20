import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BottomNavigation } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Navbar = ({ activeScreen, setActiveScreen, user }) => {
  // Don't display navbar for auth screens
  if (!user || activeScreen === 'Login' || activeScreen === 'Register') {
    return null;
  }

  // Hide navbar on certain screens where it doesn't make sense
  if (activeScreen === 'TrailDetail' || activeScreen === 'Tracking') {
    return null;
  }

  const activeColor = '#3c6e71';
  const inactiveColor = '#888';

  return (
    <View style={styles.container}>
      <BottomNavigation
        navigationState={{
          index: 0,
          routes: [
            { key: 'home', title: 'Home', icon: 'home' },
            { key: 'trails', title: 'Trails', icon: 'map-marker-path' },
            { key: 'history', title: 'History', icon: 'history' },
            { key: 'profile', title: 'Profile', icon: 'account' },
          ],
        }}
        onIndexChange={(index) => {
          switch (index) {
            case 0:
              setActiveScreen('Home');
              break;
            case 1:
              setActiveScreen('Trails');
              break;
            case 2:
              setActiveScreen('History');
              break;
            case 3:
              setActiveScreen('Profile');
              break;
          }
        }}
        renderScene={() => null}
        renderIcon={({ route, focused, color }) => {
          let iconName;
          switch (route.key) {
            case 'home':
              iconName = 'home';
              break;
            case 'trails':
              iconName = 'map-marker-path';
              break;
            case 'history':
              iconName = 'history';
              break;
            case 'profile':
              iconName = 'account';
              break;
          }
          return <MaterialCommunityIcons name={iconName} size={24} color={focused ? activeColor : inactiveColor} />;
        }}
        barStyle={styles.navbar}
        activeColor={activeColor}
        inactiveColor={inactiveColor}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  navbar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
});

export default Navbar;