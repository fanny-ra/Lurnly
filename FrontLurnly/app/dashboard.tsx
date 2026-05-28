import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Tugas {
  id: number;
  materi_id: number;
  judul_tugas: string;
  deskripsi_tugas: string;
  deadline: string;
  is_remedial: number;
  pengumpulans?: any[];
}

interface Pengumuman {
  id: number;
  judul: string;
  isi: string;
  kelas_id: number;
  guru_id: number;
  tanggal_berakhir?: string | null;
  created_at?: string;
  guru?: {
    id: number;
    nama: string;
  };
}

export default function Dashboard() {
  const API_URL = "http://127.0.0.1:8000";

  const [nama, setNama] = useState("User");
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [jadwal, setJadwal] = useState<any[]>([]);
  const [listPengumuman, setListPengumuman] = useState<any[]>([]);

  // State manajemen pembagian kelompok tugas
  const [tugasReguler, setTugasReguler] = useState<Tugas[]>([]);
  const [tugasRemedial, setTugasRemedial] = useState<Tugas[]>([]);
  const [tugasSelesai, setTugasSelesai] = useState<Tugas[]>([]);

  const router = useRouter();

  // Fungsi pengecekan apakah tugas sudah melewati deadline
  const isLate = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    return now > deadlineDate;
  };

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const savedRole = await AsyncStorage.getItem("userRole");
      setRole(savedRole || "");

      if (token) {
        const [userRes, dashRes] = await Promise.all([
          axios.get(`${API_URL}/api/user`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/api/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // 1. Set Profil & Jadwal
        setNama(userRes.data.nama || userRes.data.name || "User");
        setJadwal(dashRes.data.jadwal || []);

        // 2. Filter data Tugas secara realtime berdasarkan data gabungan backend
        const semuaTugas = dashRes.data.tugasMendesak || [];

        if (Array.isArray(semuaTugas)) {
          // A. KELOMPOK TUGAS SELESAI: Tugas reguler biasa yang sudah dikumpulkan siswa
          const selesai = semuaTugas.filter(
            (t: Tugas) =>
              (t.is_remedial === 0 || !t.is_remedial) &&
              t.pengumpulans &&
              t.pengumpulans.length > 0,
          );

          // B. KELOMPOK TUGAS REGULER: Bukan remedial DAN belum dikumpulkan sama sekali
          const reguler = semuaTugas.filter(
            (t: Tugas) =>
              (t.is_remedial === 0 || !t.is_remedial) &&
              (!t.pengumpulans || t.pengumpulans.length === 0),
          );

          // C. KELOMPOK TUGAS REMEDIAL: Lolos jika tipe remedial dan siswa belum mengumpulkan tugas perbaikan ini
          const remedial = semuaTugas.filter((t: Tugas) => {
            // Syarat 1: Validasi apakah data dari database merupakan tugas remedial
            const isRemedialType = t.is_remedial === 1;
            if (!isRemedialType) return false;

            // Syarat 2: Pastikan siswa belum mengumpulkan tugas perbaikan (remedial) ini
            // Catatan: Jika data 'pengumpulans' milik remedial masih kosong atau di bawah 1, maka tampilkan ke dashboard
            const sudahKumpulRemedial =
              t.pengumpulans && t.pengumpulans.length > 0;

            return !sudahKumpulRemedial;
          });

          setTugasReguler(reguler);
          setTugasRemedial(remedial);
          setTugasSelesai(selesai);
        }

        // 3. Ambil data Pengumuman Kelas
        const kelasIdSiswa = userRes.data.kelas_id || userRes.data.id_kelas;
        if (kelasIdSiswa) {
          getPengumumanByKelas(kelasIdSiswa, token);
        }
      }
    } catch (error) {
      console.log("Gagal ambil data user dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPengumumanByKelas = async (
    kelasId: number | string,
    token: string,
  ) => {
    try {
      const res = await axios.get(`${API_URL}/api/pengumuman/${kelasId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setListPengumuman(res.data.data);
      }
    } catch (e: any) {
      console.log("Gagal ambil pengumuman:", e.message);
    }
  };

  useEffect(() => {
    const initDashboard = async () => {
      const userData = await AsyncStorage.getItem("user");
      const token = await AsyncStorage.getItem("userToken");

      if (userData) {
        const user = JSON.parse(userData);
        if (user.role === "guru") {
          router.replace("/dashboardGuru");
          return;
        }

        if (user.kelas_id && token) {
          try {
            const res = await axios.get(
              `${API_URL}/api/pengumuman/${user.kelas_id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            );
            if (res.data.success) {
              setListPengumuman(res.data.data);
            }
          } catch (e: any) {
            console.log("Gagal ambil pengumuman awal:", e.message);
          }
        }
      }
    };
    initDashboard();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, []),
  );

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace("/login");
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#001456" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, marginHorizontal: 20 }}
      >
        {/* --- HEADER SECTION --- */}
        <View style={styles.header}>
          <View style={styles.topRow}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>Hellooo, {nama}</Text>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={() => router.push("/tugas")}
                style={[styles.iconCircle, { backgroundColor: "#EBF5FB" }]}
              >
                <Ionicons name="clipboard-outline" size={20} color="#5DADE2" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleLogout}
                style={[styles.iconCircle, { backgroundColor: "#FFF0F0" }]}
              >
                <Ionicons name="log-out-outline" size={20} color="#FF4757" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.quoteCard}>
            <Text style={styles.quoteText}>
              "Jangan berhenti belajar sampai kamu bangga."
            </Text>
          </View>
        </View>

        {/* --- PENGUMUMAN SECTION --- */}
        {listPengumuman.length > 0 && (
          <View style={styles.notifContainer}>
            <View style={styles.notifHeader}>
              <Ionicons name="megaphone" size={20} color="#D32F2F" />
              <Text style={styles.notifTitle}>Info dari Guru</Text>
            </View>

            {listPengumuman.map((item: Pengumuman) => (
              <View key={item.id} style={styles.cardNotif}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Text style={styles.txtJudulNotif}>{item.judul}</Text>

                  {item.created_at && (
                    <Text
                      style={{
                        fontSize: 10,
                        color: "#95A5A6",
                        fontWeight: "500",
                      }}
                    >
                      {new Date(item.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                    </Text>
                  )}
                </View>

                <Text style={styles.txtIsiNotif}>{item.isi}</Text>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 8,
                  }}
                >
                  {item.tanggal_berakhir ? (
                    <Text
                      style={{
                        fontSize: 10,
                        color: "#E74C3C",
                        fontStyle: "italic",
                        fontWeight: "500",
                      }}
                    >
                      ⏰ Berlaku s/d:{" "}
                      {new Date(item.tanggal_berakhir).toLocaleDateString(
                        "id-ID",
                        { day: "numeric", month: "short", year: "numeric" },
                      )}
                    </Text>
                  ) : (
                    <Text
                      style={{
                        fontSize: 10,
                        color: "#2ECC71",
                        fontStyle: "italic",
                      }}
                    >
                      📌 Pengumuman Tetap
                    </Text>
                  )}

                  <Text style={styles.txtGuru}>
                    Oleh: {item.guru?.nama || "Guru Kelas"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* --- JADWAL SECTION --- */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Jadwal</Text>
          <TouchableOpacity onPress={() => router.push("/jadwal")}>
            <Text style={styles.seeAll}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.scheduleCard}>
          <View style={styles.dayBanner}>
            <Text style={styles.dayText}>
              {new Date().toLocaleDateString("id-ID", { weekday: "long" })}
            </Text>
          </View>
          <View style={styles.scheduleContent}>
            {jadwal && jadwal.length > 0 ? (
              jadwal.map((item, index) => (
                <View key={index} style={styles.subjectRow}>
                  <Text style={styles.subjectName}>
                    {item.materi?.matapelajaran || "Mata Pelajaran"}
                  </Text>
                  <Text style={styles.subjectTime}>
                    {item.jam_mulai?.substring(0, 5)} -{" "}
                    {item.jam_selesai?.substring(0, 5)}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={{ color: "#999", textAlign: "center" }}>
                Tidak ada jadwal hari ini
              </Text>
            )}
          </View>
        </View>

        {/* --- TUGAS SECTION --- */}

        {/* ==================== 1. SEKSI TUGAS REGULER BIASA ==================== */}
        <Text style={styles.sectionTitleMargin}>Tugas Perlu Dikumpulkan</Text>
        {tugasReguler.length > 0 ? (
          tugasReguler.map((t, index) => {
            const sudahTelat = isLate(t.deadline);
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.taskCardLarge,
                  sudahTelat && styles.taskCardLate,
                ]}
                onPress={() =>
                  router.push({ pathname: "/tugas", params: { id: t.id } })
                }
              >
                <View style={styles.taskIconContainer}>
                  <Text style={{ fontSize: 24 }}>
                    {sudahTelat ? "⚠️" : "📝"}
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: 15 }}>
                  <Text
                    style={[
                      styles.taskTitle,
                      sudahTelat && { color: "#c0392b" },
                    ]}
                  >
                    {t.judul_tugas}
                  </Text>
                  <Text
                    style={[
                      styles.taskDeadline,
                      sudahTelat && { color: "#e74c3c" },
                    ]}
                  >
                    Deadline: {t.deadline}
                  </Text>
                  {sudahTelat && (
                    <Text style={styles.textWarning}>
                      Anda melewati batas waktu pengumpulan!
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={{ padding: 20, alignItems: "center" }}>
            <Text
              style={{
                color: "#2ecc71",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Hore! Semua tugas reguler sudah selesai ✨
            </Text>
          </View>
        )}

        {/* ==================== 2. SEKSI KHUSUS TUGAS REMEDIAL ==================== */}
        {tugasRemedial.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <Text style={[styles.sectionTitleMargin, { color: "#e74c3c" }]}>
              ⚠️ Tugas Perbaikan (Remedial)
            </Text>
            {tugasRemedial.map((t, index) => {
              const sudahTelat = isLate(t.deadline);
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.taskCardLarge,
                    {
                      backgroundColor: "#fff5f5",
                      borderColor: "#fbb6b6",
                      borderWidth: 1,
                      borderLeftWidth: 5,
                      borderLeftColor: "#e74c3c",
                    },
                    sudahTelat && styles.taskCardLate,
                  ]}
                  onPress={() =>
                    router.push({ pathname: "/tugas", params: { id: t.id } })
                  }
                >
                  <View
                    style={[
                      styles.taskIconContainer,
                      { backgroundColor: "#fde8e8" },
                    ]}
                  >
                    <Text style={{ fontSize: 24 }}>🔥</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 15 }}>
                    <Text
                      style={{
                        fontWeight: "bold",
                        color: "#c0392b",
                        fontSize: 16,
                      }}
                    >
                      {t.judul_tugas}
                    </Text>
                    <Text
                      style={{
                        color: "#e74c3c",
                        fontSize: 12,
                        marginTop: 2,
                        fontWeight: "600",
                      }}
                    >
                      Batas Remedial: {t.deadline}
                    </Text>
                    {sudahTelat && (
                      <Text style={[styles.textWarning, { color: "#c0392b" }]}>
                        Batas waktu perbaikan remedial telah habis!
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ==================== 3. SEKSI TUGAS SELESAI ==================== */}
        {tugasSelesai.length > 0 && (
          <>
            <Text
              style={[
                styles.sectionTitleMargin,
                { marginTop: 20, color: "#2ecc71" },
              ]}
            >
              Tugas Selesai ✨
            </Text>
            {tugasSelesai.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.cardSelesai}
                onPress={() =>
                  router.push({
                    pathname: "/tugas-detail",
                    params: {
                      id: item.id,
                      judul: item.judul_tugas,
                      deskripsi: item.deskripsi_tugas,
                      deadline: item.deadline,
                    },
                  })
                }
              >
                <Ionicons
                  name="checkmark-done-circle"
                  size={24}
                  color="#2ECC71"
                  style={{ marginRight: 10 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.textSelesai} numberOfLines={1}>
                    {item.judul_tugas}
                  </Text>
                  <Text style={styles.lihatNilai}>
                    {item.pengumpulans?.[0]?.nilai !== null
                      ? `Nilai: ${item.pengumpulans?.[0]?.nilai}`
                      : "Belum Dinilai"}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#CCC" />
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Catatan: Pastikan object styles bawaan kode Anda tetap berada di bagian paling bawah file ini.
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { marginBottom: 20 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: "bold", color: "#333" },
  actionButtons: { flexDirection: "row" },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  quoteCard: {
    backgroundColor: "#F2F4F4",
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
  },
  quoteText: { fontStyle: "italic", color: "#555", textAlign: "center" },
  notifContainer: {
    backgroundColor: "#FDEDEC",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  notifHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  notifTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#D32F2F",
    marginLeft: 5,
  },
  cardNotif: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#FADBD8",
  },
  txtJudulNotif: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#7B241C",
    flex: 1,
    marginRight: 10,
  },
  txtIsiNotif: { color: "#555", fontSize: 13, marginTop: 5 },
  txtGuru: { fontSize: 10, color: "#7F8C8D", fontWeight: "bold" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#333" },
  seeAll: { color: "#2980B9", fontSize: 14 },
  scheduleCard: {
    backgroundColor: "#FAF9F6",
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EAECEE",
  },
  dayBanner: { backgroundColor: "#001456", padding: 10 },
  dayText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
  scheduleContent: { padding: 15 },
  subjectRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  subjectName: { fontWeight: "600", color: "#333" },
  subjectTime: { color: "#7F8C8D" },
  sectionTitleMargin: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 15,
    marginBottom: 10,
  },
  taskCardLarge: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7E9",
  },
  taskCardLate: { borderColor: "#FADBD8", backgroundColor: "#FDEDEC" },
  taskIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#EAEDED",
    justifyContent: "center",
    alignItems: "center",
  },
  taskTitle: { fontWeight: "bold", fontSize: 15, color: "#2C3E50" },
  taskDeadline: { color: "#7F8C8D", fontSize: 12, marginTop: 3 },
  textWarning: {
    color: "#E74C3C",
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 5,
  },
  cardSelesai: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D5F5E3",
  },
  textSelesai: { fontWeight: "600", fontSize: 15, color: "#27AE60" },
  lihatNilai: {
    fontSize: 12,
    color: "#2ECC71",
    marginTop: 2,
    fontWeight: "500",
  },
});
