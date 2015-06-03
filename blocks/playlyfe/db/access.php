<?php
$capabilities = array(
  'block/playlyfe:addinstance' => array(
      'riskbitmask' => RISK_SPAM | RISK_XSS,
      'captype' => 'write',
      'contextlevel' => CONTEXT_BLOCK,
      'archetypes' => array(
          'manager' => CAP_ALLOW
      ),
      'clonepermissionsfrom' => 'moodle/site:manageblocks'
  ),
  'block/playlyfe:myaddinstance' => array(
      'captype' => 'read',
      'contextlevel' =>  CONTEXT_SYSTEM,
      'archetypes' => array(
          'manager' => CAP_ALLOW
      ),
      'clonepermissionsfrom' => 'moodle/site:manageblocks'
  ),
);
