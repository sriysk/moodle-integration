<?php

$observers = array(
    array(
        'eventname' => '\core\event\user_created',
        'callback' => 'block_playlyfe_observer::create_player',
    ),
);
