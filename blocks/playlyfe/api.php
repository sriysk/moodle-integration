<?php
require_once(dirname(dirname(dirname(__FILE__))).'/config.php');
require_login();
$can_modify = has_capability('block/playlyfe:addinstance', context_user::instance($USER->id));
$method = $_GET['method'];
$route = $_GET['route'];
$query = array();
if(stripos($route, '/design') === 0 && !$can_modify) {
  echo 'You need to be authorized to make this request';
}
else if(stripos($route, '/admin') === 0 && !$can_modify) {
  echo 'You need to be authorized to make this request';
}
else {
  if(stripos($route, '/runtime') === 0) {
    $query['player_id'] = $USER->id;
  }
  header('Content-Type: application/json');
  try {
    $data = json_decode(file_get_contents('php://input'), false);
    $pl = block_playlyfe_sdk::get_pl();
    echo json_encode($pl->api($method, $route, $query, $data));
    $pl->post('/design/versions/latest/deploy');
  }
  catch(Exception $e) {
    http_response_code(400);
    echo json_encode($e);
  }
}
