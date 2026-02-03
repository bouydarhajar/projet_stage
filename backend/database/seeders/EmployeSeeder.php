<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Employe;

class EmployeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Employe::create([
            'nom' => 'EL ATTAR',
            'prenom' => 'Houssaine',
            'email' => 'houssaine@test.com',
            'service' => 'Informatique',
            'fonction' => 'Technicien',
            'grade' => 'Technicien Principal'
        ]);

        Employe::create([
            'nom' => 'ALAMI',
            'prenom' => 'Mohammed',
            'email' => 'alami@test.com',
            'service' => 'Informatique',
            'fonction' => 'Développeur',
            'grade' => 'Ingénieur d\'Etat'
        ]);

        Employe::create([
            'nom' => 'BENALI',
            'prenom' => 'Fatima',
            'email' => 'fatima@test.com',
            'service' => 'Finance',
            'fonction' => 'Comptable',
            'grade' => 'Agent de Maîtrise'
        ]);
    }
}
