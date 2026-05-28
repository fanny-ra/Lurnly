import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView 
} from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import RNPickerSelect from 'react-native-picker-select';

export default function RegisterScreen() {
  const router = useRouter();
  const [role, setRole] = useState('siswa');
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [kelasList, setKelasList] = useState([]);
  const [nis, setNis] = useState('');
  const [kelas_id, setKelasId] = useState('');
  const [nip, setNip] = useState('');
  const [mapel, setMapel] = useState('');

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/kelas') 
      .then(response => {
        // Cek apakah data array ada
        const data = response.data?.data?.map((item: any) => ({
          label: item.nama_kelas,
          value: item.id
        })) || [];
        setKelasList(data);
      })
      .catch(error => console.log("Gagal ambil kelas:", error));
  }, []);

  const handleRegister = async () => {

    if (!nama || !email || !password) {
      Alert.alert("Eits!", "Nama, Email, dan Password wajib diisi.");
      return;
    }

    if (role === 'siswa' && (!nis || !kelas_id)) {
      Alert.alert("Info", "NIS dan Kelas harus diisi ya.");
      return;
    }
    // Gunakan cara yang lebih bersih untuk membuat payload
    const payload = { 
      role, 
      nama: nama, // Pastikan key ini sama dengan $request->validate di Laravel
      email, 
      password,
      ...(role === 'siswa' ? { nis, kelas_id } : { nip, mapel })
    };

    try {
      await axios.post('http://127.0.0.1:8000/api/register', payload, {
        headers: { 'Accept': 'application/json' }
      });
      Alert.alert("Sukses", "Akun berhasil dibuat!");
      router.replace('/login');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Menampilkan pesan error validasi dari Laravel
        const errors = error.response.data.errors;
        const errorMsg = errors ? Object.values(errors).flat().join('\n') : "Terjadi kesalahan.";
        Alert.alert("Gagal", errorMsg);
        console.log("Detail Error Validasi:", error.response?.data.errors);
        alert(JSON.stringify(error.response?.data.errors));
      } else {
        Alert.alert("Gagal", "Tidak dapat terhubung ke server.");
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcomee!!</Text>

        <TextInput style={styles.input} placeholder="Nama" value={nama} onChangeText={setNama} />
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

        {role === 'siswa' ? (
          <>
            <TextInput style={styles.input} placeholder="NIS" value={nis} onChangeText={setNis} keyboardType="numeric" />
            <RNPickerSelect
              onValueChange={(value) => setKelasId(value)}
              items={kelasList}
              placeholder={{ label: "Pilih Kelas Anda...", value: '' }}
              style={{
                inputAndroid: styles.input,
                inputIOS: styles.input,
              }}
            />
          </>
        ) : (
          <>
            <TextInput style={styles.input} placeholder="NIP" value={nip} onChangeText={setNip} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Mata Pelajaran" value={mapel} onChangeText={setMapel} />
          </>
        )}

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/login')} style={styles.loginLink}>
            <Text style={styles.loginText}>Sudah punya akun? Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 20, backgroundColor: '#F5F5F5' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 15, padding: 25, width: '100%', maxWidth: 400, alignSelf: 'center', elevation: 5 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  roleContainer: { flexDirection: 'row', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', padding: 15, borderRadius: 10, marginBottom: 15, backgroundColor: '#FAFAFA', fontSize: 16 },
  button: { backgroundColor: '#001456', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  tab: { flex: 1, padding: 10, alignItems: 'center', backgroundColor: '#eee', marginHorizontal: 5, borderRadius: 8 },
  activeTab: { backgroundColor: '#001456' },
  loginLink: {
      marginTop: 15,
      alignItems: 'center',
    },
    loginText: {
      color: '#0083ee',
      textAlign: 'center',
      fontWeight: '600',
    },
});