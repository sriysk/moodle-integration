<?php

class block_playlyfe_observer {

  public static function create_player(\core\event\user_created $event) {
    $pl = block_playlyfe_sdk::get_pl();
    $user = $event->get_record_snapshot('user', $event->objectid);
    $pl->post('/admin/players', array(), array('id' => $user->id, 'alias' => $user->firstname.' '.$user->lastname));
  }

  public static function log_in(\core\event\user_created $event) {
  }

  public static function log_out(\core\event\user_created $event) {
  }
}
