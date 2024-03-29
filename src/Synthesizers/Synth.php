<?php

namespace Synthetic\Synthesizers;

abstract class Synth {
    public static function getKey() {
        throw_unless(
            property_exists(static::class, 'key'),
            new \Exception('You need to define static $key property on: '.static::class)
        );

        return static::$key;
    }

    abstract static function match($target);

    function methods($target)
    {
        return [];
    }

    function __call($method, $params) {
        if ($method === 'dehydrate') {
            throw new \Exception('You must define a "dehydrate" method');
        }

        if ($method === 'hydrate') {
            throw new \Exception('You must define a "hydrate" method');
        }

        if ($method === 'get') {
            throw new \Exception('This synth doesn\'t support getting properties: '.get_class($this));
        }

        if ($method === 'set') {
            throw new \Exception('This synth doesn\'t support setting properties: '.get_class($this));
        }

        if ($method === 'unset') {
            throw new \Exception('This synth doesn\'t support unsetting properties: '.get_class($this));
        }

        if ($method === 'call') {
            throw new \Exception('This synth doesn\'t support calling methods: '.get_class($this));
        }
    }
}
