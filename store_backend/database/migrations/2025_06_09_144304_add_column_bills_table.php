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
        Schema::table('bills', function (Blueprint $table) {
            // adding subtotal column to bills table.
            $table->integer('subtotal')->after('customer_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bills', function (Blueprint $table) {
            //
            $table->string('subtotal')->after('customer_id');
        });
    }
};
