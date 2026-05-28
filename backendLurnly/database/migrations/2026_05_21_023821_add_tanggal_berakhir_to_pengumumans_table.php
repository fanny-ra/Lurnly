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
        Schema::table('pengumumans', function (Blueprint $table) {
            // ➕ Menambahkan kolom setelah kolom guru_id dan tipenya nullable agar data lama tidak error
            $table->dateTime('tanggal_berakhir')->nullable()->after('guru_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pengumumans', function (Blueprint $table) {
            // ➖ Logika jika migration dibatalkan (rollback)
            $table->dropColumn('tanggal_berakhir');
        });
    }
};
