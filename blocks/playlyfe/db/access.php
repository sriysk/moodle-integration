<?php
$capabilities = array(
  'block/playlyfe:addinstance' => array(
      'riskbitmask' => RISK_SPAM | RISK_XSS,
      'captype' => 'write',
      'contextlevel' => CONTEXT_BLOCK,
      'archetypes' => array(
          'editingteacher' => CAP_ALLOW,
          'coursecreator'  => CAP_ALLOW,
          'manager' => CAP_ALLOW,
          'admin' => CAP_ALLOW
      ),
      'clonepermissionsfrom' => 'moodle/site:manageblocks'
  ),
  'block/playlyfe:myaddinstance' => array(
      'captype' => 'write',
      'contextlevel' => CONTEXT_SYSTEM,
      'archetypes' => array(
          'user' => CAP_ALLOW
      ),
      'clonepermissionsfrom' => 'moodle/my:manageblocks'
  ),
);
