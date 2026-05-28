import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert, Linking, Modal } from 'react-native';
import { Link, router, useLocalSearchParams, useNavigation } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

interface Pengumpulan {
  id: number;
  tugas_id: number;
  siswa_id: number;
  nilai: number | null;
  file_path: string | null;
  siswa?: {
    nama: string;
  };
  // tambahkan field lain jika ada
}

export default function DetailTugasGuru() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [dataTugas, setDataTugas] = useState<any>(null);
  const [selectedSiswa, setSelectedSiswa] = useState<any>(null); // State untuk Modal
  const [nilaiBaru, setNilaiBaru] = useState('');
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [pengumpulan, setPengumpulan] = useState<any[]>([]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      // Pastikan di Laravel Controller menggunakan: Tugas::with('pengumpulans.siswa')->find($id)
      const response = await axios.get(`http://127.0.0.1:8000/api/tugas/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setDataTugas(response.data.data);
        // Log dari response langsung, jangan dari state dataTugas
        console.log("Data Berhasil Dimuat:", response.data.data.judul_tugas);
      }
    } catch (e) {
      Alert.alert("Error", "Gagal mengambil data");
    } finally {
      setLoading(false);
    }
  };

  const filteredPengumpulan = dataTugas?.pengumpulans?.filter((item: any) => {
    const namaSiswa = item.siswa?.nama?.toLowerCase() || "";
    return namaSiswa.includes(searchQuery.toLowerCase());
  });

  const simpanNilai = async () => {
    if (!selectedSiswa || !nilaiBaru) return;

    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.post(`http://127.0.0.1:8000/api/nilai/update`, {
        pengumpulan_id: selectedSiswa.id,
        nilai: nilaiBaru
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        Alert.alert("Sukses", "Nilai berhasil disimpan!");
        setNilaiBaru("");
        setSelectedSiswa(null);
        fetchDetail();
      }
    } catch (e) {
      Alert.alert("Error", "Gagal menyimpan nilai");
    }
  };

  useEffect(() => { fetchDetail(); }, [id]);

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#0D47A1" />
        </TouchableOpacity>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>{dataTugas?.judul_tugas}</Text>
          <Text style={styles.subtitle}>Kelas: {dataTugas?.kelas?.nama_kelas}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Daftar Pengumpulan Siswa</Text>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          placeholder="Cari nama siswa..."
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredPengumpulan}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          // Cek apakah sudah dinilai (nilai tidak null dan lebih dari 0)
          const sudahDinilai = item.nilai !== null && item.nilai > 0;

          return (
            <TouchableOpacity 
              style={[styles.cardNama, sudahDinilai && styles.cardSudahDinilai]} 
              onPress={() => {
                setSelectedSiswa(item);
                setNilaiBaru(item.nilai?.toString() || '');
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.namaSiswa}>{item.siswa?.nama || "Siswa"}</Text>
                
                {/* Label Status Dinamis */}
                <View style={[styles.badge, sudahDinilai ? styles.badgeSuccess : styles.badgeWarning]}>
                  <Text style={styles.badgeText}>
                    {sudahDinilai ? `Sudah Dinilai: ${item.nilai}` : "Menunggu Dinilai"}
                  </Text>
                </View>
              </View>
              
              <Ionicons 
                name={sudahDinilai ? "checkmark-circle" : "time-outline"} 
                size={24} 
                color={sudahDinilai ? "#2E7D32" : "#F9A825"} 
              />
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>Belum ada siswa yang mengumpulkan.</Text>}
      />

      {/* MODAL UNTUK LIHAT FILE & INPUT NILAI */}
      <Modal visible={!!selectedSiswa} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalLabel}>Nama Siswa:</Text>
            <Text style={styles.modalNama}>
              {selectedSiswa?.siswa?.nama || "Nama Tidak Terbaca"}
            </Text>

            <View style={styles.separator} />

            {/* LIHAT FILE DULU */}
            <Text style={styles.modalLabel}>Hasil Tugas:</Text>
            {selectedSiswa?.file_path ? (
              <TouchableOpacity 
                style={styles.btnFile} 
                onPress={() => {
                  if (!selectedSiswa?.file_path) return;

                  const baseUrl = "http://127.0.0.1:8000/storage/";
                  // selectedSiswa.file_path sudah berisi "tugas/namafile.jpg"
                  const fullUrl = encodeURI(baseUrl + selectedSiswa.file_path);

                  console.log("Membuka:", fullUrl);
                  Linking.openURL(fullUrl);
                }}
              >
                <Ionicons name="cloud-download" size={20} color="white" />
                <Text style={styles.btnText}>Buka / Download File</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.noFile}>Siswa tidak melampirkan file</Text>
            )}

            {/* INPUT NILAI KEMUDIAN */}
            <Text style={styles.modalLabel}>Berikan Nilai (0-100):</Text>
            <TextInput
              style={styles.inputNilai}
              placeholder="Masukkan Nilai (0-100)"
              keyboardType="numeric"
              value={nilaiBaru} // Terhubung ke state nilaiBaru
              onChangeText={(text) => setNilaiBaru(text)} // Mengubah state saat diketik
            />

            <View style={styles.modalAction}>
              <TouchableOpacity style={styles.btnBatal} onPress={() => setSelectedSiswa(null)}>
                <Text style={{color: '#666'}}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSimpanModal} onPress={simpanNilai}>
                <Text style={{color: 'white', fontWeight: 'bold'}}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', padding: 20 },
  header: { flexDirection: 'row', // Biar tombol & teks bersampingan
    alignItems: 'center', // Biar tombol & teks sejajar di tengah secara vertikal
    paddingTop: 50, // Biar gak ketutup notch HP
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
    elevation: 2, },
  title: { fontSize: 22, fontWeight: 'bold', color: '#0D47A1' },
  subtitle: { fontSize: 16, color: '#666' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333', marginTop: 15 },
  cardNama: { backgroundColor: 'white', padding: 18, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, borderLeftWidth: 5, borderLeftColor: '#0D47A1' },
  namaSiswa: { fontSize: 17, fontWeight: '600' },
  statusInfo: { fontSize: 13, color: '#888', marginTop: 4 },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 25 },
  modalContent: { backgroundColor: 'white', borderRadius: 20, padding: 25 },
  modalLabel: { fontSize: 12, color: '#999', marginBottom: 5, textTransform: 'uppercase' },
  modalNama: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  separator: { height: 1, backgroundColor: '#EEE', marginBottom: 15 },
  btnFile: { backgroundColor: '#0D47A1', flexDirection: 'row', padding: 15, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  btnText: { color: 'white', marginLeft: 10, fontWeight: 'bold' },
  modalInput: { backgroundColor: '#F0F2F5', borderRadius: 10, padding: 15, fontSize: 18, textAlign: 'center', marginBottom: 20 },
  modalAction: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  btnBatal: { padding: 15, marginRight: 10 },
  btnSimpanModal: { backgroundColor: '#28A745', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10 },
  noFile: { color: '#dc3545', marginBottom: 20, fontStyle: 'italic' },
  empty: { textAlign: 'center', color: '#999', marginTop: 50 },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  badgeSuccess: {
    backgroundColor: '#E8F5E9', // Hijau muda
  },
  badgeWarning: {
    backgroundColor: '#FFF9C4', // Kuning muda
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  cardSudahDinilai: {
    borderLeftWidth: 5,
    borderLeftColor: '#2E7D32'
  },
  inputNilai: {
    backgroundColor: '#F5F7FA', // Abu-abu sangat muda agar terlihat elegan
    borderWidth: 1,
    borderColor: '#D1D5DB', // Warna border netral
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 18, // Font agak besar supaya jelas angkanya
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center', // Angka nilai biasanya lebih bagus di tengah
    marginBottom: 20,
  },
  titleWrapper: {
    flex: 1, // Mengambil semua sisa ruang
    justifyContent: 'center', // Biar teks atas-bawah ini pas di tengah dibanding tombol
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    paddingHorizontal: 15,
    borderRadius: 12,
    height: 45,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    // Shadow agar terlihat mengapung sedikit
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  backText: {
    fontSize: 16,
    marginLeft: 5,
    color: '#333',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0D47A1',
    lineHeight: 22,
  },
});