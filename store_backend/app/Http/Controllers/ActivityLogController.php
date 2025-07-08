<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class ActivityLogController extends Controller
{

    //--------Analytics Data------------//
    public function getActivities(Request $req)
    {
        // Ensure the user is authorized (only Admin can access this method)
        $auth = Auth::user();
        if ($auth->role !== "admin") {
            return response()->json([
                'status' => 'UNAUTHORIZED',
                'message' => 'USER NOT AUTHORIZED'
            ], 401);
        }

        // Validate Request 
        $validate = validator::make($req->all(), [
            'filter' => 'required|string|max:20',
            'action_type' => 'nullable|string|in:Created,Updated,Deleted,Logged In,Logged Out,Searched'
        ]);

        // Invalid requets response
        if ($validate->fails()) {
            return response()->json([
                'status' => 'invalid',
                'message' => $validate->errors()
            ], 400);
        }

        $filter = $req->input('filter');
        $action_type = $req->input('action_type');
        $page = $req->input('pagenum', 1);
        $to = null;
        $from = null;
        $timezone = 'Asia/Karachi';

        // validate custom filter ensuring all 3 values it reqiures. (filter, to, from).
        if ($filter === 'custom' && (!$req->filled('from') || !$req->filled('to'))) {
            return response()->json([
                'status' => "invalid",
                'message' => 'Ranges for Custom Search Is not Provided'
            ], 400);
        }

        // switch according to filter value.
        switch ($filter) {
            case 'today':
                $now = Carbon::now($timezone);
                $from = $now->copy()->startOfDay()->setTimezone('UTC');
                $to = $now->copy()->endOfDay()->setTimezone('UTC');
                break;

            case 'week':
                $from = Carbon::now($timezone)->subDays(6)->startOfDay()->timezone('UTC');
                $to = Carbon::now($timezone)->endOfDay()->timezone('UTC');
                break;

            case 'month':
                $from = Carbon::now($timezone)->startOfMonth()->timezone('UTC');
                $to = Carbon::now($timezone)->endOfMonth()->timezone('UTC');
                break;

            case 'year':
                $from = Carbon::now($timezone)->startOfYear()->setTimezone('UTC');
                $to = Carbon::now($timezone)->endOfYear()->setTimezone('UTC');
                break;

            case 'custom':
                $from = Carbon::parse($req->input('from'), $timezone)->startOfDay()->timezone('UTC');
                $to = Carbon::parse($req->input('to'), $timezone)->endOfDay()->timezone('UTC');
                break;

            default:
                // fallback to today as default
                $from = Carbon::now($timezone)->startOfDay()->timezone('UTC');
                $to = Carbon::now($timezone)->endOfDay()->timezone('UTC');
                break;
        }


        // getting Activity by data range.
        $query = ActivityLog::whereBetween('created_at', [$from, $to]);

        // filter Activities by Action type if action_type is filled otherwise skip.
        if (!empty($action_type)) {
            $query->where('action_type', $action_type);
        }

        // get activities
        $activities = $query->orderBy('created_at', 'desc')
            ->paginate(20, ['*'], 'page', $page);

        if ($activities->isNotEmpty()) {
            // success JSON response
            return response()->json([
                'status' => "success",
                'message' => 'Activities Fetched Successfully',
                'data' =>   [
                    'activities' => $activities->items(),
                    'current_page' => $activities->currentPage(),
                    'last_page' => $activities->lastPage(),
                    'total' => $activities->total(),
                    'per_page' => $activities->perPage()
                ]
            ], 200);
        } else {
            //not found JSON response.
            return response()->json([
                'status' => 'notfound',
                'message' => 'No activities found',
                'data' => []
            ], 404);
        }
    }
}
