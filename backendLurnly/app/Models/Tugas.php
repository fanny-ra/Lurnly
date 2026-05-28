<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tugas extends Model
{
    protected $guarded = [];

    public function kelas()
    {
        // Pastikan kolom di tabel tugas adalah 'kelas_id'
        return $this->belongsTo(Kelas::class, 'kelas_id');
    }

    public function materi() {
        return $this->belongsTo(Materi::class);
    }

    public function pengumpulans() {
        return $this->hasMany(Pengumpulan::class, 'tugas_id');
    }

    public function guru() {
        return $this->belongsTo(Guru::class);
    }
}
