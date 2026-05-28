  import React, { useState } from 'react';
  import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    Alert, 
    KeyboardAvoidingView, 
    Platform 
  } from 'react-native';
  import axios from 'axios';
  import { useAuth } from '../context/AuthContext'
  import { useRouter, Link } from 'expo-router'; // 1. Tambahkan Link di sini
  import AsyncStorage from '@react-native-async-storage/async-storage';

  export default function LoginScreen() {
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const router = useRouter();

    // Di dalam LoginScreen.tsx
    const handleLogin = async () => {
      await AsyncStorage.clear();
    // Tambahin log ini buat mastiin fungsinya kepanggil
    console.log("Tombol Login diklik!");
    console.log("Data:", { email, password, role });

    if (!email || !password || !role) {
      Alert.alert("Ups!", "Email, Password, dan Role wajib diisi.");
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login', {
        email: email,
        password: password,
        role: role, // <--- INI WAJIB ADA BIAR BACKEND GAK ERROR 422
      }, {
        headers: { 'Accept': 'application/json' }
      }); 
    if (response.data.success) {
      const { token, user } = response.data;

      // SIMPAN DATA
      await AsyncStorage.setItem('userToken', token);
      
      // Masukkan role secara manual ke objek user sebelum disimpan
      const userWithRole = { ...user, role: role }; 
      await AsyncStorage.setItem('user', JSON.stringify(userWithRole));

      console.log("Navigasi manual berdasarkan pilihan tombol:", role);

      // NAVIGASI BERDASARKAN TOMBOL YANG DIKLIK, BUKAN DATA API
      if (role === 'guru') {
        router.replace('/dashboardGuru');
      } else {
        router.replace('/dashboard');
      }
    }
  } catch (error: any) {
    console.log("Error Full:", error); // Cek terminal VS Code untuk liat aslinya
    
    let pesan = "Terjadi kesalahan koneksi";
    
    if (error.response) {
      // Kalau Laravel kasih error validasi (422)
      if (error.response.status === 422) {
        const errors = error.response.data.errors;
        // Ambil pesan error pertama saja biar gak kepanjangan
        pesan = Object.values(errors)[0] as string;
      } else {
        pesan = error.response.data.message || "Server Error";
      }
    }

    Alert.alert("Login Gagal", pesan);
  }
};

    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.container}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Selamat Datang</Text>
          <Text style={styles.subtitle}>Silakan masuk ke akun Anda</Text>

          <TextInput 
            style={styles.input} 
            placeholder="Email" 
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput 
            style={styles.input} 
            placeholder="Password" 
            value={password}
            onChangeText={setPassword}
            secureTextEntry 
          />

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 20 }}>
            <TouchableOpacity 
              style={[styles.roleButton, role === 'siswa' && styles.activeButton]} 
              onPress={() => setRole('siswa')}
            >
              <Text style={role === 'siswa' ? styles.activeText : styles.inactiveText}>Siswa</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.roleButton, role === 'guru' && styles.activeButton]} 
              onPress={() => setRole('guru')}
            >
              <Text style={role === 'guru' ? styles.activeText : styles.inactiveText}>Guru</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          {/* 2. Tambahkan Link di bawah tombol */}
          <TouchableOpacity onPress={() => router.push('/register')} style={styles.registerLink}>
              <Text style={styles.registerText}>Belum punya akun? Register</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  const styles = StyleSheet.create({
    // ... container dan card style tetap sama ...
    container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#F5F5F5' },
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 15,
      padding: 25,
      width: '90%',
      maxWidth: 400,
      alignSelf: 'center',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 5, textAlign: 'center' },
    subtitle: { fontSize: 14, color: '#777', marginBottom: 20, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#E0E0E0', padding: 15, borderRadius: 10, marginBottom: 15, backgroundColor: '#FAFAFA' },
    button: { backgroundColor: '#001456', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 5 },
    buttonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
    
    // 3. Tambahkan style baru untuk link register
    registerLink: {
      marginTop: 15,
      alignItems: 'center',
    },
    registerText: {
      color: '#0083ee',
      textAlign: 'center',
      fontWeight: '600',
    },
    roleButton: {
      paddingVertical: 8,
      paddingHorizontal: 30,
      borderRadius: 25, // Membuat tombol agak bulat
      borderWidth: 1,
      borderColor: '#ddd',
      marginHorizontal: 10,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    
    // Style tambahan jika tombol sedang aktif (dipilih)
    activeButton: {
      backgroundColor: '#3487e6', // Warna utama (misal: Indigo/Biru)
      borderColor: '#4680e5',
    },

    // Teks saat tombol aktif
    activeText: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      fontSize: 14,
    },

    // Teks saat tombol tidak aktif
    inactiveText: {
      color: '#666666',
      fontWeight: '600',
      fontSize: 16,
    },
  });
