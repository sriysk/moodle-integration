<?php

class block_playlyfe_edit_form extends block_edit_form {

  protected function specific_definition($mform) {
    $mform->addElement('text', 'config_title', 'Title');
    $mform->setDefault('config_title', 'Playlyfe');
    $mform->setType('config_title', PARAM_RAW);

    $types = array('0' => 'Points', '1' => 'Badges', '2' => 'Levels');
    $mform->addElement('select', 'config_type', 'Type', $types);
    $mform->setDefault('config_type', 0);
  }
}
