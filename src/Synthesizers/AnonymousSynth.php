<?php

namespace Synthetic\Synthesizers;

use Synthetic\AnonymousSynthetic;
use Synthetic\Synthetic;
use Laravel\SerializableClosure\Contracts\Serializable;
use ReflectionClass;
use ReflectionObject;
use ReflectionProperty;
use Laravel\SerializableClosure\SerializableClosure;

class AnonymousSynth {
    public static $key = 'anms';

    static function match($target) {
        return $target instanceof AnonymousSynthetic;
    }

    function exposedMethods($target)
    {
        return array_keys($target->getMethods());
    }

    function dehydrate($target) {
        $properties = $target->getProperties();
        $methods = $target->getMethods();

        SerializableClosure::transformUseVariablesUsing(function ($uses) {
            // We need to wash out any "uses" variables that are properties as we don't
            // want them to be "dehydrated" because of the serialize() call.
            return array_flip(array_keys($uses));
        });

        return [$properties, [
            'synth' => 'anms',
            'methods' => array_map(function ($closure) use ($target) {
                // $closure->bindTo($target);
                $thing = new SerializableClosure($closure);
                // $thing->transformUseVariablesUsing(function ($hey) {
                //     dd($hey);
                // });
                return serialize($thing);
            }, $methods)
        ]];
    }

    function hydrate($value, $meta) {
        $target = new AnonymousSynthetic($value, []);

        $methods = collect($meta['methods'])->mapWithKeys(function ($serialized, $key) use ($target) {
            SerializableClosure::resolveUseVariablesUsing(function ($uses) use ($target) {
                $properties = &$target->properties;

                $result = [];

                foreach ($properties as $key => $value) {
                    $result[$key] = &$properties[$key];
                }

                return $result;
            });

            return [$key => unserialize($serialized)->getClosure()];
        })->all();

        $target->setMethods($methods);

        return $target;
    }

    function update($target, $newValue, $meta) {
        //
    }

    function callMethod($target, $method, $params) {
        return $target->$method(...$params);
    }
}
