<?php

namespace Synthetic\Synthesizers;

use Synthetic\Synthetic;
use ReflectionClass;
use ReflectionProperty;

class TrapSynth {
    public static $key = 'trap';

    static function match($target) {
        return true;
    }

    function callable($target)
    {
        return $this->getPublicMethodNamesDefinedBySubClass($target);
    }

    function dehydrate($target) {
        $this->ensureSynthetic($target);

        $properties = [];

        $reflectedProperties = (new ReflectionClass($target))->getProperties(ReflectionProperty::IS_PUBLIC);

        foreach ($reflectedProperties as $property) {
            $properties[$property->getName()] = $property->getValue($target);
        }

        return [$properties, [
            'synth' => 'obj', 'class' => get_class($target),
        ]];
    }

    function hydrate($value, $meta) {
        $class = $meta['class'];
        $target = new $class;

        $properties = $value;

        foreach ($properties as $key => $value) {
            $target->$key = $value;
        }

        return $target;
    }

    function get($target, $key) {
        return $target->{$key};
    }

    function set($target, $key, $value, $current, $rawValue, $meta) {
        $target->$key = $value;
    }

    function call($target, $method, $params) {
        return $target->{$method}(...$params);
    }

    function ensureSynthetic($target) {
        abort_unless(
            in_array(Synthetic::class, class_uses($target)),
            419,
            'You can only synthesize a class that implements the Synthetic interface.'
        );
    }

    function getPublicMethodNamesDefinedBySubClass($target)
    {
        $methods = array_filter((new \ReflectionObject($target))->getMethods(), function ($method) use ($target) {
            $isInSyntheticTrait = str($method->getFilename())->afterLast('/')->exactly('Synthetic.php');

            return $method->isPublic()
                && ! $method->isStatic()
                && ! $isInSyntheticTrait;
        });

        return array_map(function ($method) {
            return $method->getName();
        }, $methods);
    }
}
