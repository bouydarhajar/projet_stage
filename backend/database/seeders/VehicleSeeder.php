<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Vehicle;

class VehicleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $vehicles = [
            ['brand' => 'Renault', 'model' => 'Master', 'plate' => '12456-A-1', 'seats' => 7, 'status' => 'available', 'current_mileage' => 15200],
            ['brand' => 'Peugeot', 'model' => '308', 'plate' => '12345-B-2', 'seats' => 5, 'status' => 'maintenance', 'current_mileage' => 45000],
            ['brand' => 'Toyota', 'model' => 'Hilux', 'plate' => 'B-122', 'seats' => 5, 'status' => 'available', 'current_mileage' => 78000],
            ['brand' => 'VW', 'model' => 'Caddy', 'plate' => 'C-45', 'seats' => 7, 'status' => 'available', 'current_mileage' => 32000],
            ['brand' => 'Mercedes', 'model' => 'Vito', 'plate' => 'D-789', 'seats' => 8, 'status' => 'on_mission', 'current_mileage' => 120000],
            ['brand' => 'Ford', 'model' => 'Transit', 'plate' => 'E-321', 'seats' => 9, 'status' => 'available', 'current_mileage' => 56000],
            ['brand' => 'BMW', 'model' => 'X5', 'plate' => 'F-654', 'seats' => 5, 'status' => 'maintenance', 'current_mileage' => 89000],
            ['brand' => 'Audi', 'model' => 'A6', 'plate' => 'G-987', 'seats' => 5, 'status' => 'available', 'current_mileage' => 45000],
            ['brand' => 'Citroën', 'model' => 'Jumper', 'plate' => 'H-159', 'seats' => 12, 'status' => 'available', 'current_mileage' => 23000],
            ['brand' => 'Fiat', 'model' => 'Ducato', 'plate' => 'I-753', 'seats' => 6, 'status' => 'on_mission', 'current_mileage' => 67000],
            ['brand' => 'Nissan', 'model' => 'Navara', 'plate' => 'J-246', 'seats' => 5, 'status' => 'available', 'current_mileage' => 34000],
            ['brand' => 'Hyundai', 'model' => 'H1', 'plate' => 'K-135', 'seats' => 9, 'status' => 'maintenance', 'current_mileage' => 78000],
            ['brand' => 'Kia', 'model' => 'Sorento', 'plate' => 'L-579', 'seats' => 7, 'status' => 'available', 'current_mileage' => 29000],
            ['brand' => 'Chevrolet', 'model' => 'Tahoe', 'plate' => 'M-864', 'seats' => 8, 'status' => 'available', 'current_mileage' => 56000],
            ['brand' => 'Opel', 'model' => 'Vivaro', 'plate' => 'N-297', 'seats' => 7, 'status' => 'on_mission', 'current_mileage' => 91000],
        ];

        foreach ($vehicles as $vehicle) {
            Vehicle::updateOrCreate(
                ['plate' => $vehicle['plate']],
                $vehicle
            );
        }

        // Ajouter des commentaires de confirmation
        $this->command->info(count($vehicles) . ' véhicules ont été créés/actualisés dans la base de données.');
    }
}