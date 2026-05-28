<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Guru extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'gurus';
    protected $guarded = [];

    public function materis() {
        return $this->hasMany(Materi::class);
    }

    public function tugas() {
        return $this->hasMany(Tugas::class);
    }
}
