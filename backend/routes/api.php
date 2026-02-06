<?php 
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EmployController;
use App\Http\Controllers\Api\MissionController;
use App\Http\Controllers\Api\VehicleController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function(){
    // Routes pour les missions 
    Route::get('/missions', [MissionController::class, 'index']);
    Route::post('/missions', [MissionController::class, 'store']);
    Route::put('/missions/{id}', [MissionController::class, 'update']);
    Route::delete('/missions/{id}', [MissionController::class, 'destroy']);
    Route::post('/missions/{id}/validate', [MissionController::class, 'validate']);
    
    // Routes pour les employés
    Route::prefix('employes')->group(function () {
        Route::get('/', [EmployController::class, 'index']);
        Route::put('/{id}', [EmployController::class, 'update']);
        Route::delete('/{id}', [EmployController::class, 'destroy']);
    });
    
    // Routes pour les véhicules
    Route::get('/vehicles', [VehicleController::class, 'index']);
    Route::put('/vehicles/{vehicle}/status', [VehicleController::class, 'updateStatus']);
    Route::post('/vehicles/{vehicle}/assign', [VehicleController::class, 'assignToMission']);
});