import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getReports, getReportsByAuthor } from '../../service/api';
import { useAppTheme } from '@/lib/app-theme';

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
const CURRENT_USER_KEY = '@ruasegura:current-user';
const CURRENT_USER_EMAIL_KEY = '@ruasegura:current-email';

export default function RegistrosScreen() {
  const { isDark, toggleTheme } = useAppTheme();
  const [reports, setReports] = useState<DamageReport[]>([]);
  const [profile, setProfile] = useState({
    email: '',
    name: 'Morador',
  });

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadReports() {
        const [currentUser, currentEmail] = await Promise.all([
          AsyncStorage.getItem(CURRENT_USER_KEY),
          AsyncStorage.getItem(CURRENT_USER_EMAIL_KEY),
        ]);
        let fetchedReports: DamageReport[] = [];

        try {
          const rawReports = currentUser
            ? await getReportsByAuthor(currentUser)
            : await getReports();

          fetchedReports = (rawReports || []).map((item: any) => ({
            id: item.id?.toString() ?? `${Date.now()}`,
            problems: item.problems ?? [],
            otherProblem: item.otherProblem ?? '',
            location: item.location ?? '',
            coordinates: item.latitude != null && item.longitude != null
              ? { latitude: item.latitude, longitude: item.longitude }
              : null,
            photoUri: item.photoUri ?? '',
            author: item.author ?? 'Morador',
            details: item.details ?? '',
            createdAt: item.createdAt ?? item.date ?? new Date().toISOString(),
          }));
        } catch (error) {
          console.warn('Falha ao carregar registros da API, usando local storage:', error);
          const storedReports = await AsyncStorage.getItem(STORAGE_KEY);
          try {
            fetchedReports = storedReports ? (JSON.parse(storedReports) as DamageReport[]) : [];
          } catch {
            fetchedReports = [];
          }
        }

        if (isActive) {
          setReports(fetchedReports);
          setProfile({
            email: currentEmail ?? '',
            name: currentUser ?? 'Morador',
          });
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
            <Text style={[styles.title, isDark && styles.titleDark]}>Meu perfil</Text>
            <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
              Veja seus dados e acompanhe as avarias que voce enviou.
            </Text>
          </View>
          <Pressable
            accessibilityLabel={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
            accessibilityRole="button"
            onPress={toggleTheme}
            style={[styles.themeButton, isDark && styles.themeButtonDark]}>
            <Ionicons
              name={isDark ? 'moon' : 'sunny-outline'}
              size={23}
              color={isDark ? '#F8FAFC' : '#0F766E'}
            />
          </Pressable>
        </View>

        <View style={[styles.profileCard, isDark && styles.cardDark]}>
          <View style={[styles.profileIcon, isDark && styles.profileIconDark]}>
            <Ionicons name="person-circle-outline" size={52} color="#0F766E" />
          </View>

          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, isDark && styles.titleDark]}>{profile.name}</Text>
            <Text style={[styles.profileEmail, isDark && styles.bodyDark]}>
              {profile.email || 'Email nao informado'}
            </Text>
            <Text style={styles.profileCount}>
              {reports.length} {reports.length === 1 ? 'registro feito' : 'registros feitos'}
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
    padding: 20,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
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
  themeButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  themeButtonDark: {
    backgroundColor: '#1E293B',
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 14,
    marginBottom: 14,
    padding: 16,
  },
  profileIcon: {
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    height: 68,
    justifyContent: 'center',
    width: 68,
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  profileName: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 25,
  },
  profileEmail: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
  },
  profileCount: {
    color: '#0F766E',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
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
  profileIconDark: {
    backgroundColor: '#134E4A',
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
