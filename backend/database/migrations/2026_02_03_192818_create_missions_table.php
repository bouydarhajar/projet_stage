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
        Schema::create('missions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('doti_id')->constrained('employes', 'Doti');
            $table->foreignId('chef_service_id')->constrained('users');
            $table->string('fonction');
            $table->string('lieu_affectation');
            $table->text('objectif');
            $table->text('itineraire');
            $table->date('date_depart');
            $table->date('date_retour');
            $table->string('statut')->default('en_attente');
            $table->string('transport_type')->nullable(); // car | voiture
            $table->foreignId('vehicle_id')->nullable()->constrained('vehicles');
            $table->foreignId('chef_parc_id')->nullable()->constrained('users');
            $table->timestamps();
        });

    }
    public function down(): void
    {
        Schema::dropIfExists('missions');
    }
};
