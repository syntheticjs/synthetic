<?php

use Illuminate\Support\Str;

if (! function_exists('synthetic')) {
    function synthetic($subject) {
        return app('synthetic')->synthesize($subject);
    }
}

if (! function_exists('str')) {
    function str($subject) {
        return Str::of($subject);
    }
}
