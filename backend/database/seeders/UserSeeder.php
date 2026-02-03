<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
        'name'=>'Chef Service',
        'email'=>'chefservice@test.com',
        'password'=>Hash::make('123456'),
        'role'=>'chef_service'
    ]);

    User::create([
        'name'=>'Chef Parc',
        'email'=>'chefparc@test.com',
        'password'=>Hash::make('123456'),
        'role'=>'chef_parc'
    ]);

    }
}
