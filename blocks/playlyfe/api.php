<?php
require_once(dirname(dirname(dirname(__FILE__))).'/config.php');
require_login();
$can_modify = has_capability('block/playlyfe:addinstance', context_user::instance($USER->id));
$method = $_GET['method'];
$route = $_GET['route'];
if(stripos($route, '/design') === 0 && !$can_modify) {
  echo 'You need to be authorized to make this request';
}
else if(stripos($route, '/admin') === 0 && !$can_modify) {
  echo 'You need to be authorized to make this request';
}
else {
  header('Content-Type: application/json');
  try {
    $data = json_decode(file_get_contents('php://input'), true);
    $pl = block_playlyfe_sdk::get_pl();
    echo json_encode($pl->api($method, $route, array(), $data));
  }
  catch(Exception $e) {
    http_response_code(400);
    echo json_encode($e);
  }
}
