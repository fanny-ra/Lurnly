<?php

namespace Database\Seeders;

use App\Models\Guru;
use App\Models\Kelas;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash; // Tambahkan ini

class DatabaseSeeder extends Seeder
{
    public function run(): void
{
    $this->call([
        KelasSeeder::class,
        MateriSeeder::class, // Isi mapel dulu (IPA, MTK, dll)
        GuruSeeder::class,   // Isi data guru
        JadwalSeeder::class, // Jadwal terakhir karena butuh data di atas
    ]);
}
}
