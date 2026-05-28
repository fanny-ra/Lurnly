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
        Schema::table('tugas', function (Blueprint $table) {
            // Menambahkan kolom is_remedial dengan posisi setelah kolom deadline
            $table->boolean('is_remedial')->default(false)->after('deadline');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tugas', function (Blueprint $table) {
            // Menghapus kolom jika migration di-rollback
            $table->dropColumn('is_remedial');
        });
    }
};
