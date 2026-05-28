<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Materi extends Model
{
    protected $guarded = [];

    // Relasi ke Guru (Satu materi dimiliki oleh satu guru)
    public function guru()
    {
        return $this->belongsTo(Guru::class, 'guru_id');
    }

    // Relasi ke Jadwal (Satu materi memiliki banyak jadwal)
    public function jadwals()
    {
        return $this->hasMany(Jadwal::class, 'materi_id');
    }

    // Relasi ke Tugas (Satu materi memiliki banyak tugas)
    public function tugas()
    {
        return $this->hasMany(Tugas::class, 'materi_id');
    }

    public function kelas()
    {
        return $this->belongsTo(Kelas::class, 'kelas_id');
    }
}
