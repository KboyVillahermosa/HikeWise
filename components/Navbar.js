import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Navbar = ({ activeScreen, setActiveScreen, user, handleLogout }) => {
  return (
    <View style={styles.navbar}>
      <Text style={styles.logo}>Cebu Hikes</Text>
      <View style={styles.navLinks}>
        <TouchableOpacity 
          style={[styles.navItem, activeScreen === 'Home' && styles.activeNavItem]} 
          onPress={() => setActiveScreen('Home')}
        >
          <Text style={[styles.navText, activeScreen === 'Home' && styles.activeNavText]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navItem, activeScreen === 'Trails' && styles.activeNavItem]} 
          onPress={() => setActiveScreen('Trails')}
        >
          <Text style={[styles.navText, activeScreen === 'Trails' && styles.activeNavText]}>Trails</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navItem, activeScreen === 'About' && styles.activeNavItem]} 
          onPress={() => setActiveScreen('About')}
        >
          <Text style={[styles.navText, activeScreen === 'About' && styles.activeNavText]}>About</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 20,
    backgroundColor: '#3c6e71',
  },
  logo: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  navLinks: {
    flexDirection: 'row',
  },
  navItem: {
    marginLeft: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  activeNavItem: {
    backgroundColor: '#ffffff',
  },
  navText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  activeNavText: {
    color: '#3c6e71',
  }
});

export default Navbar;