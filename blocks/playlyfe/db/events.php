<?php

$observers = array(
    array(
        'eventname' => '\core\event\user_created',
        'callback' => 'block_playlyfe_observer::create_player',
    ),
    array(
       'eventname'   => '\core\event\user_loggedin',
       'callback'    => 'block_playlyfe_observer::log_in',
   ),
   array(
       'eventname'   => '\core\event\user_loggedout',
       'callback'    => 'block_playlyfe_observer::log_out',
   ),
   array(
       'eventname'   => 'core\event\course_completed',
       'callback'    => 'block_playlyfe_observer::course_completed',
   )
);
