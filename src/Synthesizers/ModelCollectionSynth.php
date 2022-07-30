<?php

namespace Synthetic\Synthesizers;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Queue\SerializesAndRestoresModelIdentifiers;

class ModelCollectionSynth extends ArraySynth {
    use SerializesAndRestoresModelIdentifiers;

    public static $key = 'mdlcl';

    static function match($target) {
        return $target instanceof Collection;
    }

    function dehydrate($target) {
        // Unsure of the best thing to do here, so going to leave this incomplete for now.
        return [
            $target->all(),
            [
                'class' => $target->getQueueableClass(),
            ]
        ];
    }

    function hydrate($value, $meta) {
        //
    }
}
