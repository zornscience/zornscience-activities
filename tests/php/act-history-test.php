<?php
// Tests for the ACT Practice History WordPress plugin, run by tests/unit/act-history.test.js with `php`.
// WordPress is replaced by small stand-ins below, and $wpdb by one backed by an in-memory SQLite database, so the
// plugin's real SQL runs. Prints "OK n" on success; any failed check exits with status 1.

define( 'ABSPATH', __DIR__ . '/' );
define( 'HOUR_IN_SECONDS', 3600 );
define( 'DAY_IN_SECONDS', 86400 );
define( 'ARRAY_A', 'ARRAY_A' );

$GLOBALS['zsa_options'] = array();
$GLOBALS['zsa_transients'] = array();
$GLOBALS['zsa_routes'] = array();
function add_action() {}
function add_filter() {}
function register_activation_hook() {}
function register_deactivation_hook() {}
function get_option( $k, $d = false ) { return array_key_exists( $k, $GLOBALS['zsa_options'] ) ? $GLOBALS['zsa_options'][ $k ] : $d; }
function update_option( $k, $v ) { $GLOBALS['zsa_options'][ $k ] = $v; return true; }
function get_transient( $k ) { return isset( $GLOBALS['zsa_transients'][ $k ] ) ? $GLOBALS['zsa_transients'][ $k ] : false; }
function set_transient( $k, $v ) { $GLOBALS['zsa_transients'][ $k ] = $v; return true; }
function wp_salt() { return 'test-salt'; }
function wp_unslash( $v ) { return $v; }
function sanitize_text_field( $v ) { return trim( (string) $v ); }
function register_rest_route( $ns, $route, $args ) { $GLOBALS['zsa_routes'][ $ns . $route ] = $args; }
function is_wp_error( $v ) { return $v instanceof WP_Error; }
class WP_Error {
	public $code; public $message; public $data;
	function __construct( $code, $message, $data ) { $this->code = $code; $this->message = $message; $this->data = $data; }
}
class WP_REST_Response {
	public $data; public $status; public $headers = array();
	function __construct( $data, $status ) { $this->data = $data; $this->status = $status; }
	function header( $k, $v ) { $this->headers[ $k ] = $v; }
}
class Fake_Request implements ArrayAccess {
	private $params; private $json;
	function __construct( $params, $json = null ) { $this->params = $params; $this->json = $json; }
	function get_json_params() { return $this->json; }
	function offsetExists( $k ): bool { return isset( $this->params[ $k ] ); }
	function offsetGet( $k ): mixed { return $this->params[ $k ]; }
	function offsetSet( $k, $v ): void { $this->params[ $k ] = $v; }
	function offsetUnset( $k ): void { unset( $this->params[ $k ] ); }
}

// $wpdb on SQLite. prepare() handles %s and %d the way WordPress does for these queries.
class Fake_Wpdb {
	public $prefix = 'wp_'; public $insert_id = 0; public $pdo;
	function __construct() { $this->pdo = new PDO( 'sqlite::memory:' ); $this->pdo->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION ); }
	function prepare( $sql, ...$args ) {
		$i = 0;
		return preg_replace_callback( '/%[sd]/', function ( $m ) use ( &$i, $args ) {
			$v = $args[ $i++ ];
			return '%d' === $m[0] ? (string) (int) $v : $this->pdo->quote( (string) $v );
		}, $sql );
	}
	function get_row( $sql, $out ) { $r = $this->pdo->query( $sql )->fetch( PDO::FETCH_ASSOC ); return $r ? $r : null; }
	function get_results( $sql, $out ) { return $this->pdo->query( $sql )->fetchAll( PDO::FETCH_ASSOC ); }
	function get_col( $sql ) { return $this->pdo->query( $sql )->fetchAll( PDO::FETCH_COLUMN, 0 ); }
	function get_var( $sql ) { return $this->pdo->query( $sql )->fetchColumn(); }
	function query( $sql ) { return $this->pdo->exec( $sql ); }
	function insert( $table, $data, $formats = null ) {
		$cols = array_keys( $data );
		$st = $this->pdo->prepare( "INSERT INTO $table (" . implode( ',', $cols ) . ') VALUES (' . implode( ',', array_fill( 0, count( $cols ), '?' ) ) . ')' );
		try { $st->execute( array_values( $data ) ); } catch ( PDOException $e ) { return false; }
		$this->insert_id = (int) $this->pdo->lastInsertId();
		return 1;
	}
	function update( $table, $data, $where ) {
		$set = implode( ',', array_map( function ( $c ) { return "$c = ?"; }, array_keys( $data ) ) );
		$wh = implode( ' AND ', array_map( function ( $c ) { return "$c = ?"; }, array_keys( $where ) ) );
		$st = $this->pdo->prepare( "UPDATE $table SET $set WHERE $wh" );
		$st->execute( array_merge( array_values( $data ), array_values( $where ) ) );
		return $st->rowCount();
	}
	function delete( $table, $where ) {
		$wh = implode( ' AND ', array_map( function ( $c ) { return "$c = ?"; }, array_keys( $where ) ) );
		$st = $this->pdo->prepare( "DELETE FROM $table WHERE $wh" );
		$st->execute( array_values( $where ) );
		return $st->rowCount();
	}
}
$GLOBALS['wpdb'] = new Fake_Wpdb();
$GLOBALS['wpdb']->query( 'CREATE TABLE wp_zsa_act_codes (code TEXT PRIMARY KEY, created_at TEXT NOT NULL, last_used TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0)' );
$GLOBALS['wpdb']->query( 'CREATE TABLE wp_zsa_act_attempts (id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT NOT NULL, created_at TEXT NOT NULL, section TEXT NOT NULL, mode TEXT NOT NULL, questions INTEGER NOT NULL, correct INTEGER NOT NULL, score INTEGER, score_low INTEGER, score_high INTEGER, seconds INTEGER NOT NULL DEFAULT 0)' );

require dirname( __DIR__, 2 ) . '/wordpress/zornscience-act-history/zornscience-act-history.php';

$checks = 0;
function check( $cond, $what ) {
	global $checks;
	$checks++;
	if ( ! $cond ) { fwrite( STDERR, "FAILED: $what\n" ); exit( 1 ); }
}
function status( $r ) { return $r instanceof WP_Error ? $r->data['status'] : $r->status; }
function reset_limits() { $GLOBALS['zsa_transients'] = array(); }
$good = array( 'section' => 'english', 'mode' => 'full', 'questions' => 50, 'correct' => 40, 'score' => 26, 'low' => null, 'high' => null, 'seconds' => 2050 );

// Routes
zsa_act_routes();
check( isset( $GLOBALS['zsa_routes']['zsa-act/v1/codes'] ), 'new-code route' );
check( 'GET' === $GLOBALS['zsa_routes']['zsa-act/v1/codes/(?P<code>[A-Za-z0-9]{6})']['methods'], 'history route is GET' );
check( 'POST' === $GLOBALS['zsa_routes']['zsa-act/v1/codes/(?P<code>[A-Za-z0-9]{6})/attempts']['methods'], 'save route is POST' );

// Code format
check( 'K7M2QX' === zsa_act_clean_code( 'k7m2qx' ), 'lowercase is accepted' );
check( 'K7M2QX' === zsa_act_clean_code( ' K7M-2QX ' ), 'spaces and a dash are ignored' );
foreach ( array( 'K7M2Q', 'K7M2QXX', 'K7M2QO', 'K7M2Q0', 'K7M2QI', 'K7M2Q1', 'K7M2Q!', '' ) as $bad ) {
	check( null === zsa_act_clean_code( $bad ), "rejects $bad" );
}
for ( $i = 0; $i < 2000; $i++ ) {
	$c = zsa_act_random_code();
	check( $c === zsa_act_clean_code( $c ), "random code $c is valid" );
}

// New code
$r = zsa_act_rest_new_code( new Fake_Request( array() ) );
check( 201 === status( $r ), 'new code is 201' );
$code = $r->data['code'];
check( 'no-store, private' === $r->headers['Cache-Control'], 'responses are not cached' );
check( null !== zsa_act_find_code( $code ), 'new code is stored' );

// History
$r = zsa_act_rest_history( new Fake_Request( array( 'code' => strtolower( $code ) ) ) );
check( 200 === status( $r ) && $code === $r->data['code'] && array() === $r->data['attempts'], 'empty history for a new code (any case)' );
check( 404 === status( zsa_act_rest_history( new Fake_Request( array( 'code' => 'ZZZZZZ' === $code ? 'YYYYYY' : 'ZZZZZZ' ) ) ) ), 'unknown code is 404' );
check( 404 === status( zsa_act_rest_history( new Fake_Request( array( 'code' => 'AAAAA0' ) ) ) ), 'invalid code is 404' );

// Save
$r = zsa_act_rest_save( new Fake_Request( array( 'code' => $code ), $good ) );
check( 201 === status( $r ), 'valid attempt saves' );
$mixed = array( 'section' => 'math', 'mode' => 'mixed', 'questions' => '15', 'correct' => 9, 'score' => 20, 'low' => 17, 'high' => 23, 'seconds' => 900 );
check( 201 === status( zsa_act_rest_save( new Fake_Request( array( 'code' => $code ), $mixed ) ) ), 'numbers as digit strings save' );
$practice = array( 'section' => 'science', 'mode' => 'one', 'questions' => 6, 'correct' => 6, 'score' => null, 'low' => null, 'high' => null, 'seconds' => 300 );
check( 201 === status( zsa_act_rest_save( new Fake_Request( array( 'code' => $code ), $practice ) ) ), 'practice without an estimate saves' );
$h = zsa_act_rest_history( new Fake_Request( array( 'code' => $code ) ) )->data['attempts'];
check( 3 === count( $h ), 'three attempts in history' );
check( 'english' === $h[0]['section'] && 26 === $h[0]['score'] && 40 === $h[0]['correct'] && null === $h[0]['low'], 'first attempt as saved, with integers' );
check( 15 === $h[1]['questions'] && 17 === $h[1]['low'] && 23 === $h[1]['high'], 'range saved' );
check( null === $h[2]['score'], 'no estimate saved as null' );
check( 1 === preg_match( '/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/', $h[0]['date'] ), 'dates are ISO UTC' );
check( 3 === (int) zsa_act_find_code( $code )['attempts'], 'attempt count kept' );
check( 404 === status( zsa_act_rest_save( new Fake_Request( array( 'code' => 'ZZZZZZ' === $code ? 'YYYYYY' : 'ZZZZZZ' ), $good ) ) ), 'save to unknown code is 404' );

// Validation
$cases = array(
	'unknown section'      => array( 'section' => 'art' ),
	'unknown mode'         => array( 'mode' => 'quiz' ),
	'more correct'         => array( 'correct' => 51 ),
	'score too high'       => array( 'score' => 37 ),
	'score zero'           => array( 'score' => 0 ),
	'backward range'       => array( 'low' => 20, 'high' => 18 ),
	'fraction'             => array( 'questions' => 12.5 ),
	'negative seconds'     => array( 'seconds' => -1 ),
	'missing questions'    => array( 'questions' => null ),
	'text number'          => array( 'correct' => 'ten' ),
);
foreach ( $cases as $name => $change ) {
	check( 400 === status( zsa_act_rest_save( new Fake_Request( array( 'code' => $code ), array_merge( $good, $change ) ) ) ), "rejects $name" );
}
check( 400 === status( zsa_act_rest_save( new Fake_Request( array( 'code' => $code ), 'not an object' ) ) ), 'rejects a non-object' );
check( 3 === count( zsa_act_attempts( $code ) ), 'rejected attempts are not saved' );

// Limit on saved attempts per code
$GLOBALS['wpdb']->query( "UPDATE wp_zsa_act_codes SET attempts = 1000 WHERE code = '$code'" );
check( 409 === status( zsa_act_rest_save( new Fake_Request( array( 'code' => $code ), $good ) ) ), 'full code is 409' );
$GLOBALS['wpdb']->query( "UPDATE wp_zsa_act_codes SET attempts = 3 WHERE code = '$code'" );

// Rate limits (per hour, per address, by kind) and the off switch
reset_limits();
update_option( 'zsa_act_settings', array( 'limit_lookup' => 3 ) );
for ( $i = 0; $i < 3; $i++ ) {
	check( 200 === status( zsa_act_rest_history( new Fake_Request( array( 'code' => $code ) ) ) ), "lookup $i allowed" );
}
check( 429 === status( zsa_act_rest_history( new Fake_Request( array( 'code' => $code ) ) ) ), 'fourth lookup in an hour is 429' );
check( 201 === status( zsa_act_rest_save( new Fake_Request( array( 'code' => $code ), $good ) ) ), 'saves have their own limit' );
foreach ( array_keys( $GLOBALS['zsa_transients'] ) as $k ) {
	check( false === strpos( $k, '127.0.0.1' ), 'the address is not in the counter name' );
}
reset_limits();
update_option( 'zsa_act_settings', array( 'enabled' => 0 ) );
check( 503 === status( zsa_act_rest_new_code( new Fake_Request( array() ) ) ), 'off: new code is 503' );
check( 503 === status( zsa_act_rest_history( new Fake_Request( array( 'code' => $code ) ) ) ), 'off: lookup is 503' );
update_option( 'zsa_act_settings', array() );

// Allowed sites
check( zsa_act_origin_allowed( 'https://activities.zornscience.org' ), 'ACT site allowed' );
check( zsa_act_origin_allowed( 'https://activities.zornscience.org/' ), 'trailing slash allowed' );
check( ! zsa_act_origin_allowed( 'https://evil.example' ), 'other sites not allowed' );
check( ! zsa_act_origin_allowed( 'https://activities.zornscience.org.evil.example' ), 'look-alike not allowed' );
check( ! zsa_act_origin_allowed( '' ) && ! zsa_act_origin_allowed( null ), 'no origin not allowed' );
update_option( 'zsa_act_settings', array( 'origins' => "https://activities.zornscience.org\nhttp://127.0.0.1:4173" ) );
check( zsa_act_origin_allowed( 'http://127.0.0.1:4173' ), 'second listed site allowed' );
update_option( 'zsa_act_settings', array() );

// Cleanup of unused codes
reset_limits();
$old = zsa_act_rest_new_code( new Fake_Request( array() ) )->data['code'];
zsa_act_rest_save( new Fake_Request( array( 'code' => $old ), $good ) );
$GLOBALS['wpdb']->query( "UPDATE wp_zsa_act_codes SET last_used = '2020-01-01 00:00:00' WHERE code = '$old'" );
check( 1 === zsa_act_cleanup(), 'cleanup removes one old code' );
check( null === zsa_act_find_code( $old ) && 0 === count( zsa_act_attempts( $old ) ), 'old code and its scores are gone' );
check( null !== zsa_act_find_code( $code ), 'recent code is kept' );

// Delete on request
check( zsa_act_delete_code( $code ) && null === zsa_act_find_code( $code ) && 0 === count( zsa_act_attempts( $code ) ), 'delete removes the code and its scores' );

// Nothing personal is stored: the plugin's own CREATE TABLE statements have only these columns, and the test
// tables above match them.
$src = file_get_contents( dirname( __DIR__, 2 ) . '/wordpress/zornscience-act-history/zornscience-act-history.php' );
preg_match_all( '/CREATE TABLE \{\$t\[\'(\w+)\'\]\} \((.*?)\) \$charset/s', $src, $m, PREG_SET_ORDER );
check( 2 === count( $m ), 'two tables are created' );
$want = array(
	'codes'    => array( 'code', 'created_at', 'last_used', 'attempts' ),
	'attempts' => array( 'id', 'code', 'created_at', 'section', 'mode', 'questions', 'correct', 'score', 'score_low', 'score_high', 'seconds' ),
);
foreach ( $m as $table ) {
	preg_match_all( '/^\s*([a-z_]+) (?:char|datetime|smallint|bigint|varchar|tinyint|mediumint)/m', $table[2], $c );
	check( $want[ $table[1] ] === $c[1], $table[1] . ' table columns: ' . implode( ', ', $c[1] ) );
	$test = array_column( $GLOBALS['wpdb']->get_results( 'PRAGMA table_info(wp_zsa_act_' . $table[1] . ')', ARRAY_A ), 'name' );
	check( $want[ $table[1] ] === $test, $table[1] . ' test table matches' );
}

echo "OK $checks\n";
