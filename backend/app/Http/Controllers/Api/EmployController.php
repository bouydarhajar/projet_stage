<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employe;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployController extends Controller
{
    public function index()
    {
       try {
            $employes = Employe::all();
            
            return response()->json($employes, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération des employés',
                'error' => $e->getMessage()
            ], 500);
        }
    }  
    /**
     * Mettre à jour un employé
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, $id): JsonResource
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'sometimes|required|string|max:255',
            'prenom' => 'sometimes|required|string|max:255',
            'doti' => 'sometimes|required|string|unique:employes,doti,' . $id,
            'cin' => 'sometimes|required|string|unique:employes,cin,' . $id,
            'grade' => 'sometimes|required|string|max:255',
            'fonction' => 'sometimes|required|string|max:255',
            'statut' => 'nullable|in:Actif,En Mission,Inactif'
        ]);

        if ($validator->fails()) {
            return new JsonResource([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ]);
        }

        try {
            $employe = Employe::findOrFail($id);
            $employe->update($request->all());
            return new JsonResource([
                'message' => 'Employé mis à jour avec succès',
                'data' => $employe
            ]);
        } catch (\Exception $e) {
            return new JsonResource([
                'message' => 'Erreur lors de la mise à jour de l\'employé',
                'error' => $e->getMessage()
            ]);
        }
    }
     /**
     * Supprimer un employé
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy($id): JsonResource
    {
        try {
            $employe = Employe::findOrFail($id);
            $employe->delete();

            return new JsonResource([
                'message' => 'Employé supprimé avec succès'
            ], 200);
        } catch (\Exception $e) {
            return new JsonResource([
                'message' => 'Erreur lors de la suppression de l\'employé',
                'error' => $e->getMessage()
            ], 500);
        }
    }
 
}
