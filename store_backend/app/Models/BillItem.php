<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BillItem extends Model
{
    protected $guarded = [];
    public $timestamps = false;

    public function bill()
    {
        return $this->belongsTo(Bill::class, 'bill_id');
    }
}
