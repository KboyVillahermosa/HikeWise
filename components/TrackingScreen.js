import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, Text, Dimensions } from 'react-native';
import { Button, Surface, Title, IconButton } from 'react-native-paper';
import * as Location from 'expo-location';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const TrackingScreen = ({ setActiveScreen, currentTrail }) => {
  // State variables
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [distanceTraveled, setDistanceTraveled] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(null);
  const [timerInterval, setTimerInterval] = useState(null);
  
  // References
  const locationSubscription = useRef(null);
  const mapRef = useRef(null);

  // Request location permissions when component mounts
  useEffect(() => {
    (async () => {
      // Request location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      try {
        // Get initial position
        let initialPosition = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced
        });
        setLocation(initialPosition);
      } catch (error) {
        setErrorMsg('Could not get your location. Please try again.');
        console.error('Location error:', error);
      }
    })();

    // Clean up on unmount
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, []);

  // Start tracking user location
  const startTracking = async () => {
    if (!location) {
      Alert.alert('Error', 'Unable to get your location. Please try again.');
      return;
    }

    setIsTracking(true);
    setRouteCoordinates([{
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    }]);
    setDistanceTraveled(0);
    const now = new Date();
    setStartTime(now);
    setCurrentTime(now);
    
    // Center map on user's initial position
    mapRef.current?.animateToRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    }, 1000);
    
    // Update timer every second
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    setTimerInterval(interval);
    
    try {
      // Subscribe to location updates
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation, // Use highest accuracy for tracking
          distanceInterval: 5, // Update every 5 meters
          timeInterval: 3000 // Or every 3 seconds
        },
        newLocation => {
          const { latitude, longitude } = newLocation.coords;
          
          setLocation(newLocation);
          
          // Add point to route
          setRouteCoordinates(prevCoordinates => {
            const newCoordinates = [...prevCoordinates, { latitude, longitude }];
            
            // Calculate distance if we have at least two points
            if (prevCoordinates.length > 0) {
              const lastCoord = prevCoordinates[prevCoordinates.length - 1];
              const newDistance = calculateDistance(
                lastCoord.latitude, lastCoord.longitude,
                latitude, longitude
              );
              setDistanceTraveled(prevDistance => prevDistance + newDistance);
            }
            
            return newCoordinates;
          });
          
          // Always center map on user with a slight delay to look smoother
          setTimeout(() => {
            mapRef.current?.animateToRegion({
              latitude,
              longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }, 500); // 500ms animation makes it smoother
          }, 100);
        }
      );
    } catch (error) {
      console.error('Error starting location tracking:', error);
      Alert.alert('Error', 'Failed to start tracking. Please try again.');
      setIsTracking(false);
      clearInterval(interval);
    }
  };

  // Stop tracking
  const stopTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
    }
    
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    
    setIsTracking(false);
    
    // Calculate final stats
    const duration = formatDuration(startTime, new Date());
    const distance = distanceTraveled.toFixed(2);
    const endTime = new Date();
    
    // Prepare activity data
    const activityData = {
      id: Date.now().toString(), // Simple unique ID
      date: endTime.toISOString(),
      trailName: currentTrail ? currentTrail.name : 'Custom Hike',
      trailId: currentTrail ? currentTrail.id : null,
      distance: parseFloat(distance),
      duration: duration,
      durationMs: endTime - startTime,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      routeCoordinates: routeCoordinates,
      averagePace: formatPace(),
      maxElevation: location ? Math.round(location.coords.altitude || 0) : 0,
    };
    
    // Show completion dialog
    Alert.alert(
      "Hike Completed",
      `You hiked ${distance} km in ${duration}`,
      [
        {
          text: "Save Activity",
          onPress: () => {
            // Save the activity to storage
            saveActivityToHistory(activityData);
            Alert.alert("Success", "Your hike was saved to your history!");
            setActiveScreen('Home');
          }
        },
        {
          text: "Discard",
          style: "cancel",
          onPress: () => setActiveScreen('Home')
        }
      ]
    );
  };

  // Function to save activity to history
  const saveActivityToHistory = async (activityData) => {
    try {
      // Get existing history from AsyncStorage
      const existingHistoryJSON = await AsyncStorage.getItem('hikeHistory');
      let hikeHistory = existingHistoryJSON ? JSON.parse(existingHistoryJSON) : [];
      
      // Add new activity to history array
      hikeHistory.unshift(activityData); // Add to the beginning of the array
      
      // Save updated history back to AsyncStorage
      await AsyncStorage.setItem('hikeHistory', JSON.stringify(hikeHistory));
      
      console.log('Activity saved to history:', activityData.id);
    } catch (error) {
      console.error('Error saving activity to history:', error);
      Alert.alert('Error', 'Failed to save your activity. Please try again.');
    }
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };

  const formatDuration = (start, end) => {
    if (!start || !end) return '00:00:00';
    
    const durationMs = end - start;
    const seconds = Math.floor((durationMs / 1000) % 60);
    const minutes = Math.floor((durationMs / (1000 * 60)) % 60);
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatPace = () => {
    if (distanceTraveled <= 0) return '--:--';
    
    // Calculate time in minutes
    const timeMs = currentTime - startTime;
    const timeMinutes = timeMs / (1000 * 60);
    
    // Calculate pace (minutes per km)
    const pace = timeMinutes / distanceTraveled;
    const paceMinutes = Math.floor(pace);
    const paceSeconds = Math.floor((pace - paceMinutes) * 60);
    
    return `${paceMinutes}:${paceSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <IconButton 
          icon="arrow-left" 
          size={24} 
          color="#555"
          onPress={() => {
            if (isTracking) {
              Alert.alert(
                "End Tracking?",
                "Are you sure you want to end your tracking session?",
                [
                  {
                    text: "Continue Tracking",
                    style: "cancel"
                  },
                  {
                    text: "End Tracking",
                    onPress: stopTracking
                  }
                ]
              );
            } else {
              setActiveScreen('Home');
            }
          }}
        />
        <Title style={styles.headerTitle}>
          {currentTrail ? currentTrail.name : 'Track Your Hike'}
        </Title>
        <View style={{width: 40}} /> {/* Empty view for balance */}
      </View>
      
      {errorMsg ? (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="map-marker-off" size={40} color="#e53935" />
          <Text style={styles.errorText}>{errorMsg}</Text>
          <Button 
            mode="contained" 
            onPress={() => setActiveScreen('Home')}
            style={styles.goBackButton}
          >
            Go Back
          </Button>
        </View>
      ) : (
        <>
          {location ? (
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
              followsUserLocation={true}
              showsUserLocation={true}
              showsMyLocationButton={true}
            >
              {/* User's current position */}
              <Marker
                coordinate={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                }}
                title="Your location"
              >
                <View style={styles.markerContainer}>
                  <View style={styles.marker} />
                </View>
              </Marker>
              
              {/* Route line */}
              {routeCoordinates.length > 1 && (
                <Polyline
                  coordinates={routeCoordinates}
                  strokeColor="#FC5200" // Strava orange
                  strokeWidth={4}
                />
              )}
            </MapView>
          ) : (
            <View style={styles.loadingContainer}>
              <MaterialCommunityIcons name="map-search" size={40} color="#3c6e71" />
              <Text style={styles.loadingText}>Getting your location...</Text>
            </View>
          )}
          
          <Surface style={styles.statsContainer}>
            <View style={styles.statRow}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>DISTANCE</Text>
                <Text style={styles.statValue}>{distanceTraveled.toFixed(2)}</Text>
                <Text style={styles.statUnit}>kilometers</Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.stat}>
                <Text style={styles.statLabel}>DURATION</Text>
                <Text style={styles.statValue}>
                  {startTime && currentTime ? formatDuration(startTime, currentTime) : '00:00:00'}
                </Text>
                <Text style={styles.statUnit}>hh:mm:ss</Text>
              </View>
            </View>
            
            <View style={styles.statRow}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>PACE</Text>
                <Text style={styles.statValue}>{formatPace()}</Text>
                <Text style={styles.statUnit}>min/km</Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.stat}>
                <Text style={styles.statLabel}>ELEVATION</Text>
                <Text style={styles.statValue}>
                  {location ? Math.round(location.coords.altitude || 0) : 0}
                </Text>
                <Text style={styles.statUnit}>meters</Text>
              </View>
            </View>
          </Surface>
          
          <View style={styles.buttonContainer}>
            {!isTracking ? (
              <Button 
                mode="contained" 
                onPress={startTracking}
                style={styles.trackingButton}
                labelStyle={styles.buttonLabel}
                icon="play"
              >
                START TRACKING
              </Button>
            ) : (
              <Button 
                mode="contained" 
                onPress={stopTracking}
                style={[styles.trackingButton, styles.stopButton]}
                labelStyle={styles.buttonLabel}
                icon="stop"
              >
                FINISH HIKE
              </Button>
            )}
          </View>
        </>
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
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 20,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  goBackButton: {
    marginTop: 20,
    backgroundColor: '#3c6e71',
  },
  markerContainer: {
    height: 24,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    height: 16,
    width: 16,
    borderRadius: 8,
    backgroundColor: '#FC5200',
    borderWidth: 3,
    borderColor: '#fff',
  },
  statsContainer: {
    backgroundColor: '#fff',
    padding: 12,
    margin: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#eee',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FC5200',
    marginBottom: 2,
  },
  statUnit: {
    fontSize: 10,
    color: '#999',
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  trackingButton: {
    backgroundColor: '#FC5200',
    borderRadius: 8,
    paddingVertical: 8,
  },
  stopButton: {
    backgroundColor: '#E53935',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TrackingScreen;