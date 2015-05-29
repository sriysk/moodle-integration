<?php
require_once(dirname(dirname(dirname(__FILE__))).'/config.php');
require_once('classes/block_playlyfe_sdk.php');
require_login();
$pl = block_playlyfe_sdk::get_pl();
$image_id = $_GET['image_id'];
unset($_GET['image_id']);
header('Content-type: image/png');
echo $pl->read_image($image_id, $_GET);

