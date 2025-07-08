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
        Schema::create('bill_items', function (Blueprint $table,) {
            $table->id();
            $table->unsignedBigInteger('bill_id'); //FK
            $table->unsignedBigInteger('product_id'); //FK
            $table->string('quantity');
            $table->string('price_per_unit');
            $table->string('total_price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bill_items');
    }
};
