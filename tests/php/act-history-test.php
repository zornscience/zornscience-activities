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
	function get_error_message() { return $this->message; }
}
// Roles, and what the admin pages need.
$GLOBALS['zsa_roles'] = array( 'administrator' => new Fake_Role( array( 'manage_options' => true ) ) );
class Fake_Role {
	public $capabilities;
	function __construct( $caps ) { $this->capabilities = $caps; }
	function add_cap( $cap ) { $this->capabilities[ $cap ] = true; }
}
function get_role( $name ) { return isset( $GLOBALS['zsa_roles'][ $name ] ) ? $GLOBALS['zsa_roles'][ $name ] : null; }
function add_role( $name, $label, $caps ) { $GLOBALS['zsa_roles'][ $name ] = new Fake_Role( $caps ); $GLOBALS['zsa_role_labels'][ $name ] = $label; }
$GLOBALS['zsa_user'] = array( 'id' => 7, 'caps' => array( 'zsa_act_class_lists' ) );
function current_user_can( $cap ) { return in_array( $cap, $GLOBALS['zsa_user']['caps'], true ); }
function get_current_user_id() { return $GLOBALS['zsa_user']['id']; }
function wp_die( $m ) { throw new Exception( 'wp_die: ' . $m ); }
function check_admin_referer( $action ) { $GLOBALS['zsa_nonce_checked'] = $action; return 1; }
function wp_nonce_field( $action ) { echo '<input type="hidden" name="_wpnonce" value="nonce-' . $action . '">'; }
function esc_html( $v ) { return htmlspecialchars( (string) $v, ENT_QUOTES ); }
function esc_attr( $v ) { return htmlspecialchars( (string) $v, ENT_QUOTES ); }
function esc_html__( $v ) { return esc_html( $v ); }
function absint( $v ) { return abs( (int) $v ); }
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
	check( 1 !== preg_match( '/^\d+E\d+$/', $c ), "random code $c cannot be read as a number" );
	$p = zsa_act_random_pin();
	check( $p === zsa_act_clean_pin( $p ) && '0' !== $p[0], "random PIN $p is valid and does not start with 0" );
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
check( ZSA_ACT_VERSION === get_option( 'zsa_act_db_version' ) && 365 === zsa_act_settings()['retention_days'], 'upgrade records the version and moves 400 days to a year' );
$GLOBALS['zsa_dbdelta'] = array();
zsa_act_maybe_upgrade();
check( array() === $GLOBALS['zsa_dbdelta'], 'no second upgrade' );
update_option( 'zsa_act_settings', array( 'retention_days' => 200 ) );
update_option( 'zsa_act_db_version', '1.0.0' );
zsa_act_maybe_upgrade();
check( 200 === zsa_act_settings()['retention_days'], 'a setting someone chose is kept' );
update_option( 'zsa_act_settings', array() );

// Upgrading also adds the ACT Practice teacher role (class lists only) and lets administrators make class lists.
check( array( 'read' => true, 'zsa_act_class_lists' => true ) === get_role( 'zsa_act_teacher' )->capabilities, 'teacher role can read and make class lists, nothing else' );
check( 'ACT Practice teacher' === $GLOBALS['zsa_role_labels']['zsa_act_teacher'], 'teacher role name' );
check( ! empty( get_role( 'administrator' )->capabilities['zsa_act_class_lists'] ), 'administrators can make class lists' );

// Class lists: a teacher makes codes and PINs ahead of time.
reset_limits();
$before = (int) $GLOBALS['wpdb']->get_var( 'SELECT COUNT(*) FROM wp_zsa_act_codes' );
foreach ( array( 0, -3, ZSA_ACT_CLASS_MAX + 1 ) as $n ) {
	check( 400 === status( zsa_act_make_class_list( $n, 7 ) ), "class list of $n is refused" );
}
$list = zsa_act_make_class_list( 25, 7 );
check( is_array( $list ) && 25 === count( $list ), 'class list of 25' );
check( 25 === count( array_unique( array_column( $list, 'code' ) ) ), 'class list codes are all different' );
check( $before + 25 === (int) $GLOBALS['wpdb']->get_var( 'SELECT COUNT(*) FROM wp_zsa_act_codes' ), 'class list saved 25 codes' );
update_option( 'zsa_act_settings', array( 'limit_lookup' => 1000 ) );
foreach ( $list as $r ) {
	check( $r['pin'] === zsa_act_clean_pin( $r['pin'] ) && '0' !== $r['pin'][0], 'class PIN is four digits, not starting with 0' );
	$row = zsa_act_find_code( $r['code'] );
	check( false === strpos( $row['pin_hash'], $r['pin'] ) && password_verify( $r['pin'], $row['pin_hash'] ), 'class PIN stored as a hash only' );
	check( 200 === status( open_code( $r['code'], $r['pin'] ) ), 'each class code opens with its own PIN' );
}
check( 403 === status( open_code( $list[0]['code'], $list[1]['pin'] === $list[0]['pin'] ? $wrong : $list[1]['pin'] ) ), "a classmate's PIN does not open a code" );
update_option( 'zsa_act_settings', array( 'limit_class' => 30 ) );
check( 429 === status( zsa_act_make_class_list( 6, 7 ) ), 'over the hourly limit for one teacher' );
check( $before + 25 === (int) $GLOBALS['wpdb']->get_var( 'SELECT COUNT(*) FROM wp_zsa_act_codes' ), 'nothing made over the limit' );
check( 5 === count( zsa_act_make_class_list( 5, 7 ) ), 'up to the limit is fine' );
check( 6 === count( zsa_act_make_class_list( 6, 8 ) ), "another teacher's limit is separate" );
update_option( 'zsa_act_settings', array() );

// The CSV file: a header, then the code in the first column and the PIN in the second.
$csv = zsa_act_class_csv( $list );
$lines = explode( "\r\n", $csv );
check( 'Code,PIN' === $lines[0] && 27 === count( $lines ) && '' === $lines[26], 'CSV has a header and 25 rows' );
foreach ( $list as $i => $r ) {
	check( $r['code'] . ',' . $r['pin'] === $lines[ $i + 1 ], 'CSV row ' . ( $i + 1 ) );
}

// The PDF: well formed (every cross-reference offset points at its object), the ZornScience logo and name, every
// code and PIN, the name columns, and the ACT notice and a page number on every page.
function pdf_ok( $pdf, $rows, $class ) {
	check( 0 === strpos( $pdf, '%PDF-1.4' ) && "%%EOF\n" === substr( $pdf, -6 ), 'PDF header and end' );
	preg_match( '/startxref\n(\d+)\n/', $pdf, $sx );
	check( 0 === strpos( substr( $pdf, (int) $sx[1] ), "xref\n0 " ), 'startxref points at the table' );
	preg_match_all( '/^(\d{10}) 00000 n $/m', $pdf, $offs );
	foreach ( $offs[1] as $i => $off ) {
		check( 0 === strpos( substr( $pdf, (int) $off ), ( $i + 1 ) . ' 0 obj' ), 'xref offset for object ' . ( $i + 1 ) );
	}
	preg_match( '/\/Size (\d+)/', $pdf, $size );
	check( count( $offs[1] ) + 1 === (int) $size[1], 'trailer size' );
	preg_match_all( '/<< \/Length (\d+) >>\nstream\n/', $pdf, $streams, PREG_OFFSET_CAPTURE );
	foreach ( $streams[1] as $i => $len ) {
		$start = $streams[0][ $i ][1] + strlen( $streams[0][ $i ][0] );
		check( "\nendstream" === substr( $pdf, $start + (int) $len[0], 10 ), 'stream length ' . $i );
	}
	$logo = file_get_contents( dirname( __DIR__, 2 ) . '/wordpress/zornscience-act-history/zornscience-logo.jpg' );
	check( false !== strpos( $pdf, "/Filter /DCTDecode /Length " . strlen( $logo ) . " >>\nstream\n" . $logo . "\nendstream" ), 'the logo is embedded' );
	preg_match( '/\/Type \/Pages \/Kids \[[^\]]*\] \/Count (\d+)/', $pdf, $count );
	$pages = (int) $count[1];
	check( $pages === substr_count( $pdf, '/Im1 Do' ), 'logo on every page' );
	check( $pages === substr_count( $pdf, '(ZornScience) Tj' ), 'ZornScience on every page' );
	check( $pages === substr_count( $pdf, '(Practice tool by ZornScience. ACT is a registered trademark of ACT Education Corp. This tool is not' ), 'ACT notice on every page' );
	check( $pages === substr_count( $pdf, '(Last name) Tj' ) && $pages === substr_count( $pdf, '(First name) Tj' ), 'name columns on every page' );
	for ( $p = 1; $p <= $pages; $p++ ) {
		check( false !== strpos( $pdf, "(Page $p of $pages) Tj" ), "page $p of $pages" );
	}
	foreach ( $rows as $i => $r ) {
		check( 1 === substr_count( $pdf, '(' . $r['code'] . ') Tj' ) && false !== strpos( $pdf, '(' . $r['pin'] . ') Tj' ) && false !== strpos( $pdf, '(' . ( $i + 1 ) . ') Tj' ), 'row ' . ( $i + 1 ) . ' in the PDF' );
	}
	if ( '' !== $class ) {
		check( false !== strpos( $pdf, '(' . zsa_act_pdf_text( $class ) . ') Tj' ), 'class name in the PDF' );
	}
	return $pages;
}
$pdf = zsa_act_class_pdf( $list, 'Period 3 (Room 204) \\ Chem', 'October 24, 2026', 365 );
check( 2 === pdf_ok( $pdf, $list, 'Period 3 (Room 204) \\ Chem' ), '25 students fit on 2 pages' );
check( false !== strpos( $pdf, '(Period 3 \\(Room 204\\) \\\\ Chem) Tj' ), 'parentheses and backslashes are escaped' );
check( false !== strpos( $pdf, '(October 24, 2026) Tj' ), 'the date' );
check( false !== strpos( $pdf, 'not used for a year is' ), 'says codes last a year' );
check( 1 === pdf_ok( zsa_act_class_pdf( array_slice( $list, 0, 1 ), '', 'October 24, 2026', 200 ), array_slice( $list, 0, 1 ), '' ), 'one student, one page' );
check( false !== strpos( zsa_act_class_pdf( array_slice( $list, 0, 1 ), '', 'x', 200 ), '200 days' ), 'another retention length is spelled out' );
$hundred = array();
for ( $i = 0; $i < ZSA_ACT_CLASS_MAX; $i++ ) {
	$hundred[] = array( 'code' => zsa_act_random_code(), 'pin' => zsa_act_random_pin() );
}
$hundred = array_values( array_intersect_key( $hundred, array_unique( array_column( $hundred, 'code' ) ) ) );
check( pdf_ok( zsa_act_class_pdf( $hundred, 'Señora Pérez’s class', 'x', 365 ), $hundred, 'Señora Pérez’s class' ) >= 4, 'a long list fills several pages' );
check( false !== strpos( zsa_act_pdf_text( 'Señora Pérez’s class' ), "Se\xF1ora P\xE9rez\x92s" ), 'accented letters and curly quotes use the fonts\' encoding' );
foreach ( zsa_act_pdf_wrap( str_repeat( 'Practice codes and PINs ', 40 ), 10, 504 ) as $l ) {
	check( zsa_act_pdf_width( $l, 10 ) <= 504, 'wrapped line fits' );
}

// The ACT Class Codes page: only for teachers and administrators; both downloads come from the one list.
function class_page( $post ) {
	$_POST = $post;
	ob_start();
	try { zsa_act_class_page(); } finally { $html = ob_get_clean(); $_POST = array(); }
	return $html;
}
$html = class_page( array() );
check( false !== strpos( $html, 'name="count"' ) && false !== strpos( $html, 'max="' . ZSA_ACT_CLASS_MAX . '"' ) && false === strpos( $html, 'data:' ), 'the form, with no list yet' );
$GLOBALS['zsa_user']['caps'] = array( 'read' );
$denied = false;
try { class_page( array() ); } catch ( Exception $e ) { $denied = 0 === strpos( $e->getMessage(), 'wp_die' ); }
check( $denied, 'a user without the role cannot open the page' );
$GLOBALS['zsa_user'] = array( 'id' => 9, 'caps' => array( 'zsa_act_class_lists' ) );
$before = (int) $GLOBALS['wpdb']->get_var( 'SELECT COUNT(*) FROM wp_zsa_act_codes' );
$html = class_page( array( 'zsa_act_action' => 'class', 'count' => '12', 'class_name' => 'Period 3 Chemistry' ) );
check( 'zsa_act_class' === $GLOBALS['zsa_nonce_checked'], 'the form is checked with its nonce' );
check( $before + 12 === (int) $GLOBALS['wpdb']->get_var( 'SELECT COUNT(*) FROM wp_zsa_act_codes' ), 'the page made 12 codes' );
check( 1 === preg_match( '/download="act-class-codes-period-3-chemistry-\d{4}-\d\d-\d\d\.csv" href="data:text\/csv;base64,([A-Za-z0-9+\/=]+)"/', $html, $c ), 'CSV download link' );
check( 1 === preg_match( '/download="act-class-codes-period-3-chemistry-\d{4}-\d\d-\d\d\.pdf" href="data:application\/pdf;base64,([A-Za-z0-9+\/=]+)"/', $html, $p ), 'PDF download link' );
$rows = array_map( function ( $l ) { list( $code, $pin ) = explode( ',', $l ); return array( 'code' => $code, 'pin' => $pin ); }, array_slice( array_filter( explode( "\r\n", base64_decode( $c[1] ) ) ), 1 ) );
check( 12 === count( $rows ), 'the CSV has the 12 codes' );
pdf_ok( base64_decode( $p[1] ), $rows, 'Period 3 Chemistry' );
foreach ( $rows as $r ) {
	check( 200 === status( open_code( $r['code'], $r['pin'] ) ) && false !== strpos( $html, '<code>' . $r['code'] . '</code>' ), 'the downloads and the page show the same working codes and PINs' );
}
$html = class_page( array( 'zsa_act_action' => 'class', 'count' => '500', 'class_name' => '' ) );
check( false !== strpos( $html, 'notice-error' ) && false === strpos( $html, 'data:' ), 'too many students shows an error and no list' );
update_option( 'zsa_act_settings', array( 'enabled' => 0 ) );
check( false !== strpos( class_page( array() ), 'Practice codes are turned off' ), 'warns when codes are off' );
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
