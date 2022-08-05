<?php

namespace Synthetic\Features;

use ReflectionClass;
use ReflectionMethod;

class SupportJsMethods
{
    public function __invoke()
    {
        app('synthetic')->on('dehydrate', function ($target, $addMeta, $addEffect) {
            $methods = $this->getJsMethods($target);

            if (! $methods) return;

            $addEffect('js', $methods);

            return function (&$properties) use ($methods) {
                foreach ($methods as $name => $expression) {
                    unset($properties[$name]);
                }

                return $properties;
            };
        });
    }

    function getJsMethods($target)
    {
        $methods = (new ReflectionClass($target))->getMethods(ReflectionMethod::IS_PUBLIC);
        $properties = (new ReflectionClass($target))->getProperties(ReflectionMethod::IS_PUBLIC);

        return collect($methods)->concat($properties)
            ->map(function ($method) use ($target) {
                if ($method->getDocComment() && str($method->getDocComment())->contains('@js')) {
                    $func = $target->{$method->getName()}();

                    return [$method->getName(), $func];
                }

                return false;
            })
            ->filter()
            ->mapWithKeys(function ($method) {
                return [$method[0] => $method[1]];
            })
            ->toArray();
    }
}
