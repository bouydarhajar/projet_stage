<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mission;
use Illuminate\Http\Request;

class MissionController extends Controller
{
     // chef de service : liste de toutes les missions
    public function index()
    {
        return Mission::with(['employee','vehicle'])->get();
    }
    // chef de service crée une mission
    public function store(Request $request)
    {
        $request->validate([
            'doti_id' => 'required|exists:employes,Doti',
            'fonction' => 'required|string',
            'lieu_affectation' => 'required|string',
            'objectif' => 'required|string',
            'itineraire' => 'required|string',
            'date_depart' => 'required|date',
            'date_retour' => 'required|date|after_or_equal:date_depart',
        ]);

        $mission = Mission::create([
            'doti_id' => $request->doti_id,
            'chef_service_id' => $request->user()->id,
            'fonction' => $request->fonction,
            'lieu_affectation' => $request->lieu_affectation,
            'objectif' => $request->objectif,
            'itineraire' => $request->itineraire,
            'date_depart' => $request->date_depart,
            'date_retour' => $request->date_retour,
            'statut' => 'en_attente'
        ]);

        return response()->json($mission, 201);
    }
     // la méthode de delete un mission 
    public function destroy($id)
    {
        $mission = Mission::find($id);

        if (!$mission) {
            return response()->json(['message' => 'Mission non trouvée'], 404);
        }

        $mission->delete();

        return response()->json(['message' => 'Mission supprimée avec succès'], 200);
    }
    // la méthode Update qui peu faire des modifications sur un missions 
    public function update(Request $request, $id)
    {
        $mission = Mission::find($id);

        if (!$mission) {
            return response()->json(['message' => 'Mission non trouvée'], 404);
        }

        $request->validate([
            'doti_id' => 'sometimes|exists:employes,Doti',
            'fonction' => 'sometimes|string',
            'lieu_affectation' => 'sometimes|string',
            'objectif' => 'sometimes|string',
            'itineraire' => 'sometimes|string',
            'date_depart' => 'sometimes|date',
            'date_retour' => 'sometimes|date|after_or_equal:date_depart',
            'statut' => 'sometimes|in:en_attente,en_cours,terminee,annulee',
        ]);

        $mission->update($request->all());

        return response()->json($mission);
    }

    // chef de parc affecte le transport
    public function setTransport(Request $request, $id)
    {
        $request->validate([
            'transport_type' => 'required|in:car,voiture',
            'vehicle_id' => 'nullable|exists:vehicles,id'
        ]);

        $mission = Mission::findOrFail($id);

        if ($request->transport_type === 'car') {

            $mission->update([
                'transport_type' => 'car',
                'vehicle_id' => null,
                'chef_parc_id' => $request->user()->id
            ]);

        } else {

            $mission->update([
                'transport_type' => 'voiture',
                'vehicle_id' => $request->vehicle_id,
                'chef_parc_id' => $request->user()->id
            ]);
        }

        return response()->json($mission);
    }


   

    // employé : ses propres missions
    public function myMissions(Request $request)
        {
            return Mission::where('doti_id', $request->user()->doti_id)
                ->with('vehicle')
                ->get();
        }
   
}
