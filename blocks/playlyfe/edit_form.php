<?php

class block_playlyfe_edit_form extends block_edit_form {

  protected function specific_definition($mform) {
    $types = array('0' => 'Points', '1' => 'Badges', '2' => 'Levels', '3' => 'Events', '4' => 'Profile');
    $mform->addElement('select', 'config_type', 'Type', $types);
    $mform->setDefault('config_type', 0);

    $events = array('0' => 'LoggedIn', '1' => 'LoggedOut', '2' => 'CourseCompleted');
    $mform->addElement('select', 'config_event', 'Event', $events);
    $mform->setDefault('config_event', 0);
  }
}
