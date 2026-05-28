<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Jadwal extends Model
{
    use HasFactory;

    protected $guarded = []; // Biar semua kolom bisa diisi

    // Relasi ke Guru (Satu jadwal dimiliki oleh satu guru)
    public function guru()
    {
        return $this->belongsTo(Guru::class, 'guru_id');
    }

    // Relasi ke Materi (Satu jadwal memiliki satu materi)
    public function materi()
    {
        return $this->belongsTo(Materi::class, 'materi_id');
    }

    // Relasi ke Kelas
    public function kelas()
    {
        return $this->belongsTo(Kelas::class, 'kelas_id');
    }
}
