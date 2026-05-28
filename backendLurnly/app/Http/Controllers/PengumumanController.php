<?php

namespace App\Http\Controllers;

use App\Models\Pengumuman;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PengumumanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index($kelas_id)
    {
        // Debugging: Pastikan variabel tidak kosong
        if (!$kelas_id) {
            return response()->json(['success' => false, 'message' => 'ID Kelas tidak ditemukan'], 400);
        }

        try {
            $now = now(); // Mengambil tanggal & waktu saat ini

            $data = Pengumuman::where('kelas_id', $kelas_id)
                ->with('guru:id,nama') // Pastikan di model Guru ada kolom 'nama'
                ->where(function ($query) use ($now) {
                    // Logika Aman: Tampilkan jika tanggal_berakhir belum lewat,
                    // ATAU jika nilainya NULL (Melindungi data pengumuman lama agar tidak hilang)
                    $query->where('tanggal_berakhir', '>=', $now)
                          ->orWhereNull('tanggal_berakhir');
                })
                ->latest()
                ->get();

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'judul' => 'required|string',
            'isi' => 'required|string',
            'kelas_id' => 'required',
            'guru_id' => 'required',
            'tanggal_berakhir' => 'nullable|date', // ➕ Tambahkan validasi tanggal (boleh kosong/nullable)
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        // Karena kamu memakai $request->all(), kolom 'tanggal_berakhir' otomatis ikut tersimpan
        // selama sudah kamu daftarkan ke dalam $fillable di model Pengumuman.
        $pengumuman = Pengumuman::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Pengumuman berhasil dibuat',
            'data' => $pengumuman
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
