<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Models\Product;


class ProductController extends Controller
{
    public function addProduct(Request $req)
    {
        // Ensure the user is authorized (only Admin can access this method)
        $user = Auth::user();
        if ($user->role != "admin") {
            return response()->json([
                'status' => 'UNAUTHORIZED',
                'message' => 'User not Authorized',
            ], 401);
        }

        // validate request
        $validated = validator::make($req->all(), [
            'name' => 'required|max:256|string',
            'supplier' => 'required|max:100|string',
            'stock' => 'required',
            'barcode' => 'required|max:5|min:5',
            'p_price' => 'required',
            'category' => 'required'

        ]);

        // invalid request response
        if ($validated->fails()) {
            return response()->json([
                'status' => 'NOT_VALID',
                'message' => 'Provided Values are not Valid',
                'errors' => $validated->errors()
            ], 400);
        }

        //calculate selling price by tax and purchase.
        $purchase_price = $req->p_price;
        $profit_margin = 10; // in %
        $base_price = $purchase_price + ($purchase_price * $profit_margin / 100);
        $product_tax = Category::select('tax_rate')->where('id', $req->category)->first();
        if (!$product_tax) {
            // if category does not exists for tax_rate response
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid Category ID',
            ], 400);
        }

        // calculating the amount to sell the product by pruchase and tax.
        $selling_price = $base_price + ($base_price * $product_tax['tax_rate'] / 100);

        //  create product.
        $created = Product::create([
            'name' => $req->name,
            'supplier_name' => $req->supplier,
            'barcode' => $req->barcode,
            'quantity' => $req->stock,
            'purchase_price' => $req->p_price,
            'selling_price' => ceil($selling_price),
            'category_id' => $req->category
        ]);

        if ($created) {
            // Log Activity
            $activitySaved = ActivityLog::create([
                'user_id' => Auth::user()->id,
                'role' => Auth::user()->role,
                'action_type' => 'Created',
                'description' => Auth::user()->role . " Added a Product with ID #" . $created->id,
                'related_id' => $created->id,
                'related_type' => 'Product',
                'ip_address' => request()->ip()
            ]);

            return response()->json([
                // Success Response
                'status' => 'success',
                'mesage' => 'Product Added Successfully',
                'Activity' => $activitySaved ? "Saved" : "Not Saved",
                'id' => $created->id,
            ], 201);
        } else {
            //Faile Response
            return response()->json([
                'status' => 'failed',
                'mesage' => 'Error Adding product',
            ], 500);
        }
    }

    // get all product 
    public function allProducts()
    {
        try {
            // Ensure the user is authorized (only Admin can access this method)
            $user = Auth::user();

            if (!$user || $user->role !== 'admin') {
                return response()->json([
                    'status' => 'UNAUTHORIZED',
                    'message' => 'User not Authorized',
                ], 401);
            }

            // get all Products with Pagination. 7 for Demo purpose.
            $products = Product::with('category')->paginate("7");

            if ($products) {
                // success reponse
                return response()->json([
                    'status' => 'success',
                    'products' => $products,
                ], 200);
            } else {
                //failure response
                return response()->json([
                    'status' => 'failure',
                    'message' => 'error Fetching all products.'
                ], 500);
            }
        } catch (\Throwable $e) {
            // server error reponse
            return response()->json([
                'status' => 'ERROR',
                'message' => 'Something went wrong or token missing.',
                'debug' => $e->getMessage(),
            ], 500);
        }
    }

    // get searched product.
    public function getProduct(Request $req)
    {
        // Ensure the user is authorized (only Admin can access this method)
        $user = Auth::user();
        if ($user->role !== "admin" && $user->role !== 'cashier') {
            return response()->json([
                'status' => 'UNAUTHORIZED',
                'message' => 'USER NOT AUTHORIZED'
            ], 401);
        }

        $query = $req->input('query');

        // Perform product search by matching the query against:
        // - full-text search on product name (using BOOLEAN MODE for flexible matching)
        // - barcode exact match
        // - selling price exact match
        // Also eager loads the related category to avoid N+1 queries.
        $product = Product::with('category')
            ->where(function ($q) use ($query) {
                $q->whereRaw("MATCH(name) AGAINST(? IN BOOLEAN MODE)", ["+{$query}"])
                    ->orWhere('barcode', $query)
                    ->orWhere('selling_price', $query);
            })
            ->get();

        if ($product->isEmpty()) {
            // Return 'Not Found' if no products matched
            return response()->json([
                'status' => 'Notfound',
                'message' => 'Product Not Found',
                'product' => []
            ], 200);
        }
        // Log Activity - if Porduct(s) found 
        $activitySaved = ActivityLog::create([
            'user_id' => $user->id,
            'role' => $user->role,
            'action_type' => 'Searched',
            'description' => $user->role . " Searched for Product/Products",
            'related_id' => null,
            'related_type' => 'Product',
            'ip_address' => request()->ip()
        ]);


        // Return successful response with product(s)
        return response()->json([
            'status' => 'success',
            'Activity' => $activitySaved ? "Saved" : "Not Saved",
            'product' => $product
        ], 200);
    }

    // update product
    public function updateProd(Request $req)
    {
        // Ensure the user is authorized (only Admin can access this method)
        $auth = Auth::user();
        if ($auth->role !== "admin") {
            return response()->json([
                'status' => 'UNAUTHORIZED',
                'message' => 'USER NOT AUTHORIZED'
            ], 401);
        }
        // Validate request data
        $validated = Validator::make($req->all(), [
            'prodid' => 'required',
            'name' => 'required|max:256|string',
            'supplier' => 'required|max:100|string',
            'stock' => 'required',
            'barcode' => 'required|max:5|min:5',
            'purchase' => 'required',
            'category' => 'required'
        ]);

        if ($validated->fails()) {
            return response()->json([
                'status' => 'NOT_VALID',
                'message' => 'Provided Values are not Valid',
                'errors' => $validated->errors()
            ], 400);
        }


        // Find product to update
        $prod_to_update = Product::find($req->prodid);

        if (!$prod_to_update) {
            return response()->json([
                'status' => 'notfound',
                'message' => 'Product not found by ID #' . $req->prodid,
            ], 404);
        }

        // Get category tax rate for price calculation
        $product_tax = Category::select('tax_rate')->where('id', $req->category)->first();
        if (!$product_tax) {
            return response()->json([
                'status' => 'INVALID_CATEGORY',
                'message' => 'Category does not exist',
            ], 400);
        }

        // Calculate new selling price using purchase price + 10% profit + category tax
        $purchase_price = $req->purchase;
        $profit_margin = 10; // in %
        $base_price = $purchase_price + ($purchase_price * $profit_margin / 100);
        $selling_price = $base_price + ($base_price * $product_tax['tax_rate'] / 100);

        //  Update product fields - Fill the product with new values 
        $prod_to_update->fill([
            'name' => $req->name,
            'supplier_name' => $req->supplier,
            'barcode' => $req->barcode,
            'quantity' => $req->stock,
            'purchase_price' => $purchase_price,
            'selling_price' => ceil($selling_price),
            'category_id' => $req->category
        ]);


        // Track only the fields that were changed
        $dirtyFields = $prod_to_update->getDirty();
        $changes = [];

        foreach ($dirtyFields as $field => $newValue) {
            $oldValue = $prod_to_update->getOriginal($field);
            $prettyField = ucfirst(str_replace('_', ' ', $field));
            $changes[] = "$prettyField: $oldValue → $newValue";
        }

        // Save updated product
        $prod_to_update->save();

        // Build the activity log description based on what changed
        $description = $auth->role . " updated Product #{$req->prodid}";
        $description .= count($changes) > 0
            ? " — Changes: " . implode(', ', $changes)
            : " — No field changes detected";

        // Log the activity
        ActivityLog::create([
            'user_id' => $auth->id,
            'role' => $auth->role,
            'action_type' => 'Updated',
            'description' => $description,
            'related_id' => $req->prodid,
            'related_type' => 'Product',
            'ip_address' => request()->ip()
        ]);
        // Return Success response with updated product
        return response()->json([
            'status' => 'success',
            'message' => 'Product Updated Successfully',
            'Activity' => "Logged",
            'data' => $prod_to_update,
        ], 200);
    }


    //delete product
    public function deleteProduct(Request $req)
    {
        // Ensure the user is authorized (only Admin can access this method)
        $user = Auth::user();
        if ($user->role !== "admin" && $user->role !== 'cashier') {
            return response()->json([
                'status' => 'UNAUTHORIZED',
                'message' => 'USER NOT AUTHORIZED'
            ], 401);
        }

        // Validate request: product ID must be provided
        $validated = validator::make($req->all(), [
            'id' => 'required'
        ]);

        if ($validated->fails()) {
            return response()->json([
                'status' => 'invalid',
                'message' => 'Please Provide a Valid Id'
            ], 400);
        }

        //find product to delete
        $prod_to_delete = Product::find($req->id);

        // delete if product found
        if ($prod_to_delete) {
            $deleted = $prod_to_delete->delete();
        } else {
            return response()->json([
                'status' => 'notfound',
                'message' => 'Product Does Not Exist With ID ' . $req->id
            ], 404);
        }

        if ($deleted) {
            // Log Activity - If deleted
            $activitySaved = ActivityLog::create([
                'user_id' => Auth::user()->id,
                'role' => Auth::user()->role,
                'action_type' => 'Deleted',
                'description' => Auth::user()->role . " Deleted Product #" . $req->id,
                'related_id' => $req->id,
                'related_type' => 'Product',
                'ip_address' => request()->ip()
            ]);

            return response()->json([
                'status' => 'success',
                'Activity' => $activitySaved ? "Saved" : "Not Saved",
                'message' => 'Product Deleted Successfully'
            ], 200);
        } else {
            // If delete failed for any reason
            return response()->json([
                'status' => 'failure',
                'message' => 'Failed to Delete Product with ID ' . $req->id
            ], 500);
        }
    }
}
