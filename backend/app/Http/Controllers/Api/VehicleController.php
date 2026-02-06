<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    public function index()
    {
        $vehicles = Vehicle::all();
        return response()->json($vehicles);
    }

    public function updateStatus(Request $request, Vehicle $vehicle)
    {
        $validated = $request->validate([
            'status' => 'required|in:available,on_mission,maintenance',
        ]);

        $vehicle->update(['status' => $validated['status']]);

        return response()->json($vehicle);
    }

    // Nouvelle méthode pour assigner un véhicule à une mission
    public function assignToMission(Request $request, Vehicle $vehicle)
    {
        $validated = $request->validate([
            'mission_id' => 'required|exists:missions,id',
            'start_mileage' => 'required|integer|min:0',
        ]);

        $vehicle->update([
            'status' => 'on_mission',
            'current_mileage' => $validated['start_mileage']
        ]);

        return response()->json($vehicle);
    }
}