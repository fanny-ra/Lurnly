<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pengumpulan;
use App\Models\Tugas;
use App\Models\User;
use Illuminate\Http\Request;

class TugasController extends Controller
{
    public function index() {
        try {
            $user = auth()->user();

            // Cek apakah user benar-benar ada dan punya kelas_id
            if (!$user || !$user->kelas_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data kelas kamu tidak ditemukan. Coba logout dan login lagi.'
                ], 403);
            }

            $siswaId = $user->id;
            $kelasId = $user->kelas_id;

            // Ambil tugas yang HANYA untuk kelas_id si siswa
            $tugas = Tugas::where('kelas_id', $kelasId) // FILTER UTAMA
                ->with(['materi', 'guru', 'pengumpulans' => function($query) use ($siswaId) {
                    $query->where('siswa_id', $siswaId);
                }])
                ->orderBy('deadline', 'asc') // Urutkan biar yang paling dekat deadline di atas
                ->get();

            return response()->json([
                'success' => true,
                'data' => $tugas,
                'debug_info' => [
                    'nama' => $user->nama,
                    'kelas_user' => $kelasId
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    // Guru buat tugas baru
    public function store(Request $request) {
        $data = $request->validate([
            'materi_id' => 'required',
            'guru_id'   => 'required',
            'judul_tugas'     => 'required',
            'kelas_id' => 'required',
            'deskripsi_tugas' => 'required',
            'deadline'  => 'required', // format: YYYY-MM-DD
            'is_remedial' => 'nullable|boolean',
        ]);

        $tugas = Tugas::create($data);
        return response()->json(['success' => true, 'message' => 'Tugas berhasil dipublish', 'data' => $tugas], 201);
    }

    // Ganti fungsi show kamu dengan ini
    public function show($id) {
        // Eager loading pengumpulans dan relasi siswanya
        $tugas = Tugas::with(['kelas', 'pengumpulans.siswa'])->find($id);

        if (!$tugas) {
            return response()->json(['message' => 'Tugas tidak ditemukan'], 404);
        }

        return response()->json(['success' => true, 'data' => $tugas]);
    }

    // Tambahkan juga fungsi updateNilai (agar tombol send di aplikasi berfungsi)
    public function updateNilai(Request $request) {
        $request->validate([
            'pengumpulan_id' => 'required', // Sesuaikan dengan key di React Native
            'nilai' => 'required|numeric'
        ]);

        $data = Pengumpulan::find($request->pengumpulan_id);
        if($data) {
            $data->update(['nilai' => $request->nilai]);
            return response()->json(['success' => true, 'message' => 'Nilai berhasil diupdate', 'data' => $data]);
        }
        return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
    }

    // Update info tugas
    public function update(Request $request, $id) {
        $tugas = Tugas::find($id);
        if (!$tugas) return response()->json(['message' => 'Tugas tidak ditemukan'], 404);

        $tugas->update($request->all());
        return response()->json(['success' => true, 'message' => 'Tugas berhasil diupdate']);
    }

    // Hapus tugas (Misal tugasnya batal)
    public function destroy($id) {
        Tugas::destroy($id);
        return response()->json(['success' => true, 'message' => 'Tugas dihapus']);
    }

    public function rekapPengumpulan($id)
    {
        $tugas = Tugas::with('kelas')->find($id);
        if (!$tugas) return response()->json(['message' => 'Tugas tidak ditemukan'], 404);

        // 1. Ambil semua siswa di kelas yang sama dengan tugas ini
        $siswas = User::where('role', 'siswa')
                    ->where('kelas_id', $tugas->kelas_id)
                    ->get();

        // 2. Ambil data pengumpulan untuk tugas ini
        $pengumpulans = Pengumpulan::where('tugas_id', $id)->get()->keyBy('user_id');

        // 3. Gabungkan datanya
        $rekap = $siswas->map(function ($siswa) use ($pengumpulans) {
            $sudahKumpul = $pengumpulans->has($siswa->id);
            return [
                'nama' => $siswa->name,
                'status' => $sudahKumpul ? 'Sudah' : 'Belum',
                'waktu' => $sudahKumpul ? $pengumpulans[$siswa->id]->created_at->format('d M, H:i') : '-',
            ];
        });

        return response()->json([
            'success' => true,
            'judul_tugas' => $tugas->judul_tugas,
            'nama_kelas' => $tugas->kelas->nama_kelas,
            'data' => $rekap
        ]);
    }

    public function getTugasSiswa(Request $request)
    {
        $siswaId = $request->user_id; // Ambil ID siswa dari param atau auth

        $tugas = Tugas::leftJoin('pengumpulans', function($join) use ($siswaId) {
                $join->on('tugas.id', '=', 'pengumpulans.tugas_id')
                    ->where('pengumpulans.siswa_id', '=', $siswaId);
            })
            ->select('tugas.*', 'pengumpulans.id as sudah_kumpul')
            ->get();

        return response()->json($tugas);
    }

    public function getTugasMendesak(Request $request, $siswa_id) {
        return Tugas::leftJoin('pengumpulans', function($join) use ($siswa_id) {
                $join->on('tugas.id', '=', 'pengumpulans.tugas_id')
                    ->where('pengumpulans.siswa_id', '=', $siswa_id);
            })
            ->select('tugas.*', 'pengumpulans.id as id_pengumpulan') // Ini kunci si teks hijau tadi!
            ->get();
    }

    public function buatTugasRemedialInstan(Request $request)
    {
        $request->validate([
            'tugas_id' => 'required|exists:tugas,id',
            'kelas_id' => 'required',
            'deadline' => 'required|date'
        ]);

        $tugasAsal = Tugas::findOrFail($request->tugas_id);

        // Buat otomatis tugas baru berstatus REMEDIAL dengan materi dan kelas yang sama
        $tugasRemedial = Tugas::create([
            'materi_id'       => $tugasAsal->materi_id,
            'guru_id'         => $tugasAsal->guru_id,
            'judul_tugas'     => 'Remedial ' . $tugasAsal->judul_tugas,
            'kelas_id'        => $request->kelas_id,
            'deskripsi_tugas' => 'Tugas perbaikan khusus untuk siswa yang nilainya di bawah KKM (75).',
            'deadline'        => $request->deadline,
            'is_remedial'     => 1
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tugas remedial berhasil diterbitkan untuk kelas ini!',
            'data'    => $tugasRemedial
        ]);
    }

    public function getTugasGuruWithRemedialStatus(Request $request)
    {
        $guruId = $request->guru_id; // Sesuaikan dengan cara kamu melempar auth/ID Guru

        $tugas = Tugas::where('guru_id', $guruId)
            ->with(['kelas', 'pengumpulans'])
            ->get()
            ->map(function ($item) {
                // Menghitung persentase progres pengumpulan siswa
                $totalSiswa = $item->kelas ? $item->kelas->siswas_count : 36;
                $item->pengumpulans_count = $item->pengumpulans->count();

                // 🔍 KUNCI UTAMA: Cari apakah ada data nilai yang sudah diinput dan nilainya <= 75
                $item->punya_siswa_remedial = $item->pengumpulans
                    ->whereNotNull('nilai')
                    ->where('nilai', '<=', 75)
                    ->isNotEmpty(); // Menghasilkan true jika ada, false jika tidak ada

                return $item;
            });

        return response()->json([
            'success' => true,
            'data' => $tugas
        ]);
    }
}
