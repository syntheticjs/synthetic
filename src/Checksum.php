<?php

namespace Synthetic;

use Exception;

class Checksum {
    static function verify($snapshot) {
        $checksum = $snapshot['checksum'];

        unset($snapshot['checksum']);

        if ($checksum !== self::generate($snapshot)) {
            // "Stop hacking me!"
            throw new Exception;
        }
    }

    static function generate($snapshot) {
        $hashKey = app('encrypter')->getKey();

        return hash_hmac('sha256', json_encode($snapshot), $hashKey);
    }
}
