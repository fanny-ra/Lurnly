import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, StatusBar } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TugasScreen() {
  const [tugas, setTugas] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [totalTugas, setTotalTugas] = useState(0);
  const isLate = (deadlineStr: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadlineStr);
    return now > deadlineDate;
  };

  useEffect(() => {
    fetchTugas();
  }, []);

  const fetchTugas = async () => {
  try {
    setLoading(true);
    const token = await AsyncStorage.getItem('userToken');
    const userData = await AsyncStorage.getItem('userData'); // Asumsi kamu simpan data user pas login
    const user = userData ? JSON.parse(userData) : null;
    const userId = user?.id; // Ambil ID-nya

    // Kirim userId di ujung URL (?user_id=...)
    const response = await axios.get(`http://127.0.0.1:8000/api/tugas?siswa_id=${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    console.log("ID Siswa yang dikirim:", userId);
    console.log("Data Pengumpulan dari API:", response.data.data[0].pengumpulans);

    const dataTugas = response.data.data || [];
    setTotalTugas(dataTugas.length);
    setTugas(dataTugas);

    if (response.data && response.data.data) {
      setTugas(response.data.data);
    }
  } catch (e) {
    console.error("Gagal ambil tugas:", e);
  } finally {
    setLoading(false);
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Link href="/dashboard">
            <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
        </Link>
        <Text style={styles.headerTitle}>Daftar Tugas</Text>
        <View style={{ width: 24 }} />
      </View>

      {totalTugas === 0 ? (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Ionicons name="cafe-outline" size={80} color="#D5DBDB" />
        <Text style={{ color: '#95A5A6', fontSize: 18, fontWeight: 'bold', marginTop: 15 }}>
          Santai dulu, Cuy!
        </Text>
        <Text style={{ color: '#BDC3C7', textAlign: 'center', marginTop: 5 }}>
          Belum ada tugas yang dipublish untuk kelas kamu saat ini.
        </Text>
      </View>
    ) : (
      /* KONDISI 2: JIKA ADA DATA TUGAS, TAMPILKAN LISTNYA */
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {tugas.map((item: any) => {
          // Ambil data pengumpulan milik siswa
          const pengumpulan = item.pengumpulans && item.pengumpulans.length > 0 
            ? item.pengumpulans[0] 
            : null;

          const sudahKumpul = pengumpulan !== null; 
          const nilaiTugas = pengumpulan?.nilai;
          const sudahDinilai = sudahKumpul && (nilaiTugas !== null && nilaiTugas !== undefined);
          const terlambat = isLate(item.deadline) && !sudahKumpul;

          return (
            <TouchableOpacity 
              key={item.id} 
              style={[
                styles.card, 
                sudahKumpul && styles.cardSelesai,
                terlambat && styles.cardTelat
              ]}
              onPress={() => router.push({
                pathname: "/tugas-detail",
                params: { 
                  id: item.id, 
                  judul: item.judul_tugas, 
                  deskripsi: item.deskripsi_tugas,
                  deadline: item.deadline 
                }
              })}
            >
              <View style={styles.cardInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.subject, sudahKumpul && styles.textMuted]}>
                    {item.judul_tugas}
                  </Text>
                  {sudahKumpul && (
                    <Ionicons name="checkmark-circle" size={16} color="#2ecc71" style={{ marginLeft: 5 }} />
                  )}
                </View>
                
                <Text style={[styles.deadline, terlambat && { color: '#e74c3c' }]}>
                  {terlambat ? "Tidak Mengerjakan (Waktu Habis)" : `Deadline: ${item.deadline}`}
                </Text>

                <View style={[
                  styles.badgeNilai, 
                  !sudahDinilai && { backgroundColor: sudahKumpul ? '#3498db' : '#e67e22' }
                ]}>
                  <Text style={styles.textNilai}>
                    {sudahDinilai 
                      ? `Nilai: ${pengumpulan.nilai}` 
                      : sudahKumpul 
                        ? "Sudah Mengumpulkan" 
                        : "Belum Mengumpulkan"}
                  </Text>
                </View>
              </View>
              
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={sudahKumpul ? "#2ecc71" : terlambat ? "#e74c3c" : "#CCC"} 
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  cardInfo: { flex: 1 },
  subject: { fontSize: 16, fontWeight: 'bold' },
  deadline: { fontSize: 12, color: 'red', marginTop: 5 },
  cardSelesai: {
    borderColor: '#2ecc71',
    borderLeftWidth: 5,
    backgroundColor: '#fafffa',
  },
  cardTelat: {
    borderColor: '#e74c3c',
    borderLeftWidth: 5,
    backgroundColor: '#fff5f5',
  },
  textMuted: {
    color: '#7f8c8d',
    textDecorationLine: 'line-through', // Opsional: coret judul jika sudah selesai
  },
  badgeNilai: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  textNilai: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  }
});