<?php

class block_playlyfe extends block_base {

  public function init() {
    $this->title = 'Playlyfe';
  }

  // This will return all text content which will be displayed in the blocks
  // This is where we are going to integrate our Game using the Playlyfe REST API
  public function get_content() {
    global $USER;
    $pl = block_playlyfe_sdk::get_pl();
    $this->content = new stdClass;
    $this->content->footer = 'Powered by Playlyfe';
    $firewall = array(0, 1, 2, 3); // prevent users who don't have site config permission from accessing these type of blocks
    $isadmin = has_capability('moodle/site:config', context_user::instance($USER->id));
    if(in_array($this->config->type, $firewall) && !$isadmin) {
      $this->content->text = "You need to be an admin to use this type of the Playlyfe block";
      return;
    }
    switch ($this->config->type) {
      case 0:
        $this->title = 'Points';
        $point = null;
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
              ),
              'tags' => ['point']
            ));
            $pl->post('/design/versions/latest/leaderboards', array(), array(
              'id' => 'point',
              'name' => 'point',
              'type' => 'regular',
              'description' => '',
              'entity_type' => 'players',
              'scope' => array(
                'type' => 'game'
              ),
              'metric' => array(
                'id' => 'point',
                'type' => 'point'
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
        $this->title = 'Badges';
        $badges = $pl->get('/design/versions/latest/metrics', array('fields' => 'id,name,description,type,image', 'tags' => 'badge'));
        $this->content->text = '<div id="pl_badge_block"></div>';
        $this->page->requires->js_init_call('init_badge_list', array($badges));
        break;
      case 2:
        $this->title = 'Levels';
        try {
          $base = $pl->get('/design/versions/latest/metrics/point');
          $state = $pl->get('/design/versions/latest/metrics/level');
          $level_rule = $pl->get('/design/versions/latest/rules/level');
        }
        catch(Exception $e) {
          if($e->name == 'metric_not_found') {
            $state = $pl->post('/design/versions/latest/metrics', array(), array(
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
        $this->page->requires->js_init_call('init_level_list', array(array('state' => $state, 'base' => $base, 'rule' => $level_rule)));
        break;
      case 3:
        switch ($this->config->event) {
          case 0:
            $rule_id = "log_in";
            $this->title = 'Logged In Rule';
            break;
          case 1:
            $rule_id = "log_out";
            $this->title = 'Logged Out Rule';
            break;
          case 2:
            // Find context if not course then display this block must be shown only on course page
            $currentcontext = $this->page->context->get_course_context(false);
            if(empty($currentcontext)) {
              $this->content->text = 'This block must be present on a course page';
              return;
            }
            $this->title = 'Course Completed Rule';
            $rule_id = "course_completed_".$this->page->course->id;
            break;
          case 3:
            // Find context if not course then display this block must be shown only on course page
            $currentcontext = $this->page->context->get_course_context(false);
            if(empty($currentcontext)) {
              $this->content->text = 'This block must be present on a course page';
              return;
            }
            $this->title = 'Forum Post Created Rule';
            $rule_id = "forum_post_created_".$this->page->course->id;
            break;
          case 4:
            $currentcontext = $this->page->context->get_course_context(false);
            if(empty($currentcontext)) {
              $this->content->text = 'This block must be present on a course page';
              return;
            }
            $this->title = 'Forum Discussion Created Rule';
            $rule_id = "forum_discussion_created_".$this->page->course->id;
            break;
        }
        $point = $pl->get('/design/versions/latest/metrics/point');
        $badges = $pl->get('/design/versions/latest/metrics', array('fields' => 'id,name,description,type,image', 'tags' => 'badge'));
        // We then fetch the rule and if it does not exist we create it
        try {
          $rule = $pl->get('/design/versions/latest/rules/'.$rule_id);
        }
        catch(Exception $e) {
          if($e->name == 'rule_not_found') {
            $rule = $pl->post('/design/versions/latest/rules', array(), array(
              'id' => $rule_id,
              'name' => $rule_id,
              'type' => 'custom',
              'rules' => array(
                array(
                  'rewards' => array(),
                  'requires' => new StdClass
                )
              ),
              'variables' => array(
                array(
                  'name' => 'score',
                  'type' => 'int',
                  'required' => false,
                  'default' => 0
                ),
                array(
                  'name' => 'time_completed',
                  'type' => 'int',
                  'required' => false,
                  'default' => 0
                ),
                array(
                  'name' => 'course_id',
                  'type' => 'int',
                  'required' => false,
                  'default' => 0
                )
              )
            ));
          } else {
            throw $e;
          }
        }
        $this->content->text = '<div id="pl_'.$rule_id.'_block"></div>';
        $this->page->requires->js_init_call('init_rule_list', array(array('rule' => $rule, 'point' => $point, 'badges' => $badges)));
        break;
      case 4:
        $this->title = 'Profile';
        // if($isadmin) {
        //   $this->content->text = 'You need to be a student to view the profile';
        //   return;
        // }
        $profile = null;
        try {
          $profile = $pl->get('/runtime/player', array('player_id' => ''.$USER->id));
        }
        catch(Exception $e) {
          if($e->name == 'player_not_found') {
            $profile = $pl->post('/admin/players', array(), array('id' => $USER->id, 'alias' => $USER->firstname.' '.$USER->lastname));
          }
          else {
            throw $e;
          }
        }
        $this->content->text = '<div id="pl_profile_block"></div>';
        $this->page->requires->js_init_call('show_profile', array($profile));
        break;
      case 5:
        $this->title = "Leaderboard";
        $leaderboard = $pl->get('/runtime/leaderboards/point', array(
          'player_id' => ''.$USER->id,
          'cycle' => 'alltime',
          'skip' => 0,
          'limit' => 10,
        ));
        $this->content->text = '<div id="pl_leaderboard"></div>';
        $this->page->requires->js_init_call('show_leaderboard', array($leaderboard));
        break;
    }
    return $this->content;
  }

  // all the required javascript for our block
  public function get_required_javascript() {
    global $CFG;
    parent::get_required_javascript();
    $this->page->requires->jquery();
    $this->page->requires->js('/blocks/playlyfe/js/plupload.full.min.js');
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
