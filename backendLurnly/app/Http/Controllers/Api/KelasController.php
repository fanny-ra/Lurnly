<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kelas;
use Illuminate\Http\Request;

class KelasController extends Controller
{
    // Ambil daftar semua kelas
    public function index() {
        $kelas = Kelas::all();
        return response()->json(['success' => true, 'data' => $kelas]);
    }

    // Tambah kelas baru (Misal: 10-IPA-2)
    public function store(Request $request) {
        $data = $request->validate([
            'nama_kelas' => 'required|unique:kelas',
        ]);

        $kelas = Kelas::create($data);
        return response()->json(['success' => true, 'message' => 'Kelas berhasil dibuat', 'data' => $kelas], 201);
    }

    // Lihat detail 1 kelas (beserta daftar siswanya)
    public function show($id) {
        $kelas = Kelas::with('siswas')->find($id);
        if (!$kelas) return response()->json(['message' => 'Kelas tidak ditemukan'], 404);
        return response()->json(['success' => true, 'data' => $kelas]);
    }

    // Update info kelas
    public function update(Request $request, $id) {
        $kelas = Kelas::find($id);
        if (!$kelas) return response()->json(['message' => 'Kelas tidak ditemukan'], 404);

        $kelas->update($request->all());
        return response()->json(['success' => true, 'message' => 'Data kelas berhasil diupdate']);
    }

    // Hapus kelas
    public function destroy($id) {
        $kelas = Kelas::find($id);
        if (!$kelas) return response()->json(['message' => 'Kelas tidak ditemukan'], 404);

        $kelas->delete();
        return response()->json(['success' => true, 'message' => 'Kelas berhasil dihapus']);
    }
}
