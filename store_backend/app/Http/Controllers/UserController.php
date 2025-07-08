<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Models\User;


use function PHPUnit\Framework\isEmpty;

class UserController extends Controller
{
    // get all users
    public function index()
    {
        // Ensure the user is authorized (only Admin can access this method)
        $auth = Auth::user();
        if ($auth->role !== "admin") {
            return response()->json([
                'status' => 'UNAUTHORIZED',
                'message' => 'USER NOT AUTHORIZED'
            ], 401);
        }

        // Fetch all users, hide password from results
        $users = User::all()->makeHidden(['password']);


        // Success and Server Error Response
        if ($users) {
            return response()->json([
                'status' => 'success',
                'message' => 'All Users',
                'users' => $users
            ], 200);
        } else {
            return response()->json([
                'status' => 'failure',
                'message' => 'Failed to fetch users',
            ], 500);
        }
    }

    // get single user
    public function getUser(Request $req)
    {
        // Ensure the user is authorized (only Admin can access this method)
        $auth = Auth::user();
        if ($auth->role !== "admin") {
            return response()->json([
                'status' => 'UNAUTHORIZED',
                'message' => 'USER NOT AUTHORIZED'
            ], 401);
        }

        // Validate the search query
        $validated = Validator::make($req->all(), [
            'query' => 'required|max:50|string'
        ]);

        if ($validated->fails()) {
            return response()->json([
                'status' => 'not_valid',
                'message' => 'please provide a valid Name or Phone for user'
            ], 400);
        }

        // Sanitize input (strip tags + trim)
        $query = trim(strip_tags($req->input('query')));

        // Search for users by name or role (partial match, limit to 5 results)
        $user = User::where('name', 'LIKE', "%{$query}%")
            ->orWhere('role', 'LIKE', "%{$query}%")
            ->limit(5)
            ->get();


        // Log the search activity
        $activitySaved = ActivityLog::create([
            'user_id' => Auth::user()->id,
            'role' => Auth::user()->role,
            'action_type' => 'Searched',
            'description' => Auth::user()->role . " Searched for a User/Users ", // here is error for id 
            'related_id' => null,
            'related_type' => 'User',
            'ip_address' => request()->ip()
        ]);

        // Return user(s) if found or  No matching user found
        return  $user->isNotEmpty() ?  response()->json([
            'status' => 'success',
            'message' => 'User fetch Successfully',
            'Activity' => $activitySaved ? "Saved" : "Not Saved",
            'data' => $user
        ], 200) :  response()->json([
            'status' => 'failure',
            'message' => 'User Not Found'
        ], 404);
    }

    // create user
    public function store(Request $req)
    {
        // Validate input data
        $validated = Validator::make($req->all(), [
            'name' => 'required|max:30|string',
            'phone' => 'required|max:11|string',
            'role' => 'required|string',
            'password' => 'required'

        ]);

        if ($validated->fails()) {
            return response()->json([
                'status' => 'NOT_VALID',
                'message' => 'Provided Values are not Valid',
            ], 400);
        }

        // Check if the logged-in user is admin
        if (Auth::check() && Auth::user()->role === 'admin') {
            $created = User::create([
                'name' => $req->name,
                'phone' => $req->phone,
                'email' => $req->email,
                'address' => $req->address,
                'city' => $req->city,
                'role' => $req->role,
                'password' => $req->password,
            ]);


            if ($created) {
                // Log Activity 
                $activitySaved = ActivityLog::create([
                    'user_id' => Auth::user()->id,
                    'role' => Auth::user()->role,
                    'action_type' => 'Created',
                    'description' => Auth::user()->role . " Created New User with ID #" . $created->id,
                    'related_id' => $created->id,
                    'related_type' => 'User',
                    'ip_address' => request()->ip()
                ]);

                return response()->json([
                    'status' => 'created',
                    'message' => 'User Created Successfully',
                    'Activity' => $activitySaved ? "Saved" : "Not Saved",
                    'id' => $created->id,
                ], 201);
            } else {
                return response()->json([
                    'status' => 'failed',
                    'message' => 'Error Creating User',
                ], 500);
            }
        } else {
            // Auth Check failed
            return response()->json([
                'status' => 'UNAUTHORIZED',
                'message' => 'User not Authorized',
            ], 401);
        }
    }

    // update user 
    public function update(Request $req)
    {
        $auth = Auth::user();

        if ($auth->role !== "admin") {
            return response()->json([
                'status' => 'UNAUTHORIZED',
                'message' => 'USER NOT AUTHORIZED'
            ], 401);
        }

        // Validate input values
        $validated = Validator::make($req->all(), [
            'userId' => 'required',
            'updateName' => 'required|string|max:30',
            'updateAddress' => 'nullable|string|max:150',
            'updateCity' => 'nullable|string|max:30',
            'updatePhone' => 'required|string|max:11|min:11',
            'updateEmail' => 'nullable||string|email|max:150',
            'updateRole' => 'required|max:30|string'
        ]);

        if ($validated->fails()) {
            return response()->json([
                'status' => 'not_valid',
                'message' => 'please provide a valid Values to update',
                'error' => $validated->errors()
            ], 400);
        }

        // Find user to update
        $User_to_update = User::find($req->userId);

        // Perform update
        if ($User_to_update) {
            $updated =  $User_to_update->update([
                'name' => $req->updateName,
                'email' => $req->updateEmail,
                'phone' => $req->updatePhone,
                'address' => $req->updateAddress,
                'city' => $req->updateCity,
                'role' => $req->updateRole
            ]);

            if ($updated) {
                // Log Activity
                $activitySaved = ActivityLog::create([
                    'user_id' => $auth->id,
                    'role' => $auth->role,
                    'action_type' => 'Updated',
                    'description' => $auth->role . " Updated User #" . $req->userId,
                    'related_id' => $req->userId,
                    'related_type' => 'User',
                    'ip_address' => request()->ip()
                ]);


                return response()->json([
                    'status' => 'success',
                    'message' => 'User Updated Successfully',
                    'Activity' => $activitySaved ? "Saved" : "Not Saved",
                    'data' => $User_to_update
                ], 200);
            }
        } else {
            return response()->json([
                'status' => 'notfound',
                'message' => 'User Not by ID #' . $req->userId,
            ], 404);
        }
    }

    // Delete User 
    public function destroy(Request $req)
    {
        $user = Auth::user();

        if ($user->role !== "admin") {
            return response()->json([
                'status' => 'UNAUTHORIZED',
                'message' => 'USER NOT AUTHORIZED'
            ], 401);
        }

        // Validate  request
        $validated = Validator::make($req->all(), [
            'id' => 'required'
        ]);

        if ($validated->fails()) {
            return response()->json([
                'status' => 'invalid',
                'message' => 'Please Provide a Valid Id'
            ], 400);
        }

        //find user to delete
        $user_to_delete = User::find($req->id);

        //delete use 
        if ($user_to_delete) {
            $deleted = $user_to_delete->delete();
        } else {
            return response()->json([
                'status' => 'notfound',
                'message' => 'User Does Not Exist With ID ' . $req->id
            ], 404);
        }


        if ($deleted) {
            // Log Activity and send success response
            $activitySaved = ActivityLog::create([
                'user_id' => Auth::user()->id,
                'role' => Auth::user()->role,
                'action_type' => 'Deleted',
                'description' => Auth::user()->role . " Deleted User #" . $req->id,
                'related_id' => $req->id,
                'related_type' => 'User',
                'ip_address' => request()->ip()
            ]);

            return response()->json([
                'status' => 'success',
                'Activity' => $activitySaved ? "Saved" : "Not Saved",
                'message' => 'User Deleted Successfully'
            ], 200);
        } else {
            return response()->json([
                'status' => 'failure',
                'message' => 'Failed to Delete User with ID ' . $req->id
            ], 500);
        }
    }


    // Login User
    public function login(Request $req)
    {
        // validating request
        $validated = validator::make($req->all(), [
            'user_name' => 'required|string',
            'user_pass' => 'required',
        ]);

        // if request values fails validation
        if ($validated->fails()) {
            return response()->json([
                'status' => 'notvaild',
                'message' => 'username Or password is not provided',
            ], 422);
        }

        // if validation is correct.
        $credentials = [
            'name' => $req->user_name,
            'password' => $req->user_pass
        ];

        // checking the username and password 
        if (Auth::attempt($credentials)) {

            $activitySaved = ActivityLog::create([
                'user_id' => Auth::user()->id,
                'role' => Auth::user()->role,
                'action_type' => 'Logged In',
                'description' => Auth::user()->role . " Logged in",
                'related_id' => null,
                'related_type' => null,
                'ip_address' => request()->ip()
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'user logged in successfully',
                'Activity' => $activitySaved ? 'Saved' : "Not Saved",
                'data' => [
                    'name' => Auth::user()->name,
                    'id' => Auth::user()->id,
                    'role' => Auth::user()->role,
                    'email' => Auth::user()->email,
                ],
                'token' => Auth::user()->createToken('auth_token')->plainTextToken,
                'token_type' => 'Bearer'
            ], 200);
        } else {
            return response()->json([
                'status' => 'incorrect',
                'message' => 'incorrect username or password',
            ], 401);
        }
    }

    // Logout User
    public function logout(Request $req)
    {

        // Delete User Token 
        if ($req->user()->currentAccessToken()->delete()) {

            // Log Activity and send Response
            $activitySaved = ActivityLog::create([
                'user_id' => $req->user()->id,
                'role' => $req->user()->role,
                'action_type' => 'Logged Out',
                'description' => $req->user()->role . " Logged Out",
                'related_id' => null,
                'related_type' => null,
                'ip_address' => request()->ip()
            ]);

            return response()->json([
                'status' => 'success',
                'Activity' => $activitySaved ?  "Saved" : "Not Saved",
                'message' => 'user logged out',

            ], 200);
        } else {
            return response()->json([
                'status' => 'faliure',
                'message' => 'error logging out'
            ], 500);
        }
    }
}
