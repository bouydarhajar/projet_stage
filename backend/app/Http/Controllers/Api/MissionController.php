<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mission;
use Illuminate\Http\Request;

class MissionController extends Controller
{
    // chef de service crée une mission
    public function store(Request $request)
    {
        $request->validate([
            'employe_id' => 'required|exists:employes,id',
            'fonction' => 'required|string',
            'lieu_affectation' => 'required|string',
            'objectif' => 'required|string',
            'itineraire' => 'required|string',
            'date_depart' => 'required|date',
            'date_retour' => 'required|date|after_or_equal:date_depart',
        ]);

        $mission = Mission::create([
            'employe_id' => $request->employe_id,
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


    // chef de service : liste de toutes les missions
    public function index()
    {
        return Mission::with(['employee','vehicle'])->get();
    }


    // employé : ses propres missions
    public function myMissions(Request $request)
        {
            return Mission::where('employe_id', $request->user()->employe_id)
                ->with('vehicle')
                ->get();
        }

}
