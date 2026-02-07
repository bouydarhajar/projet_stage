<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mission;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class MissionController extends Controller
{
    public function __construct()
    {
        // Activer l'authentification pour toutes les routes
        // $this->middleware('auth:sanctum');
    }

    /**
     * Liste de toutes les missions
     * Filtrage possible par statut et pour le chef de parc
     */
    public function index(Request $request)
    {
        $query = Mission::with(['employee', 'vehicle']);
        // Filtrer par statut si spécifié
        if ($request->has('status')) {
            $query->where('statut', $request->status);
        }
        // Filtrer les missions en attente pour le chef de parc
        if ($request->has('for_chef_parc') && $request->for_chef_parc) {
            $query->where('statut', 'en_attente')->where('transport_type', 'voiture');
        }
        // Filtrer par type de transport
        if ($request->has('transport_type')) {
            $query->where('transport_type', $request->transport_type);
        }
        $missions = $query->orderBy('created_at', 'desc')->get();
        return response()->json($missions);
    }

    /**
     * Chef de service crée une nouvelle mission
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'doti_id' => 'required|exists:employes,Doti',
            'fonction' => 'required|string|max:255',
            'lieu_affectation' => 'required|string|max:255',
            'objectif' => 'required|string',
            'itineraire' => 'required|string',
            'transport_type' => 'nullable|in:car,voiture',
            'date_depart' => 'required|date',
            'date_retour' => 'required|date|after_or_equal:date_depart',
        ]);
        // Déterminer le statut initial selon le type de transport
        $statut = 'brouillon';
        if ($request->transport_type === 'voiture') {
            $statut = 'en_attente'; // Envoyé au chef de parc
        } elseif ($request->transport_type === 'car') {
            $statut = 'valide'; // Validé directement (pas besoin de véhicule)
        }
        $mission = Mission::create([
            'doti_id' => $validated['doti_id'],
            'chef_service_id' => auth()->id() ?? 1, // ID de l'utilisateur connecté ou 1 pour les tests
            'fonction' => $validated['fonction'],
            'lieu_affectation' => $validated['lieu_affectation'],
            'objectif' => $validated['objectif'],
            'itineraire' => $validated['itineraire'],
            'transport_type' => $validated['transport_type'],
            'date_depart' => $validated['date_depart'],
            'date_retour' => $validated['date_retour'],
            'statut' => $statut
        ]);
        // Charger les relations
        $mission->load(['employee', 'vehicle']);
        return response()->json([
            'message' => $statut === 'en_attente' 
                ? 'Mission créée et envoyée au chef de parc avec succès' 
                : 'Mission créée avec succès',
            'mission' => $mission
        ], 201);
    }
    /**
     * Afficher une mission spécifique
     */
    public function show($id)
    {
        $mission = Mission::with(['employee', 'vehicle'])->find($id);
        if (!$mission) {
            return response()->json(['message' => 'Mission non trouvée'], 404);
        }
        return response()->json($mission);
    }
    /**
     * Mettre à jour une mission
     */
    public function update(Request $request, $id)
    {
        $mission = Mission::find($id);

        if (!$mission) {
            return response()->json(['message' => 'Mission non trouvée'], 404);
        }
        $validated = $request->validate([
            'doti_id' => 'sometimes|exists:employes,Doti',
            'fonction' => 'sometimes|string|max:255',
            'lieu_affectation' => 'sometimes|string|max:255',
            'objectif' => 'sometimes|string',
            'itineraire' => 'sometimes|string',
            'transport_type' => 'sometimes|in:car,voiture',
            'date_depart' => 'sometimes|date',
            'date_retour' => 'sometimes|date|after_or_equal:date_depart',
            'statut' => 'sometimes|in:brouillon,en_attente,valide,en_cours,terminee,annulee',
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'start_mileage' => 'nullable|integer|min:0',
            'end_mileage' => 'nullable|integer|min:0',
        ]);
        $mission->update($validated);
        $mission->load(['employee', 'vehicle']);
        return response()->json([
            'message' => 'Mission mise à jour avec succès',
            'mission' => $mission
        ]);
    }
    /**
     * Supprimer une mission
     */
    public function destroy($id)
    {
        $mission = Mission::find($id);
        if (!$mission) {
            return response()->json(['message' => 'Mission non trouvée'], 404);
        }
        // Vérifier si un véhicule est assigné et le libérer
        if ($mission->vehicle_id) {
            $vehicle = Vehicle::find($mission->vehicle_id);
            if ($vehicle) {
                $vehicle->update(['status' => 'available']);
            }
        }
        $mission->delete();
        return response()->json(['message' => 'Mission supprimée avec succès'], 200);
    }
    /**
     * Chef de parc valide une mission et affecte un véhicule
     */
    public function validate(Request $request, $id)
    {
        $mission = Mission::find($id);
        if (!$mission) {
            return response()->json(['message' => 'Mission non trouvée'], 404);
        }
        // Vérifier que la mission est en attente
        if ($mission->statut !== 'en_attente') {
            return response()->json([
                'message' => 'Cette mission ne peut pas être validée. Statut actuel: ' . $mission->statut
            ], 400);
        }
        $validated = $request->validate([
            'vehicle_id' => 'required|exists:vehicles,id',
            'start_mileage' => 'required|integer|min:0',
        ]);
        // Vérifier que le véhicule est disponible
        $vehicle = Vehicle::find($validated['vehicle_id']);
        if ($vehicle->status !== 'available') {
            return response()->json([
                'message' => 'Le véhicule sélectionné n\'est pas disponible'
            ], 400);
        }
        // Vérifier que le kilométrage de départ est valide
        if ($validated['start_mileage'] < $vehicle->current_mileage) {
            return response()->json([
                'message' => "Le kilométrage de départ doit être au moins égal au kilométrage actuel du véhicule ({$vehicle->current_mileage} km)"
            ], 400);
        }
        // Mettre à jour la mission
        $mission->update([
            'statut' => 'valide',
            'vehicle_id' => $validated['vehicle_id'],
            'start_mileage' => $validated['start_mileage'],
            'chef_parc_id' => auth()->id() ?? 1, // ID du chef de parc
        ]);
        // Mettre à jour le statut du véhicule
        $vehicle->update([
            'status' => 'on_mission',
            'current_mileage' => $validated['start_mileage']
        ]);
        $mission->load(['employee', 'vehicle']);
        return response()->json([
            'message' => 'Mission validée et véhicule affecté avec succès',
            'mission' => $mission
        ], 200);
    }
    /**
     * Démarrer une mission (changement de statut à "en_cours")
     */
    public function start($id)
    {
        $mission = Mission::find($id);
        if (!$mission) {
            return response()->json(['message' => 'Mission non trouvée'], 404);
        }
        if ($mission->statut !== 'valide') {
            return response()->json([
                'message' => 'Seules les missions validées peuvent être démarrées'
            ], 400);
        }
        $mission->update(['statut' => 'en_cours']);
        $mission->load(['employee', 'vehicle']);
        return response()->json([
            'message' => 'Mission démarrée avec succès',
            'mission' => $mission
        ]);
    }
    /**
     * Terminer une mission
     */
    public function complete(Request $request, $id)
    {
        $mission = Mission::find($id);
        if (!$mission) {
            return response()->json(['message' => 'Mission non trouvée'], 404);
        }
        if (!in_array($mission->statut, ['valide', 'en_cours'])) {
            return response()->json([
                'message' => 'Cette mission ne peut pas être terminée'
            ], 400);
        }
        $validated = $request->validate([
            'end_mileage' => 'required|integer|min:' . ($mission->start_mileage ?? 0),
        ]);
        // Mettre à jour la mission
        $mission->update([
            'statut' => 'terminee',
            'end_mileage' => $validated['end_mileage'],
        ]);
        // Libérer le véhicule si un véhicule était assigné
        if ($mission->vehicle_id) {
            $vehicle = Vehicle::find($mission->vehicle_id);
            if ($vehicle) {
                $vehicle->update([
                    'status' => 'available',
                    'current_mileage' => $validated['end_mileage']
                ]);
            }
        }
        $mission->load(['employee', 'vehicle']);
        return response()->json([
            'message' => 'Mission terminée avec succès',
            'mission' => $mission
        ]);
    }
    /**
     * Annuler une mission
     */
    public function cancel($id)
    {
        $mission = Mission::find($id);
        if (!$mission) {
            return response()->json(['message' => 'Mission non trouvée'], 404);
        }
        if ($mission->statut === 'terminee') {
            return response()->json([
                'message' => 'Une mission terminée ne peut pas être annulée'
            ], 400);
        }
        // Libérer le véhicule si un véhicule était assigné
        if ($mission->vehicle_id) {
            $vehicle = Vehicle::find($mission->vehicle_id);
            if ($vehicle) {
                $vehicle->update(['status' => 'available']);
            }
        }
        $mission->update(['statut' => 'annulee']);
        $mission->load(['employee', 'vehicle']);
        return response()->json([
            'message' => 'Mission annulée avec succès',
            'mission' => $mission
        ]);
    }
    /**
     * Chef de parc affecte ou modifie le type de transport
     * (Cette méthode peut être conservée pour la compatibilité)
     */
    public function setTransport(Request $request, $id)
    {
        $validated = $request->validate([
            'transport_type' => 'required|in:car,voiture',
            'vehicle_id' => 'nullable|exists:vehicles,id'
        ]);
        $mission = Mission::findOrFail($id);
        if ($validated['transport_type'] === 'car') {
            // Transport en car : pas de véhicule nécessaire
            $mission->update([
                'transport_type' => 'car',
                'vehicle_id' => null,
                'statut' => 'valide',
                'chef_parc_id' => auth()->id() ?? 1
            ]);
        } else {
            // Transport en voiture : véhicule requis
            if (!$validated['vehicle_id']) {
                return response()->json([
                    'message' => 'Un véhicule doit être sélectionné pour le transport en voiture'
                ], 400);
            }
            $vehicle = Vehicle::find($validated['vehicle_id']);
            if ($vehicle->status !== 'available') {
                return response()->json([
                    'message' => 'Le véhicule sélectionné n\'est pas disponible'
                ], 400);
            }
            $mission->update([
                'transport_type' => 'voiture',
                'vehicle_id' => $validated['vehicle_id'],
                'statut' => 'valide',
                'chef_parc_id' => auth()->id() ?? 1
            ]);
            // Mettre à jour le statut du véhicule
            $vehicle->update(['status' => 'on_mission']);
        }
        $mission->load(['employee', 'vehicle']);
        return response()->json([
            'message' => 'Type de transport affecté avec succès',
            'mission' => $mission
        ]);
    }
    /**
     * Employé : ses propres missions
     */
    public function myMissions(Request $request)
    {
        // Récupérer le DOTI de l'utilisateur connecté
        $doti = $request->user()->Doti ?? $request->doti_id;

        $missions = Mission::where('doti_id', $doti)
            ->with(['vehicle'])
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($missions);
    }
    /**
     * Statistiques pour le dashboard
     */
    public function statistics()
    {
        $stats = [
            'total' => Mission::count(),
            'en_attente' => Mission::where('statut', 'en_attente')->count(),
            'valide' => Mission::where('statut', 'valide')->count(),
            'en_cours' => Mission::where('statut', 'en_cours')->count(),
            'terminee' => Mission::where('statut', 'terminee')->count(),
            'annulee' => Mission::where('statut', 'annulee')->count(),
            'avec_voiture' => Mission::where('transport_type', 'voiture')->count(),
            'avec_car' => Mission::where('transport_type', 'car')->count(),
        ];
        return response()->json($stats);
    }
}