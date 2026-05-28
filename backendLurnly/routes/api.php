<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GuruController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\JadwalController;
use App\Http\Controllers\Api\KelasController;
use App\Http\Controllers\Api\MateriController;
use App\Http\Controllers\Api\PengumpulanController;
use App\Http\Controllers\Api\SiswaController;
use App\Http\Controllers\Api\TugasController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PengumumanController;
use Illuminate\Support\Facades\Log;

// Public Routes (Bisa diakses tanpa login)
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::get('/kelas', [KelasController::class, 'index']);

// Protected Routes (Wajib membawa Bearer Token Sanctum)
Route::middleware('auth:sanctum')->group(function () {

    // FIX: Route profile user agar dinamis mengembalikan kelas_id untuk siswa
    Route::get('/user', function (Request $request) {
        $user = $request->user();

        // Cek apakah user ini instance dari model Siswa atau Guru
        $role = ($user instanceof \App\Models\Siswa) ? 'siswa' : 'guru';

        return response()->json([
            'id'       => $user->id,
            'nama'     => $user->nama, // Menggunakan 'nama' sesuai kolom database kamu
            'email'    => $user->email,
            'role'     => $role,
            'kelas_id' => $role === 'siswa' ? $user->kelas_id : null // Dikirim ke React Native agar tidak undefined
        ]);
    });

    // Logout
    Route::post('/logout', [AuthController::class, 'logout']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/dashboard-guru', [DashboardController::class, 'dashboardGuru']);
    Route::get('/get-kelas', [DashboardController::class, 'getKelas']);

    // Fitur Tugas & Pengumpulan
    Route::post('/nilai/update', [TugasController::class, 'updateNilai']);
    Route::get('/tugas/show-detail/{id}', [TugasController::class, 'showDetail']);
    Route::post('/tugas/store', [TugasController::class, 'store']);
    Route::get('/tugas/detail-pengumpulan/{id}', [TugasController::class, 'detailPengumpulan']);
    Route::get('/pengumpulans/status/{tugas_id}/{siswa_id}', [PengumpulanController::class, 'checkStatus']);
    Route::get('/tugas-mendesak/{siswa_id}', [TugasController::class, 'getTugasMendesak']);

    // Fitur Pengumuman
    Route::post('/pengumuman', [PengumumanController::class, 'store']);
    Route::get('/pengumuman/{kelas_id}', [PengumumanController::class, 'index']);

    Route::post('/tugas/buat-remedial-instan', [TugasController::class, 'buatTugasRemedialInstan']);

    // Resource Routes (Otomatis menghandle index, store, show, update, destroy)
    Route::apiResource('gurus', GuruController::class);
    Route::apiResource('siswas', SiswaController::class);
    Route::apiResource('materis', MateriController::class);
    Route::apiResource('jadwals', JadwalController::class);
    Route::apiResource('pengumpulans', PengumpulanController::class);
    Route::apiResource('tugas', TugasController::class); // Menghandle GET /api/tugas secara otomatis
});
