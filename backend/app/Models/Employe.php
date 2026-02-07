<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employe extends Model
{
    use HasFactory;

    protected $table = 'employes';
    protected $primaryKey = 'Doti';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'Doti',
        'nom',
        'prenom',
        'CIN',
        'fonction',
        'grade'
    ];

        // un employé peut avoir plusieurs missions
    public function missions()
    {
        return $this->hasMany(Mission::class, 'doti_id', 'doti');
        //                                     ↑           ↑
        //                            clé dans missions   clé dans employes
    }
    
}
