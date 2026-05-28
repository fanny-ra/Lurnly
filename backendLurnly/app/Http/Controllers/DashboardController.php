<?php

namespace App\Http\Controllers;

use App\Models\Guru;
use App\Models\Jadwal;
use App\Models\Tugas;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index() {
        $user = auth()->user(); // Ambil data siswa yang login

        $hariMap = [
            'Monday' => 'Senin',
            'Tuesday' => 'Selasa',
            'Wednesday' => 'Rabu',
            'Thursday' => 'Kamis',
            'Friday' => 'Jumat',
            'Saturday' => 'Sabtu',
            'Sunday' => 'Minggu',
        ];
        $hariIni = $hariMap[now()->format('l')];

    // Pastikan user ada dan punya kelas_id
    if (!$user || !$user->kelas_id) {
        return response()->json(['message' => 'User tidak punya kelas'], 404);
    }

    // Ambil Jadwal
    $jadwal = Jadwal::with('materi') // Pastikan nama relasi di Model Jadwal adalah 'materi'
        ->where('kelas_id', $user->kelas_id)
        ->where('hari', $hariIni)
        ->get();

    // Ambil Tugas
    $tugas = Tugas::with(['materi', 'pengumpulans' => function($query) use ($user) {
        $query->where('siswa_id', $user->id); // Pastikan hanya ambil pengumpulan milik si Raina
    }])
    ->where('kelas_id', $user->kelas_id)
    // ->where('deadline', '>=', now()) // Matikan ini dulu kalau mau tes
    ->get();

    return response()->json([
        'user' => $user,
        'jadwal' => $jadwal,
        'tugasMendesak' => $tugas
    ]);
    }

    public function dashboardGuru()
{
    // Ambil data guru yang sedang login
    $guru = auth()->user();

    // Ambil daftar tugas yang dibuat oleh guru ini
    $daftarTugas = \App\Models\Tugas::where('guru_id', $guru->id)
        ->with(['kelas', 'pengumpulans']) // Load relasi pengumpulan nilai siswa
        ->get()
        ->map(function ($tugas) {

            // 💡 HITUNG JUMLAH YANG SUDAH MENGUMPULKAN
            $tugas->pengumpulans_count = $tugas->pengumpulans->count();

            // 🔍 VALIDASI KKM: Cek apakah ada nilai siswa yang <= 75
            $tugas->punya_siswa_remedial = $tugas->pengumpulans
                ->whereNotNull('nilai')
                ->where('nilai', '<=', 75)
                ->isNotEmpty(); // Menghasilkan true jika ada siswa remedial, false jika tidak ada

            return $tugas;
        });

    return response()->json([
        'success' => true,
        'guru' => $guru,
        'daftarTugas' => $daftarTugas
    ]);
}

    public function getKelas()
    {
        try {
            $kelas = DB::table('kelas')->select('id', 'nama_kelas')->get();

            return response()->json([
                'success' => true,
                'data' => $kelas
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil kelas: ' . $e->getMessage()
            ], 500);
        }
    }
}
