<?php

namespace Synthetic\Features;

use ReflectionClass;
use ReflectionMethod;

class SupportJsMethods
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

        app('synthetic')->on('dehydrate', function ($target, $addMeta, $addEffect, $initial) {
            $methods = $this->getEagerMethods($target);

            if (! $methods) return;

            if ($initial) {
                $addEffect('js', $methods);
            }

            return function (&$properties) use ($methods) {
                foreach ($methods as $name => $expression) {
                    unset($properties[$name]);
                }

                return $properties;
            };
        });
    }

    function getEagerMethods($target)
    {
        $methods = (new ReflectionClass($target))->getMethods(ReflectionMethod::IS_PUBLIC);

        return collect($methods)
            ->filter(function ($subject) {
                return $subject->getDocComment() && str($subject->getDocComment())->contains('@eager');
            })
            ->map(function ($subject) use ($target) {
                return $subject->getName();
            })
            ->toArray();
    }
}
