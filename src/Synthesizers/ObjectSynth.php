<?php

namespace Synthetic\Synthesizers;

use ReflectionClass;
use ReflectionMethod;
use ReflectionProperty;
use Synthetic\Component;

class ObjectSynth extends Synth {
    public static $key = 'obj';

    static function match($target) {
        return is_object($target);
    }

    function dehydrate($target, $addMeta, $addEffect, $initial) {
        $finish = app('synthetic')->trigger('dehydrate', $target, $addMeta, $addEffect, $initial);

        $this->ensureSynthetic($target);

        $properties = [];

        $reflectedProperties = (new ReflectionClass($target))->getProperties(ReflectionProperty::IS_PUBLIC);

        [$computedProperties, $deps] = $this->getComputedProperties($target);

        foreach ($computedProperties as $key => $value) {
            $properties[$key] = $value;
        }

        foreach ($reflectedProperties as $property) {
            $properties[$property->getName()] = $property->getValue($target);
        }

        $addMeta('class', $this->getClass($target));
        $addMeta('computed', $deps);

        return $finish($properties);
    }

    public function getClass($target)
    {
        return get_class($target);
    }

    function hydrate($value, $meta) {
        $class = $meta['class'];
        $deps = $meta['computed'];
        $target = new $class;

        $properties = $value;

        foreach ($properties as $key => $value) {
            if ($this->isComputedProperty($target, $key)) {
                $this->storeComputedProperty($target, $key, $value, $deps[$key]);
                continue;
            }

            $target->$key = $value;
        }

        $this->hashComputedPropertyDeps($target, $deps);

        return $target;
    }

    function &get($target, $key) {
        return $target->{$key};
    }

    function set(&$target, $key, $value) {
        $target->$key = $value;
    }

    function callables($target)
    {
        return $this->getPublicMethodNamesDefinedBySubClass($target);
    }

    function call($target, $method, $params, $addEffect) {
        $finish = app('synthetic')->trigger('call', $target, $method, $params, $addEffect);

        $result = $target->{$method}(...$params);

        return $finish($result);
    }

    function ensureSynthetic($target) {
        abort_unless(
            $target instanceof Component,
            // in_array(Synthesizable::class, class_uses($target)),
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

    function isComputedProperty($target, $key)
    {
        return !! collect($this->getComputedMethods($target))
            ->first(function ($i) use ($key) {
                [$method, $property] = $i;

                return $property === $key;
            });
    }

    function storeComputedProperty($target, $key, $value, $deps)
    {
        if (! isset($target->__computeds)) $target->__computeds = [];

        $target->__computeds[$key] = ['value' => $value, 'deps' => $deps];
    }

    function hashComputedPropertyDeps($target, $deps)
    {
        if (! isset($target->__computedHashes)) $target->__computedHashes = [];

        $target->__computedHashes = collect($deps)
            ->flatten()
            ->unique()
            ->mapWithKeys(function ($property) use ($target) {
                return [$property => md5(json_encode($target->$property))];
            })
            ->toArray();
    }

    function computedPropertyDepHasChanged($target, $key) {
        if (! isset($target->__computedHashes)) return true;

        if (md5(json_encode($target->$key)) !== $target->__computedHashes[$key] ?? '') return true;

        return false;
    }

    function getComputedProperties($target) {
        $computedDeps = [];
        $properties = [];

        foreach ($this->getComputedMethods($target) as [$methodName, $propertyName]) {
            if (isset($target->__computeds[$propertyName])) {
                $deps = $target->__computeds[$propertyName]['deps'];

                $rehash = false;
                foreach ($deps as $dep) {
                    if ($this->computedPropertyDepHasChanged($target, $dep)) {
                        $rehash = true;
                        break;
                    }
                }

                if (! $rehash) {
                    $computedDeps[$propertyName] = $target->__computeds[$propertyName]['deps'];
                    $properties[$propertyName] = $target->__computeds[$propertyName]['value'];

                    continue;
                }
            }

            $deps = [];
            $result = $this->trackDeps($target, $methodName, $deps);

            $computedDeps[$propertyName] = $deps;
            $properties[$propertyName] = $result;
        }

        return [$properties, $computedDeps];
    }

    function getComputedMethods($target)
    {
        $methods = (new ReflectionClass($target))->getMethods(ReflectionMethod::IS_PUBLIC);

        return collect($methods)
            ->map(function ($method) {
                if ($method->getDocComment() && str($method->getDocComment())->contains('@computed')) {
                    return [$method->getName(), $method->getName()];
                }

                if (str($method->getName())->startsWith('computed')) {
                    return [$method->getName(), str($method->getName())->after('computed')->camel()->__toString()];
                }

                return false;
            })
            ->filter()
            ->toArray();
    }

    function trackDeps($original, $methodName, &$deps)
    {
        $class = get_class($original);

        $trap = eval(<<<EOT
        return new class extends $class {
            public \$__deps = [];
            public \$__original = [];

            public function __takeover(\$original) {
                \$this->__deps = [];
                \$this->__original = \$original;
                \$properties = (new ReflectionClass(\$this))->getProperties(ReflectionProperty::IS_PUBLIC);

                foreach (\$properties as \$property) {
                    if (in_array(\$property->getName(), ['__deps', '__original'])) continue;
                    unset(\$this->{\$property->getName()});
                }
            }

            public function __get(\$prop) {
                \$this->__deps[] = \$prop;
                return \$this->__original->{\$prop};
            }

            public function __set(\$prop, \$value) {
                \$this->__deps[] = \$prop;
                \$this->__original->{\$prop} = \$value;
            }
        };
        EOT);

        $methods = (new ReflectionClass($original))->getMethods(ReflectionProperty::IS_PUBLIC);
        foreach ($methods as $m) {
            if ($m->getName() === $methodName) {
                $method = $m->getClosure($original);
            }
        }

        $trappedMethod = $method->bindTo($trap);

        $trap->__takeover($original);

        $result = $trappedMethod();

        foreach ($trap->__deps as $dep) $deps[] = $dep;

        return $result;
    }
}
