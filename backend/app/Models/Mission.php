<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mission extends Model
{
    protected $fillable = [
        'employe_id',
        'chef_service_id',
        'fonction',
        'lieu_affectation',
        'objectif',
        'itineraire',
        'date_depart',
        'date_retour',
        'statut',
        'transport_type',
        'vehicle_id',
        'chef_parc_id',
    ];

    public function employee()
    {
        return $this->belongsTo(Employe::class, 'employe_id');
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function chefService()
    {
        return $this->belongsTo(User::class,'chef_service_id');
    }

    public function chefParc()
    {
        return $this->belongsTo(User::class,'chef_parc_id');
    }
}
