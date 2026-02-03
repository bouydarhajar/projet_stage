<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mission extends Model
{
    protected $fillable = [
        'numero',
        'employe',
        'destination',
        'date_depart',
        'date_retour',
        'statut',
        'transport',
    ];
    public function employee()
    {
        return $this->belongsTo(Employe::class, 'employe_id');
    }

}
