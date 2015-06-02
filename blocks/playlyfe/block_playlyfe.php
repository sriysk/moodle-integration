<?php

class block_playlyfe extends block_base {

  public function init() {
    $this->title = 'Playlyfe';
  }

  public function get_content() {
    global $USER;
    $pl = block_playlyfe_sdk::get_pl();
    $this->content = new stdClass;
    $this->content->footer = 'Powered by Playlyfe';
    switch ($this->config->type) {
      case 0:
        $this->title = 'Points';
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
        $profile = $pl->get('/runtime/player', array( 'player_id' => ''.$USER->id));
        $html = '<h5>'.$profile['alias'].'</h5>';
        $html .= '<b>Scores</b>';
        $html .= '<table class="generaltable">';
        $html .= '<thead>';
        $html .= '<tr>';
        $html .= '<th class="header c1 lastcol centeralign" style="" scope="col">Point</th>';
        $html .= '<th class="header c1 lastcol centeralign" style="" scope="col">Score</th>';
        $html .= '</tr>';
        $html .= '</thead>';
        $html .= '<tbody>';
        foreach($profile['scores'] as $score) {
          if ($score['metric']['type'] === 'point') {
            $html .= '<tr>';
            $html .= '<td>'. $score['metric']['name'] . '</td><td>' . $score['value'] . '</td>';
            $html .= '</tr>';
          }
        }
        $html .= '</tbody>';
        $html .= '</table>';
        $html .= '<b>Teams</b>';
        $html .= '<table class="generaltable">';
        $html .= '<thead>';
        $html .= '<tr>';
        $html .= '</tr>';
        $html .= '</thead>';
        $html .= '<tbody>';
        $html .= '<tr><td>You are not part of any teams right now</td></tr>';
        $html .= '</tbody>';
        $html .= '</table>';
        $this->content->text = $html;
    }
    return $this->content;
  }

  public function get_required_javascript() {
    global $CFG;
    parent::get_required_javascript();
    $this->page->requires->jquery();
    $this->page->requires->jquery_plugin('ui');
    $this->page->requires->jquery_plugin('ui-css');
    $this->page->requires->js('/blocks/playlyfe/block_playlyfe.js');
    $this->page->requires->js_init_call('init_cfg', array(array('root' => $CFG->wwwroot)));
  }

  public function has_config() {
    return true;
  }

  function instance_allow_multiple() {
    return true;
  }
}
