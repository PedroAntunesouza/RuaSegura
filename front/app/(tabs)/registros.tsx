import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DamageReport, getStoredReports } from '@/lib/damage-reports';
import { useAppTheme } from '@/lib/app-theme';

export default function MyRecordsScreen() {
  const { isDark } = useAppTheme();
  const [reports, setReports] = useState<DamageReport[]>([]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadReports() {
        const parsedReports = await getStoredReports();

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
    <SafeAreaView style={[styles.safeArea, isDark && styles.safeAreaDark]}>
      <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.topBar}>
            <View style={styles.titleGroup}>
              <Text style={[styles.title, isDark && styles.titleDark]}>Registros</Text>
              <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
                Acompanhe os registros feitos.
              </Text>
            </View>
          </View>

          {reports.length === 0 ? (
            <View style={[styles.emptyPanel, isDark && styles.cardDark]}>
              <Ionicons name="document-text-outline" size={36} color="#64748B" />
              <Text style={[styles.emptyTitle, isDark && styles.titleDark]}>
                Nenhum registro ainda foi feito.
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {reports.map((report) => (
                <View key={report.id} style={[styles.reportCard, isDark && styles.cardDark]}>
                  {report.photoUri ? (
                    <Image source={{ uri: report.photoUri }} style={styles.reportImage} />
                  ) : null}

                  <View style={styles.authorRow}>
                    <Ionicons name="person-circle-outline" size={18} color="#0F766E" />
                    <Text style={styles.authorText}>Registrado por {report.author || 'Morador'}</Text>
                  </View>

                  <View style={styles.reportHeader}>
                    <Text style={[styles.reportTitle, isDark && styles.titleDark]}>
                      {report.problems.join(', ')}
                    </Text>
                    <Text style={[styles.reportDate, isDark && styles.subtitleDark]}>
                      {formatDate(report.createdAt)}
                    </Text>
                  </View>

                  {report.otherProblem ? (
                    <Text style={[styles.reportText, isDark && styles.bodyDark]}>
                      {report.otherProblem}
                    </Text>
                  ) : null}
                  {report.location ? (
                    <View style={styles.infoRow}>
                      <Ionicons name="location-outline" size={16} color="#64748B" />
                      <Text style={[styles.reportText, isDark && styles.bodyDark]}>
                        {report.location}
                      </Text>
                    </View>
                  ) : null}
                  {report.coordinates ? (
                    <View style={styles.infoRow}>
                      <Ionicons name="navigate-outline" size={16} color="#64748B" />
                      <Text style={[styles.reportText, isDark && styles.bodyDark]}>
                        {report.coordinates.latitude.toFixed(6)}, {report.coordinates.longitude.toFixed(6)}
                      </Text>
                    </View>
                  ) : null}
                  {report.details ? (
                    <Text style={[styles.reportText, isDark && styles.bodyDark]}>{report.details}</Text>
                  ) : null}
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
    paddingBottom: 96,
    paddingHorizontal: 20,
    paddingTop: 32,
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
  safeAreaDark: {
    backgroundColor: '#0F172A',
  },
  cardDark: {
    backgroundColor: '#1E293B',
  },
  titleDark: {
    color: '#F8FAFC',
  },
  subtitleDark: {
    color: '#94A3B8',
  },
  bodyDark: {
    color: '#CBD5E1',
  },
});
