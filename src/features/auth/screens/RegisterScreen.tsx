import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import { StatusBar } from 'expo-status-bar';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../lib/firebase';

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

type Props = {
  navigation: RegisterScreenNavigationProp;
};

export const RegisterScreen = ({ navigation }: Props) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill out all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!acceptTerms) {
      Alert.alert('Error', 'You must accept the terms of service');
      return;
    }

    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Navigation is handled automatically by RootNavigator listening to auth state
      // (Optional: save fullName to Firebase user profile or firestore here)
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header Section */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>Start optimizing your focus today.</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          <Input
            label="Full Name"
            placeholder="Jane Doe"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />

          <Input
            label="Email Address"
            placeholder="jane@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            rightIcon={<Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>}
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          <Input
            label="Confirm Password"
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            rightIcon={<Text style={styles.eyeIcon}>{showConfirmPassword ? '🙈' : '👁️'}</Text>}
            onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
          />

          <View style={styles.optionsRow}>
            <Checkbox
              label="I accept the Terms of Service"
              checked={acceptTerms}
              onChange={setAcceptTerms}
            />
          </View>

          <Button
            title={isLoading ? "Creating Account..." : "Create Account"}
            onPress={handleRegister}
            disabled={isLoading}
          />
        </View>

        {/* Footer Section */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            Already have an account? <Text style={styles.footerLink} onPress={() => navigation.navigate('Login')}>Sign In</Text>
          </Text>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#8E9192',
    fontSize: 16,
    fontWeight: '400',
  },
  formContainer: {
    width: '100%',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: -4,
  },
  eyeIcon: {
    fontSize: 16,
    color: '#9ca3af',
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  footerText: {
    color: '#8E9192',
    fontSize: 16,
  },
  footerLink: {
    color: '#ffffff',
    fontWeight: '500',
  }
});
