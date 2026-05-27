import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

type DamageReport = {
  id: string;
  problems: string[];
  otherProblem: string;
  location: string;
  coordinates: {
    latitude: number;
    longitude: number;
  } | null;
  photoUri: string;
  author: string;
  details: string;
  createdAt: string;
};

const STORAGE_KEY = '@ruasegura:damage-reports';

export default function RegistrosScreen() {
  const [reports, setReports] = useState<DamageReport[]>([]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadReports() {
        const storedReports = await AsyncStorage.getItem(STORAGE_KEY);
        let parsedReports: DamageReport[] = [];

        try {
          parsedReports = storedReports ? (JSON.parse(storedReports) as DamageReport[]) : [];
        } catch {
          parsedReports = [];
        }

        if (isActive) {
          setReports(parsedReports);
        }
      }

      loadReports();

      return () => {
        isActive = false;
      };
    }, []),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topBar}>
          <View style={styles.titleGroup}>
            <Text style={styles.title}>Registros</Text>
            <Text style={styles.subtitle}>Acompanhe as avarias que voce enviou.</Text>
          </View>
        </View>

        {reports.length === 0 ? (
          <View style={styles.emptyPanel}>
            <Ionicons name="document-text-outline" size={36} color="#64748B" />
            <Text style={styles.emptyTitle}>Nenhum registro ainda foi feito.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {reports.map((report) => (
              <View key={report.id} style={styles.reportCard}>
                {report.photoUri ? (
                  <Image source={{ uri: report.photoUri }} style={styles.reportImage} />
                ) : null}

                <View style={styles.authorRow}>
                  <Ionicons name="person-circle-outline" size={18} color="#0F766E" />
                  <Text style={styles.authorText}>Registrado por {report.author || 'Morador'}</Text>
                </View>

                <View style={styles.reportHeader}>
                  <Text style={styles.reportTitle}>{report.problems.join(', ')}</Text>
                  <Text style={styles.reportDate}>{formatDate(report.createdAt)}</Text>
                </View>

                {report.otherProblem ? (
                  <Text style={styles.reportText}>{report.otherProblem}</Text>
                ) : null}
                {report.location ? (
                  <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={16} color="#64748B" />
                    <Text style={styles.reportText}>{report.location}</Text>
                  </View>
                ) : null}
                {report.coordinates ? (
                  <View style={styles.infoRow}>
                    <Ionicons name="navigate-outline" size={16} color="#64748B" />
                    <Text style={styles.reportText}>
                      {report.coordinates.latitude.toFixed(6)}, {report.coordinates.longitude.toFixed(6)}
                    </Text>
                  </View>
                ) : null}
                {report.details ? <Text style={styles.reportText}>{report.details}</Text> : null}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
  }).format(new Date(date));
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F7F6',
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 20,
  },
  titleGroup: {
    flex: 1,
  },
  title: {
    color: '#111827',
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: '#64748B',
    fontSize: 15,
    lineHeight: 21,
  },
  emptyPanel: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    gap: 12,
    justifyContent: 'center',
    minHeight: 220,
    padding: 24,
  },
  emptyTitle: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  list: {
    gap: 12,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    gap: 10,
    padding: 16,
  },
  reportImage: {
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    height: 180,
    width: '100%',
  },
  authorRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  authorText: {
    color: '#0F766E',
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
  },
  reportHeader: {
    gap: 6,
  },
  reportTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
  reportDate: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  reportText: {
    color: '#475569',
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
  },
});
