import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DashboardGuru() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [daftarKelas, setDaftarKelas] = useState<{ id: number; nama_kelas: string }[]>([]);
  const [selectedKelas, setSelectedKelas] = useState(""); 
  const [selectedKelasTugas, setSelectedKelasTugas] = useState(""); 
  const [guruId, setGuruId] = useState<number | null>(null);
  const [nama, setNama] = useState<string>("");
  const [tugas, setTugas] = useState<any[]>([]);
  const [modalPengumumanVisible, setModalPengumumanVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState<'listKelas' | 'listTugas'>('listKelas');
  const [selectedKelasId, setSelectedKelasId] = useState<number | null>(null);
  const [judul, setJudul] = useState('');
  const [tanggalBerakhir, setTanggalBerakhir] = useState<Date>(new Date());
  const [useExpiry, setUseExpiry] = useState(false);
  const [isi, setIsi] = useState('');
  const [modalRemedialVisible, setModalRemedialVisible] = useState(false);
  const [formRemedial, setFormRemedial] = useState({
    tugas_id: 0,
    kelas_id: 0,
    judul_tugas: "",
    deskripsi_tugas: "Tugas perbaikan khusus untuk siswa yang nilainya di bawah KKM (75).",
    deadline: "",
  });
  const router = useRouter();
  const API_URL = 'http://127.0.0.1:8000';

  const [form, setForm] = useState({
    judul_tugas: "",
    deskripsi_tugas: "",
    deadline: "",
    materi_id: "1", 
  });

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.get(`${API_URL}/api/dashboard-guru`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const dataGuru = response.data.guru;
        const namaFix = dataGuru.nama || dataGuru.nama_guru || dataGuru.name;
        setNama(namaFix);
        setGuruId(dataGuru.id);
        setTugas(response.data.daftarTugas || []);
      }
    } catch (e: any) {
      console.error("DETAIL ERROR API:", e.response?.data || e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const loadSemuaData = async () => {
      await fetchData(); 
      await fetchKelas(); 
    };
    loadSemuaData();
  }, []);

  const fetchKelas = async () => {
    const token = await AsyncStorage.getItem("userToken");
    const response = await axios.get(`${API_URL}/api/get-kelas`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setDaftarKelas(response.data.data);
  };

  {/* 🔥 FUNGSIONALITAS UTAMA: TRIGGER GENERATE REMEDIAL INSTAN */}
  const handleTriggerRemedialInstan = (tugasId: number, kelasId: number, judulAsli: string) => {
  // Hitung default deadline (+3 hari) buat diisi langsung ke form biar guru ga repot ngetik dr nol
  const batasWaktu = new Date();
  batasWaktu.setDate(batasWaktu.getDate() + 3);
  const defaultDeadline = batasWaktu.toISOString().split('T')[0];

  setFormRemedial({
    tugas_id: tugasId,
    kelas_id: kelasId,
    judul_tugas: `Remedial - ${judulAsli}`,
    deskripsi_tugas: "Tugas perbaikan khusus untuk siswa yang nilainya di bawah KKM (75).",
    deadline: defaultDeadline, // Sudah otomatis terisi tanggal 3 hari ke depan
  });
  
  // Langsung buka modal form tanpa Alert.alert konfirmasi lagi!
  setModalRemedialVisible(true);
};

  const handleKirimPengumuman = async () => {
    if (!judul || !isi || !selectedKelas) {
      Alert.alert("Peringatan", "Semua kolom wajib diisi!");
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;

      const formattedDate = useExpiry 
        ? `${tanggalBerakhir.toISOString().split('T')[0]} 23:59:59` 
        : null;

      const payload = {
        judul: judul,
        isi: isi,
        kelas_id: selectedKelas,
        guru_id: user?.id || guruId || 4, 
        tanggal_berakhir: formattedDate
      };

      const res = await axios.post(`${API_URL}/api/pengumuman`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        Alert.alert("Berhasil", "Pengumuman berhasil terkirim!");
        setModalPengumumanVisible(false);
        setJudul('');
        setIsi('');
        setSelectedKelas('');
        setUseExpiry(false);
      }
    } catch (error: any) {
      Alert.alert("Gagal", "Mengalami kendala saat mengirim pengumuman");
    }
  };

  const handlePublish = async () => {
    if (!form.judul_tugas || !selectedKelasTugas) {
      Alert.alert("Peringatan", "Judul tugas dan Kelas wajib diisi!");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("userToken");

      const dataDikirim = {
        judul: form.judul_tugas,
        judul_tugas: form.judul_tugas,
        deskripsi: form.deskripsi_tugas,
        deskripsi_tugas: form.deskripsi_tugas,
        deadline: form.deadline,
        kelas_id: parseInt(selectedKelasTugas),
        guru_id: guruId || (tugas.length > 0 ? tugas[0].guru_id : null),
        materi_id: 1,
      };

      const response = await axios.post(`${API_URL}/api/tugas/store`, dataDikirim, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        Alert.alert("Berhasil", "Tugas berhasil diterbitkan!");
        setModalVisible(false);
        setSelectedKelasTugas('');
        fetchData();
      }
    } catch (e: any) {
      const pesanLaravel = e.response?.data?.message || e.message;
      Alert.alert("Gagal Simpan", pesanLaravel);
    }
  };

  const handlePublishRemedial = async () => {
    if (!formRemedial.deadline) {
      Alert.alert("Peringatan", "Deadline remedial wajib dipilih melalui kalender!");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("userToken");
      
      const payload = {
        tugas_id: formRemedial.tugas_id,
        kelas_id: formRemedial.kelas_id,
        judul_tugas: formRemedial.judul_tugas,
        deskripsi_tugas: formRemedial.deskripsi_tugas,
        deadline: `${formRemedial.deadline} 23:59:59` // Hasilnya jadi: 2026-05-24 23:59:59
      };

      const res = await axios.post(`${API_URL}/api/tugas/buat-remedial-instan`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        Alert.alert("Berhasil", "Tugas remedial berhasil diterbitkan!");
        setModalRemedialVisible(false);
        fetchData();
      }
    } catch (error: any) {
      console.log("Error publish remedial:", error.response?.data || error.message);
      Alert.alert("Gagal", error.response?.data?.message || "Gagal memproses pembuatan remedial.");
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace("/login");
  };

  const handleKelasPress = (kelasId: number) => {
    setSelectedKelasId(kelasId);
    setViewMode('listTugas'); 
  };

  const renderKelasCards = () => (
    <FlatList
      data={daftarKelas}
      numColumns={2}
      keyExtractor={(item) => `kelas-${item.id}`}
      renderItem={({ item }) => (
        <TouchableOpacity 
          style={styles.cardKelas} 
          onPress={() => handleKelasPress(item.id)}
        >
          <Ionicons name="people" size={40} color="#4A90E2" />
          <Text style={styles.textKelas}>{item.nama_kelas}</Text>
          <Text style={styles.textJumlahTugas}>Lihat Tugas</Text>
        </TouchableOpacity>
      )}
    />
  );

  const renderItemTugas = ({ item }: { item: any }) => {
  const totalSiswa = item.kelas?.siswas_count || 36;
  const progressPercent = Math.min((item.pengumpulans_count / totalSiswa) * 100, 100) || 0;

  // 🔍 PERBAIKAN LOGIKA: Cek apakah ada nilai di bawah 75, atau cek flag dari backend
  // Ditambahkan pengecekan jika nilai berbentuk string atau number langsung
  const adaSiswaRemedial = 
    item.punya_siswa_remedial === true || 
    item.punya_siswa_remedial === 1 ||
    (Array.isArray(item.pengumpulans) && item.pengumpulans.some(
      (p: any) => p.nilai !== null && p.nilai !== undefined && parseFloat(p.nilai) <= 75
    ));

  return (
    <View style={styles.taskContainer}>
      <TouchableOpacity
        style={styles.taskCard}
        onPress={() => router.push({ pathname: "detailTugasGuru", params: { id: item.id } } as any)}
      >
        <View style={styles.taskIcon}>
          <Ionicons name="document-text" size={24} color="#0D47A1" />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.taskTitle}>{item.judul_tugas}</Text>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{item.pengumpulans_count || 0}</Text>
        </View>
      </TouchableOpacity>

      {/* 🛠️ TOMBOL REMEDIAL */}
      {adaSiswaRemedial ? (
        <TouchableOpacity
          style={styles.btnActionRemedial}
          onPress={() => handleTriggerRemedialInstan(item.id, item.kelas_id, item.judul_tugas)}
        >
          <Ionicons name="alert-circle" size={16} color="#D32F2F" />
          <Text style={styles.btnActionRemedialText}>Sediakan Slot Remedial Otomatis</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
  };

  const renderTugasByKelas = () => {
  const tugasFiltered = tugas.filter(t => t.kelas_id === selectedKelasId);
  
  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity 
        onPress={() => setViewMode('listKelas')} 
        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}
      >
        <Ionicons name="arrow-back" size={20} color="#0D47A1" />
        <Text style={{ color: "#0D47A1", marginLeft: 5, fontWeight: 'bold' }}>Kembali ke Daftar Kelas</Text>
      </TouchableOpacity>
      
      <FlatList
        data={tugasFiltered}
        renderItem={renderItemTugas}
        keyExtractor={(item) => `tugas-${item.id}`}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 20, color: '#999' }}>
            Belum ada tugas untuk kelas ini.
          </Text>
        }
      />
    </View>
  );
};

  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#0D47A1" />
      </View>
    );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* --- HEADER GURU --- */}
        <View style={styles.headerGuru}>
          <View>
            <Text style={styles.txtRole}>Panel Guru</Text>
            <Text style={styles.txtName}>
              {nama ? `Welcome ${nama} !` : "Loading Name..."}
            </Text>
            <Text>Jumlah Tugas: {tugas?.length}</Text>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            style={[styles.iconCircle, { backgroundColor: "#FFF0F0" }]}
          >
            <Ionicons name="log-out-outline" size={20} color="#FF4757" />
          </TouchableOpacity>
        </View>

        {/* --- STATS MINI --- */}
        <View style={styles.statsRow}>
          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>{tugas.length}</Text>
            <Text style={styles.statsLabel}>Total Tugas</Text>
          </View>
          
          <TouchableOpacity
            style={[styles.statsCard, { backgroundColor: "#0D47A1" }]}
            onPress={() => setModalVisible(true)} 
          >
            <Ionicons name="add-circle" size={30} color="white" />
            <Text style={[styles.statsLabel, { color: "white" }]}>Buat Tugas</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.btnPengumuman} 
            onPress={() => setModalPengumumanVisible(true)}
          >
            <Ionicons name="megaphone" size={24} color="white" />
            <Text style={{color: 'white', marginLeft: 10, fontWeight: 'bold'}}>Buat Info</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1, paddingHorizontal: 20 }}>
          {viewMode === 'listKelas' ? (
            <>
              <Text style={styles.sectionTitle}>Pilih Kelas</Text>
              {renderKelasCards()}
            </>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Monitoring Tugas</Text>
              {renderTugasByKelas()}
            </>
          )}
        </View>
      </ScrollView>

      {/* --- MODAL BUAT PENGUMUMAN --- */}
      <Modal visible={modalPengumumanVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Kirim Pengumuman Ke Siswa</Text>

            <Text style={styles.label}>Judul Info</Text>
            <TextInput
              style={styles.input}
              placeholder="Misal: Minggu Depan Ulangan"
              value={judul}
              onChangeText={setJudul}
            />

            <Text style={styles.label}>Isi Pengumuman</Text>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              placeholder="Tulis detail informasinya di sini..."
              multiline
              value={isi}
              onChangeText={setIsi}
            />

            <Text style={styles.label}>Pilih Kelas Tujuan</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedKelas}
                onValueChange={(itemValue) => setSelectedKelas(itemValue)}
              >
                <Picker.Item label="-- Pilih Kelas --" value="" />
                {daftarKelas.map((k) => (
                  <Picker.Item key={k.id} label={k.nama_kelas} value={k.id.toString()} />
                ))}
              </Picker>
            </View>

            <View style={{ marginBottom: 10 }}>
    <Text style={styles.label}>Tanggal Pengumuman</Text>
    {/* Menggunakan elemen input HTML murni khusus runtime web */}
    <input
      type="date"
      style={{
        width: '100%',
        height: '40px',
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid #CCC',
        backgroundColor: '#F9F9F9',
        fontSize: '14px',
        fontFamily: 'sans-serif',
        marginTop: '5px',
        boxSizing: 'border-box'
      }}
      value={tanggalBerakhir.toISOString().split('T')[0]}
      onChange={(e) => setTanggalBerakhir(new Date(e.target.value))}
    />
  </View>

            <View style={styles.modalAction}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => setModalPengumumanVisible(false)}
              >
                <Text style={{ color: "#666" }}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnConfirm, { backgroundColor: '#D32F2F' }]}
                onPress={handleKirimPengumuman}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>Kirim Info</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- MODAL INPUT FORM TUGAS REMEDIAL --- */}
<Modal visible={modalRemedialVisible} animationType="slide" transparent>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Text style={[styles.modalTitle, { color: '#D32F2F' }]}>Buat Tugas Remedial</Text>

      <Text style={styles.label}>Judul Tugas</Text>
      <TextInput
        style={[styles.input, { backgroundColor: '#FFF5F5' }]}
        value={formRemedial.judul_tugas}
        onChangeText={(v) => setFormRemedial({ ...formRemedial, judul_tugas: v })}
      />

      <Text style={styles.label}>Instruksi/Deskripsi Remedial</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        multiline
        value={formRemedial.deskripsi_tugas}
        onChangeText={(v) => setFormRemedial({ ...formRemedial, deskripsi_tugas: v })}
      />

      <Text style={styles.label}>Deadline Pengumpulan Remedial</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD (Contoh: 2026-05-24)"
        value={formRemedial.deadline}
        onChangeText={(v) => setFormRemedial({ ...formRemedial, deadline: v })}
      />
      <Text style={styles.label}>Deadline Pengumpulan Remedial</Text>
{/* Menggunakan kalender HTML murni untuk input deadline remedial */}
<input
  type="date"
  style={{
    width: '100%',
    height: '40px',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #CCC',
    backgroundColor: '#F9F9F9',
    fontSize: '14px',
    fontFamily: 'sans-serif',
    marginTop: '5px',
    boxSizing: 'border-box'
  }}
  value={formRemedial.deadline}
  onChange={(e) => setFormRemedial({ ...formRemedial, deadline: e.target.value })}
/>

      <View style={styles.modalAction}>
        <TouchableOpacity
          style={styles.btnCancel}
          onPress={() => setModalRemedialVisible(false)}
        >
          <Text style={{ color: "#666" }}>Batal</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btnConfirm, { backgroundColor: '#D32F2F' }]}
          onPress={handlePublishRemedial}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Publish Remedial</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

      {/* --- MODAL TAMBAH TUGAS --- */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Publish Tugas Baru</Text>

            <Text style={styles.label}>Judul Tugas</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Latihan Aljabar"
              value={form.judul_tugas}
              onChangeText={(v) => setForm({ ...form, judul_tugas: v })}
            />

            <Text style={styles.label}>Instruksi/Deskripsi</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Apa yang harus dikerjakan?"
              multiline
              value={form.deskripsi_tugas}
              onChangeText={(v) => setForm({ ...form, deskripsi_tugas: v })}
            />

            <Text style={styles.label}>Pilih Kelas</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedKelasTugas} 
                onValueChange={(itemValue) => setSelectedKelasTugas(itemValue)}
              >
                <Picker.Item label="-- Pilih Kelas --" value="" />
                {daftarKelas.map((k) => (
                  <Picker.Item key={k.id} label={k.nama_kelas} value={k.id.toString()} />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Deadline</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={form.deadline}
              onChangeText={(v) => setForm({ ...form, deadline: v })}
            />

            <View style={styles.modalAction}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: "#666" }}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnConfirm}
                onPress={handlePublish}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>Publish</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// 🎨 Tambahan style untuk tombol remedial terintegrasi
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  headerGuru: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, backgroundColor: "#FFF" },
  txtRole: { fontSize: 12, color: "#777" },
  txtName: { fontSize: 18, fontWeight: "bold", color: "#333" },
  iconCircle: { padding: 10, borderRadius: 20 },
  statsRow: { flexDirection: "row", padding: 20, justifyContent: "space-between" },
  statsCard: { flex: 1, backgroundColor: "#FFF", padding: 15, borderRadius: 12, alignItems: "center", marginHorizontal: 5, elevation: 2 },
  statsNumber: { fontSize: 20, fontWeight: "bold", color: "#0D47A1" },
  statsLabel: { fontSize: 12, color: "#666", marginTop: 4 },
  btnPengumuman: { flex: 1.2, backgroundColor: "#D32F2F", flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 12, marginHorizontal: 5, padding: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginVertical: 15, color: "#333" },
  cardKelas: { flex: 1, backgroundColor: "#FFF", padding: 20, margin: 8, borderRadius: 12, alignItems: "center", borderWidth: 1, borderColor: "#E0E0E0" },
  textKelas: { fontSize: 16, fontWeight: "bold", marginTop: 8 },
  textJumlahTugas: { fontSize: 12, color: "#4A90E2", marginTop: 4 },
  taskContainer: { backgroundColor: "#FFF", borderRadius: 12, marginVertical: 8, borderWidth: 1, borderColor: "#E0E0E0", overflow: "hidden" },
  taskCard: { flexDirection: "row", alignItems: "center", padding: 15 },
  taskIcon: { padding: 8, backgroundColor: "#E3F2FD", borderRadius: 8 },
  taskTitle: { fontSize: 14, fontWeight: "bold", color: "#333" },
  progressBg: { height: 6, backgroundColor: "#EEE", borderRadius: 3, marginTop: 8 },
  progressFill: { height: 6, backgroundColor: "#4CAF50", borderRadius: 3 },
  countBadge: { backgroundColor: "#0D47A1", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  countText: { color: "#FFF", fontSize: 12, fontWeight: "bold" },
  btnActionRemedial: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#FFEBEE", paddingVertical: 8, borderTopWidth: 1, borderTopColor: "#FFCDD2" },
  btnActionRemedialText: { color: "#D32F2F", fontSize: 12, fontWeight: "bold", marginLeft: 6 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
  modalContent: { backgroundColor: "#FFF", padding: 20, borderRadius: 16 },
  modalTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  label: { fontSize: 12, fontWeight: "bold", marginTop: 10, color: "#555" },
  input: { borderWidth: 1, borderColor: "#CCC", borderRadius: 8, padding: 10, marginTop: 5, fontSize: 14 },
  pickerContainer: { borderWidth: 1, borderColor: "#CCC", borderRadius: 8, marginTop: 5, overflow: "hidden" },
  modalAction: { flexDirection: "row", justifyContent: "flex-end", marginTop: 20 },
  btnCancel: { padding: 12, marginRight: 10 },
  btnConfirm: { backgroundColor: "#0D47A1", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
});