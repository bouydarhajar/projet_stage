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
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->string('brand'); // Marque du véhicule
            $table->string('model'); // Modèle
            $table->string('plate')->unique(); // Plaque
            $table->integer('seats'); // Nombre de places
            $table->enum('status', ['available', 'on_mission', 'maintenance'])->default('available'); // Statut
            $table->integer('current_mileage')->default(0); // Kilométrage actuel
            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
