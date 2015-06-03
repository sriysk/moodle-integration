<?php

class block_playlyfe extends block_base {

  public function init() {
    $this->title = 'Playlyfe';
  }

  public function get_content() {
    $pl = block_playlyfe_sdk::get_pl();
    $this->content = new stdClass;
    $this->content->footer = 'Powered by Playlyfe';
    switch ($this->config->type) {
      case 0:
        try {
          $point = $pl->get('/design/versions/latest/metrics/point');
        }
        catch(Exception $e) {
          if($e->name == 'metric_not_found') {
            $point = $pl->post('/design/versions/latest/metrics', array(), array(
              'id' => 'point',
              'name' => 'point',
              'type' => 'point',
              'constraints' => array(
                'default' => '0',
                'max' => 'Infinity',
                'min' => '0'
              )
            ));
          } else {
            throw $e;
          }
        }
        $this->content->text = '<div id="pl_point_block"></div>';
        $this->page->requires->js_init_call('init_point_block', array($point));
        break;
      case 1:
        $badges = $pl->get('/design/versions/latest/metrics', array('fields' => 'id,name,description,type,image', 'tags' => 'badge'));
        $this->content->text = '<div id="pl_badge_block"></div>';
        $this->page->requires->js_init_call('init_badge_list', array($badges));
        break;
      case 2:
        try {
          $base = $pl->get('/design/versions/latest/metrics/point');
          $level = $pl->get('/design/versions/latest/metrics/level');
          $level_rule = $pl->get('/design/versions/latest/rules/level');
        }
        catch(Exception $e) {
          if($e->name == 'metric_not_found') {
            $level = $pl->post('/design/versions/latest/metrics', array(), array(
              'id' => 'level',
              'name' => 'level',
              'type' => 'state',
              'image' => 'default-state-metric',
              'constraints' => array(
                'states' => array(
                  array('name' => 'none1', 'image' => 'default-state-metric'),
                  array('name' => 'none2', 'image' => 'default-state-metric')
                )
              )
            ));
          } else if($e->name == 'rule_not_found') {
            $level_rule = $pl->post('/design/versions/latest/rules', array(), array(
              'id' => 'level',
              'name' => 'level',
              'type' => 'level',
              'level_metric' => 'level',
              'base_metric' => 'point',
              'levels' => array(
                array('rank' => 'none1', 'threshold' => '5'),
                array('rank' => 'none2')
              )
            ));
          } else {
            throw $e;
          }
        }
        $this->content->text = '<div id="pl_level_block"></div>';
        $this->page->requires->js_init_call('init_level_list', array(array('level' => $level, 'base' => $base, 'rule' => $level_rule)));
        break;
      case 3:
      case 4:
    }
    return $this->content;
  }

  // all the required javascript for our block
  public function get_required_javascript() {
    global $CFG;
    parent::get_required_javascript();
    $this->page->requires->jquery();
    $this->page->requires->jquery_plugin('ui');
    $this->page->requires->jquery_plugin('ui-css');
    $this->page->requires->js('/blocks/playlyfe/block_playlyfe.js');
    $this->page->requires->js_init_call('init_cfg', array(array('root' => $CFG->wwwroot)));
  }

  // Each of our block instance has some configuration parameters
  public function has_config() {
    return true;
  }

  // Admin can create multiple block instances
  public function instance_allow_multiple() {
    return true;
  }

  // Allow this block to be added on any page
  public function applicable_formats() {
    return array(
      'all' => true,
      'admin' => true,
      'site-index' => true,
      'course-view' => true,
      'mod' => true,
      'my' => true
    );
  }
}
