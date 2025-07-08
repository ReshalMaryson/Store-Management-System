<?php

use App\Http\Controllers\BillController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\Bill_ItemController;

use App\Models\Bill;
use illuminate\Support\Facades\Auth;


// public routes
Route::post('user/login', [UserController::class, 'login'])->name('user.login'); // change

//protected routes
Route::middleware(['auth:sanctum'])->group(function () {
    // user API routes
    Route::controller(UserController::class)->group(function () {
        Route::post('user/logout', 'logout')->name('user.logout');
        Route::post('user/create', 'store');
        Route::get('/users', 'index');
        Route::post('/users/query', 'getUser');
        Route::post('/user/delete', 'destroy');
        Route::post('/user/update', 'update');
    });

    // product API routes
    Route::controller(ProductController::class)->group(function () {
        Route::post('product/add', 'addproduct')->name('product.add');
        Route::get('/products', 'allProducts')->name('products.all');
        Route::post('/products/query', 'getProduct')->name('products.single');
        Route::post('/product/delete', 'deleteProduct')->name('product.delete');
        Route::post('/product/update', 'updateProd');
    });

    // // customer API routes
    // Route::controller(CustomerController::class)->group(function () {
    //     Route::post('customer/add', 'createCustomer')->name('customer.add');
    // });

    // Bill API routes
    Route::controller(BillController::class)->group(function () {
        Route::get('/bills', 'index');
        Route::get('/bill/analytics/topcashiers', 'TopCashier');
        Route::get('/bill/analytics/topsales', 'TopSales');
        Route::post('/bill/analytics/storeperformance', 'StoreMeterics');
        Route::post('/bill/create', 'store');
        Route::post('/bills/admin/search', 'AdminSearchBill');
        Route::post('/bills/cashier/search', 'CashierSearchBill');
    });

    // Bill items API routes
    Route::controller(Bill_ItemController::class)->group(function () {
        Route::get('/billitems/analytics/topproducts', 'TopProducts');
    });

    //Activity API Route
    Route::controller(ActivityLogController::class)->group(function () {
        route::post('analytics/activities', 'getActivities');
    });
});


// check logged in user -> for testing purpose.
Route::middleware('auth:sanctum')->get('/test-auth', function () {
    return response()->json([
        'status' => 'authenticated',
        'user' => Auth::user(),
    ]);
});
