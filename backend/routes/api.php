<?php 
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MissionController;
use App\Http\Controllers\Api\VehicleController;
use Illuminate\Support\Facades\Route;

    Route::post('/login',[AuthController::class,'login']);

    Route::middleware('auth:sanctum')->group(function(){

        Route::post('/missions',[MissionController::class,'store']);
        Route::get('/missions',[MissionController::class,'index']);
        Route::post('/missions/{id}/transport',[MissionController::class,'affectTransport']);
        Route::get('/my-missions',[MissionController::class,'myMissions']);
        Route::get('/vehicles',[VehicleController::class,'index']);

    });