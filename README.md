# 📚 Lurnly - Sistem Manajemen Tugas & Otomatisasi Remedial Sekolah

**Lurnly** adalah aplikasi perangkat bergerak (mobile app) yang dirancang khusus untuk mempermudah, merapikan, dan mempercepat interaksi belajar-mengajar antara **Guru** dan **Siswa**. 

Berbeda dengan aplikasi pencatat tugas biasa, Lurnly dilengkapi dengan kecerdasan sistem yang mampu mendeteksi nilai siswa secara mandiri. Jika nilai siswa berada di bawah standar, aplikasi akan langsung bergerak otomatis tanpa perlu campur tangan atau instruksi manual dari guru.

---

## ⚙️ Bagaimana Aplikasi Ini Bekerja? (Alur Sistem)

Lurnly bekerja layaknya asisten akademik digital 24 jam yang menghubungkan Guru dan Siswa dalam satu siklus perputaran data yang rapi:


```

[1. Guru Membuat Tugas Umum]
│
▼
[2. Siswa Menerima & Mengumpulkan Berkas]
│
▼
[3. Guru Memeriksa & Memberi Nilai]
│
├─► (Jika Nilai >= 75) ──► Tugas Selesai & Masuk Arsip Kelulusan
│
└─► (Jika Nilai < 75)  ──► SISTEM OTOMATIS MEMBUAT TUGAS REMEDIAL

```

1. **Penyaringan Akun Otomatis:** Begitu pengguna membuka aplikasi dan masuk (login), sistem langsung membaca jenis akun tersebut untuk membuka pintu halaman yang sesuai (Halaman khusus Siswa atau Halaman khusus Guru).
2. **Penerbitan Tugas:** Guru menerbitkan tugas pelajaran biasa di ruang kontrolnya, lengkap dengan petunjuk pengerjaan dan batas waktu (*deadline*).
3. **Penyebaran Tugas Realtime:** Tanpa perlu memuat ulang (*refresh*) aplikasi, tugas tersebut langsung muncul di handphone siswa yang berada di kelas tersebut.
4. **Pengumpulan & Penilaian:** Siswa mengirimkan lembar jawaban mereka berupa berkas digital melalui aplikasi. Guru kemudian memeriksa berkas tersebut dan langsung mengetikkan angka nilainya.
5. **Evaluasi Mandiri Sistem (Pemicu Remedial):** Di sinilah keunggulan Lurnly. Sistem akan membaca angka nilai yang diinput oleh guru. Jika nilai siswa berada di bawah KKM (Kriteria Ketuntasan Minimal, yaitu **75**), sistem akan langsung mengaktifkan tugas khusus bertipe **Remedial** di handphone siswa yang bersangkutan saat itu juga.

---

## 🎯 Detail Fitur Utama Aplikasi

Aplikasi Lurnly memisahkan fitur menjadi dua bagian besar berdasarkan hak akses penggunanya:

### 👨‍🎓 1. Portal Utama Siswa (Student Dashboard)
Halaman depan siswa dirancang dengan pendekatan adaptif, di mana tampilan layar akan berubah secara fleksibel sesuai dengan status akademik siswa saat itu. Layar dibagi menjadi 3 blok utama:

* **⚡ Blok 1: Tugas Perlu Dikumpulkan (Daftar Kerja Aktif)**
  * **Fungsi:** Menampilkan semua tugas sekolah biasa yang statusnya masih aktif dan belum pernah dikerjakan oleh siswa.
  * **Sistem Peringatan Keterlambatan (*Overdue Warning*):** Jika jam di HP siswa sudah melewati batas waktu yang ditentukan guru, kartu tugas akan otomatis berubah warna menjadi kemerahan dan memunculkan simbol bahaya (`⚠️ Anda melewati batas waktu pengumpulan!`). Fitur ini melatih kedisiplinan siswa agar tidak menunda pekerjaan.

* **🛡️ Blok 2: Tugas Perbaikan / Remedial (Ruang Kondisional)**
  * **Fungsi:** Ruang ini adalah fitur pintar yang bersifat rahasia dan kondisional. Artinya, **halaman ini akan kosong bersih** jika siswa selalu mendapatkan nilai bagus. 
  * **Cara Kerja:** Tugas remedial baru akan menampakkan diri di layar ini jika dan hanya jika siswa tersebut memiliki riwayat nilai di bawah 75 pada tugas biasa. Siswa bisa langsung mengerjakan perbaikan tanpa perlu merasa malu karena harus ditagih secara manual oleh guru di depan kelas.

* **✅ Blok 3: Tugas Selesai (Arsip & Transparansi Nilai)**
  * **Fungsi:** Berfungsi sebagai buku rapor digital mini. Semua tugas yang sudah diklik dan dikirim oleh siswa akan pindah ke kompartemen ini.
  * **Transparansi Nilai Nyata (*Live Score*):** Siswa tidak perlu lagi bertanya-tanya *"Tugas saya sudah diperiksa atau belum?"*. Jika guru belum sempat memeriksa, kartu tugas akan tertulis `Belum Dinilai`. Namun, begitu guru selesai mengoreksi, statusnya akan langsung berubah menampilkan angka riil (misal: `Nilai: 80`).

> **📌 Fitur Pendukung Siswa:**
> * 📅 **Jadwal Pelajaran Otomatis:** Layar jadwal tidak akan menampilkan hari Senin sampai Jumat sekaligus yang membuat bingung. Layar ini pintar, ia hanya akan menampilkan mata pelajaran yang harus diikuti **hari ini saja** (berubah otomatis mengikuti kalender di HP).
> * 📢 **Mading Pengumuman Digital:** Tempat bagi siswa untuk membaca maklumat penting atau instruksi mendadak yang disiarkan langsung oleh wali kelas atau guru mata pelajaran mereka.

---

### 👩‍🏫 2. Portal Utama Guru (Teacher Control Center)
Guru diberikan kendali penuh penuh untuk memegang kendali manajemen kelas, pembuatan soal, hingga rekapitulasi nilai:

* **📝 Pembuat Tugas Pintar (*Task Creator Engine*):**
  * Guru dapat membuat tugas reguler baru dengan memasukkan judul, deskripsi petunjuk, serta memilih tanggal dan jam tenggat waktu melalui kalender digital yang mudah digunakan.
  * Guru juga bisa membuat tugas khusus yang diberi label/flag `is_remedial`. Tugas inilah yang nantinya akan mengendap di sistem dan hanya keluar secara otomatis kepada siswa-siswa yang nilainya tidak tuntas.
* **📊 Pusat Pengumpulan Terpusat (*Grading Center*):**
  * Guru tidak perlu memeriksa pesan satu per satu. Lurnly mengumpulkan seluruh berkas kiriman siswa di dalam satu halaman yang rapi.
  * Dilengkapi dengan fitur **Kolom Pencarian Nama**, sehingga guru bisa mengetik nama siswa tertentu untuk melihat apakah dia sudah mengumpulkan tugas atau belum dalam hitungan detik.
* **⚡ Penilaian Instan (*One-Click Grading*):**
  * Guru dapat membuka berkas tugas siswa, lalu langsung mengetikkan nilai pada kolom yang disediakan. Begitu tombol simpan ditekan, nilai tersebut langsung menyebar: masuk ke arsip siswa, dan menentukan apakah siswa itu perlu remedial atau tidak.
* **📢 Siaran Pengumuman Massal (*Broadcast Bulletin*):**
  * Fasilitas untuk membuat pengumuman (seperti info libur, tugas pengganti, atau pesan motivasi) yang ditujukan ke kelas tertentu, lengkap dengan pengaturan tanggal kedaluwarsa agar pengumuman bisa terhapus otomatis jika sudah tidak berlaku.

---

## 🛠️ Penjelasan Sederhana Teknologi di Balik Aplikasi

Mengapa aplikasi Lurnly bisa berjalan dengan sangat mulus, aman, dan pintar? Hal itu dikarenakan aplikasi ini dibangun di atas tiga teknologi utama berikut (dijelaskan dengan analogi sederhana):

### 1. Sistem Pembaca Peran (*Role-Based JWT Authentication*)
* **Analogi Sederhana:** *Gelang Tiket Masuk Bioskop.*
* **Cara Kerja:** Teknologi ini berfungsi menjaga keamanan gerbang aplikasi. Saat kamu mengetik email dan password lalu menekan tombol login, server internet (backend) akan memeriksa identitasmu dan memberikan sebuah kode rahasia digital bernama **JWT Token**. Kode ini berisi informasi peranmu. 
* Jika kodenya tertulis sebagai `Siswa`, aplikasi secara otomatis hanya akan membukakan pintu dashboard siswa. Jika kodenya tertulis `Guru`, aplikasi akan membuka ruang kendali guru. Teknologi ini memastikan siswa tidak akan pernah bisa mengintip halaman guru untuk mengubah nilai mereka sendiri.

### 2. Fitur Memori Ingat Akun (*Sesi Persisten via AsyncStorage*)
* **Analogi Sederhana:** *Fitur "Ingat Saya" atau Gembok Otomatis.*
* **Cara Kerja:** Pernahkah kamu merasa kesal dengan aplikasi yang setiap kali ditutup atau HP dimatikan, lalu pas dibuka lagi kita harus mengetik ulang email dan password dari awal? Lurnly mengatasi hal itu menggunakan `AsyncStorage`. 
* Teknologi ini bertindak sebagai memori jangka pendek khusus di dalam penyimpanan internal HP kamu. Begitu kamu sukses login untuk pertama kali, kode JWT Token kamu akan langsung disimpan di memori ini. Saat aplikasi dibuka kembali di lain waktu, Lurnly akan langsung membaca memori tersebut dan langsung memasukkanmu ke dashboard tanpa perlu login ulang.

### 3. Pembaruan Layar Tanpa Muat Ulang (*Realtime Sync via useFocusEffect*)
* **Analogi Sederhana:** *Mata Pengawas yang Selalu Memantau.*
* **Cara Kerja:** Pada aplikasi biasa, data di layar hanya akan diperbarui jika kita menutup aplikasi atau menarik layar ke bawah secara manual untuk melakukan penyegaran (*refresh*). Hal ini berbahaya jika guru baru saja menginput nilai atau tugas remedial baru, namun siswa tidak mengetahuinya karena layarnya belum diperbarui.
* Lurnly menggunakan teknologi `useFocusEffect`. Ini seperti menaruh "satpam pengawas" di layar dashboard. Setiap kali mata kamu melihat kembali ke layar dashboard (misalnya kamu baru saja kembali dari membaca halaman pengumuman, atau baru kembali dari melihat detail jadwal), si satpam ini secara otomatis langsung berlari ke server internet untuk mengambil data tugas dan nilai paling baru. Hasilnya, tampilan tugas dan nilai di handphonemu selalu segar dan akurat secara *realtime*.

```
