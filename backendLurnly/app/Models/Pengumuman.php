<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pengumuman extends Model
{
    protected $table = 'pengumumans';

    protected $guarded = [];

    public function guru() {
        return $this->belongsTo(Guru::class);
    }
    public function kelas()
    {
        return $this->belongsTo(Kelas::class, 'kelas_id');
    }
}
