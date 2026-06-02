import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
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

type AuthMode = 'login' | 'cadastro';

const CURRENT_USER_KEY = '@ruasegura:current-user';
const CURRENT_USER_EMAIL_KEY = '@ruasegura:current-email';

export default function AuthScreen() {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleAuth = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password.trim() || (authMode === 'cadastro' && !userName.trim())) {
      Alert.alert('Erro', 'Preencha todos os dados.');
      return;
    }

    if (authMode === 'cadastro' && !trimmedEmail.includes('@')) {
      Alert.alert('Erro no cadastro', 'Digite um email valido.');
      return;
    }

    if (authMode === 'cadastro' && password.length < 5) {
      Alert.alert('Erro no cadastro', 'A senha precisa ter no minimo 5 caracteres.');
      return;
    }

    const fallbackName = trimmedEmail ? trimmedEmail.split('@')[0] : 'Morador';
    const currentUser = authMode === 'cadastro' && userName.trim() ? userName.trim() : fallbackName;

    await AsyncStorage.setItem(CURRENT_USER_KEY, currentUser);
    await AsyncStorage.setItem(CURRENT_USER_EMAIL_KEY, trimmedEmail);
    router.replace('/(tabs)/registrar-avaria');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.authContainer}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled">
          <View style={styles.brandMark}>
            <Ionicons name="shield-checkmark" size={38} color="#FFFFFF" />
          </View>

          <View style={styles.authHeader}>
            <Text style={styles.appName}>RuaSegura</Text>
            <Text style={styles.authTitle}>
              {authMode === 'login' ? 'Entrar na sua conta' : 'Criar cadastro'}
            </Text>
            <Text style={styles.authSubtitle}>
              {'Registre avarias na rua de forma r\u00e1pida para facilitar o encaminhamento.'}
            </Text>
          </View>

          <View style={styles.modeSwitch}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setAuthMode('login')}
              style={[styles.modeButton, authMode === 'login' && styles.modeButtonActive]}>
              <Text style={[styles.modeText, authMode === 'login' && styles.modeTextActive]}>
                Login
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setAuthMode('cadastro')}
              style={[styles.modeButton, authMode === 'cadastro' && styles.modeButtonActive]}>
              <Text style={[styles.modeText, authMode === 'cadastro' && styles.modeTextActive]}>
                Cadastro
              </Text>
            </Pressable>
          </View>

          {authMode === 'cadastro' && (
            <TextInput
              autoCapitalize="words"
              onChangeText={setUserName}
              placeholder="Nome completo"
              placeholderTextColor="#6B7280"
              style={styles.input}
              value={userName}
            />
          )}

          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="E-mail"
            placeholderTextColor="#6B7280"
            style={styles.input}
            value={email}
          />
          <View style={styles.passwordField}>
            <TextInput
              onChangeText={setPassword}
              placeholder={authMode === 'cadastro' ? 'Senha com no minimo 5 caracteres' : 'Senha'}
              placeholderTextColor="#6B7280"
              secureTextEntry={!isPasswordVisible}
              style={[styles.input, styles.passwordInput]}
              value={password}
            />
            <Pressable
              accessibilityLabel={isPasswordVisible ? 'Esconder senha' : 'Mostrar senha'}
              accessibilityRole="button"
              onPress={() => setIsPasswordVisible((current) => !current)}
              style={styles.passwordToggle}>
              <Ionicons
                name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color="#64748B"
              />
            </Pressable>
          </View>

          <Pressable accessibilityRole="button" onPress={handleAuth} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>
              {authMode === 'login' ? 'Entrar' : 'Cadastrar'}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F7F6',
  },
  keyboardView: {
    flex: 1,
  },
  authContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 24,
    paddingHorizontal: 24,
    paddingTop: 36,
  },
  brandMark: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#0F766E',
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    marginBottom: 20,
    width: 56,
  },
  authHeader: {
    gap: 8,
    marginBottom: 24,
  },
  appName: {
    color: '#0F766E',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  authTitle: {
    color: '#111827',
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
  },
  authSubtitle: {
    color: '#475569',
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
  },
  modeSwitch: {
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: 18,
    padding: 4,
  },
  modeButton: {
    alignItems: 'center',
    borderRadius: 6,
    flex: 1,
    paddingVertical: 12,
  },
  modeButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  modeText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '700',
  },
  modeTextActive: {
    color: '#0F766E',
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
  passwordField: {
    marginBottom: 12,
    position: 'relative',
  },
  passwordInput: {
    marginBottom: 0,
    paddingRight: 48,
  },
  passwordToggle: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    right: 4,
    top: 0,
    width: 44,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#0F766E',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
