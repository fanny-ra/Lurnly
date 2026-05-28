<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class GuruSeeder extends Seeder
{
    public function run(): void
    {
        $gurus = [
            [
                'nama' => 'Muh. Nurrohman, S.Kom',
                'mapel' => 'Konsentrasi Keahlian',
            ],
            [
                'nama' => 'Mujahid Rabbani Sholahudin, S.Pd',
                'mapel' => 'Konsentrasi Keahlian, PJOK',
            ],
            [
                'nama' => 'Faris Naufal, S.Pd',
                'mapel' => 'Mata Pelajaran Pilihan, Produk Kreatif & Kewirausahaan',
            ],
            [
                'nama' => 'Habibah, S.Pd',
                'mapel' => 'Pendidikan Pancasila',
            ],
            [
                'nama' => 'Siti Syarifah, S.Pd',
                'mapel' => 'Sejarah',
            ],
            [
                'nama' => 'Sudewo Pranowo, M.Pd',
                'mapel' => 'B. Indonesia',
            ],
            [
                'nama' => 'Ahmad Sustisna, S.Pd',
                'mapel' => 'B. Inggris',
            ],
            [
                'nama' => 'Nurul Asfiyah, S.Pd',
                'mapel' => 'Pendidikan Agama Islam',
            ],
            [
                'nama' => 'Wuryaningrum, S.Pd',
                'mapel' => 'B. Jepang',
            ],
        ];

        foreach ($gurus as $guru) {
            // Generate NIP random awalan 198 (total 18 digit standar NIP)
            $nip = '198' . rand(100000000000000, 999999999999999);

            // Generate email otomatis dari nama (kecilkan huruf, buang spasi & gelar)
            $cleanName = strtolower(str_replace([' ', '.', ','], '', explode(',', $guru['nama'])[0]));
            $email = $cleanName . '@lurnly.sch.id';

            DB::table('gurus')->insert([
                'nip' => $nip,
                'nama' => $guru['nama'],
                'mapel' => $guru['mapel'],
                'email' => $email,
                'password' => Hash::make('password123'), // Password seragam: password123
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
