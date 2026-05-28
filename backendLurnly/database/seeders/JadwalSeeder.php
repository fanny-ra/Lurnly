<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Jadwal;
use App\Models\Kelas;
use App\Models\Materi;
use App\Models\Guru;
use Illuminate\Support\Facades\DB;

class JadwalSeeder extends Seeder
{
    public function run(): void
    {
        // Ambil Data Kelas
        $kelasRpl = Kelas::where('nama_kelas', '11 RPL')->first();
        $kelasAk = Kelas::where('nama_kelas', '11 AK 1')->first();

        // Helper cari ID Materi & Guru
        $getMateri = fn($nama) => DB::table('materis')->where('matapelajaran', 'LIKE', "%$nama%")->first()?->id;
        $getGuru = fn($nama) => Guru::where('nama', 'LIKE', "%$nama%")->first()?->id;

        // --- DATA JADWAL 11 RPL ---
        $jadwalRpl = [
            ['Senin', '07:15', '09:30', 'Pendidikan Agama Islam', 'Nurul Asfiyah'],
            ['Senin', '09:50', '11:20', 'Konsentrasi Keahlian', 'Mujahid Rabbani'],
            ['Senin', '11:20', '13:30', 'Sejarah', 'Siti Syarifah'],
            ['Senin', '13:30', '15:00', 'Mata Pelajaran Pilihan', 'Faris Naufal'],
            ['Selasa', '06:30', '10:35', 'Konsentrasi Keahlian', 'Mujahid Rabbani'],
            ['Selasa', '10:35', '12:05', 'Mata Pelajaran Pilihan', 'Faris Naufal'],
            ['Selasa', '12:45', '15:00', 'Produk Kreatif & Kewirausahaan', 'Faris Naufal'],
            ['Rabu', '07:15', '08:00', 'B. Jepang', 'Wuryaningrum'],
            ['Rabu', '08:00', '09:30', 'B. Inggris', 'Ahmad Sustisna'],
            ['Rabu', '09:50', '15:00', 'Konsentrasi Keahlian', 'Mujahid Rabbani'],
            ['Kamis', '06:30', '08:45', 'Matematika', 'Sudewo Pranowo'],
            ['Kamis', '08:45', '15:00', 'Konsentrasi Keahlian', 'Mujahid Rabbani'],
            ['Jumat', '07:15', '08:35', 'B. Inggris', 'Ahmad Sustisna'],
            ['Jumat', '08:35', '09:55', 'Produk Kreatif & Kewirausahaan', 'Faris Naufal'],
            ['Jumat', '10:15', '13:40', 'B. Indonesia', 'Sudewo Pranowo'],
            ['Jumat', '13:40', '15:00', 'Pendidikan Pancasila', 'Habibah'],
        ];

        // --- DATA JADWAL 11 AK 1 ---
        $jadwalAk = [
            // SENIN
            ['Senin', '07:15', '09:30', 'Akuntansi Keuangan', 'Habibah'],
            ['Senin', '09:50', '12:00', 'Praktikum Akuntansi Jasa', 'Habibah'],
            // SELASA
            ['Selasa', '07:15', '09:00', 'Matematika', 'Sudewo Pranowo'],
            ['Selasa', '09:00', '11:00', 'Perpajakan', 'Siti Syarifah'],
            // RABU
            ['Rabu', '07:15', '10:00', 'Komputer Akuntansi', 'Faris Naufal'],
            ['Rabu', '10:30', '13:00', 'Administrasi Pajak', 'Siti Syarifah'],
            // KAMIS
            ['Kamis', '07:15', '09:30', 'B. Inggris', 'Ahmad Sustisna'],
            ['Kamis', '10:00', '12:30', 'Produk Kreatif & Kewirausahaan', 'Faris Naufal'],
            // JUMAT
            ['Jumat', '07:15', '08:45', 'Pendidikan Agama Islam', 'Nurul Asfiyah'],
            ['Jumat', '09:00', '10:30', 'B. Indonesia', 'Sudewo Pranowo'],
            ['Jumat', '13:00', '14:30', 'Pendidikan Pancasila', 'Habibah'],
        ];

        // Proses Input Jadwal RPL
        if ($kelasRpl) {
            foreach ($jadwalRpl as $d) {
                $this->simpanJadwal($d, $kelasRpl->id, $getMateri, $getGuru);
            }
        }

        // Proses Input Jadwal AK
        if ($kelasAk) {
            foreach ($jadwalAk as $d) {
                $this->simpanJadwal($d, $kelasAk->id, $getMateri, $getGuru);
            }
        }
    }

    /**
     * Fungsi Helper agar kodingan tidak duplikat
     */
    private function simpanJadwal($data, $kelasId, $getMateri, $getGuru)
    {
        $mId = $getMateri($data[3]);
        $gId = $getGuru($data[4]);

        if ($mId && $gId) {
            Jadwal::updateOrCreate(
                [
                    'kelas_id' => $kelasId,
                    'hari' => $data[0],
                    'jam_mulai' => $data[1],
                ],
                [
                    'materi_id' => $mId,
                    'guru_id' => $gId,
                    'jam_selesai' => $data[2],
                ]
            );
        }
    }
}
