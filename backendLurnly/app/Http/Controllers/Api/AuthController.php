<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Siswa;
use App\Models\Guru;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'role' => 'required|in:siswa,guru'
        ]);

        // 1. Cari user berdasarkan role
        $user = ($request->role == 'siswa')
            ? Siswa::where('email', $request->email)->first()
            : Guru::where('email', $request->email)->first();

        // 2. CEK DULU ADA GAK USERNYA? (Pindahkan ke sini)
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau Password salah!'
            ], 401);
        }

        // 3. KALAU ADA & BENAR, BARU BIKIN TOKEN
        $token = $user->createToken('auth_token')->plainTextToken;

        // 4. Return respons sukses
        return response()->json([
            'success' => true,
            'message' => 'Login Berhasil!',
            'token'   => $token,
            'user'    => [
                'id' => $user->id,
                'nama' => $user->nama,
                'role'    => $user->role,
                'kelas_id' => ($request->role == 'siswa') ? $user->kelas_id : null
            ]
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'nama'     => 'required|string|max:255',
            'email'    => 'required|string|email|unique:users',
            'password' => 'required|min:6',
            'role'     => 'required|in:siswa,guru',
            // Validasi bersyarat
            'nis'      => 'required_if:role,siswa',
            'kelas_id' => 'required_if:role,siswa',
            'nip'      => 'required_if:role,guru',
            'mapel'    => 'required_if:role,guru',
        ]);

        $warning = null; // Inisialisasi variabel agar tidak error

        // --- LOGIC REGISTER SISWA ---
        if ($request->role == 'siswa') {
            $request->validate([
                'nis'      => 'required|unique:siswas,nis',
                'kelas_id' => 'required|exists:kelas,id',
            ]);

            $user = Siswa::create([
                'nis'      => $request->nis,
                'nama'     => $request->nama,
                'kelas_id' => $request->kelas_id,
                'email'    => $request->email,
                'password' => Hash::make($request->password),
            ]);
        }

        // --- LOGIC REGISTER GURU ---
        else {
            if ($request->has('kelas_id')) {
                $warning = "Peringatan: Guru tidak memerlukan data Kelas. Data kelas diabaikan.";
            }

            $request->validate([
                'nip'   => 'required|unique:gurus,nip',
                'mapel' => 'required|string',
            ]);

            $user = Guru::create([
                'nip'      => $request->nip,
                'nama'     => $request->nama,
                'mapel'    => $request->mapel, // Disimpan ke database
                'email'    => $request->email,
                'password' => Hash::make($request->password),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Registrasi ' . ucfirst($request->role) . ' Berhasil!',
            'warning' => $warning,
            'data'    => $user
        ], 201);
    }
}
