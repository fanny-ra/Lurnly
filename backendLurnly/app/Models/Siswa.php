<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Siswa extends Model
{
    use HasApiTokens, Notifiable;

    protected $guarded = [];

    public function kelas() {
        return $this->belongsTo(Kelas::class);
    }

    public function pengumpulan() {
        return $this->hasMany(Pengumpulan::class);
    }
}
