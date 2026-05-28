<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Siswa;
use Illuminate\Http\Request;

class SiswaController extends Controller
{
    // Lihat semua siswa
    public function index() {
        $siswa = Siswa::with('kelas')->get();
        return response()->json(['success' => true, 'data' => $siswa]);
    }

    // Tambah siswa baru
    public function store(Request $request) {
        $data = $request->validate([
            'nis'      => 'required|unique:siswas',
            'nama'     => 'required',
            'kelas_id' => 'required|exists:kelas,id',
            'email'    => 'required|email|unique:siswas',
            'password' => 'required|min:6'
        ]);

        $siswa = Siswa::create($data);
        return response()->json(['success' => true, 'message' => 'Siswa berhasil didaftarkan', 'data' => $siswa], 201);
    }

    // Lihat profil 1 siswa
    public function show($id) {
        $siswa = Siswa::with('kelas')->find($id);
        if (!$siswa) return response()->json(['message' => 'Siswa tidak ditemukan'], 404);
        return response()->json(['success' => true, 'data' => $siswa]);
    }

    // Update data siswa
    public function update(Request $request, $id) {
        $siswa = Siswa::find($id);
        if (!$siswa) return response()->json(['message' => 'Siswa tidak ditemukan'], 404);

        $siswa->update($request->all());
        return response()->json(['success' => true, 'message' => 'Data siswa berhasil diubah']);
    }

    // Hapus siswa
    public function destroy($id) {
        $siswa = Siswa::find($id);
        if (!$siswa) return response()->json(['message' => 'Siswa tidak ditemukan'], 404);

        $siswa->delete();
        return response()->json(['success' => true, 'message' => 'Siswa berhasil dihapus']);
    }
}
