<?php

class block_playlyfe extends block_base {

  public function init() {
    $this->title = 'Playlyfe';
  }

  public function get_content() {
    global $CFG;
    $pl = block_playlyfe_sdk::get_pl();
    $response = $pl->get('/admin');
    $game = $response['game'];
    $this->content = new stdClass;
    $this->content->footer = 'Powered by Playlyfe';
    $this->content->text = '
      <h5>'.$game['title'].'</h5>
      <p> Description - '.$game['description'].'<p>
      <p> Access - '.$game['access'].'<p>
      <p> Timezone - '.$game['timezone'].'<p>
    ';
    return $this->content;
  }

  public function get_required_javascript() {
    parent::get_required_javascript();
    $this->page->requires->jquery();
    $this->page->requires->jquery_plugin('ui');
    $this->page->requires->jquery_plugin('ui-css');
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

  public function instance_allow_multiple() {
    return true;
  }

  public function applicable_formats() {
    return array(
      'all' => true,
      'admin' => false,
      'site-index' => true,
      'course-view' => true,
      'mod' => false,
      'my' => true
    );
  }

}
