<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Guru;
use Illuminate\Http\Request;

class GuruController extends Controller
{
    public function index() {
        return response()->json(['success' => true, 'data' => Guru::all()]);
    }

    public function store(Request $request) {
        $data = $request->validate([
            'nip' => 'required|unique:gurus',
            'nama' => 'required',
            'mapel' => 'required'
        ]);
        $guru = Guru::create($data);
        return response()->json(['success' => true, 'message' => 'Guru berhasil ditambah', 'data' => $guru], 201);
    }

    public function update(Request $request, $id) {
        $guru = Guru::find($id);
        if (!$guru) return response()->json(['message' => 'Data tidak ada'], 404);

        $guru->update($request->all());
        return response()->json(['success' => true, 'message' => 'Guru berhasil diupdate', 'data' => $guru]);
    }

    public function destroy($id) {
        $guru = Guru::find($id);
        if (!$guru) return response()->json(['message' => 'Data tidak ada'], 404);

        $guru->delete();
        return response()->json(['success' => true, 'message' => 'Guru berhasil dihapus']);
    }
}
