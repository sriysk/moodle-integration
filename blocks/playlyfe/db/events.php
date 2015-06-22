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
        'eventname'   => 'mod_forum\event\post_created',
        'callback'    => 'block_playlyfe_observer::forum_post_created',
   ),
   array(
        'eventname'   => 'mod_forum\event\discussion_created',
        'callback'    => 'block_playlyfe_observer::forum_discussion_created',
   ),
   array(
        'eventname'   => 'mod_quiz\event\attempt_submitted',
        'callback'    => 'block_playlyfe_observer::quiz_attempt_submitted',
   ),
);

