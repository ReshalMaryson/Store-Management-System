<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bill extends Model
{
    //
    protected $guarded = [];

    public function billItems()
    {
        return $this->hasMany(BillItem::class, 'bill_id');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    public function staff()
    {
        return $this->belongsTo(User::class, 'staff_id');
    }
}
