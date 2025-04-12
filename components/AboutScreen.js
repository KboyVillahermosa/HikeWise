import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AboutScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>About Cebu Hiking Spots</Text>
      <Text style={styles.content}>
        This app is dedicated to showcasing the most beautiful hiking spots in Cebu Island, Philippines.
        Cebu offers a diverse range of hiking trails for beginners and experienced hikers alike.
      </Text>
      <Text style={styles.content}>
        From majestic mountain peaks to stunning waterfalls, Cebu's natural wonders are waiting to be explored.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  content: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 24,
  },
});

export default AboutScreen;