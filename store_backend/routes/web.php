<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\BillController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\Bill_ItemController;

Route::get('/', function () {
    return view('welcome');
});

//user
Route::resource('user', UserController::class);

// product
Route::controller(ProductController::class)->group(function () {
    Route::get('product/create', 'addProduct')->name('addproduct');
    Route::get('product', 'showProducts')->name('showproduct');
});


// // bills
Route::resource('bill', BillController::class);

// //customer
Route::controller(CustomerController::class)->group(function () {
    Route::get('customer/create', 'createCustomer')->name('createcustomer');
});


// // bill items
Route::controller(Bill_ItemController::class)->group(function () {
    Route::get('billitem', 'addBillItems')->name('billitems');
});
