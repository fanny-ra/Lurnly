<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pengumpulan;
use Illuminate\Http\Request;

class PengumpulanController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validasi input
        $request->validate([
            'tugas_id' => 'required',
            'file_path' => 'required|file|mimes:pdf,doc,docx,jpg,png|max:10240',
        ]);

        $pengumpulan = new Pengumpulan();
        $pengumpulan->tugas_id = $request->tugas_id;
        $pengumpulan->siswa_id = auth()->user()->id; // Ambil ID siswa yang login
        $pengumpulan->waktu_kumpul = now();

        // 2. PROSES UPLOAD (Taruh di sini)
        if ($request->hasFile('file_path')) {
            // Simpan ke storage/app/public/tugas
            $path = $request->file('file_path')->store('tugas', 'public');

            // Simpan path-nya ke database
            $pengumpulan->file_path = $path;
        }

        $pengumpulan->save();

        return response()->json([
            'message' => 'Tugas berhasil dikumpulkan!',
            'data' => $pengumpulan
        ]);
    }

    // Tambahkan fungsi ini di dalam class PengumpulanController
    public function checkStatus($tugas_id, $siswa_id)
    {
        // Cari apakah ada data pengumpulan untuk tugas dan siswa ini
        $pengumpulan = \App\Models\Pengumpulan::where('tugas_id', $tugas_id)
            ->where('siswa_id', $siswa_id)
            ->first();

        if ($pengumpulan) {
            return response()->json([
                'sudah_ada' => true,
                'data' => $pengumpulan
            ]);
        }

        return response()->json([
            'sudah_ada' => false,
            'message' => 'Belum ada data pengumpulan'
        ]);
    }
}
