import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator, Linking, Platform } from 'react-native';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TugasDetail() {
  const { id, judul, deskripsi, deadline } = useLocalSearchParams();
  const [file, setFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const [sudahKumpul, setSudahKumpul] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // LOGIKA PENENTU REMEDIAL BERDASARKAN KKM 75
  const nilaiSiswa = sudahKumpul?.nilai !== null ? Number(sudahKumpul?.nilai) : null;
  const isRemedial = nilaiSiswa !== null && nilaiSiswa <= 75;

  const pickDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
    });
    
    if (!result.canceled) {
      setFile(result);
    }
  };

  const lihatFile = (url: string) => {
    if (!url) {
      Alert.alert("Info", "File tidak ditemukan.");
      return;
    }
    Linking.openURL(url).catch(err => console.error("Gagal buka link:", err));
  };

  useEffect(() => {
    const cekStatusTugas = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userData = await AsyncStorage.getItem('user');

        if (!userData) {
          setLoading(false);
          return;
        }

        const user = JSON.parse(userData || '{}');

        const response = await axios.get(`http://127.0.0.1:8000/api/pengumpulans/status/${id}/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.sudah_ada) {
          setSudahKumpul(response.data.data);
        } else {
          setSudahKumpul(null);
        }
      } catch (e) {
        console.log("Belum ada data pengumpulan");
      } finally {
        setLoading(false)
      }
    };

    if(id){
      cekStatusTugas();
    }
  }, [id]);

  const submitTugas = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('user');
      
      if (!userData) {
        return Alert.alert("Error", "Data siswa tidak ditemukan. Silakan login ulang.");
      }

      if (!file || !file.assets) {
        return Alert.alert("Eits!", "Pilih file dulu, Cuy.");
      }

      const user = JSON.parse(userData);
      const formData = new FormData();
      const selectedFile = file.assets[0];

      formData.append('tugas_id', String(id)); 
      formData.append('siswa_id', String(user.id));
      if (Platform.OS === 'web') {
        const response = await fetch(selectedFile.uri);
        const blob = await response.blob();
        formData.append('file_path', blob, selectedFile.name);
      } else {
        formData.append('file_path', {
          uri: selectedFile.uri,
          name: selectedFile.name,
          type: selectedFile.mimeType || 'application/octet-stream',
        } as any);
      }

      await axios.post('http://127.0.0.1:8000/api/pengumpulans', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });

      alert("Berhasil! Tugas kamu sudah terkirim.");
      router.replace('/dashboard');
    } catch (e: any) {
      console.log("Detail Error:", e.response?.data || e.message);
      Alert.alert("Gagal", "Cek koneksi atau data validasi.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.btnBack}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Tugas</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{judul}</Text>
        <Text style={styles.deadline}>Batas Waktu: {deadline}</Text>
        
        <View style={styles.descBox}>
          <Text style={styles.description}>{deskripsi}</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#5DADE2" />
            <Text style={styles.loadingText}>Mengecek status tugas...</Text>
          </View>
        ) : sudahKumpul ? (
          <View style={[
            styles.statusBox, 
            sudahKumpul.nilai !== null && (isRemedial ? styles.cardRemedial : styles.cardLulus)
          ]}>
            
            {sudahKumpul.nilai !== null ? (
              isRemedial ? (
                <Ionicons name="alert-circle" size={60} color="#D32F2F" />
              ) : (
                <Ionicons name="ribbon" size={60} color="#F1C40F" /> 
              )
            ) : (
              <Ionicons name="checkmark-circle" size={60} color="#2ECC71" />
            )}
            
            <Text style={[
              styles.statusText, 
              sudahKumpul.nilai !== null && (isRemedial ? styles.txtRemedial : styles.txtLulus)
            ]}>
              {sudahKumpul.nilai !== null 
                ? (isRemedial ? "Nilai di Bawah KKM (Butuh Remedial)" : "Tugas Selesai Dikoreksi")
                : "Tugas Sudah Terkirim"
              }
            </Text>
            
            <View style={[
              styles.nilaiBox,
              sudahKumpul.nilai !== null && (isRemedial ? styles.nilaiBoxRemedial : styles.nilaiBoxLulus)
            ]}>
              <Text style={styles.nilaiLabel}>Nilai Anda:</Text>
              <Text style={[
                styles.nilaiAngka, 
                !sudahKumpul.nilai ? styles.menungguText : null,
                (sudahKumpul.nilai !== null && isRemedial) ? styles.nilaiAngkaRemedial : null
              ]}>
                {sudahKumpul.nilai !== null ? sudahKumpul.nilai : "Menunggu Dinilai"}
              </Text>
            </View>

            {sudahKumpul.file_path && (
              <TouchableOpacity 
                style={[
                  styles.btnViewFile,
                  isRemedial ? styles.btnViewFileRemedial : null
                ]} 
                onPress={() => lihatFile(`http://127.0.0.1:8000/storage/${sudahKumpul.file_path}`)}
              >
                <Ionicons name="document-text-outline" size={20} color={isRemedial ? "#D32F2F" : "#3498db"} />
                <Text style={[styles.btnViewFileText, isRemedial ? styles.txtRemedial : styles.txtLulus]}>
                  Lihat File yang Dikumpulkan
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            <TouchableOpacity style={styles.pickButton} onPress={pickDocument}>
              <Ionicons name="attach" size={20} color="#5DADE2" />
              <Text style={styles.pickText}>
                {file && !file.canceled ? file.assets[0].name : "Pilih Foto/File Tugas"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.submitButton, !file ? styles.btnDisabled : null]} 
              onPress={submitTugas}
              disabled={uploading || !file}
            >
              <Text style={styles.submitText}>
                {uploading ? "Sabar, lagi ngirim..." : "Kirim Jawaban"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

// STYLESHEET YANG SUDAH DIPISAH DAN DISECURE DARI CONFLICT TYPESCRIPT
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderColor: '#EEE' },
  btnBack: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  headerSpacer: { width: 32 },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#000' },
  deadline: { color: 'red', marginTop: 4, fontSize: 14 },
  descBox: { backgroundColor: '#F5F5F5', padding: 15, borderRadius: 10, marginTop: 15, marginBottom: 20 },
  description: { color: '#555', lineHeight: 20, fontSize: 14 },
  statusBox: { alignItems: 'center', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#2ECC71', backgroundColor: '#E8F8F5', marginTop: 10 },
  
  // Tipe Card Layouts
  cardLulus: { borderColor: '#3498DB', backgroundColor: '#EBF5FB' },
  cardRemedial: { borderColor: '#FFCCD0', backgroundColor: '#FFF0F0' },
  
  // Tipe Teks Colors
  statusText: { fontSize: 16, fontWeight: 'bold', marginTop: 10, marginBottom: 15, color: '#2ECC71' },
  txtLulus: { color: '#2980B9' },
  txtRemedial: { color: '#D32F2F' },

  // Tipe Nilai Wrapper Box
  nilaiBox: { width: '100%', alignItems: 'center', padding: 10, borderRadius: 10, backgroundColor: '#FFF' },
  nilaiBoxLulus: { backgroundColor: '#FFF' },
  nilaiBoxRemedial: { backgroundColor: '#FFE5E5' },
  
  nilaiLabel: { fontSize: 12, color: '#888' },
  nilaiAngka: { fontSize: 32, fontWeight: 'bold', marginTop: 4, color: '#333' },
  nilaiAngkaRemedial: { color: '#D32F2F', fontWeight: 'bold' },
  menungguText: { fontSize: 16, color: '#7F8C8D', fontWeight: 'normal' },
  
  loadingContainer: { marginTop: 50, alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#666', fontSize: 14 },

  pickButton: { flexDirection: 'row', alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: '#5DADE2', padding: 15, borderRadius: 10, justifyContent: 'center', marginBottom: 15 },
  pickText: { color: '#5DADE2', marginLeft: 8, fontWeight: 'bold', fontSize: 14 },
  submitButton: { backgroundColor: '#5DADE2', padding: 15, borderRadius: 10, alignItems: 'center' },
  submitText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  btnDisabled: { backgroundColor: '#CCC' },

  btnViewFile: { marginTop: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#3498db', width: '100%', justifyContent: 'center' },
  btnViewFileRemedial: { borderColor: '#D32F2F' },
  btnViewFileText: { fontWeight: 'bold', marginLeft: 8, fontSize: 14 }
});