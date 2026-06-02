import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  InteractionManager,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { useAppTheme } from '@/lib/app-theme';
import { getReportTitle, getReportsRegion } from '@/lib/damage-reports';
import { createReport } from '../../service/api';

type DamageReport = {
  id: string;
  problems: string[];
  otherProblem: string;
  location: string;
  coordinates: SelectedLocation | null;
  photoUri: string;
  author: string;
  details: string;
  createdAt: string;
};

type SelectedLocation = {
  latitude: number;
  longitude: number;
};

const STORAGE_KEY = '@ruasegura:damage-reports';
const CURRENT_USER_KEY = '@ruasegura:current-user';
const CURRENT_USER_EMAIL_KEY = '@ruasegura:current-email';
const DRAFT_PHOTO_KEY = '@ruasegura:draft-photo-uri';
const DRAFT_LOCATION_KEY = '@ruasegura:draft-location';
const NOTIFICATION_SHOWN_PREFIX = '@ruasegura:records-reminder-shown:';

const DEFAULT_REGION = {
  latitude: -23.55052,
  longitude: -46.633308,
  latitudeDelta: 0.025,
  longitudeDelta: 0.025,
};

const problemOptions = [
  'Buraco na rua',
  'Postes sem luz',
  'Cal\u00e7ada/rua danificada',
  'Lixo espalhado',
  'Outro',
];

export default function HomeScreen() {
  const { isDark } = useAppTheme();
  const successOpacity = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const [isRegisteringDamage, setIsRegisteringDamage] = useState(false);
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [otherProblem, setOtherProblem] = useState('');
  const [location, setLocation] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  const [photoUri, setPhotoUri] = useState('');
  const [author, setAuthor] = useState('Morador');
  const [details, setDetails] = useState('');
  const [sentReport, setSentReport] = useState(false);
  const [regionPreview, setRegionPreview] = useState<Region>(DEFAULT_REGION);
  const [reports, setReports] = useState<DamageReport[]>([]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
    await AsyncStorage.removeItem(CURRENT_USER_EMAIL_KEY);
    router.replace('/');
  };

  useEffect(() => {
    if (!sentReport) {
      successOpacity.setValue(0);
      return;
    }

    successOpacity.setValue(1);

    const animation = Animated.timing(successOpacity, {
      duration: 2000,
      toValue: 0,
      useNativeDriver: true,
    });

    animation.start(({ finished }) => {
      if (finished) {
        setSentReport(false);
      }
    });

    return () => animation.stop();
  }, [sentReport, successOpacity]);

  useFocusEffect(
    useCallback(() => {
      let notificationId: string | undefined;
      let isActive = true;

      async function loadDraftFields() {
        const [draftPhotoUri, draftLocation, currentUser] = await Promise.all([
          AsyncStorage.getItem(DRAFT_PHOTO_KEY),
          AsyncStorage.getItem(DRAFT_LOCATION_KEY),
          AsyncStorage.getItem(CURRENT_USER_KEY),
        ]);

        if (!isActive) {
          return;
        }

        if (draftPhotoUri) {
          setPhotoUri(draftPhotoUri);
        }

        if (draftLocation) {
          try {
            setSelectedLocation(JSON.parse(draftLocation) as SelectedLocation);
          } catch {
            setSelectedLocation(null);
          }
        }

        if (currentUser) {
          setAuthor(currentUser);
        }
      }

      async function scheduleRecordsReminder() {
        const [currentReports, currentUser] = await Promise.all([
          getStoredReports(),
          AsyncStorage.getItem(CURRENT_USER_KEY),
        ]);
        const userForNotification = currentUser || 'Morador';
        const reminderKey = `${NOTIFICATION_SHOWN_PREFIX}${userForNotification}`;
        const alreadyShown = await AsyncStorage.getItem(reminderKey);

        if (currentReports.length === 0 || alreadyShown === 'true') {
          return;
        }

        const canNotify = await ensureNotificationPermission();

        if (!canNotify) {
          return;
        }

        await AsyncStorage.setItem(reminderKey, 'true');
        notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'RuaSegura',
            body: 'veja os registros ja feitos',
            data: { url: '/registros' },
            priority: Notifications.AndroidNotificationPriority.MAX,
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            channelId: 'registros-alertas',
            seconds: 5,
          },
        });
      }

      async function loadRegionPreview() {
        const currentReports = await getStoredReports();

        if (!isActive) {
          return;
        }

        setReports(currentReports);

        const reportsRegion = getReportsRegion(currentReports);

        if (reportsRegion) {
          setRegionPreview(reportsRegion);
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

        setRegionPreview({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.025,
          longitudeDelta: 0.025,
        });
      }

      scheduleRecordsReminder();
      loadDraftFields();
      loadRegionPreview();

      return () => {
        isActive = false;

        if (notificationId) {
          Notifications.cancelScheduledNotificationAsync(notificationId);
        }
      };
    }, []),
  );

  const scrollToFormEnd = useCallback(() => {
    InteractionManager.runAfterInteractions(() => {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 250);
    });
  }, []);

  const toggleProblem = (problem: string) => {
    setSentReport(false);
    setSelectedProblems((current) =>
      current.includes(problem)
        ? current.filter((item) => item !== problem)
        : [...current, problem],
    );
  };

  const handleSubmitReport = async () => {
    const currentReports = await getStoredReports();
    const createdAt = new Date().toISOString();
    const newReport: DamageReport = {
      id: `${Date.now()}`,
      problems: selectedProblems,
      otherProblem: otherProblem.trim(),
      location: location.trim(),
      coordinates: selectedLocation,
      photoUri,
      author,
      details: details.trim(),
      createdAt,
    };

    const apiPayload: Record<string, any> = {
      problems: selectedProblems,
      otherProblem: otherProblem.trim(),
      location: location.trim(),
      photoUri,
      author,
      details: details.trim(),
      createdAt,
    };

    if (selectedLocation) {
      apiPayload.latitude = selectedLocation.latitude;
      apiPayload.longitude = selectedLocation.longitude;
    }

    const currentUserEmail = await AsyncStorage.getItem(CURRENT_USER_EMAIL_KEY);

    try {
      await createReport(apiPayload, currentUserEmail ?? undefined);
    } catch (error) {
      console.warn('Falha ao enviar para API:', error);
    }

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([newReport, ...currentReports]));
    setReports([newReport, ...currentReports]);
    await AsyncStorage.multiRemove([DRAFT_PHOTO_KEY, DRAFT_LOCATION_KEY]);
    resetReport();
    setSentReport(true);
    setIsRegisteringDamage(false);
  };

  const resetReport = () => {
    setSelectedProblems([]);
    setOtherProblem('');
    setLocation('');
    setSelectedLocation(null);
    setPhotoUri('');
    setDetails('');
    setSentReport(false);
  };

  const locationLabel = selectedLocation
    ? `${selectedLocation.latitude.toFixed(6)}, ${selectedLocation.longitude.toFixed(6)}`
    : '';
  const themeKey = isDark ? 'dark' : 'light';
  const screenColors = {
    background: isDark ? '#0F172A' : '#F4F7F6',
    card: isDark ? '#1E293B' : '#FFFFFF',
    emptyPreview: isDark ? '#0F172A' : '#F8FAFC',
    input: isDark ? '#0F172A' : '#FFFFFF',
    inputBorder: isDark ? '#334155' : '#D1D5DB',
    previewBorder: isDark ? '#334155' : '#CBD5E1',
    secondaryButton: isDark ? '#0F172A' : '#FFFFFF',
  };
  const cardStyle = [styles.cardBase, { backgroundColor: screenColors.card }];
  const inputStyle = [
    styles.input,
    {
      backgroundColor: screenColors.input,
      borderColor: screenColors.inputBorder,
      color: isDark ? '#F8FAFC' : '#111827',
    },
  ];
  const textAreaStyle = [...inputStyle, styles.textArea];
  const secondaryButtonStyle = [
    styles.secondaryButton,
    { backgroundColor: screenColors.secondaryButton },
  ];
  const emptyPreviewStyle = [
    styles.emptyPhotoPreview,
    {
      backgroundColor: screenColors.emptyPreview,
      borderColor: screenColors.previewBorder,
    },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: screenColors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.container}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled">
        <View style={styles.topBar}>
          <View>
            <Text style={[styles.greeting, isDark && styles.titleDark]}>Registrar</Text>
            <Text style={[styles.sectionHint, isDark && styles.subtitleDark]}>
              Use o app para avisar problemas na sua rua.
            </Text>
          </View>
          <Pressable onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="exit-outline" size={24} color="#0F766E" />
            <Text style={styles.logoutText}>Sair</Text>
          </Pressable>
        </View>

        {!isRegisteringDamage ? (
          <View style={styles.homeContent}>
            <View style={[cardStyle, styles.homePanel]}>
              <View style={[styles.panelIcon, isDark && styles.panelIconDark]}>
                <Ionicons name="construct" size={34} color="#0F766E" />
              </View>
              <Text style={[styles.panelTitle, isDark && styles.titleDark]}>Registrar avaria</Text>
              <Text style={[styles.panelDescription, isDark && styles.bodyDark]}>
                {
                  'Informe buracos, postes sem luz, cal\u00e7adas danificadas, lixo espalhado ou outro problema urbano.'
                }
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  resetReport();
                  setIsRegisteringDamage(true);
                }}
                style={styles.primaryButton}>
                <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Registrar avaria</Text>
              </Pressable>
              {sentReport && (
                <Animated.View style={[styles.successBox, { opacity: successOpacity }]}>
                  <Ionicons name="checkmark-circle" size={20} color="#0F766E" />
                  <Text style={styles.successText}>Registro enviado.</Text>
                </Animated.View>
              )}
            </View>

            <View style={[cardStyle, styles.regionPanel]}>
              <View>
                <Text style={[styles.panelTitle, isDark && styles.titleDark]}>Mapa</Text>
                <Text style={[styles.sectionHint, isDark && styles.subtitleDark]}>
                  {'Visualizar mapa da regi\u00e3o'}
                </Text>
              </View>
              <View style={styles.regionMapPreview}>
                <MapView
                  pointerEvents="none"
                  region={regionPreview}
                  showsUserLocation
                  style={StyleSheet.absoluteFill}>
                  {reports.map((report) =>
                    report.coordinates ? (
                      <Marker
                        coordinate={report.coordinates}
                        key={report.id}
                        title={getReportTitle(report)}
                      />
                    ) : null,
                  )}
                </MapView>
              </View>
            </View>
          </View>
        ) : (
          <View key={`form-${themeKey}`} style={[cardStyle, styles.formPanel]}>
            <View style={styles.formHeader}>
              <View>
                <Text style={[styles.panelTitle, isDark && styles.titleDark]}>Qual o problema?</Text>
                <Text style={[styles.sectionHint, isDark && styles.subtitleDark]}>
                  {'Marque uma ou mais op\u00e7\u00f5es.'}
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Fechar formulario"
                accessibilityRole="button"
                onPress={() => setIsRegisteringDamage(false)}
                style={[styles.iconButton, isDark && styles.iconButtonDark]}>
                <Ionicons name="close" size={22} color={isDark ? '#F8FAFC' : '#1F2937'} />
              </Pressable>
            </View>

            <View style={styles.optionList}>
              {problemOptions.map((problem) => {
                const isSelected = selectedProblems.includes(problem);

                return (
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                    key={problem}
                    onPress={() => toggleProblem(problem)}
                    style={[
                      styles.problemOption,
                      isDark && styles.problemOptionDark,
                      isSelected && styles.problemOptionSelected,
                      isSelected && isDark && styles.problemOptionSelectedDark,
                    ]}>
                    <Ionicons
                      name={isSelected ? 'checkbox' : 'square-outline'}
                      size={24}
                      color={isSelected ? '#0F766E' : '#64748B'}
                    />
                    <Text style={[styles.problemText, isDark && styles.titleDark]}>{problem}</Text>
                  </Pressable>
                );
              })}
            </View>

            {selectedProblems.includes('Outro') && (
              <TextInput
                multiline
                onChangeText={setOtherProblem}
                placeholder="Descreva o que aconteceu"
                placeholderTextColor={isDark ? '#94A3B8' : '#6B7280'}
                style={textAreaStyle}
                value={otherProblem}
              />
            )}

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, isDark && styles.titleDark]}>Foto da avaria</Text>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.photoPreview} />
              ) : (
                <View style={emptyPreviewStyle}>
                  <Ionicons name="camera-outline" size={28} color="#64748B" />
                  <Text style={[styles.emptyPhotoText, isDark && styles.subtitleDark]}>
                    Nenhuma foto adicionada.
                  </Text>
                </View>
              )}
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/capturar-foto')}
                style={secondaryButtonStyle}>
                <Ionicons name="camera" size={18} color="#0F766E" />
                <Text style={styles.secondaryButtonText}>Abrir camera</Text>
              </Pressable>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, isDark && styles.titleDark]}>
                {'Localiza\u00e7\u00e3o'}
              </Text>
              <View style={styles.mapPreview}>
                {selectedLocation ? (
                  <MapView
                    pointerEvents="none"
                    region={{
                      latitude: selectedLocation.latitude,
                      longitude: selectedLocation.longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                    style={StyleSheet.absoluteFill}>
                    <Marker coordinate={selectedLocation} />
                  </MapView>
                ) : (
                  <View
                    style={[
                      styles.emptyMapPreview,
                      {
                        backgroundColor: screenColors.emptyPreview,
                        borderColor: screenColors.previewBorder,
                      },
                    ]}>
                    <Ionicons name="map-outline" size={28} color="#64748B" />
                    <Text style={[styles.emptyPhotoText, isDark && styles.subtitleDark]}>
                      Escolha um ponto no mapa.
                    </Text>
                  </View>
                )}
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/escolher-localizacao')}
                style={secondaryButtonStyle}>
                <Ionicons name="expand" size={18} color="#0F766E" />
                <Text style={styles.secondaryButtonText}>Exibir em tela cheia</Text>
              </Pressable>
            </View>

            <TextInput
              onChangeText={setLocation}
              placeholder={'Localiza\u00e7\u00e3o'}
              placeholderTextColor={isDark ? '#94A3B8' : '#6B7280'}
              style={inputStyle}
              value={locationLabel || location}
              editable={!selectedLocation}
              onFocus={scrollToFormEnd}
            />
            <TextInput
              multiline
              onChangeText={setDetails}
              onFocus={scrollToFormEnd}
              placeholder="Detalhes adicionais"
              placeholderTextColor={isDark ? '#94A3B8' : '#6B7280'}
              style={textAreaStyle}
              value={details}
            />

            <Pressable
              accessibilityRole="button"
              disabled={selectedProblems.length === 0}
              onPress={handleSubmitReport}
              style={[styles.primaryButton, selectedProblems.length === 0 && styles.buttonDisabled]}>
              <Ionicons name="send" size={18} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Enviar registro</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

async function getStoredReports() {
  const storedReports = await AsyncStorage.getItem(STORAGE_KEY);

  if (!storedReports) {
    return [];
  }

  try {
    return JSON.parse(storedReports) as DamageReport[];
  } catch {
    return [];
  }
}

async function ensureNotificationPermission() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('registros-alertas', {
      name: 'Registros',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F7F6',
  },
  keyboardView: {
    flex: 1,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
    borderRadius: 8,
    borderWidth: 1,
    color: '#111827',
    fontSize: 16,
    marginBottom: 12,
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#0F766E',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#0F766E',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    color: '#0F766E',
    fontSize: 15,
    fontWeight: '800',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  greeting: {
    color: '#111827',
    fontSize: 26,
    fontWeight: '800',
  },
  sectionHint: {
    color: '#64748B',
    fontSize: 15,
    lineHeight: 21,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  logoutButton: {
    alignItems: 'center',
    gap: 4,
  },
  logoutText: {
    color: '#0F766E',
    fontSize: 12,
    fontWeight: '600',
  },
  cardBase: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  homePanel: {
    gap: 14,
    padding: 20,
  },
  homeContent: {
    gap: 14,
  },
  regionPanel: {
    gap: 12,
    padding: 16,
  },
  regionMapPreview: {
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    height: 260,
    overflow: 'hidden',
  },
  formPanel: {
    padding: 18,
  },
  panelIcon: {
    alignItems: 'center',
    backgroundColor: '#CCFBF1',
    borderRadius: 8,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  panelTitle: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '800',
  },
  panelDescription: {
    color: '#475569',
    fontSize: 16,
    lineHeight: 23,
  },
  successBox: {
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    padding: 12,
  },
  successText: {
    color: '#0F766E',
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  formHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  optionList: {
    gap: 10,
    marginBottom: 12,
  },
  problemOption: {
    alignItems: 'center',
    borderColor: '#CBD5E1',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 12,
  },
  problemOptionSelected: {
    backgroundColor: '#ECFDF5',
    borderColor: '#0F766E',
  },
  problemText: {
    color: '#1F2937',
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  fieldGroup: {
    gap: 10,
    marginBottom: 12,
  },
  fieldLabel: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '800',
  },
  photoPreview: {
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    height: 180,
    width: '100%',
  },
  emptyPhotoPreview: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    height: 140,
    justifyContent: 'center',
  },
  emptyPhotoText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '700',
  },
  mapPreview: {
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    height: 160,
    overflow: 'hidden',
  },
  emptyMapPreview: {
    alignItems: 'center',
    flex: 1,
    gap: 8,
    justifyContent: 'center',
  },
  safeAreaDark: {
    backgroundColor: '#0F172A',
  },
  cardDark: {
    backgroundColor: '#1E293B',
  },
  inputDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
    color: '#F8FAFC',
  },
  secondaryButtonDark: {
    backgroundColor: '#0F172A',
    borderColor: '#0F766E',
  },
  iconButtonDark: {
    backgroundColor: '#334155',
  },
  panelIconDark: {
    backgroundColor: '#134E4A',
  },
  problemOptionDark: {
    borderColor: '#334155',
  },
  problemOptionSelectedDark: {
    backgroundColor: '#134E4A',
  },
  emptyPreviewDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
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
