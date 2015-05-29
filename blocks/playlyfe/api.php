<?php
require_once(dirname(dirname(dirname(__FILE__))).'/config.php');
require_once('classes/block_playlyfe_sdk.php');
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
  // case 0:
  //       $profile = $pl->get('/runtime/player', array( 'player_id' => 'student1' ));
  //       $html = '<h5>'.$profile['alias'].'</h5>';
  //       $html .= '<b>Scores</b>';
  //       $html .= '<table class="generaltable">';
  //       $html .= '<thead>';
  //       $html .= '<tr>';
  //       $html .= '<th class="header c1 lastcol centeralign" style="" scope="col">Point</th>';
  //       $html .= '<th class="header c1 lastcol centeralign" style="" scope="col">Score</th>';
  //       $html .= '</tr>';
  //       $html .= '</thead>';
  //       $html .= '<tbody>';
  //       foreach($profile['scores'] as $score) {
  //         if ($score['metric']['type'] === 'point') {
  //           $html .= '<tr>';
  //           $html .= '<td>'. $score['metric']['name'] . '</td><td>' . $score['value'] . '</td>';
  //           $html .= '</tr>';
  //         }
  //       }
  //       $html .= '</tbody>';
  //       $html .= '</table>';
  //       $html .= '<b>Teams</b>';
  //       $html .= '<table class="generaltable">';
  //       $html .= '<thead>';
  //       $html .= '<tr>';
  //       $html .= '</tr>';
  //       $html .= '</thead>';
  //       $html .= '<tbody>';
  //       $html .= '<tr><td>You are not part of any teams right now</td></tr>';
  //       $html .= '</tbody>';
  //       $html .= '</table>';
  //       $this->content->text = $html;
  //       break;
  // case 1:
  //       $leaderboard = $pl->get('/runtime/leaderboards/game_leaderboard', array(
  //         'player_id' => 'student1',
  //         'cycle' => 'alltime',
  //         'skip' => 0,
  //         'limit' => 10,
  //       ));
  //       $html = '<table class="generaltable">';
  //       $html .= '<thead>';
  //       $html .= '<tr>';
  //       $html .= '<th class="header c1 lastcol centeralign" style="" scope="col">Rank</th>';
  //       $html .= '<th class="header c1 lastcol centeralign" style="" scope="col">Name</th>';
  //       $html .= '<th class="header c1 lastcol centeralign" style="" scope="col">Score</th>';
  //       $html .= '</tr>';
  //       $html .= '</thead>';
  //       $html .= '<tbody>';
  //       foreach($leaderboard['data'] as $data) {
  //         $html .= '<tr>';
  //         $html .= '<td>'. $data['rank'] . '</td><td>' . $data['player']['alias'] . '</td><td>' . $data['score'].'</td>';
  //         $html .= '</tr>';
  //       }
  //       $html .= '</tbody>';
  //       $html .= '</table>';
  //       $this->content->text = $html;
  //       break;
