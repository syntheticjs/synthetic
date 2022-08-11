<?php

namespace Synthetic\Synthesizers;

use Exception;
use Synthetic\SyntheticManager;
use Synthetic\SyntheticValidation;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Contracts\Database\ModelIdentifier;
use Illuminate\Queue\SerializesAndRestoresModelIdentifiers;

class ModelSynth extends Synth {
    use SerializesAndRestoresModelIdentifiers, SyntheticValidation;

    public static $key = 'mdl';

    static function match($target) {
        return $target instanceof Model;
    }

    function dehydrate($target, $addMeta, $addEffect, $initial) {
        $value = $this->getSerializedPropertyValue($target);

        $attributes = $target->getAttributes();

        foreach ($value->relations as $relation) {
            $attributes[$relation] = $target->getRelationValue($relation);
        }

        $addMeta('connection', $value->connection);
        $addMeta('relations', $value->relations);
        $addMeta('class', $value->class);
        $addMeta('key', $value->id);

        return $attributes;
    }

    function hydrate($value, $meta) {
        if ($meta['key'] === null) {
            return new $meta['class']($value);
        }

        $identifier = new ModelIdentifier(
            $meta['class'],
            $meta['key'],
            $meta['relations'],
            $meta['connection'],
        );

        return $this->getRestoredPropertyValue($identifier);
    }

    function &get($target, $key) {
        $target->getAttribute($key);
    }

    function set(&$target, $key, $value) {
        $target->setAttribute($key, $value);
    }

    function callables($target)
    {
        return ['save'];
    }

    function call($target, $method, $params, $addEffect) {
        if ($method === 'save') {
            $models = $this->validate(
                $target->getAttributes(),
                $target->rules(),
            );

            return $target->save();
        }

        throw new Exception;
    }
}
