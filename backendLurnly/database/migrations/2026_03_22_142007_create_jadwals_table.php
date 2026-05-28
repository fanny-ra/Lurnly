<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('jadwals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kelas_id')->constrained('kelas')->onDelete('cascade');
            $table->foreignId('materi_id')->constrained('materis')->onDelete('cascade'); // Untuk Nama Mapel
            $table->foreignId('guru_id')->constrained('gurus')->onDelete('cascade');   // Untuk Nama Guru
            $table->string('hari');         // Contoh: "Kamis"
            $table->time('jam_mulai');    // Contoh: "12:00"
            $table->time('jam_selesai');  // Contoh: "13:00"
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jadwals');
    }
};
