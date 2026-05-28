<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Kelas;

class KelasSeeder extends Seeder
{
    public function run()
    {
        $jurusans = ['RPL', 'AK 1', 'AK 2', 'BR', 'BD', 'MP', 'ML'];
        $tingkatans = [10, 11, 12];

        foreach ($jurusans as $jurusan) {
            foreach ($tingkatans as $tingkat) {
                Kelas::create([
                    'nama_kelas' => "$tingkat $jurusan" // Hasilnya: "10 RPL", "11 RPL", dst
                ]);
            }
        }
    }
}
