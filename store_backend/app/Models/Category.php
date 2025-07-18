<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class Category extends Model
{
    public function product()
    {
        return $this->HasMany(Product::class, 'id');
    }
}
