import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

const DRAFT_PHOTO_KEY = '@ruasegura:draft-photo-uri';

export default function CapturePhotoScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);

  const takePhoto = async () => {
    if (!cameraRef.current || isTakingPhoto) {
      return;
    }

    setIsTakingPhoto(true);
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.75 });

    if (photo?.uri) {
      await AsyncStorage.setItem(DRAFT_PHOTO_KEY, photo.uri);
      router.back();
    }

    setIsTakingPhoto(false);
  };

  if (!permission) {
    return <SafeAreaView style={styles.safeArea} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionScreen}>
        <Ionicons name="camera-outline" size={42} color="#0F766E" />
        <Text style={styles.permissionTitle}>Acesso a camera</Text>
        <Text style={styles.permissionText}>
          Permita o uso da camera para tirar uma foto da avaria.
        </Text>
        <Pressable accessibilityRole="button" onPress={requestPermission} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Permitir camera</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.cameraScreen}>
      <CameraView ref={cameraRef} facing="back" style={styles.camera} />
      <SafeAreaView style={styles.overlay}>
        <Pressable
          accessibilityLabel="Voltar ao formulario"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>

        <View style={styles.captureArea}>
          <Pressable
            accessibilityLabel="Tirar foto"
            accessibilityRole="button"
            disabled={isTakingPhoto}
            onPress={takePhoto}
            style={styles.captureButton}>
            <Ionicons name="camera" size={34} color="#0F766E" />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraScreen: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 36,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: 8,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  captureArea: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  captureButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 38,
    height: 76,
    justifyContent: 'center',
    width: 76,
  },
  permissionScreen: {
    alignItems: 'center',
    backgroundColor: '#F4F7F6',
    flex: 1,
    gap: 14,
    justifyContent: 'center',
    padding: 24,
  },
  permissionTitle: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '800',
  },
  permissionText: {
    color: '#475569',
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#0F766E',
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 18,
    width: '100%',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
