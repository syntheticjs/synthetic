<?php

namespace Synthetic\Features;

use Illuminate\Http\RedirectResponse;

class SupportRedirects
{
    public function __invoke()
    {
        app('synthetic')->on('call', function ($target, $method, $params, $addEffect) {
            return function ($result) use ($method, $params, $addEffect) {
                if (! $result instanceof RedirectResponse) return $result;

                $addEffect('redirect', $result->getTargetUrl());

                return $result;
            };
        });
    }
}
