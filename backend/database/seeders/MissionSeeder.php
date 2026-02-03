<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Mission;
use App\Models\Employe;
use App\Models\User;

class MissionSeeder extends Seeder
{
    public function run(): void
    {
        $chefService = User::where('role', 'chef_service')->first();

        $employes = Employe::take(3)->get();

        if (!$chefService || $employes->count() < 3) {
            return;
        }

        Mission::create([
            'employe_id' => $employes[0]->id,
            'chef_service_id' => $chefService->id,
            'fonction' => 'Technicien informatique',
            'lieu_affectation' => 'Errachidia',
            'objectif' => 'Maintenance du réseau',
            'itineraire' => 'Ouarzazate → Errachidia',
            'date_depart' => now()->addDays(1),
            'date_retour' => now()->addDays(2),
            'statut' => 'en_cours',
        ]);

        Mission::create([
            'employe_id' => $employes[1]->id,
            'chef_service_id' => $chefService->id,
            'fonction' => 'Développeur',
            'lieu_affectation' => 'Marrakech',
            'objectif' => 'Installation système',
            'itineraire' => 'Ouarzazate → Marrakech',
            'date_depart' => now()->addDays(3),
            'date_retour' => now()->addDays(4),
            'statut' => 'en_attente',
        ]);

        Mission::create([
            'employe_id' => $employes[2]->id,
            'chef_service_id' => $chefService->id,
            'fonction' => 'Comptable',
            'lieu_affectation' => 'Agadir',
            'objectif' => 'Audit financier',
            'itineraire' => 'Ouarzazate → Agadir',
            'date_depart' => now()->addDays(5),
            'date_retour' => now()->addDays(6),
            'statut' => 'en_attente',
        ]);
    }
}
