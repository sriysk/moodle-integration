<?php

class block_playlyfe extends block_base {

  public function init() {
    $this->title = 'Playlyfe';
  }

  public function get_content() {
    global $CFG;
    $pl = block_playlyfe_sdk::get_pl();
    $this->content = new stdClass;
    $this->content->footer = 'Powered by Playlyfe';
    switch ($this->config->type) {
      case 0:
      case 1:
        $tag = 'point';
        if($this->config->type == 1) {
          $tag = 'badge';
        }
        $metrics = $pl->get('/design/versions/latest/metrics', array('fields' => 'id,name,description,type,image', 'tags' => $tag));
        $this->content->text = '<div id="gamification_'.$tag.'_block"></div>';
        $this->page->requires->js_init_call('create_metric_list', array(array('type' => $tag, 'metrics' => $metrics, 'root' => $CFG->wwwroot)));
        break;
    }
    return $this->content;
  }

  public function get_required_javascript() {
    parent::get_required_javascript();
    $this->page->requires->jquery();
    $this->page->requires->jquery_plugin('ui');
    $this->page->requires->jquery_plugin('ui-css');
    $this->page->requires->js('/blocks/playlyfe/block_playlyfe.js');
  }

  public function specialization() {
    if (!empty($this->config->title)) {
      $this->title = $this->config->title;
    } else {
      $this->config->title = 'Playlyfe';
    }
    if (empty($this->config->type)) {
      $this->config->type = 0;
    }
  }

  public function has_config() {
    return true;
  }

  function instance_allow_multiple() {
    return true;
  }

}
