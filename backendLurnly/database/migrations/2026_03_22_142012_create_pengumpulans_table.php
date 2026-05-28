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
        Schema::create('pengumpulans', function (Blueprint $table) {
            $table->id();
            // Relasi ke tugas mana yang dikerjakan
            $table->foreignId('tugas_id')->constrained('tugas')->onDelete('cascade');
            // Relasi ke siswa mana yang mengumpulkan
            $table->foreignId('siswa_id')->constrained('siswas')->onDelete('cascade');

            $table->text('catatan_siswa')->nullable(); // Pesan tambahan dari siswa
            $table->string('file_path'); // Lokasi file jawaban yang diupload
            $table->integer('nilai')->nullable(); // Guru akan mengisi ini nanti
            $table->dateTime('waktu_kumpul');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengumpulans');
    }
};
