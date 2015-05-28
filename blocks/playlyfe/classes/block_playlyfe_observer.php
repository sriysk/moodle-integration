<?php

class block_playlyfe_observer {

  public static function create_player(\core\event\user_created $event) {
    global $pl;
    $user_id = $event->id;
    $alias = $event->firstname.' '.$event->lastname;
    $pl->post('/admin/players', array(), array('id' => $user_id, 'alias' => $alias));
  }
}
