<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use App\Models\BillItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class Bill_ItemController extends Controller
{
    ///---------Analytics data----------///

    //Get most sold items.
    public function TopProducts()
    {
        // Ensure the user is authorized (only Admin can access this method)
        $auth = Auth::user();
        if ($auth->role !== "admin") {
            return response()->json([
                'status' => 'UNAUTHORIZED',
                'message' => 'USER NOT AUTHORIZED'
            ], 401);
        }

        // Get Top 5 most selling Products according to the number of times they have been bought.
        $topProducts = BillItem::select('name', DB::raw('SUM(quantity) as total_sold'))
            ->groupBy('name')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get();

        if ($topProducts->isNotEmpty()) {
            // success response
            return response()->json([
                'status' => 'success',
                'data' => $topProducts
            ], 200);
        } else {
            // failure response
            return response()->json([
                'status' => 'failure',
                'message' => 'failed to fetch Top Products'
            ], 500);
        }
    }
}
