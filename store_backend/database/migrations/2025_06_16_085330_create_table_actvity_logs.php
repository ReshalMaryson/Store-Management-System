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
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('role');
            $table->string('action_type');
            $table->string('description');
            $table->integer('related_id')->nullable();
            $table->string('related_type')->nullable();
            $table->string('ip_address')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('table_activity_logs', function (Blueprint $table) {
            Schema::dropIfExists('table_activity_logs');
        });
    }
};
