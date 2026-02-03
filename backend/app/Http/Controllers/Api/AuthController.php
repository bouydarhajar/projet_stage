<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email'=>'required|email',
            'password'=>'required'
        ]);
        $user = User::where('email',$request->email)->first();

        if(!$user || !Hash::check($request->password,$user->password)){
            return response()->json(['message'=>'Invalid'],401);
        }

         $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'token'=>$token,
            'user'=>$user
        ]);
    }


    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json();
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'password'=>'required|confirmed|min:6'
        ]);

        $request->user()->update([
            'password'=>Hash::make($request->password)
        ]);

        return response()->json();
    }
}