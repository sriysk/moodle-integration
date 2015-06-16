<?php  // Moodle configuration file

unset($CFG);
global $CFG;
$CFG = new stdClass();

$CFG->dbtype    = 'mysqli';
$CFG->dblibrary = 'native';
$CFG->dbhost    = 'localhost';
$CFG->dbname    = 'moodle';
$CFG->dbuser    = 'moodleuser';
$CFG->dbpass    = 'moodle';
$CFG->prefix    = 'mdl_';
$CFG->dboptions = array (
  'dbpersist' => 0,
  'dbport' => 3306,
  'dbsocket' => '',
);

$CFG->wwwroot   = 'http://localhost:3000';
$CFG->dataroot  = '/var/www/moodledata';
$CFG->admin     = 'admin';

// For openshift
if(isset($_ENV['OPENSHIFT_DATA_DIR'])) {
  $CFG->dbhost    = $_ENV['OPENSHIFT_MYSQL_DB_HOST'];
  $CFG->dbname    = $_ENV['OPENSHIFT_APP_NAME'];
  $CFG->dbuser    = $_ENV['OPENSHIFT_MYSQL_DB_USERNAME'];
  $CFG->dbpass    = $_ENV['OPENSHIFT_MYSQL_DB_PASSWORD'];
  $CFG->dboptions = array (
    'dbpersist' => 0,
    'dbport' => $_ENV['OPENSHIFT_MYSQL_DB_PORT'],
    'dbsocket' => '',
  );
  $CFG->wwwroot   = "https://$_ENV[OPENSHIFT_APP_DNS]";
  $CFG->sslproxy=true;
  $CFG->dataroot  = $_ENV['OPENSHIFT_DATA_DIR'];
}

$CFG->directorypermissions = 0777;

require_once(dirname(__FILE__) . '/lib/setup.php');

// There is no php closing tag in this file,
// it is intentional because it prevents trailing whitespace problems!
