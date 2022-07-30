<?php

namespace Synthetic;

use Synthetic\SyntheticManager;
use Illuminate\Support\ServiceProvider;

class SyntheticServiceProvider extends ServiceProvider
{
    public function register()
    {
        $this->app->singleton(SyntheticManager::class);
        $this->app->alias(SyntheticManager::class, 'synthetic');
    }

    public function boot()
    {
        //
    }
}
