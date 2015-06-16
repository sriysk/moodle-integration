<?php

class block_playlyfe_edit_form extends block_edit_form {

  protected function specific_definition($mform) {
    global $USER;
    // This is to prevent students from changing config
    if(!has_capability('moodle/site:config', context_user::instance($USER->id))) {
      return;
    }
    $types = array('0' => 'Points', '1' => 'Badges', '2' => 'Levels', '3' => 'Events', '4' => 'Profile', '5' => 'Leaderboard');
    $mform->addElement('select', 'config_type', 'Type', $types);
    $mform->setDefault('config_type', 0);

    $events = array('0' => 'LoggedIn', '1' => 'LoggedOut', '2' => 'CourseCompleted', '3' => 'Forum Posted', '4' => 'Forum Discussion Created');
    $mform->addElement('select', 'config_event', 'Event', $events);
    $mform->setDefault('config_event', 0);

    //TODO add recent activity and feedback
  }
}
