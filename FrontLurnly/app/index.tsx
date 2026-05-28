import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function IndexScreen() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const role = await AsyncStorage.getItem('userRole');

      if (token) {
        // Jika ada token, lempar ke dashboard sesuai role
        if (role === 'guru') {
          router.replace('/dashboardGuru');
        } else {
          router.replace('/dashboard');
        }
      } else {
        // Jika tidak ada token, tetap di sini (tampilkan tombol login)
        setChecking(false);
      }
    } catch (e) {
      setChecking(false);
    }
  };

  // Tampilkan loading screen sebentar saat ngecek session
  if (checking) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#001456" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lurnly Classroom</Text>
      <Text style={styles.subtitle}>Selamat datang, silakan masuk untuk mulai belajar.</Text>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/login')}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={() => router.push('/register')}>
        <Text style={styles.secondaryButtonText}>Belum punya akun? Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20,
    backgroundColor: '#fff' 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 10,
    color: '#001456'
  },
  subtitle: { 
    fontSize: 16, 
    color: '#666', 
    marginBottom: 40, 
    textAlign: 'center'
  },
  button: { 
    backgroundColor: '#001456', 
    padding: 15, 
    borderRadius: 10, 
    width: '100%', 
    alignItems: 'center', 
    marginBottom: 15 
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  secondaryButton: { 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#001456' 
  },
  secondaryButtonText: { 
    color: '#001456', 
    fontWeight: 'bold', 
    fontSize: 16 
  }
});