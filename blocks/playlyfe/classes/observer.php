<?php

class block_playlyfe_observer {

  public static function create_player(\core\event\user_created $event) {
    $pl = block_playlyfe_sdk::get_pl();
    $user = $event->get_record_snapshot('user', $event->objectid);
    $pl->post('/admin/players', array(), array('id' => $user->id, 'alias' => $user->firstname.' '.$user->lastname));
  }

  public static function log_in(\core\event\user_loggedin $event) {
    self::execute_rule('log_in', $event->userid);
  }

  public static function log_out(\core\event\user_loggedout $event) {
    self::execute_rule('log_out', $event->userid);
  }

  public static function course_completed(\core\event\course_completed $event) {
    self::execute_rule('course_completed_'.$event->courseid, $event->relateduserid);
  }

  public static function forum_post_created(mod_forum\event\post_created $event) {
    self::execute_rule('forum_post_created_'.$event->courseid, $event->userid);
  }

  public static function forum_discussion_created(mod_forum\event\discussion_created $event) {
    self::execute_rule('forum_discussion_created_'.$event->courseid, $event->userid);
  }

  public static function quiz_attempt_submitted(mod_quiz\event\attempt_submitted $event) {
    self::execute_rule('quiz_attempt_submitted_'.$event->contextinstanceid, $event->relateduserid);
  }

  public static function execute_rule($rule_id, $user_id, $variables = array()) {
    $pl = block_playlyfe_sdk::get_pl();
    try {
      $pl->post('/admin/rules/'.$rule_id, array(), array(
        'data' => array(
          array(
            'player_ids' => array(''.$user_id ),
            'variables' => (object)$variables,
          )
        )
      ));
    }
    catch(Exception $e) {
      if($e->name != 'rule_not_found') {
        throw $e;
      }
    }
  }
}
