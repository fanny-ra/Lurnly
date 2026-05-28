<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TugasSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('tugas')->insert([
            [
                'materi_id' => 8, // Pastikan ID ini ada di tabel materis
                'guru_id' => 10,   // Pastikan ID ini ada di tabel gurus
                'kelas_id' => 2,
                'judul_tugas' => 'Latihan Soal Aljabar',
                'deskripsi_tugas' => 'Kerjakan soal halaman 45-47 di buku cetak. Foto jawaban dan upload dalam format PDF.',
                'deadline' => Carbon::now()->addDays(3),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'materi_id' => 9,
                'guru_id' => 6,
                'kelas_id' => 2,
                'judul_tugas' => 'Analisis Puisi Lama',
                'deskripsi_tugas' => 'Cari satu puisi lama, lalu analisis rima dan maknanya. Ketik rapi di MS Word.',
                'deadline' => Carbon::now()->addDays(5),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'materi_id' => 10,
                'guru_id' => 4,
                'kelas_id' => 2,
                'judul_tugas' => 'Latihan soal sistem pemerintahan, bentuk negara, dan bentuk pemerintahan',
                'deskripsi_tugas' => 'Carilah pengertian dari sistem pemerintahan, bentuk negara, dan bentuk pemerintahan',
                'deadline' => Carbon::now()->addDays(7),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ]);
    }
}
