<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Auth\AuthenticationException;

class Handler extends Exception
{
    protected function unauthenticated($request, AuthenticationException $exception)
    {
        return response()->json([
            'status' => 'UNAUTHENTICATED',
            'message' => 'User not logged in or token is missing/invalid',
        ], 401);
        return redirect()->guest(route('login'));
    }
}
