<?php

namespace Synthetic\Synthesizers;

use DateTime;
use Carbon\Carbon;

class CarbonSynth extends Synth {
    public $types = [
        'native' => \DateTime::class,
        'nativeImmutable' => \DateTimeImmutable::class,
        'carbon' => \Illuminate\Support\Carbon::class,
        'carbonImmutable' => \Carbon\CarbonImmutable::class,
        'illuminate' => \Carbon\Carbon::class,
    ];

    public static $key = 'cbn';

    static function match($target) {
        return $target instanceof Carbon;
    }

    function dehydrate($target, $addMeta, $addEffect, $annotations, $annotationsFromParent, $initial) {
        $addMeta('type', array_search(get_class($target), $this->types));

        $format = \DateTimeInterface::ISO8601;

        if (isset($annotationsFromParent['format']) && isset($annotationsFromParent['format'][0])) {
            $format = $annotationsFromParent['format'][0];
            $addMeta('format', $format);
        }

        return ['year' => '2012', 'month' => '08', 'day' => '23'];

        return $target->format($format);
    }

    function hydrate($value, $meta) {
        $format = $meta['format'] ?? \DateTimeInterface::ISO8601;

        $date = new DateTime;

        $date->setDate($value['year'], $value['month'], $value['day']);

        // $date = DateTime::createFromFormat($format, $value);

        return new $this->types[$meta['type']]($date);
    }

    function set(DateTime $target, $key, $value) {
        $target->setDate($value, $target->format('m'), $target->format('d'));
    }
}
