import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import MapView, { MapPressEvent, Marker, Region } from 'react-native-maps';

type SelectedLocation = {
  latitude: number;
  longitude: number;
};

const DRAFT_LOCATION_KEY = '@ruasegura:draft-location';

const DEFAULT_REGION = {
  latitude: -23.55052,
  longitude: -46.633308,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export default function ChooseLocationScreen() {
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    async function loadCurrentLocation() {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setPermissionDenied(true);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});

      setRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }

    loadCurrentLocation();
  }, []);

  const handleMapPress = (event: MapPressEvent) => {
    setSelectedLocation(event.nativeEvent.coordinate);
  };

  const chooseLocation = async () => {
    if (!selectedLocation) {
      return;
    }

    await AsyncStorage.setItem(DRAFT_LOCATION_KEY, JSON.stringify(selectedLocation));
    router.back();
  };

  return (
    <View style={styles.screen}>
      <MapView
        initialRegion={region}
        onRegionChangeComplete={setRegion}
        onPress={handleMapPress}
        region={region}
        showsUserLocation
        style={styles.map}>
        {selectedLocation && <Marker coordinate={selectedLocation} />}
      </MapView>

      <SafeAreaView style={styles.overlay}>
        <View style={styles.topControls}>
          <Pressable
            accessibilityLabel="Voltar ao formulario"
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </Pressable>

          <View style={styles.locationCard}>
            <Text style={styles.cardTitle}>Local escolhido</Text>
            {selectedLocation ? (
              <Text style={styles.coordinates}>
                {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
              </Text>
            ) : (
              <Text style={styles.cardHint}>
                {permissionDenied
                  ? 'Permissao de localizacao negada. Toque no mapa para escolher.'
                  : 'Toque no mapa para posicionar a agulha.'}
              </Text>
            )}
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={!selectedLocation}
          onPress={chooseLocation}
          style={[styles.chooseButton, !selectedLocation && styles.buttonDisabled]}>
          <Text style={styles.chooseButtonText}>{'Escolher localiza\u00e7\u00e3o'}</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  topControls: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  locationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    flex: 1,
    gap: 4,
    padding: 12,
  },
  cardTitle: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '800',
  },
  coordinates: {
    color: '#0F766E',
    fontSize: 14,
    fontWeight: '800',
  },
  cardHint: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 18,
  },
  chooseButton: {
    alignItems: 'center',
    backgroundColor: '#0F766E',
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 18,
  },
  chooseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
