<?php
require_once(dirname(dirname(dirname(__FILE__))).'/config.php');
require_login();
$pl = block_playlyfe_sdk::get_pl();
if(isset($_GET['id'])) { // This is for uploading an image to playlyfe and updating the corresponing metric
  if (empty($_FILES) || $_FILES["file"]["error"]) {
    die('{"OK": 0}');
  }
  $image_id = $pl->upload_image($_FILES['file']['tmp_name']);
  $metric_id = $_GET['id'];
  $metric_type = $_GET['type'];
  $name = $_GET['name'];
  if($metric_type == 'point') { // update the image of the point metric
    $pl->patch('/design/versions/latest/metrics/'.$metric_id, array(), array('type' => 'point', 'image' => $image_id));
  }
  else { // update the image of the state in the state metric
    $level = $pl->get('/design/versions/latest/metrics/'.$metric_id);
    for($i=0;$i<count($level['constraints']['states']);$i++) {
      if($level['constraints']['states'][$i]['name'] == $name) {
        $level['constraints']['states'][$i]['image'] = $image_id;
        break;
      }
    }
    $pl->patch('/design/versions/latest/metrics/'.$metric_id, array(), array(
      'type' => 'state',
      'constraints' => $level['constraints']
    ));
  }
  $pl->post('/design/versions/latest/deploy');
  die(json_encode(array('image_id' => $image_id)));
}
else if(isset($_GET['metric_id'])) {
  $metric_id = $_GET['metric_id'];
  $query = array('player_id' => ''.$USER->id, 'size' => 'small');
  if(isset($_GET['state'])) {
    $query['state'] = $_GET['state'];
  }
  header('Content-type: image/png');
  // Note every runtime route requires a player and this route we need the raw response
  echo $pl->get('/runtime/assets/definitions/metrics/'.$metric_id, $query, true);
}
else {
  // Get the image of the point or state based on the image_id
  $image_id = $_GET['image_id'];
  unset($_GET['image_id']);
  header('Content-type: image/png');
  echo $pl->read_image($image_id, $_GET);
}

