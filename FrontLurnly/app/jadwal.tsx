import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  SafeAreaView, ActivityIndicator, StatusBar 
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
// PERBAIKAN IMPORT IONICONS
import Ionicons from '@expo/vector-icons/Ionicons'; 
import { Link } from 'expo-router';

// 1. DEFINISIKAN INTERFACE (Agar tidak error 'never')
interface JadwalItem {
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  materi?: {
    matapelajaran?: string;
    idmatapelajaran?: string;
  };
  guru?: {
    nama: string;
  };
}

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

export default function DetailJadwal() {
  const [selectedDay, setSelectedDay] = useState('Senin');
  
  // 2. KASIH TIPE DATA PADA STATE
  const [jadwalData, setJadwalData] = useState<JadwalItem[]>([]);
  
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchJadwal();
  }, []);

  const fetchJadwal = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    const response = await axios.get('http://127.0.0.1:8000/api/jadwals', {
      headers: { Authorization: `Bearer ${token}` }
    });

    // CEK DISINI: Kalau API Laravel kamu pakai Resource atau manual
    // Pastikan kita ambil bagian array-nya saja.
    const dataArray = Array.isArray(response.data) 
      ? response.data 
      : (response.data.data || []); // Jika data dibungkus { data: [...] }

    setJadwalData(dataArray);
  } catch (e) {
    console.log("Error fetch:", e);
    setJadwalData([]); // Set kosong kalau error biar nggak crash
  } finally {
    setLoading(false);
  }
};

  const filteredJadwal = jadwalData.filter(item => item.hari === selectedDay);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Link href="/dashboard">
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
        </Link>
        <Text style={styles.headerTitle}>Jadwal Pelajaran</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
          {DAYS.map((day) => (
            <TouchableOpacity 
              key={day} 
              onPress={() => setSelectedDay(day)}
              style={[styles.tabItem, selectedDay === day && styles.activeTab]}
            >
              <Text style={[styles.tabText, selectedDay === day && styles.activeTabText]}>{day}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#5DADE2" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollList}>
          {filteredJadwal.length > 0 ? (
            filteredJadwal.map((item, index) => (
              <View key={index} style={styles.card}>
                <View style={styles.timeSection}>
                  <Text style={styles.timeStart}>{item.jam_mulai?.substring(0, 5)}</Text>
                  <View style={styles.dotLine}>
                    <View style={styles.dot} />
                    <View style={styles.line} />
                    <View style={styles.dot} />
                  </View>
                  <Text style={styles.timeEnd}>{item.jam_selesai?.substring(0, 5)}</Text>
                </View>

                <View style={styles.infoSection}>
                  <Text style={styles.mapelTitle}>
                    {item.materi?.matapelajaran || item.materi?.idmatapelajaran || "Mata Pelajaran"}
                  </Text>
                  
                  <View style={styles.guruRow}>
                    <Ionicons name="person-circle-outline" size={16} color="#888" />
                    <Text style={styles.guruName}>{item.guru?.nama || "Guru Belum Diset"}</Text>
                  </View>
                </View>
              </View>
            )) // <--- INI PENUTUP MAP YANG TADI KURANG
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={80} color="#DDD" />
              <Text style={styles.emptyText}>Tidak ada jadwal di hari {selectedDay}</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ... styles tetap sama seperti sebelumnya ...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FBFBFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 15, backgroundColor: '#FFF' },
  backButton: { padding: 8, borderRadius: 12, backgroundColor: '#F5F5F5' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  tabContainer: { backgroundColor: '#FFF', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  tabItem: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginRight: 10, backgroundColor: '#F0F2F5' },
  activeTab: { backgroundColor: '#5DADE2' },
  tabText: { fontWeight: '600', color: '#666' },
  activeTabText: { color: '#FFF' },
  scrollList: { padding: 20 },
  card: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 20, padding: 15, marginBottom: 15, elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  timeSection: { alignItems: 'center', justifyContent: 'center', width: 60 },
  timeStart: { fontSize: 14, fontWeight: '700', color: '#333' },
  timeEnd: { fontSize: 12, color: '#999' },
  dotLine: { alignItems: 'center', marginVertical: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#5DADE2' },
  line: { width: 1, height: 20, backgroundColor: '#E0E0E0' },
  infoSection: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  mapelTitle: { fontSize: 16, fontWeight: '800', color: '#1A1A1A', marginBottom: 6 },
  guruRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  guruName: { fontSize: 13, color: '#666', marginLeft: 5 },
  roomRow: { flexDirection: 'row', alignItems: 'center' },
  roomText: { fontSize: 12, color: '#5DADE2', marginLeft: 5, fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 10, color: '#AAA', fontSize: 14 }
});