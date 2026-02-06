<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
   protected $fillable = [
        'brand',
        'model',
        'plate',
        'seats',
        'status',
        'current_mileage',
    ];
    

}
