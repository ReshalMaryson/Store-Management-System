<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Models\Bill;
use App\Models\Customer;
use App\Models\BillItem;
use App\Models\ActivityLog;
use BcMath\Number;
use Pest\ArchPresets\Custom;
use Carbon\Carbon;

use function Pest\Laravel\json;
use function PHPSTORM_META\type;

class BillController extends Controller
{

    // get bills 
    public function index()
    {

        // Ensure the user is authorized (only admin can request a bill)
        $user = Auth::user();
        if ($user->role !== "admin") {
            return response()->json([
                'status' => 'UNAUTHORIZED',
                'message' => 'USER NOT AUTHORIZED'
            ], 401);
        }


        // if authorized -> get bills with bill_items
        $bills = Bill::with('customer', 'billItems')->paginate('10');


        // if bills are fetched
        if ($bills) {
            // success response
            return response()->json([
                'status' => 'success',
                'messages' => 'bill fetched successfully',
                'data' => $bills,

            ]);
        } else {
            // failure response
            return response()->json([
                'status' => 'failure',
                'message' => 'Failed to Fetch Bills'
            ]);
        }
    }

    // create bill
    public function store(Request $req)
    {

        // Ensure the user is authorized (only admin or cashier can create a bill)
        $user = Auth::user();
        if ($user->role !== "admin" && $user->role !== "cashier") {
            return response()->json([
                'status' => 'UNAUTHORIZED',
                'message' => 'USER NOT AUTHORIZED'
            ], 401);
        }

        try {
            $Customer = null;

            // Wrap operations inside a DB transaction to maintain data integrity
            $response = DB::transaction(function () use ($req, &$Customer) {


                // If customer phone is provided, find or create the customer
                if ($req->filled('cust_phone')) {
                    $Customer = Customer::firstOrCreate(
                        ['phone' => $req->cust_phone], // this checks for the phone first
                        ['name' => $req->cust_name ?? 'Take Away'] //if not exists then creates with both values
                    );
                } else {
                    // Use a default customer with ID 1 (assumed to be permanent "Take Away" guest)
                    $Customer = Customer::find(1); // take away parmanent customer
                }

                // VALIDATE BILL FIELDS 
                $billValidator = Validator::make($req->all(), [
                    'staff_id' => "required",
                    'subtotal' => 'required',
                    'discount' => 'required',
                    'total' => 'required'
                ]);

                if ($billValidator->fails()) {
                    throw new \Exception('Invalid Bill Data: ' . json_encode($billValidator->errors()));
                }

                // CREATE BILL
                $bill = Bill::create([
                    'staff_id' => $req->staff_id,
                    'customer_id' => $Customer->id,
                    'subtotal' => $req->subtotal,
                    'discount' => $req->discount,
                    'total'  => $req->total,
                ]);

                // CREATE BILL ITEMS
                if ($req->items) {

                    // VALIDATE BILL ITEMS FIELDS 
                    $billItemValidator = Validator::make($req->all(), [
                        'items' => "required|array|min:1",
                        'items.*.id' => 'required',
                        'items.*.qty' => 'required',
                        'items.*.price' => 'required',
                        'items.*.name' => 'required'
                    ]);

                    if ($billItemValidator->fails()) {
                        throw new \Exception('Invalid Bill Data: ' . json_encode($billItemValidator->errors()));
                    }
                    // Insert data in to bill_ items
                    foreach ($req->items as $item) {
                        BillItem::create([
                            'bill_id' => $bill->id,
                            'product_id' => $item['id'],
                            'name' => $item['name'],
                            'quantity' => $item['qty'],
                            'price_per_unit' => $item['price'],
                            'total_price' => $item['qty'] * $item['price'],
                        ]);
                    }
                }

                // Log Activity
                $activitySaved = ActivityLog::create([
                    'user_id' => Auth::user()->id,
                    'role' => Auth::user()->role,
                    'action_type' => 'Created',
                    'description' => Auth::user()->role . " Created a New Bill with ID #" . $bill->id,
                    'related_id' => $bill->id,
                    'related_type' => 'Bill',
                    'ip_address' => request()->ip()
                ]);

                // Success JSON respose
                return response()->json([
                    'status' => 'success',
                    'message' => 'Bill created successfully',
                    'message' => $activitySaved ? "Saved" : "Not Saved",
                    'bill_id' => $bill->id,
                    'customer_id' => $Customer->id,
                    'customer_name' =>  $Customer->name,
                    'discount' => $bill->discount,
                    'total' => $bill->total
                ], 200);
                // END TRANSACTION
            });

            return $response; // return json success reponse for entire transaction.
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'ERROR',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // search bills for admin dashboard
    public function AdminSearchBill(Request $req)
    {
        // Ensure the user is authorized (only admin search bill)
        $user = Auth::user();
        if ($user->role !== "admin") {
            return response()->json([
                'status' => 'UNAUTHORIZED',
                'message' => 'USER NOT AUTHORIZED'
            ], 401);
        }

        // validate search query
        $validate = Validator::make($req->all(), [
            'query' => "required"
        ]);

        // validaition failure
        if ($validate->fails()) {
            return response()->json([
                'status' => 'notvalid',
                'message' => 'Please Provide Valid Search Query',
                'error' => $validate->errors()
            ], 400);
        }

        //get data from request
        $type = $req->input('type');
        $query = $req->input('query');
        $now = now()->setTimezone('Asia/Karachi');


        // switch according to request query.
        switch ($type) {
            case 'IdOrTotal':
                $bills = Bill::with('customer', 'billItems')
                    ->where('id', $query)
                    ->orWhere('total', $query)
                    ->get();
                break;

            case 'filter':
                switch ($query) {
                    case 'today':
                        $bills = Bill::with('customer', 'billItems')
                            ->whereBetween('created_at', [
                                $now->copy()->startOfDay()->timezone('UTC'),
                                $now->copy()->endOfDay()->timezone('UTC')
                            ])
                            ->get();
                        break;

                    case '3days':
                        $bills = Bill::with('customer', 'billItems')
                            ->whereBetween('created_at', [
                                $now->copy()->subDays(2)->startOfDay()->timezone('UTC'),
                                $now->copy()->endOfDay()->timezone('UTC')
                            ])
                            ->get();
                        break;

                    case 'week':
                        $bills = Bill::with('customer', 'billItems')
                            ->whereBetween('created_at', [
                                $now->copy()->subDays(6)->startOfDay()->timezone('UTC'),
                                $now->copy()->endOfDay()->timezone('UTC')
                            ])
                            ->get();
                        break;

                    case 'month':
                        $bills = Bill::with('customer', 'billItems')
                            ->whereBetween('created_at', [
                                $now->copy()->startOfMonth()->timezone('UTC'),
                                $now->copy()->endOfMonth()->timezone('UTC')
                            ])
                            ->get();
                        break;

                    case '3months':
                        $bills = Bill::with('customer', 'billItems')
                            ->whereBetween('created_at', [
                                $now->copy()->subMonths(2)->startOfMonth()->timezone('UTC'),
                                $now->copy()->endOfMonth()->timezone('UTC')
                            ])
                            ->get();
                        break;

                    case 'year':
                        $bills = Bill::with('customer', 'billItems')
                            ->whereBetween('created_at', [
                                $now->copy()->startOfYear()->timezone('UTC'),
                                $now->copy()->endOfYear()->timezone('UTC')
                            ])
                            ->get();
                        break;

                    default:
                        return response()->json([
                            'status' => 'failure',
                            'message' => 'Invalid filter query.'
                        ], 400);
                }
                break;

            case 'custom':
                $bills = Bill::with('customer', 'billItems')
                    ->whereDate('created_at',  $query)
                    ->get();
                break;


            default:
                return response()->json([
                    'status' => 'failure',
                    'message' => 'Invalid type value.'
                ], 400);
        }

        // if bills found 
        if ($bills->isNotEmpty()) {
            // Log Activity
            $activitySaved = ActivityLog::create([
                'user_id' => Auth::user()->id,
                'role' => Auth::user()->role,
                'action_type' => 'Searched',
                'description' => Auth::user()->role . " Searched For Bill/Bills",
                'related_id' => null,
                'related_type' => 'Bill',
                'ip_address' => request()->ip()
            ]);

            // return JSON success response
            return response()->json([
                'status' => 'success',
                'Activity' => $activitySaved ? "Saved" : "Not Saved",
                'data' => $bills
            ], 200);
        } else {
            // Not Found response if bill not found according to request query.
            return response()->json([
                'status' => 'notfound',
                'message' => 'Bill Not Found'
            ], 200);
        }
    }

    // get latest bill for cashier to print.
    public function CashierSearchBill(Request $req)
    {
        // Ensure the user is authorized (only cashier can access this method)
        $user = Auth::user();
        if ($user->role !== "cashier") {
            return response()->json([
                'status' => 'UNAUTHORIZED',
                'message' => 'USER NOT AUTHORIZED'
            ], 401);
        }

        //Validate Bill Id from request 
        $validate = Validator::make($req->all(), [
            'id' => 'required|integer|min:1|max:200000'
        ]);

        // handle in valid ID
        if ($validate->fails()) {
            return response()->json([
                'status' => 'notvalid',
                'message' => 'Please Provide Valid Search Query',
                'error' => $validate->errors()
            ], 400);
        }

        // ensure id is an integar
        $bill_id = (int) $req->id;

        //get bills 
        $bill = Bill::with('customer', 'billItems')->find($bill_id);;

        if ($bill) {
            // success response
            return response()->json([
                'status' => "success",
                'message' => 'bill found successfully',
                'data' => $bill
            ], 200);
        } else {
            // not found response
            return response()->json([
                'status' => "notfound",
                'message' => 'bill not found',
            ], 404);
        }
    }

    //--------------- Analytics Data -------------------//

    //get top performing cashiers.
    public function TopCashier()
    {
        // Ensure the user is authorized (only Admin can access this method)
        $auth = Auth::user();
        if ($auth->role !== "admin") {
            return response()->json([
                'status' => 'UNAUTHORIZED',
                'message' => 'USER NOT AUTHORIZED'
            ], 401);
        }

        // get To 5 Cashiers by Most Number of Sales.
        $topCashiers = Bill::select('staff_id', DB::raw('COUNT(*) as total_bills'))
            ->with('staff:id,name')
            ->groupBy('staff_id')
            ->orderByDesc('total_bills')
            ->limit(5)
            ->get();

        // if Cashiers Found 
        if ($topCashiers->isNotEmpty()) {
            // success response
            return response()->json([
                'status' => 'success',
                'data' => $topCashiers
            ], 200);
        } else {
            // failure response
            return response()->json([
                'status' => 'failure',
                'message' => 'failed to fetch Top Cashiers'
            ], 500);
        }
    }


    //get top Sales.
    public function TopSales()
    {
        // Ensure the user is authorized (only Admin can access this method)
        $auth = Auth::user();
        if ($auth->role !== "admin") {
            return response()->json([
                'status' => 'UNAUTHORIZED',
                'message' => 'USER NOT AUTHORIZED'
            ], 401);
        }


        // Get To 3 sales by highest amount amount 
        $topSale = Bill::select('id', 'total', 'created_at')
            ->orderByDesc('total')
            ->limit(3)
            ->get();


        if ($topSale->isNotEmpty()) {
            //succes Response 
            return response()->json([
                'status' => 'success',
                'data' => $topSale
            ], 200);
        } else {
            // failure response
            return response()->json([
                'status' => 'failure',
                'message' => 'failed to fetch Top Sales'
            ], 500);
        }
    }


    // get store performance meterics
    public function StoreMeterics(Request $req)
    {
        // Ensure the user is authorized (only Admin can access this method)
        $auth = Auth::user();
        if ($auth->role !== "admin") {
            return response()->json([
                'status' => 'UNAUTHORIZED',
                'message' => 'USER NOT AUTHORIZED'
            ], 401);
        }

        //Validate the request data.
        $validate = validator::make($req->all(), [
            'filter' => 'required|string|max:20',
            'from' => 'nullable|date',
            'to' => 'nullable|date'
        ]);

        // Not Valid reponse
        if ($validate->fails()) {
            return response()->json([
                'status' => 'notvalid',
                'message' => $validate->errors()
            ], 400);
        }

        $timezone = 'Asia/Karachi';
        $filter = $req->input('filter', "week");
        $from = null;
        $to = null;

        // switch according to filter.
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

            case '6months':
                $from = Carbon::now($timezone)->subMonths(5)->startOfMonth()->timezone('UTC');
                $to = Carbon::now($timezone)->endOfMonth()->timezone('UTC');
                break;

            case 'year':
                $from = Carbon::now($timezone)->startOfYear()->timezone('UTC');
                $to = Carbon::now($timezone)->endOfYear()->timezone('UTC');
                break;

            case 'custom':
                $from = Carbon::parse($req->input('from'), $timezone)->startOfDay()->timezone('UTC');
                $to = Carbon::parse($req->input('to'), $timezone)->endOfDay()->timezone('UTC');
                break;

            default:
                // fallback to month as default
                $from = Carbon::now($timezone)->startOfMonth()->timezone('UTC');
                $to = Carbon::now($timezone)->endOfMonth()->timezone('UTC');
                break;
        }

        // getting and calculating meterics for admin analytics     
        $totalRevenue = Bill::whereBetween('created_at', [$from, $to])->sum('total');
        $totalBills = Bill::whereBetween('created_at', [$from, $to])->count();
        $averageSale = $totalBills > 0 ? round($totalRevenue / $totalBills, 2) : 0;

        // metrics are set 
        if ($totalBills && $totalRevenue && $averageSale) {
            // success response
            return response()->json([
                'status' => 'success',
                'filter' => $filter,
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
                "data" => [
                    'total_revenue' => $totalRevenue,
                    'total_bills' => $totalBills,
                    'average_sale' => $averageSale
                ]
            ], 200);
        } else {
            // failure response
            return response()->json([
                'status' => 'failure',
                'filter' => $filter,
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
                "data" => []
            ], 404);
        }
    }
}
