<?php

namespace App;

use Synthetic\SyntheticManager;

trait Synthetic {
    public function validate($rules = null, $messages = [], $attributes = []) {
        return (new SyntheticManager)->validate($this, $rules, $messages, $attributes);
    }
}
