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
            'Doti' => '123001',
            'nom' => 'EL ATTAR',
            'prenom' => 'Houssaine',
            'CIN' => 'CIN001',
            'fonction' => 'Technicien',
            'grade' => 'Technicien Principal'
        ]);

        Employe::create([
            'Doti' => '234002',
            'nom' => 'ALAMI',
            'prenom' => 'Mohammed',
            'CIN' => 'CIN002',
            'fonction' => 'Développeur',
            'grade' => 'Ingénieur d\'Etat'
        ]);

        Employe::create([
            'Doti' => '123003',
            'nom' => 'BENALI',
            'prenom' => 'Fatima',
            'CIN' => 'CIN003',
            'fonction' => 'Comptable',
            'grade' => 'Agent de Maîtrise'
        ]);
    }
}
