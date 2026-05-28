<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Materi;
use Illuminate\Http\Request;

class MateriController extends Controller
{
    // Lihat semua materi
    public function index() {
        $materi = Materi::with('guru')->get();
        return response()->json(['success' => true, 'data' => $materi]);
    }

    // Tambah materi baru
    public function store(Request $request) {
        $data = $request->validate([
            'guru_id' => 'required|exists:gurus,id',
            'matapelajaran'   => 'required|string',
            'deskripsi' => 'nullable|string',
        ]);

        $materi = Materi::create($data);
        return response()->json(['success' => true, 'message' => 'Materi berhasil dibuat', 'data' => $materi], 201);
    }

    // Lihat 1 materi spesifik
    public function show($id) {
        $materi = Materi::with('guru')->find($id);
        if (!$materi) return response()->json(['message' => 'Materi tidak ketemu'], 404);
        return response()->json(['success' => true, 'data' => $materi]);
    }

    // Update materi
    public function update(Request $request, $id) {
        $materi = Materi::find($id);
        if (!$materi) return response()->json(['message' => 'Materi tidak ada'], 404);

        $materi->update($request->all());
        return response()->json(['success' => true, 'message' => 'Materi berhasil diupdate', 'data' => $materi]);
    }

    // Hapus materi
    public function destroy($id) {
        $materi = Materi::find($id);
        if (!$materi) return response()->json(['message' => 'Materi tidak ada'], 404);

        $materi->delete();
        return response()->json(['success' => true, 'message' => 'Materi dihapus']);
    }
}
