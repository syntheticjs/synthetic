<?php

namespace Synthetic;

use Closure;
use Synthetic\LifecycleHooks;
use Synthetic\Synthesizers\ArraySynth;
use Synthetic\Synthesizers\ModelSynth;
use Synthetic\Synthesizers\ObjectSynth;
use Synthetic\Synthesizers\CollectionSynth;
use Synthetic\Synthesizers\StringableSynth;
use Synthetic\Synthesizers\ModelCollectionSynth;
use Illuminate\Validation\ValidationException;

class SyntheticManager
{
    use SyntheticValidation, SyntheticTesting;

    protected $synthesizers = [
        // AnonymousSynth::class,
        // ModelCollectionSynth::class,
        CollectionSynth::class,
        ModelSynth::class,
        StringableSynth::class,
        ObjectSynth::class,
        ArraySynth::class,
    ];

    public function registerSynth($synthClass)
    {
        array_unshift($this->synthesizers, $synthClass);
    }

    protected $metasByPath = [];

    function new($name)
    {
        return synthesize(new $name);
    }

    function synthesize($target)
    {
        return $this->toSnapshot($target);
    }

    function update($snapshot, $diff, $calls)
    {
        $effects = [];

        $root = $this->fromSnapshot($snapshot, $diff);

        $this->makeCalls($root, $calls, $effects);

        $payload = $this->toSnapshot($root, $effects);

        return [
            'target' => $root,
            'snapshot' => $payload['snapshot'],
            'effects' => $effects,
        ];
    }

    function toSnapshot($root, &$effects = []) {
        $data = $this->dehydrate($root, $effects);

        $this->metasByPath = [];

        $snapshot = ['data' => $data];

        $snapshot['checksum'] = Checksum::generate($snapshot);

        return ['snapshot' => $snapshot, 'effects' => $effects];
    }

    function fromSnapshot($snapshot, $diff) {
        Checksum::verify($snapshot);

        $root = $this->hydrate($snapshot['data']);

        $this->applyDiff($root, $diff);

        return $root;
    }

    function dehydrate($target, &$effects, $path = '') {
        $synth = $this->synth($target);

        if ($synth) {
            $methods[$path] = $synth->callables($target);

            $addEffect = function ($key, $value) use (&$effects, $path) {
                if (! isset($effects[$path])) $effects[$path] = [];
                $effects[$path][$key] = $value;
            };

            $meta = [];
            $addMeta = function ($key, $value) use (&$meta) {
                $meta[$key] = $value;
            };

            $value = $synth->dehydrate($target, $addMeta, $addEffect);

            $meta['s'] = $synth::getKey();

            if (is_array($value)) {
                foreach ($value as $key => $child) {
                    $value[$key] = $this->dehydrate($child, $effects, $path === '' ? $key : $path.'.'.$key);
                }
            }

            return [$value, $meta];
        } else {
            if (is_array($target)) {
                foreach ($target as $key => $child) {
                    $target[$key] = $this->dehydrate($child, $effects, $path === '' ? $key : $path.'.'.$key);
                }
            }
        }

        return $target;
    }

    function hydrate($data, $path = null) {
        if (is_array($data)) {
            [$rawValue, $meta] = $data;
            $synthKey = $meta['s'];
            $synth = $this->synth($synthKey);
            $this->metasByPath[$path] = $meta;

            if (is_array($rawValue)) {
                foreach ($rawValue as $key => $i) {
                    $rawValue[$key] = $this->hydrate($i, $path ? $path.'.'.$key : $key);
                }
            }

            return $synth->hydrate($rawValue, $meta);
        }

        return $data;
    }

    function applyDiff($root, $diff) {
        foreach ($diff as $path => $newValue) {
            $rawValue = $newValue;

            if (isset($this->metasByPath[$path])) {
                $newValue = [$newValue, $this->metasByPath[$path]];
            }

            [$parentKey, $key] = $this->getParentAndChildKey($path);

            $target =& $this->dataGet($root, $parentKey);

            LifecycleHooks::updating($root, $path, $rawValue);
            LifecycleHooks::updatingSelf($target, $key, $rawValue);

            $value = $this->hydrate($newValue, $path);

            if ($value === '__rm__') {
                $this->synth($target)->unset($target, $key);
            } else {
                $this->synth($target)->set($target, $key, $value);
            }

            LifecycleHooks::updated($root, $path, $value);
            LifecycleHooks::updatedSelf($target, $key, $value);
        }
    }

    protected function makeCalls($root, $calls, &$effects) {
        $returns = [];

        foreach ($calls as $call) {
            $method = $call['method'];
            $params = $call['params'];
            $path = $call['path'];

            $target = $this->dataGet($root, $path);

            $addEffect = function ($key, $value) use (&$effects, $path) {
                if (! isset($effects[$path])) $effects[$path] = [];

                $effects[$path][$key] = $value;
            };

            $return = $this->synth($target)->call($target, $method, $params, $addEffect);

            $return !== null && $addEffect('return', $return);
        }

        return $returns;
    }

    protected function &dataGet(&$target, $key) {
        if (str($key)->exactly('')) return $target;

        if (! str($key)->contains('.')) {
            $thing =& $this->synth($target)->get($target, $key);

            return $thing;
        }

        $parentKey = str($key)->before('.')->__toString();
        $childKey = str($key)->after('.')->__toString();

        $parent =& $this->synth($target)->get($target, $parentKey);

        return $this->dataGet($parent, $childKey);
    }

    function synth($keyOrTarget) {
        return is_string($keyOrTarget)
            ? $this->getSynthesizerByKey($keyOrTarget)
            : $this->getSynthesizerByTarget($keyOrTarget);
    }

    function getSynthesizerByKey($key) {
        foreach ($this->synthesizers as $synth) {
            if ($synth::getKey() === $key) {
                return new $synth;
            }
        }
    }

    function getSynthesizerByTarget($target) {
        foreach ($this->synthesizers as $synth) {
            if ($synth::match($target)) {
                return new $synth;
            }
        }
    }

    function getParentAndChildKey($path) {
        if (! str($path)->contains('.')) {
            return ['', $path];
        }

        $parentKey = str($path)->beforeLast('.')->__toString();
        $childKey = str($path)->afterLast('.')->__toString();

        return [$parentKey, $childKey];
    }

    protected $listeners = [];

    function trigger($name, ...$params) {
        $finishers = [];

        foreach ($this->listeners[$name] ?? [] as $callback) {
            $result = $callback(...$params);

            if ($result instanceof Closure) {
                $finishers[] = $result;
            }
        }

        return function (&$forward) use (&$finishers) {
            $latest = $forward;
            foreach ($finishers as $finisher) {
                $latest = $finisher($latest);
            }
            return $latest;
        };
    }

    function on($name, $callback) {
        if (! isset($this->listeners[$name])) $this->listeners[$name] = [];

        $this->listeners[$name][] = $callback;
    }
}
