<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $guarded = [];

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function getTaxRateAttribute()
    {
        return $this->category ? $this->category->tax_rate : null;
    }
}
