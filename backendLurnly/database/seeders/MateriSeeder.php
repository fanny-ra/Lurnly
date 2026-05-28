<?php

namespace Database\Seeders;

use App\Models\Materi;
use App\Models\Kelas;
use App\Models\Guru;
use Illuminate\Database\Seeder;

class MateriSeeder extends Seeder
{
    public function run(): void
    {
        // Cari ID Kelas 11 AK 1
        $kelasAk = Kelas::where('nama_kelas', '11 AK 1')->first();
        // Cari ID Guru (Sesuaikan nama guru yang ada di database kamu)
        $guruHabibah = Guru::where('nama', 'LIKE', '%Habibah%')->first();
        $guruFaris = Guru::where('nama', 'LIKE', '%Faris%')->first();
        $guruSiti = Guru::where('nama', 'LIKE', '%Siti%')->first();

        $materis = [
            [
                'matapelajaran' => 'Akuntansi Keuangan',
                'deskripsi' => 'Mempelajari siklus akuntansi perusahaan',
                'kelas_id' => $kelasAk->id ?? null,
                'guru_id' => $guruHabibah->id ?? null,
                'file_path' => 'default.pdf'
            ],
            [
                'matapelajaran' => 'Praktikum Akuntansi Jasa',
                'deskripsi' => 'Praktik akuntansi pada perusahaan jasa dan dagang',
                'kelas_id' => $kelasAk->id ?? null,
                'guru_id' => $guruHabibah->id ?? null,
                'file_path' => 'default.pdf'
            ],
            [
                'matapelajaran' => 'Komputer Akuntansi',
                'deskripsi' => 'Penggunaan software akuntansi (MYOB/ Zahir)',
                'kelas_id' => $kelasAk->id ?? null,
                'guru_id' => $guruFaris->id ?? null,
                'file_path' => 'default.pdf'
            ],
            [
                'matapelajaran' => 'Administrasi Pajak',
                'deskripsi' => 'Perhitungan pajak penghasilan dan PPN',
                'kelas_id' => $kelasAk->id ?? null,
                'guru_id' => $guruSiti->id ?? null,
                'file_path' => 'default.pdf'
            ],
        ];

        foreach ($materis as $m) {
            if ($m['kelas_id'] && $m['guru_id']) {
                Materi::updateOrCreate(['matapelajaran' => $m['matapelajaran']], $m);
            }
        }
    }
}
