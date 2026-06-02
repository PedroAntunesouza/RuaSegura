import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';

import {
  DamageReport,
  getReportTitle,
  getReportsRegion,
  getStoredReports,
} from '@/lib/damage-reports';
import { useAppTheme } from '@/lib/app-theme';

const DEFAULT_REGION = {
  latitude: -23.55052,
  longitude: -46.633308,
  latitudeDelta: 0.018,
  longitudeDelta: 0.018,
};

export default function DetailedMapScreen() {
  const { isDark } = useAppTheme();
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [reports, setReports] = useState<DamageReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<DamageReport | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadMapData() {
        const currentReports = await getStoredReports();

        if (!isActive) {
          return;
        }

        setReports(currentReports);
        setSelectedReport(null);

        const reportsRegion = getReportsRegion(currentReports);

        if (reportsRegion) {
          setRegion(reportsRegion);
          return;
        }

        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});

        if (!isActive) {
          return;
        }

        setRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.018,
          longitudeDelta: 0.018,
        });
      }

      loadMapData();

      return () => {
        isActive = false;
      };
    }, []),
  );

  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.safeAreaDark]}>
      <View style={[styles.mapFrame, isDark && styles.mapFrameDark]}>
        <MapView
          onPress={() => setSelectedReport(null)}
          onRegionChangeComplete={setRegion}
          region={region}
          showsUserLocation
          style={StyleSheet.absoluteFill}>
          {reports.map((report) =>
            report.coordinates ? (
              <Marker
                coordinate={report.coordinates}
                key={report.id}
                onPress={(event) => {
                  event.stopPropagation();
                  setSelectedReport(report);
                }}
                title={getReportTitle(report)}
              />
            ) : null,
          )}
        </MapView>

        {selectedReport ? (
          <View style={[styles.reportPanel, isDark && styles.reportPanelDark]}>
            <View style={styles.reportPanelHeader}>
              <Text style={[styles.reportPanelTitle, isDark && styles.titleDark]}>
                {getReportTitle(selectedReport)}
              </Text>
              <Pressable
                accessibilityLabel="Fechar detalhes do registro"
                accessibilityRole="button"
                onPress={() => setSelectedReport(null)}
                style={[styles.closeButton, isDark && styles.closeButtonDark]}>
                <Ionicons name="close" size={18} color={isDark ? '#F8FAFC' : '#111827'} />
              </Pressable>
            </View>
            {selectedReport.problems.length > 0 ? (
              <Text style={styles.reportPanelMeta}>
                Problema: {selectedReport.problems.join(', ')}
              </Text>
            ) : null}
            {selectedReport.photoUri ? (
              <Image source={{ uri: selectedReport.photoUri }} style={styles.reportImage} />
            ) : null}
            {selectedReport.details ? (
              <Text style={[styles.reportPanelText, isDark && styles.bodyDark]}>
                {selectedReport.details}
              </Text>
            ) : null}
            {selectedReport.location ? (
              <Text style={[styles.reportPanelText, isDark && styles.bodyDark]}>
                {selectedReport.location}
              </Text>
            ) : null}
            {selectedReport.coordinates ? (
              <Text style={styles.reportPanelMeta}>
                {selectedReport.coordinates.latitude.toFixed(6)},{' '}
                {selectedReport.coordinates.longitude.toFixed(6)}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F4F7F6',
    flex: 1,
    paddingBottom: 12,
    paddingHorizontal: 12,
    paddingTop: 32,
  },
  mapFrame: {
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    flex: 1,
    overflow: 'hidden',
  },
  reportPanel: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D8E3DF',
    borderRadius: 8,
    borderWidth: 1,
    bottom: 14,
    left: 14,
    padding: 14,
    position: 'absolute',
    right: 14,
  },
  reportPanelHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  reportPanelTitle: {
    color: '#111827',
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 23,
  },
  reportPanelText: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  reportImage: {
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    height: 150,
    marginTop: 10,
    width: '100%',
  },
  reportPanelMeta: {
    color: '#0F766E',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 8,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderRadius: 8,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  safeAreaDark: {
    backgroundColor: '#0F172A',
  },
  mapFrameDark: {
    backgroundColor: '#1E293B',
  },
  reportPanelDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  closeButtonDark: {
    backgroundColor: '#334155',
    borderColor: '#475569',
  },
  titleDark: {
    color: '#F8FAFC',
  },
  bodyDark: {
    color: '#CBD5E1',
  },
});
