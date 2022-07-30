<?php

namespace Synthetic\Synthesizers;

use Illuminate\Support\Collection;

class CollectionSynth extends ArraySynth {
    public static $key = 'clctn';

    static function match($target) {
        return $target instanceof Collection;
    }

    function dehydrate($target) {
        return [
            $target->all(),
            ['class' => get_class($target)]
        ];
    }

    function hydrate($value, $meta) {
        return new $meta['class']($value);
    }
}
