import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Surface, Title, Caption, Button, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Polyline } from 'react-native-maps';

const HistoryScreen = ({ setActiveScreen }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState(null);

  // Load activity history on component mount
  useEffect(() => {
    loadActivityHistory();
  }, []);

  const loadActivityHistory = async () => {
    try {
      setLoading(true);
      const historyJSON = await AsyncStorage.getItem('hikeHistory');
      
      if (historyJSON) {
        const history = JSON.parse(historyJSON);
        setActivities(history);
      }
    } catch (error) {
      console.error('Error loading activity history:', error);
      Alert.alert('Error', 'Could not load your hiking history.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const deleteActivity = async (id) => {
    Alert.alert(
      "Delete Activity",
      "Are you sure you want to delete this activity? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              // Get current history
              const historyJSON = await AsyncStorage.getItem('hikeHistory');
              if (historyJSON) {
                const history = JSON.parse(historyJSON);
                // Filter out the activity with matching id
                const updatedHistory = history.filter(activity => activity.id !== id);
                // Save updated history
                await AsyncStorage.setItem('hikeHistory', JSON.stringify(updatedHistory));
                // Update state
                setActivities(updatedHistory);
                
                if (selectedActivity && selectedActivity.id === id) {
                  setSelectedActivity(null);
                }
              }
            } catch (error) {
              console.error('Error deleting activity:', error);
              Alert.alert('Error', 'Failed to delete the activity.');
            }
          }
        }
      ]
    );
  };

  const renderActivityItem = ({ item }) => (
    <TouchableOpacity
      style={styles.activityItem}
      onPress={() => setSelectedActivity(item)}
    >
      <Surface style={styles.activityCard}>
        <View style={styles.activityHeader}>
          <View>
            <Title style={styles.activityTitle}>{item.trailName}</Title>
            <Caption>{formatDate(item.date)}</Caption>
          </View>
          <IconButton
            icon="delete-outline"
            size={20}
            color="#999"
            onPress={() => deleteActivity(item.id)}
            style={styles.deleteButton}
          />
        </View>

        <View style={styles.activityStats}>
          <View style={styles.activityStat}>
            <MaterialCommunityIcons name="map-marker-distance" size={16} color="#3c6e71" />
            <Text style={styles.statValue}>{item.distance.toFixed(2)} km</Text>
          </View>
          
          <View style={styles.activityStat}>
            <MaterialCommunityIcons name="clock-outline" size={16} color="#3c6e71" />
            <Text style={styles.statValue}>{item.duration}</Text>
          </View>
          
          <View style={styles.activityStat}>
            <MaterialCommunityIcons name="speedometer" size={16} color="#3c6e71" />
            <Text style={styles.statValue}>{item.averagePace} min/km</Text>
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );

  const renderActivityDetail = () => {
    if (!selectedActivity) return null;

    // Calculate map region from route coordinates
    const getMapRegion = () => {
      if (!selectedActivity.routeCoordinates || selectedActivity.routeCoordinates.length === 0) {
        return {
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
      }

      // Calculate min/max lat/long to determine the region
      let minLat = selectedActivity.routeCoordinates[0].latitude;
      let maxLat = selectedActivity.routeCoordinates[0].latitude;
      let minLng = selectedActivity.routeCoordinates[0].longitude;
      let maxLng = selectedActivity.routeCoordinates[0].longitude;

      selectedActivity.routeCoordinates.forEach(coord => {
        minLat = Math.min(minLat, coord.latitude);
        maxLat = Math.max(maxLat, coord.latitude);
        minLng = Math.min(minLng, coord.longitude);
        maxLng = Math.max(maxLng, coord.longitude);
      });

      const centerLat = (minLat + maxLat) / 2;
      const centerLng = (minLng + maxLng) / 2;
      const latDelta = (maxLat - minLat) * 1.5; // Add some padding
      const lngDelta = (maxLng - minLng) * 1.5;

      return {
        latitude: centerLat,
        longitude: centerLng,
        latitudeDelta: Math.max(0.005, latDelta),
        longitudeDelta: Math.max(0.005, lngDelta),
      };
    };

    return (
      <View style={styles.detailContainer}>
        <View style={styles.detailHeader}>
          <IconButton 
            icon="arrow-left" 
            size={24} 
            onPress={() => setSelectedActivity(null)} 
          />
          <Title style={styles.detailTitle}>{selectedActivity.trailName}</Title>
          <View style={{width: 48}} />
        </View>

        <View style={styles.mapContainer}>
          {selectedActivity.routeCoordinates && selectedActivity.routeCoordinates.length > 0 ? (
            <MapView
              style={styles.map}
              initialRegion={getMapRegion()}
              scrollEnabled={true}
              zoomEnabled={true}
            >
              <Polyline
                coordinates={selectedActivity.routeCoordinates}
                strokeColor="#FC5200"
                strokeWidth={4}
              />
            </MapView>
          ) : (
            <View style={styles.noMapContainer}>
              <MaterialCommunityIcons name="map-marker-off" size={50} color="#ccc" />
              <Text style={styles.noMapText}>No route data available</Text>
            </View>
          )}
        </View>

        <Surface style={styles.detailStats}>
          <View style={styles.detailStatRow}>
            <View style={styles.detailStat}>
              <Text style={styles.detailStatLabel}>DATE</Text>
              <Text style={styles.detailStatValue}>{formatDate(selectedActivity.date)}</Text>
            </View>
            
            <View style={styles.detailStat}>
              <Text style={styles.detailStatLabel}>DISTANCE</Text>
              <Text style={styles.detailStatValue}>{selectedActivity.distance.toFixed(2)} km</Text>
            </View>
          </View>
          
          <View style={styles.detailStatRow}>
            <View style={styles.detailStat}>
              <Text style={styles.detailStatLabel}>DURATION</Text>
              <Text style={styles.detailStatValue}>{selectedActivity.duration}</Text>
            </View>
            
            <View style={styles.detailStat}>
              <Text style={styles.detailStatLabel}>PACE</Text>
              <Text style={styles.detailStatValue}>{selectedActivity.averagePace} min/km</Text>
            </View>
          </View>
          
          <View style={styles.detailStatRow}>
            <View style={styles.detailStat}>
              <Text style={styles.detailStatLabel}>MAX ELEVATION</Text>
              <Text style={styles.detailStatValue}>{selectedActivity.maxElevation} m</Text>
            </View>
            
            <View style={styles.detailStat}>
              <Text style={styles.detailStatLabel}>TIME</Text>
              <Text style={styles.detailStatValue}>
                {new Date(selectedActivity.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </Text>
            </View>
          </View>
        </Surface>

        <Button 
          mode="contained" 
          style={styles.deleteActivityButton}
          icon="delete"
          onPress={() => deleteActivity(selectedActivity.id)}
        >
          Delete Activity
        </Button>
      </View>
    );
  };

  // If viewing a selected activity, show that detail view
  if (selectedActivity) {
    return (
      <SafeAreaView style={styles.container}>
        {renderActivityDetail()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <IconButton 
          icon="arrow-left" 
          size={24} 
          color="#555"
          onPress={() => setActiveScreen('Home')}
        />
        <Title style={styles.headerTitle}>Hiking History</Title>
        <View style={{width: 40}} /> {/* Empty view for balance */}
      </View>

      {activities.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="hiking" size={70} color="#ccc" />
          <Text style={styles.emptyText}>No hiking activities yet</Text>
          <Text style={styles.emptySubtext}>
            Your completed hikes will appear here
          </Text>
          <Button 
            mode="contained" 
            style={styles.startButton}
            onPress={() => setActiveScreen('Tracking')}
          >
            Start a New Hike
          </Button>
        </View>
      ) : (
        <FlatList
          data={activities}
          renderItem={renderActivityItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.activityList}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    marginBottom: 30,
  },
  startButton: {
    backgroundColor: '#3c6e71',
    paddingHorizontal: 16,
    marginTop: 20,
  },
  activityList: {
    padding: 16,
  },
  activityItem: {
    marginBottom: 16,
  },
  activityCard: {
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  activityTitle: {
    fontSize: 16,
  },
  deleteButton: {
    margin: 0,
  },
  activityStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  activityStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    marginLeft: 4,
    color: '#555',
  },
  detailContainer: {
    flex: 1,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  mapContainer: {
    height: 300,
    backgroundColor: '#e1e1e1',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  noMapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  noMapText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999',
  },
  detailStats: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  detailStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailStat: {
    flex: 1,
  },
  detailStatLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  detailStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  deleteActivityButton: {
    margin: 16,
    backgroundColor: '#e53935',
  },
});

export default HistoryScreen;