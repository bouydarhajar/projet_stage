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
        // Récupérer un chef de service
        $chefService = User::where('role', 'chef_service')->first();

        // Récupérer 5 employés pour créer plusieurs missions
        $employes = Employe::take(5)->get();

        // Vérifier qu'on a les données nécessaires
        if (!$chefService || $employes->count() < 3) {
            $this->command->warn('⚠️  Chef de service ou employés manquants. Seeders Users et Employes doivent être exécutés d\'abord.');
            return;
        }

        $this->command->info('🚀 Création des missions...');

        // Mission 1 - En cours
        Mission::create([
            'doti_id' => $employes[0]->Doti,
            'chef_service_id' => $chefService->id,
            'fonction' => $employes[0]->fonction ?? 'Technicien informatique',
            'lieu_affectation' => 'Direction Provinciale de Ouarzazate',
            'objectif' => 'Formation technique à Errachidia',
            'itineraire' => 'Ouarzazate → Errachidia → Ouarzazate',
            'date_depart' => now()->addDays(1),
            'date_retour' => now()->addDays(3),
            'statut' => 'en_cours',
            'transport_type' => 'voiture',
            'vehicle_id' => null, // À affecter plus tard
            'chef_parc_id' => null,
        ]);

        // Mission 2 - En attente
        Mission::create([
            'doti_id' => $employes[1]->Doti,
            'chef_service_id' => $chefService->id,
            'fonction' => $employes[1]->fonction ?? 'Développeur',
            'lieu_affectation' => 'Direction Provinciale de Ouarzazate',
            'objectif' => 'Installation et configuration système à Marrakech',
            'itineraire' => 'Ouarzazate → Marrakech → Ouarzazate',
            'date_depart' => now()->addDays(5),
            'date_retour' => now()->addDays(7),
            'statut' => 'en_attente',
            'transport_type' => null,
            'vehicle_id' => null,
            'chef_parc_id' => null,
        ]);

        // Mission 3 - En attente
        Mission::create([
            'doti_id' => $employes[2]->Doti,
            'chef_service_id' => $chefService->id,
            'fonction' => $employes[2]->fonction ?? 'Comptable',
            'lieu_affectation' => 'Direction Provinciale de Ouarzazate',
            'objectif' => 'Audit financier à Agadir',
            'itineraire' => 'Ouarzazate → Agadir → Ouarzazate',
            'date_depart' => now()->addDays(10),
            'date_retour' => now()->addDays(12),
            'statut' => 'en_attente',
            'transport_type' => null,
            'vehicle_id' => null,
            'chef_parc_id' => null,
        ]);

        // Mission 4 - Approuvée avec transport car
        Mission::create([
            'doti_id' => $employes[0]->Doti,
            'chef_service_id' => $chefService->id,
            'fonction' => $employes[0]->fonction ?? 'Technicien',
            'lieu_affectation' => 'Direction Provinciale de Ouarzazate',
            'objectif' => 'Séminaire de formation à Casablanca',
            'itineraire' => 'Ouarzazate → Casablanca → Ouarzazate',
            'date_depart' => now()->addDays(15),
            'date_retour' => now()->addDays(18),
            'statut' => 'approuve',
            'transport_type' => 'car',
            'vehicle_id' => null,
            'chef_parc_id' => null,
        ]);

        // Mission 5 - Terminée
        Mission::create([
            'doti_id' => $employes[1]->Doti,
            'chef_service_id' => $chefService->id,
            'fonction' => $employes[1]->fonction ?? 'Développeur',
            'lieu_affectation' => 'Direction Provinciale de Ouarzazate',
            'objectif' => 'Migration de serveurs à Rabat',
            'itineraire' => 'Ouarzazate → Rabat → Ouarzazate',
            'date_depart' => now()->subDays(10),
            'date_retour' => now()->subDays(7),
            'statut' => 'termine',
            'transport_type' => 'voiture',
            'vehicle_id' => null,
            'chef_parc_id' => null,
        ]);

        // Mission 6 - Rejetée
        Mission::create([
            'doti_id' => $employes[2]->Doti,
            'chef_service_id' => $chefService->id,
            'fonction' => $employes[2]->fonction ?? 'Comptable',
            'lieu_affectation' => 'Direction Provinciale de Ouarzazate',
            'objectif' => 'Consultation financière à Fès',
            'itineraire' => 'Ouarzazate → Fès → Ouarzazate',
            'date_depart' => now()->addDays(20),
            'date_retour' => now()->addDays(22),
            'statut' => 'rejete',
            'transport_type' => null,
            'vehicle_id' => null,
            'chef_parc_id' => null,
        ]);

        // Mission 7 - Brouillon
        if ($employes->count() > 3) {
            Mission::create([
                'doti_id' => $employes[3]->Doti,
                'chef_service_id' => $chefService->id,
                'fonction' => $employes[3]->fonction ?? 'Gestionnaire',
                'lieu_affectation' => 'Direction Provinciale de Ouarzazate',
                'objectif' => 'Réunion de coordination à Tanger',
                'itineraire' => 'Ouarzazate → Tanger → Ouarzazate',
                'date_depart' => now()->addDays(25),
                'date_retour' => now()->addDays(27),
                'statut' => 'brouillon',
                'transport_type' => null,
                'vehicle_id' => null,
                'chef_parc_id' => null,
            ]);
        }

        // Mission 8 - En cours avec transport affecté
        if ($employes->count() > 4) {
            Mission::create([
                'doti_id' => $employes[4]->Doti,
                'chef_service_id' => $chefService->id,
                'fonction' => $employes[4]->fonction ?? 'Responsable technique',
                'lieu_affectation' => 'Direction Provinciale de Ouarzazate',
                'objectif' => 'Inspection des équipements à Meknès',
                'itineraire' => 'Ouarzazate → Meknès → Ouarzazate',
                'date_depart' => now()->addDays(2),
                'date_retour' => now()->addDays(4),
                'statut' => 'en_cours',
                'transport_type' => 'voiture',
                'vehicle_id' => null,
                'chef_parc_id' => null,
            ]);
        }

        $missionCount = Mission::count();
        $this->command->info("✅ {$missionCount} missions créées avec succès!");
        
        // Afficher un résumé
        $this->command->table(
            ['Statut', 'Nombre'],
            [
                ['Brouillon', Mission::where('statut', 'brouillon')->count()],
                ['En Attente', Mission::where('statut', 'en_attente')->count()],
                ['Approuvée', Mission::where('statut', 'approuve')->count()],
                ['En Cours', Mission::where('statut', 'en_cours')->count()],
                ['Terminée', Mission::where('statut', 'termine')->count()],
                ['Rejetée', Mission::where('statut', 'rejete')->count()],
            ]
        );
    }
}