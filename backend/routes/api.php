<?php 
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EmployController;
use App\Http\Controllers\Api\MissionController;
use App\Http\Controllers\Api\VehicleController;
use Illuminate\Support\Facades\Route;

    Route::post('/login',[AuthController::class,'login']);

    Route::middleware('auth:sanctum')->group(function(){
         // Routes pour les missions 
        Route::post('/missions',[MissionController::class,'store']);
        Route::get('/missions',[MissionController::class,'index']);
        Route::put('/missions/{id}',[MissionController::class,'update']);
        Route::delete('/missions/{id}',[MissionController::class,'destroy']);
        Route::post('/missions/{id}/transport',[MissionController::class,'setTransport']);
       
       

    });
       
    // Routes pour les employés
    Route::prefix('employes')->group(function () {
        Route::get('/', [EmployController::class, 'index']);           // GET /api/employes
        Route::put('/{id}', [EmployController::class, 'update']);      // PUT /api/employes/{id}
        Route::delete('/{id}', [EmployController::class, 'destroy']);  // DELETE /api/employes/{id}
    });