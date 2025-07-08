<?php

namespace App\Models;

//use Illuminate\Contracts\Auth\MustVerifyEmail;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use  Laravel\Sanctum\HasApiTokens;


class User extends Authenticatable
{

    use HasApiTokens, HasFactory, Notifiable;

    // fetch all except these.
    protected $hidden = ['password', 'updated_at'];

    protected $guarded = [];


    // protected $hidden = [
    //     'password',
    //     'remember_token',
    // ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed', // hash password before saving in DB
        ];
    }

    // mutator
    // protected function password(): Attribute
    // {
    //     return Attribute::make(
    //         set: fn($value) => bcrypt($value),
    //     );
    // }
}
