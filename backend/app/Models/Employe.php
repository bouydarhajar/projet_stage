<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employe extends Model
{
    use HasFactory;

    protected $table = 'employes';

    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'service',
        'fonction',
        'grade'
    ];

    // un employé peut avoir plusieurs missions
    public function missions()
    {
        return $this->hasMany(Mission::class, 'employe_id');
    }

}
