import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Surface } from 'react-native-paper';

const { width } = Dimensions.get('window');

const BottomNavBar = ({ activeScreen, setActiveScreen, onCreatePostPress }) => {
  const navItems = [
    { name: 'Home', icon: 'home', screen: 'Home' },
    { name: 'Trails', icon: 'map', screen: 'Trails' },
    { name: 'Create', icon: 'plus-circle', screen: 'CreatePost', special: true },
    { name: 'Track', icon: 'hiking', screen: 'Tracking' },
    { name: 'Profile', icon: 'account', screen: 'Profile' },
  ];

  const handleNavPress = (item) => {
    if (item.screen === 'CreatePost' && onCreatePostPress) {
      onCreatePostPress();
    } else {
      setActiveScreen(item.screen);
    }
  };

  return (
    <Surface style={styles.container}>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.name}
          style={[
            styles.navItem,
            item.special && styles.specialNavItem
          ]}
          onPress={() => handleNavPress(item)}
          activeOpacity={0.7}
        >
          <View style={[
            styles.iconContainer,
            item.special && styles.specialIconContainer
          ]}>
            <MaterialCommunityIcons
              name={item.icon}
              size={item.special ? 32 : 24}
              color={item.special ? '#FFFFFF' : (activeScreen === item.screen ? '#FC5200' : '#757575')}
            />
            {!item.special && activeScreen === item.screen && <View style={styles.activeDot} />}
          </View>
          {!item.special && (
            <Text
              style={[
                styles.navLabel,
                activeScreen === item.screen && styles.activeNavLabel,
              ]}
            >
              {item.name}
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 60,
    width: width - 32,
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 30,
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    paddingHorizontal: 8,
    zIndex: 1000,
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  specialNavItem: {
    flex: 1.2,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 2,
  },
  specialIconContainer: {
    backgroundColor: '#FC5200',
    width: 48,
    height: 48,
    borderRadius: 24,
    shadowColor: '#FC5200',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    marginBottom: 0,
  },
  activeDot: {
    position: 'absolute',
    bottom: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FC5200',
  },
  navLabel: {
    fontSize: 10,
    color: '#757575',
    marginTop: 2,
  },
  activeNavLabel: {
    color: '#FC5200',
    fontWeight: 'bold',
  },
});

export default BottomNavBar;