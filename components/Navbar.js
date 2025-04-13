import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { 
  Appbar, 
  Menu, 
  Avatar, 
  Divider, 
  useTheme,
  IconButton
} from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Navbar = ({ activeScreen, setActiveScreen, user, handleLogout }) => {
  const theme = useTheme();
  const [menuVisible, setMenuVisible] = React.useState(false);
  
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);
  
  const getTitle = () => {
    switch(activeScreen) {
      case 'Home': return 'Cebu Hiking Spots';
      case 'Trails': return 'Hiking Trails';
      case 'TrailDetail': return 'Trail Details';
      case 'About': return 'About';
      case 'Profile': return 'Profile';
      default: return 'Cebu Hiking Spots';
    }
  };
  
  return (
    <Appbar.Header style={styles.header}>
      {activeScreen !== 'Home' && (
        <Appbar.BackAction onPress={() => setActiveScreen('Home')} />
      )}
      
      <Appbar.Content 
        title={getTitle()} 
        titleStyle={styles.title}
      />
      
      <View style={styles.actions}>
        {activeScreen === 'Trails' && (
          <Appbar.Action icon="magnify" onPress={() => {/* Search functionality */}} />
        )}
        
        <Appbar.Action 
          icon={activeScreen === 'Home' ? 'view-dashboard-outline' : 'home-outline'}
          onPress={() => setActiveScreen('Home')} 
        />
        
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={
            <Appbar.Action 
              icon="menu" 
              onPress={openMenu}
              color={theme.colors.surface}
            />
          }
          contentStyle={styles.menuContent}
        >
          <View style={styles.menuHeader}>
            <Avatar.Icon 
              size={40} 
              icon="account" 
              style={styles.avatar}
            />
            <View style={styles.userInfo}>
              <Menu.Item 
                title={user?.displayName || user?.email || 'User'} 
                disabled
                titleStyle={styles.userName}
              />
            </View>
          </View>
          
          <Divider />
          
          <Menu.Item 
            icon="view-dashboard-outline" 
            onPress={() => {
              setActiveScreen('Home');
              closeMenu();
            }} 
            title="Home" 
          />
          
          <Menu.Item 
            icon="hiking" 
            onPress={() => {
              setActiveScreen('Trails');
              closeMenu();
            }} 
            title="All Trails" 
          />
          
          <Menu.Item 
            icon="information-outline" 
            onPress={() => {
              setActiveScreen('About');
              closeMenu();
            }} 
            title="About" 
          />
          
          <Divider />
          
          <Menu.Item 
            icon="logout" 
            onPress={() => {
              handleLogout();
              closeMenu();
            }} 
            title="Logout" 
          />
        </Menu>
      </View>
      
      {/* Add a Profile option to your navigation items */}
      <TouchableOpacity
        style={[
          styles.navItem,
          activeScreen === 'Profile' && styles.activeNavItem
        ]}
        onPress={() => setActiveScreen('Profile')}
      >
        <Ionicons
          name="person"
          size={24}
          color={activeScreen === 'Profile' ? '#3c6e71' : '#666'}
        />
        <Text
          style={[
            styles.navText,
            activeScreen === 'Profile' && styles.activeNavText
          ]}
        >
          Profile
        </Text>
      </TouchableOpacity>
    </Appbar.Header>
  );
};

const styles = StyleSheet.create({
  header: {
    elevation: 4,
  },
  title: {
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
  },
  menuContent: {
    marginTop: 40,
    minWidth: 200,
  },
  menuHeader: {
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center',
  },
  avatar: {
    marginRight: 8,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  activeNavItem: {
    backgroundColor: '#e0f7fa',
  },
  navText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  activeNavText: {
    color: '#3c6e71',
    fontWeight: 'bold',
  },
});

export default Navbar;