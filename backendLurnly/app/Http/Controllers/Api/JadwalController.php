<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Jadwal;
use Illuminate\Http\Request;

class JadwalController extends Controller
{
    public function index()
    {
        try {
            $user = auth()->user(); // Ambil data siswa yang login

            // Ambil jadwal yang 'kelas_id'-nya sama dengan 'kelas_id' si siswa
            $jadwal = Jadwal::with(['materi', 'guru'])
                ->where('kelas_id', $user->kelas_id)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $jadwal
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request) {
        $data = $request->validate([
            'kelas_id'  => 'required',
            'materi_id' => 'required',
            'guru_id'   => 'required',
            'hari'      => 'required',
            'jam_mulai' => 'required',
            'jam_selesai' => 'required',
        ]);

        $jadwal = \App\Models\Jadwal::create($data);
        return response()->json(['success' => true, 'data' => $jadwal], 201);
    }
}
