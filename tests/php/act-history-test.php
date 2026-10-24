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
function wp_next_scheduled() { return false; }
function wp_schedule_event() { $GLOBALS['zsa_scheduled'] = true; }
function delete_transient( $k ) { unset( $GLOBALS['zsa_transients'][ $k ] ); }
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
	function get_charset_collate() { return ''; }
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
$GLOBALS['wpdb']->query( "CREATE TABLE wp_zsa_act_codes (code TEXT PRIMARY KEY, created_at TEXT NOT NULL, last_used TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, pin_hash TEXT NOT NULL DEFAULT '')" );
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
function open_code( $code, $pin ) { return zsa_act_rest_history( new Fake_Request( array( 'code' => $code ), array( 'pin' => $pin ) ) ); }
function save_to( $code, $pin, $attempt ) { return zsa_act_rest_save( new Fake_Request( array( 'code' => $code ), array_merge( $attempt, array( 'pin' => $pin ) ) ) ); }
$good = array( 'section' => 'english', 'mode' => 'full', 'questions' => 50, 'correct' => 40, 'score' => 26, 'low' => null, 'high' => null, 'seconds' => 2050 );

// Routes: new code, open (POST, so the PIN is never in a web address), save. No GET route.
zsa_act_routes();
check( 'POST' === $GLOBALS['zsa_routes']['zsa-act/v1/codes']['methods'], 'new-code route is POST' );
check( 'POST' === $GLOBALS['zsa_routes']['zsa-act/v1/codes/(?P<code>[A-Za-z0-9]{6})/open']['methods'], 'open route is POST' );
check( 'POST' === $GLOBALS['zsa_routes']['zsa-act/v1/codes/(?P<code>[A-Za-z0-9]{6})/attempts']['methods'], 'save route is POST' );
check( 3 === count( $GLOBALS['zsa_routes'] ), 'three routes only' );

// Code and PIN formats
check( 'K7M2QX' === zsa_act_clean_code( 'k7m2qx' ), 'lowercase is accepted' );
check( 'K7M2QX' === zsa_act_clean_code( ' K7M-2QX ' ), 'spaces and a dash are ignored' );
foreach ( array( 'K7M2Q', 'K7M2QXX', 'K7M2QO', 'K7M2Q0', 'K7M2QI', 'K7M2Q1', 'K7M2Q!', '' ) as $bad ) {
	check( null === zsa_act_clean_code( $bad ), "rejects code $bad" );
}
check( '0427' === zsa_act_clean_pin( ' 04 27 ' ), 'PIN spaces ignored, leading zero kept' );
foreach ( array( '123', '12345', 'abcd', '12.4', '', '-123' ) as $bad ) {
	check( null === zsa_act_clean_pin( $bad ), "rejects PIN $bad" );
}
$pins = array();
for ( $i = 0; $i < 2000; $i++ ) {
	$c = zsa_act_random_code();
	check( $c === zsa_act_clean_code( $c ), "random code $c is valid" );
	$p = zsa_act_random_pin();
	check( $p === zsa_act_clean_pin( $p ), "random PIN $p is valid" );
	$pins[ $p ] = true;
}
check( count( $pins ) > 1000, 'PINs vary' );

// New code: the PIN is returned once and stored only as a hash.
$r = zsa_act_rest_new_code( new Fake_Request( array() ) );
check( 201 === status( $r ), 'new code is 201' );
$code = $r->data['code'];
$pin  = $r->data['pin'];
check( null !== zsa_act_clean_pin( $pin ), 'new PIN is four digits' );
check( 'no-store, private' === $r->headers['Cache-Control'], 'responses are not cached' );
$row = zsa_act_find_code( $code );
check( null !== $row && $row['pin_hash'] !== $pin && false === strpos( $row['pin_hash'], $pin ) && password_verify( $pin, $row['pin_hash'] ), 'PIN stored as a hash only' );
$other = zsa_act_rest_new_code( new Fake_Request( array() ) )->data;
$wrong = $pin === '0000' ? '0001' : '0000';
while ( $wrong === $other['pin'] || $wrong === $pin ) { $wrong = str_pad( (string) ( ( (int) $wrong + 7 ) % 10000 ), 4, '0', STR_PAD_LEFT ); }

// Opening needs the matching PIN. An unknown code and a wrong PIN get the same answer.
$r = open_code( strtolower( $code ), $pin );
check( 200 === status( $r ) && $code === $r->data['code'] && array() === $r->data['attempts'], 'code and PIN open an empty history (any case)' );
check( ! isset( $r->data['pin'] ) && ! isset( $r->data['pin_hash'] ), 'the PIN is never sent back' );
$mismatch = open_code( $code, $wrong );
check( 403 === status( $mismatch ), 'wrong PIN is 403' );
$unknown = open_code( 'ZZZZZZ' === $code ? 'YYYYYY' : 'ZZZZZZ', $pin );
check( 403 === status( $unknown ) && $unknown->message === $mismatch->message && $unknown->code === $mismatch->code, 'unknown code gets the same answer as a wrong PIN' );
check( 403 === status( open_code( $code, '' ) ), 'missing PIN is 403' );
check( 403 === status( open_code( $code, 'abcd' ) ), 'malformed PIN is 403' );
check( 403 === status( open_code( $code, $other['pin'] === $pin ? $wrong : $other['pin'] ) ), "another code's PIN does not open this code" );
check( 403 === status( zsa_act_rest_history( new Fake_Request( array( 'code' => $code ), null ) ) ), 'no body is 403' );
reset_limits();

// Save: only with the matching PIN; a mistyped code or PIN never adds to someone's history.
check( 201 === status( save_to( $code, $pin, $good ) ), 'valid attempt saves' );
$mixed = array( 'section' => 'math', 'mode' => 'mixed', 'questions' => '15', 'correct' => 9, 'score' => 20, 'low' => 17, 'high' => 23, 'seconds' => 900 );
check( 201 === status( save_to( $code, $pin, $mixed ) ), 'numbers as digit strings save' );
$practice = array( 'section' => 'science', 'mode' => 'one', 'questions' => 6, 'correct' => 6, 'score' => null, 'low' => null, 'high' => null, 'seconds' => 300 );
check( 201 === status( save_to( $code, $pin, $practice ) ), 'practice without an estimate saves' );
check( 403 === status( save_to( $code, $wrong, $good ) ), 'save with the wrong PIN is 403' );
check( 403 === status( save_to( $other['code'], $pin === $other['pin'] ? $wrong : $pin, $good ) ), "save with another student's PIN is 403" );
check( 0 === count( zsa_act_attempts( $other['code'] ) ), 'nothing was added to the other code' );
$h = open_code( $code, $pin )->data['attempts'];
check( 3 === count( $h ), 'three attempts in history' );
check( 'english' === $h[0]['section'] && 26 === $h[0]['score'] && 40 === $h[0]['correct'] && null === $h[0]['low'], 'first attempt as saved, with integers' );
check( 15 === $h[1]['questions'] && 17 === $h[1]['low'] && 23 === $h[1]['high'], 'range saved' );
check( null === $h[2]['score'], 'no estimate saved as null' );
check( 1 === preg_match( '/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/', $h[0]['date'] ), 'dates are ISO UTC' );
check( 3 === (int) zsa_act_find_code( $code )['attempts'], 'attempt count kept' );
reset_limits();

// Validation
$cases = array(
	'unknown section'   => array( 'section' => 'art' ),
	'unknown mode'      => array( 'mode' => 'quiz' ),
	'more correct'      => array( 'correct' => 51 ),
	'score too high'    => array( 'score' => 37 ),
	'score zero'        => array( 'score' => 0 ),
	'backward range'    => array( 'low' => 20, 'high' => 18 ),
	'fraction'          => array( 'questions' => 12.5 ),
	'negative seconds'  => array( 'seconds' => -1 ),
	'missing questions' => array( 'questions' => null ),
	'text number'       => array( 'correct' => 'ten' ),
);
foreach ( $cases as $name => $change ) {
	check( 400 === status( save_to( $code, $pin, array_merge( $good, $change ) ) ), "rejects $name" );
}
check( 403 === status( zsa_act_rest_save( new Fake_Request( array( 'code' => $code ), 'not an object' ) ) ), 'rejects a non-object (no PIN)' );
check( 3 === count( zsa_act_attempts( $code ) ), 'rejected attempts are not saved' );

// Limit on saved attempts per code
$GLOBALS['wpdb']->query( "UPDATE wp_zsa_act_codes SET attempts = 1000 WHERE code = '$code'" );
check( 409 === status( save_to( $code, $pin, $good ) ), 'full code is 409' );
$GLOBALS['wpdb']->query( "UPDATE wp_zsa_act_codes SET attempts = 3 WHERE code = '$code'" );

// Wrong PINs lock a code for an hour after 10 tries, even with the right PIN; other codes are not affected.
reset_limits();
update_option( 'zsa_act_settings', array( 'limit_lookup' => 1000, 'limit_save' => 1000 ) );
for ( $i = 0; $i < 10; $i++ ) {
	check( 403 === status( open_code( $code, $wrong ) ), "wrong PIN $i" );
}
check( 429 === status( open_code( $code, $pin ) ), 'locked after 10 wrong PINs, even with the right one' );
check( 429 === status( save_to( $code, $pin, $good ) ), 'saving is locked too' );
check( 200 === status( open_code( $other['code'], $other['pin'] ) ), 'another code still opens' );
reset_limits();
check( 200 === status( open_code( $code, $pin ) ), 'opens again after the hour' );

// Rate limits per network address, and the off switch
reset_limits();
update_option( 'zsa_act_settings', array( 'limit_lookup' => 3 ) );
for ( $i = 0; $i < 3; $i++ ) {
	check( 200 === status( open_code( $code, $pin ) ), "lookup $i allowed" );
}
check( 429 === status( open_code( $code, $pin ) ), 'fourth lookup in an hour is 429' );
check( 201 === status( save_to( $code, $pin, $good ) ), 'saves have their own limit' );
foreach ( array_keys( $GLOBALS['zsa_transients'] ) as $k ) {
	check( false === strpos( $k, '127.0.0.1' ), 'the address is not in a counter name' );
}
reset_limits();
update_option( 'zsa_act_settings', array( 'enabled' => 0 ) );
check( 503 === status( zsa_act_rest_new_code( new Fake_Request( array() ) ) ), 'off: new code is 503' );
check( 503 === status( open_code( $code, $pin ) ), 'off: open is 503' );
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

// Purging codes inactive for a year (the default), with their PINs and scores
reset_limits();
check( 365 === zsa_act_settings()['retention_days'], 'default is a year' );
$old = zsa_act_rest_new_code( new Fake_Request( array() ) )->data;
save_to( $old['code'], $old['pin'], $good );
$year = gmdate( 'Y-m-d H:i:s', time() - 366 * DAY_IN_SECONDS );
$recent = gmdate( 'Y-m-d H:i:s', time() - 364 * DAY_IN_SECONDS );
$GLOBALS['wpdb']->query( "UPDATE wp_zsa_act_codes SET last_used = '$year' WHERE code = '{$old['code']}'" );
$GLOBALS['wpdb']->query( "UPDATE wp_zsa_act_codes SET last_used = '$recent' WHERE code = '{$other['code']}'" );
check( array( $old['code'] ) === zsa_act_inactive_codes(), 'only the code unused for over a year is inactive' );
check( 1 === zsa_act_cleanup(), 'purge removes one code' );
check( null === zsa_act_find_code( $old['code'] ) && 0 === count( zsa_act_attempts( $old['code'] ) ), 'the inactive code, its PIN and its scores are gone' );
check( 403 === status( open_code( $old['code'], $old['pin'] ) ), 'a purged code no longer opens' );
check( null !== zsa_act_find_code( $code ) && null !== zsa_act_find_code( $other['code'] ), 'codes used within the year are kept' );
check( 0 === zsa_act_cleanup(), 'nothing left to purge' );

// Upgrading from 1.0.0: the tables are updated (the PIN column) and a saved 400-day setting becomes a year.
update_option( 'zsa_act_db_version', '1.0.0' );
update_option( 'zsa_act_settings', array( 'retention_days' => 400, 'origins' => 'https://activities.zornscience.org' ) );
$GLOBALS['zsa_dbdelta'] = array();
zsa_act_maybe_upgrade();
check( 2 === count( $GLOBALS['zsa_dbdelta'] ) && false !== strpos( $GLOBALS['zsa_dbdelta'][0], 'pin_hash varchar(255)' ), 'upgrade runs dbDelta with the PIN column' );
check( '1.1.0' === get_option( 'zsa_act_db_version' ) && 365 === zsa_act_settings()['retention_days'], 'upgrade records the version and moves 400 days to a year' );
$GLOBALS['zsa_dbdelta'] = array();
zsa_act_maybe_upgrade();
check( array() === $GLOBALS['zsa_dbdelta'], 'no second upgrade' );
update_option( 'zsa_act_settings', array( 'retention_days' => 200 ) );
update_option( 'zsa_act_db_version', '1.0.0' );
zsa_act_maybe_upgrade();
check( 200 === zsa_act_settings()['retention_days'], 'a setting someone chose is kept' );
update_option( 'zsa_act_settings', array() );

// A code from before PINs (empty hash) cannot be opened until a teacher makes it a new PIN.
$GLOBALS['wpdb']->query( "INSERT INTO wp_zsa_act_codes (code, created_at, last_used, attempts, pin_hash) VALUES ('ABCDEF', '2026-10-01 00:00:00', '" . zsa_act_now() . "', 0, '')" );
check( 403 === status( open_code( 'ABCDEF', '0000' ) ), 'a code without a PIN does not open' );

// Delete on request
check( zsa_act_delete_code( $code ) && null === zsa_act_find_code( $code ) && 0 === count( zsa_act_attempts( $code ) ), 'delete removes the code and its scores' );

// Nothing personal is stored: the plugin's own CREATE TABLE statements have only these columns, and the test
// tables above match them.
$src = file_get_contents( dirname( __DIR__, 2 ) . '/wordpress/zornscience-act-history/zornscience-act-history.php' );
preg_match_all( '/CREATE TABLE \{\$t\[\'(\w+)\'\]\} \((.*?)\) \$charset/s', $src, $m, PREG_SET_ORDER );
check( 2 === count( $m ), 'two tables are created' );
$want = array(
	'codes'    => array( 'code', 'created_at', 'last_used', 'attempts', 'pin_hash' ),
	'attempts' => array( 'id', 'code', 'created_at', 'section', 'mode', 'questions', 'correct', 'score', 'score_low', 'score_high', 'seconds' ),
);
foreach ( $m as $table ) {
	preg_match_all( '/^\s*([a-z_]+) (?:char|datetime|smallint|bigint|varchar|tinyint|mediumint)/m', $table[2], $c );
	check( $want[ $table[1] ] === $c[1], $table[1] . ' table columns: ' . implode( ', ', $c[1] ) );
	$test = array_column( $GLOBALS['wpdb']->get_results( 'PRAGMA table_info(wp_zsa_act_' . $table[1] . ')', ARRAY_A ), 'name' );
	check( $want[ $table[1] ] === $test, $table[1] . ' test table matches' );
}

echo "OK $checks\n";
