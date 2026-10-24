<?php
/**
 * Plugin Name: ZornScience ACT Practice History
 * Description: Saves ACT Practice scores under anonymous six-character practice codes, each with a four-digit PIN, so students can see how their scores change over time without making an account. Stores no names, emails, or IP addresses.
 * Version: 1.2.0
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Author: ZornScience
 * License: GPL-2.0-or-later
 * Text Domain: zornscience-act-history
 *
 * How it works: the ACT Practice page (activities.zornscience.org/act/) calls three REST routes under
 * /wp-json/zsa-act/v1/. A student gets a new random code and PIN, or enters a code and PIN they already have; each
 * finished section is saved under that code with its date, section, mode, number correct, and estimated score. A
 * history opens, and a score saves, only when the code and PIN match, so a student who mistypes a code cannot add to
 * or see someone else's history. PINs are stored only as one-way hashes. Wrong PINs lock a code for an hour after ten
 * tries, and every route is rate limited. Teachers can also make a class list of codes and PINs ahead of time
 * (ACT Class Codes in the WordPress menu), downloaded once as a CSV file and a ZornScience PDF.
 */

defined( 'ABSPATH' ) || exit;

define( 'ZSA_ACT_VERSION', '1.2.0' );
define( 'ZSA_ACT_NS', 'zsa-act/v1' );
// Code alphabet: capital letters and digits without look-alikes (no I, O, 0 or 1). 32 symbols, so 32^6, about a
// billion, possible codes.
define( 'ZSA_ACT_ALPHABET', 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' );
define( 'ZSA_ACT_SECTIONS', 'english,math,reading,science,composite' );
define( 'ZSA_ACT_MODES', 'one,mixed,full,fullact' );
define( 'ZSA_ACT_MAX_ATTEMPTS', 1000 );
// Class lists: the most codes one list can make, and the capability that allows making them (administrators and the
// ACT Practice teacher role have it).
define( 'ZSA_ACT_CLASS_MAX', 100 );
define( 'ZSA_ACT_CAP', 'zsa_act_class_lists' );

/** Default settings, merged with what the admin page saves. */
function zsa_act_settings() {
	$defaults = array(
		'enabled'        => 1,
		'origins'        => 'https://activities.zornscience.org',
		// Codes (with their PINs and scores) not used for this many days are deleted once a day.
		'retention_days' => 365,
		// Wrong PINs allowed for one code in an hour before it locks for the rest of that hour.
		'pin_tries'      => 10,
		// Requests allowed per hour from one network address, by kind.
		'limit_new'      => 20,
		'limit_lookup'   => 60,
		'limit_save'     => 120,
		// Codes one teacher's account can make in an hour with class lists.
		'limit_class'    => 500,
	);
	$saved = get_option( 'zsa_act_settings', array() );
	return array_merge( $defaults, is_array( $saved ) ? $saved : array() );
}

function zsa_act_tables() {
	global $wpdb;
	return array(
		'codes'    => $wpdb->prefix . 'zsa_act_codes',
		'attempts' => $wpdb->prefix . 'zsa_act_attempts',
	);
}

// ---------- Install, uninstall, cleanup ----------

register_activation_hook( __FILE__, 'zsa_act_activate' );
add_action( 'plugins_loaded', 'zsa_act_maybe_upgrade' );
register_deactivation_hook( __FILE__, 'zsa_act_deactivate' );
add_action( 'zsa_act_cleanup', 'zsa_act_cleanup' );

function zsa_act_activate() {
	global $wpdb;
	require_once ABSPATH . 'wp-admin/includes/upgrade.php';
	$t       = zsa_act_tables();
	$charset = $wpdb->get_charset_collate();
	dbDelta(
		"CREATE TABLE {$t['codes']} (
			code char(6) NOT NULL,
			created_at datetime NOT NULL,
			last_used datetime NOT NULL,
			attempts smallint(5) unsigned NOT NULL DEFAULT 0,
			pin_hash varchar(255) NOT NULL DEFAULT '',
			PRIMARY KEY  (code),
			KEY last_used (last_used)
		) $charset;"
	);
	dbDelta(
		"CREATE TABLE {$t['attempts']} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			code char(6) NOT NULL,
			created_at datetime NOT NULL,
			section varchar(12) NOT NULL,
			mode varchar(8) NOT NULL,
			questions smallint(5) unsigned NOT NULL,
			correct smallint(5) unsigned NOT NULL,
			score tinyint(3) unsigned DEFAULT NULL,
			score_low tinyint(3) unsigned DEFAULT NULL,
			score_high tinyint(3) unsigned DEFAULT NULL,
			seconds mediumint(8) unsigned NOT NULL DEFAULT 0,
			PRIMARY KEY  (id),
			KEY code_date (code, created_at)
		) $charset;"
	);
	zsa_act_roles();
	update_option( 'zsa_act_db_version', ZSA_ACT_VERSION );
	if ( ! wp_next_scheduled( 'zsa_act_cleanup' ) ) {
		wp_schedule_event( time() + HOUR_IN_SECONDS, 'daily', 'zsa_act_cleanup' );
	}
}

/**
 * The ACT Practice teacher role can make class lists and nothing else (besides reading the site, like a subscriber).
 * Administrators can make them too.
 */
function zsa_act_roles() {
	if ( ! get_role( 'zsa_act_teacher' ) ) {
		add_role(
			'zsa_act_teacher',
			'ACT Practice teacher',
			array(
				'read'      => true,
				ZSA_ACT_CAP => true,
			)
		);
	}
	$admin = get_role( 'administrator' );
	if ( $admin ) {
		$admin->add_cap( ZSA_ACT_CAP );
	}
}

/**
 * Uploading a new version replaces the files without running the activation hook, so the tables are brought up to
 * date (dbDelta adds the PIN column) on the first page load after an update. Settings saved with the old default of
 * 400 days move to the new default of a year.
 */
function zsa_act_maybe_upgrade() {
	if ( get_option( 'zsa_act_db_version' ) === ZSA_ACT_VERSION ) {
		return;
	}
	zsa_act_activate();
	$saved = get_option( 'zsa_act_settings', array() );
	if ( is_array( $saved ) && isset( $saved['retention_days'] ) && 400 === (int) $saved['retention_days'] ) {
		$saved['retention_days'] = 365;
		update_option( 'zsa_act_settings', $saved );
	}
}

function zsa_act_deactivate() {
	wp_clear_scheduled_hook( 'zsa_act_cleanup' );
}

/** Codes (with their PINs and scores) not used since the retention cutoff (a year by default). */
function zsa_act_inactive_codes() {
	global $wpdb;
	$t      = zsa_act_tables();
	$days   = max( 30, (int) zsa_act_settings()['retention_days'] );
	$cutoff = gmdate( 'Y-m-d H:i:s', time() - $days * DAY_IN_SECONDS );
	return $wpdb->get_col( $wpdb->prepare( "SELECT code FROM {$t['codes']} WHERE last_used < %s", $cutoff ) );
}

/** Deletes inactive codes, their PINs and their scores. Runs once a day, and from Delete inactive codes now. */
function zsa_act_cleanup() {
	$old = zsa_act_inactive_codes();
	foreach ( $old as $code ) {
		zsa_act_delete_code( $code );
	}
	return count( $old );
}

function zsa_act_delete_code( $code ) {
	global $wpdb;
	$t = zsa_act_tables();
	$wpdb->delete( $t['attempts'], array( 'code' => $code ), array( '%s' ) );
	return (bool) $wpdb->delete( $t['codes'], array( 'code' => $code ), array( '%s' ) );
}

// ---------- Codes ----------

/** A code in canonical form (capitals, no spaces or dashes), or null if it is not a valid code. */
function zsa_act_clean_code( $raw ) {
	$code = strtoupper( preg_replace( '/[\s\-]+/', '', (string) $raw ) );
	if ( strlen( $code ) !== 6 || strspn( $code, ZSA_ACT_ALPHABET ) !== 6 ) {
		return null;
	}
	return $code;
}

/**
 * A random code. Codes like 234E56, which a spreadsheet would read as a number in scientific notation, are skipped so
 * a class list's CSV file opens correctly.
 */
function zsa_act_random_code() {
	do {
		$code = '';
		for ( $i = 0; $i < 6; $i++ ) {
			$code .= ZSA_ACT_ALPHABET[ random_int( 0, strlen( ZSA_ACT_ALPHABET ) - 1 ) ];
		}
	} while ( 1 === preg_match( '/^\d+E\d+$/', $code ) );
	return $code;
}

/** A random PIN from 1000 to 9999. None starts with 0, which a spreadsheet would drop. */
function zsa_act_random_pin() {
	return (string) random_int( 1000, 9999 );
}

function zsa_act_hash_pin( $pin ) {
	return password_hash( $pin, PASSWORD_DEFAULT );
}

/** A PIN in canonical form (four digits), or null. */
function zsa_act_clean_pin( $raw ) {
	$pin = preg_replace( '/\s+/', '', (string) $raw );
	return 1 === preg_match( '/^\d{4}$/', $pin ) ? $pin : null;
}

function zsa_act_now() {
	return gmdate( 'Y-m-d H:i:s' );
}

function zsa_act_iso( $mysql_utc ) {
	return str_replace( ' ', 'T', $mysql_utc ) . 'Z';
}

// ---------- REST API ----------

add_action( 'rest_api_init', 'zsa_act_routes' );

function zsa_act_routes() {
	$code = '(?P<code>[A-Za-z0-9]{6})';
	register_rest_route(
		ZSA_ACT_NS,
		'/codes',
		array(
			'methods'             => 'POST',
			'callback'            => 'zsa_act_rest_new_code',
			'permission_callback' => '__return_true',
		)
	);
	// POST, not GET, so the PIN travels in the request body and never appears in a web address or a server log.
	register_rest_route(
		ZSA_ACT_NS,
		'/codes/' . $code . '/open',
		array(
			'methods'             => 'POST',
			'callback'            => 'zsa_act_rest_history',
			'permission_callback' => '__return_true',
		)
	);
	register_rest_route(
		ZSA_ACT_NS,
		'/codes/' . $code . '/attempts',
		array(
			'methods'             => 'POST',
			'callback'            => 'zsa_act_rest_save',
			'permission_callback' => '__return_true',
		)
	);
}

/** Common checks for every route: the feature is on, the request is not over its hourly limit, and nothing is cached. */
function zsa_act_gate( $kind ) {
	if ( ! defined( 'DONOTCACHEPAGE' ) ) {
		define( 'DONOTCACHEPAGE', true );
	}
	$s = zsa_act_settings();
	if ( empty( $s['enabled'] ) ) {
		return new WP_Error( 'zsa_act_off', 'Practice codes are turned off.', array( 'status' => 503 ) );
	}
	if ( ! zsa_act_rate_ok( $kind, (int) $s[ 'limit_' . $kind ] ) ) {
		return new WP_Error( 'zsa_act_busy', 'Too many requests. Try again later.', array( 'status' => 429 ) );
	}
	return true;
}

/**
 * Counts requests per network address and kind for one hour. The address itself is never stored: the counter's
 * name is a salted hash of it, and the counter disappears after an hour.
 */
function zsa_act_rate_ok( $kind, $limit ) {
	$ip  = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
	$key = 'zsa_act_rl_' . $kind . '_' . substr( hash_hmac( 'sha256', $ip, wp_salt( 'nonce' ) ), 0, 24 );
	$n   = (int) get_transient( $key );
	if ( $n >= $limit ) {
		return false;
	}
	set_transient( $key, $n + 1, HOUR_IN_SECONDS );
	return true;
}

function zsa_act_response( $data, $status = 200 ) {
	$r = new WP_REST_Response( $data, $status );
	$r->header( 'Cache-Control', 'no-store, private' );
	return $r;
}

function zsa_act_rest_new_code( $request ) {
	$ok = zsa_act_gate( 'new' );
	if ( true !== $ok ) {
		return $ok;
	}
	$pin  = zsa_act_random_pin();
	$code = zsa_act_create_code( $pin );
	if ( ! $code ) {
		return new WP_Error( 'zsa_act_db', 'Could not create a code. Try again.', array( 'status' => 500 ) );
	}
	// The only time the PIN is ever sent: the page shows it once for the student to write down.
	return zsa_act_response(
		array(
			'code' => $code,
			'pin'  => $pin,
		),
		201
	);
}

/** Saves a new random code with this PIN's hash. Returns the code, or null if five tries all collided. */
function zsa_act_create_code( $pin ) {
	global $wpdb;
	$t    = zsa_act_tables();
	$now  = zsa_act_now();
	$hash = zsa_act_hash_pin( $pin );
	for ( $try = 0; $try < 5; $try++ ) {
		$code     = zsa_act_random_code();
		$inserted = $wpdb->insert(
			$t['codes'],
			array(
				'code'       => $code,
				'created_at' => $now,
				'last_used'  => $now,
				'attempts'   => 0,
				'pin_hash'   => $hash,
			),
			array( '%s', '%s', '%s', '%d', '%s' )
		);
		if ( $inserted ) {
			return $code;
		}
	}
	return null;
}

function zsa_act_find_code( $code ) {
	global $wpdb;
	$t = zsa_act_tables();
	return $wpdb->get_row( $wpdb->prepare( "SELECT code, created_at, attempts, pin_hash FROM {$t['codes']} WHERE code = %s", $code ), ARRAY_A );
}

function zsa_act_attempts( $code ) {
	global $wpdb;
	$t    = zsa_act_tables();
	$rows = $wpdb->get_results(
		$wpdb->prepare(
			"SELECT created_at, section, mode, questions, correct, score, score_low, score_high, seconds FROM {$t['attempts']} WHERE code = %s ORDER BY created_at ASC, id ASC LIMIT %d",
			$code,
			ZSA_ACT_MAX_ATTEMPTS
		),
		ARRAY_A
	);
	return array_map(
		function ( $r ) {
			return array(
				'date'      => zsa_act_iso( $r['created_at'] ),
				'section'   => $r['section'],
				'mode'      => $r['mode'],
				'questions' => (int) $r['questions'],
				'correct'   => (int) $r['correct'],
				'score'     => null === $r['score'] ? null : (int) $r['score'],
				'low'       => null === $r['score_low'] ? null : (int) $r['score_low'],
				'high'      => null === $r['score_high'] ? null : (int) $r['score_high'],
				'seconds'   => (int) $r['seconds'],
			);
		},
		$rows ? $rows : array()
	);
}

/**
 * Checks a code and PIN from the page. Returns the code's row, or a WP_Error: 403 when they do not match (the same
 * answer for an unknown code and a wrong PIN, so it never tells anyone which codes exist), or 429 when the code has
 * had too many wrong PINs in the last hour.
 */
function zsa_act_unlock( $raw_code, $raw_pin ) {
	$nope = new WP_Error( 'zsa_act_mismatch', 'That code and PIN do not match.', array( 'status' => 403 ) );
	$code = zsa_act_clean_code( $raw_code );
	$pin  = zsa_act_clean_pin( $raw_pin );
	$row  = $code ? zsa_act_find_code( $code ) : null;
	if ( ! $row ) {
		return $nope;
	}
	$key   = 'zsa_act_pin_' . $code;
	$wrong = (int) get_transient( $key );
	if ( $wrong >= (int) zsa_act_settings()['pin_tries'] ) {
		return new WP_Error( 'zsa_act_locked', 'Too many wrong PINs for this code. Try again in an hour.', array( 'status' => 429 ) );
	}
	if ( ! $pin || '' === $row['pin_hash'] || ! password_verify( $pin, $row['pin_hash'] ) ) {
		set_transient( $key, $wrong + 1, HOUR_IN_SECONDS );
		return $nope;
	}
	return $row;
}

function zsa_act_pin_of( $request ) {
	$p = $request->get_json_params();
	return is_array( $p ) && isset( $p['pin'] ) && is_scalar( $p['pin'] ) ? (string) $p['pin'] : '';
}

function zsa_act_rest_history( $request ) {
	global $wpdb;
	$ok = zsa_act_gate( 'lookup' );
	if ( true !== $ok ) {
		return $ok;
	}
	$row = zsa_act_unlock( $request['code'], zsa_act_pin_of( $request ) );
	if ( is_wp_error( $row ) ) {
		return $row;
	}
	$code = $row['code'];
	$t    = zsa_act_tables();
	$wpdb->update( $t['codes'], array( 'last_used' => zsa_act_now() ), array( 'code' => $code ), array( '%s' ), array( '%s' ) );
	return zsa_act_response(
		array(
			'code'     => $code,
			'created'  => zsa_act_iso( $row['created_at'] ),
			'attempts' => zsa_act_attempts( $code ),
		)
	);
}

/** Checks one saved attempt from the page. Returns the row to insert, or a WP_Error. */
function zsa_act_validate_attempt( $p ) {
	$bad = function ( $why ) {
		return new WP_Error( 'zsa_act_invalid', $why, array( 'status' => 400 ) );
	};
	if ( ! is_array( $p ) ) {
		return $bad( 'Expected a JSON object.' );
	}
	$section = isset( $p['section'] ) ? (string) $p['section'] : '';
	$mode    = isset( $p['mode'] ) ? (string) $p['mode'] : '';
	if ( ! in_array( $section, explode( ',', ZSA_ACT_SECTIONS ), true ) ) {
		return $bad( 'Unknown section.' );
	}
	if ( ! in_array( $mode, explode( ',', ZSA_ACT_MODES ), true ) ) {
		return $bad( 'Unknown mode.' );
	}
	$int = function ( $key, $min, $max, $nullable ) use ( $p ) {
		if ( ! array_key_exists( $key, $p ) || null === $p[ $key ] ) {
			return $nullable ? null : false;
		}
		$v = $p[ $key ];
		if ( ! is_int( $v ) && ! ( is_string( $v ) && ctype_digit( $v ) ) ) {
			return false;
		}
		$v = (int) $v;
		return ( $v < $min || $v > $max ) ? false : $v;
	};
	$questions = $int( 'questions', 1, 200, false );
	$correct   = $int( 'correct', 0, 200, false );
	$score     = $int( 'score', 1, 36, true );
	$low       = $int( 'low', 1, 36, true );
	$high      = $int( 'high', 1, 36, true );
	$seconds   = $int( 'seconds', 0, 86400, false );
	if ( false === $questions || false === $correct || false === $score || false === $low || false === $high || false === $seconds ) {
		return $bad( 'A number is missing or out of range.' );
	}
	if ( $correct > $questions ) {
		return $bad( 'More correct answers than questions.' );
	}
	if ( null !== $low && null !== $high && $low > $high ) {
		return $bad( 'The score range is backward.' );
	}
	return array(
		'section'    => $section,
		'mode'       => $mode,
		'questions'  => $questions,
		'correct'    => $correct,
		'score'      => $score,
		'score_low'  => $low,
		'score_high' => $high,
		'seconds'    => $seconds,
	);
}

function zsa_act_rest_save( $request ) {
	global $wpdb;
	$ok = zsa_act_gate( 'save' );
	if ( true !== $ok ) {
		return $ok;
	}
	$row = zsa_act_unlock( $request['code'], zsa_act_pin_of( $request ) );
	if ( is_wp_error( $row ) ) {
		return $row;
	}
	$code = $row['code'];
	if ( (int) $row['attempts'] >= ZSA_ACT_MAX_ATTEMPTS ) {
		return new WP_Error( 'zsa_act_full', 'This code has reached its limit of saved attempts.', array( 'status' => 409 ) );
	}
	$attempt = zsa_act_validate_attempt( $request->get_json_params() );
	if ( is_wp_error( $attempt ) ) {
		return $attempt;
	}
	$t   = zsa_act_tables();
	$now = zsa_act_now();
	$wpdb->insert(
		$t['attempts'],
		array_merge(
			array(
				'code'       => $code,
				'created_at' => $now,
			),
			$attempt
		)
	);
	$id = (int) $wpdb->insert_id;
	if ( ! $id ) {
		return new WP_Error( 'zsa_act_db', 'Could not save. Try again.', array( 'status' => 500 ) );
	}
	$wpdb->query( $wpdb->prepare( "UPDATE {$t['codes']} SET attempts = attempts + 1, last_used = %s WHERE code = %s", $now, $code ) );
	return zsa_act_response( array( 'saved' => true ), 201 );
}

/**
 * CORS for this plugin's routes only: allow the ACT Practice site (and any other origin listed in the settings),
 * without cookies. WordPress's own CORS headers would echo any origin and allow credentials, so they are replaced.
 */
add_filter( 'rest_pre_serve_request', 'zsa_act_cors', 20, 4 );

function zsa_act_cors( $served, $result, $request, $server ) {
	if ( 0 !== strpos( $request->get_route(), '/' . ZSA_ACT_NS ) ) {
		return $served;
	}
	$origin = get_http_origin();
	header_remove( 'Access-Control-Allow-Credentials' );
	header_remove( 'Access-Control-Allow-Origin' );
	if ( zsa_act_origin_allowed( $origin ) ) {
		header( 'Access-Control-Allow-Origin: ' . esc_url_raw( $origin ) );
		header( 'Access-Control-Allow-Methods: POST, OPTIONS' );
		header( 'Access-Control-Allow-Headers: Content-Type' );
		header( 'Vary: Origin', false );
	}
	return $served;
}

/** Whether a browser origin (such as https://activities.zornscience.org) is in the allowed sites setting. */
function zsa_act_origin_allowed( $origin ) {
	$allowed = array_filter( array_map( 'trim', preg_split( '/[\s,]+/', (string) zsa_act_settings()['origins'] ) ) );
	return is_string( $origin ) && '' !== $origin && in_array( rtrim( $origin, '/' ), array_map( function ( $o ) { return rtrim( $o, '/' ); }, $allowed ), true );
}

// ---------- Class lists ----------

/**
 * Makes $count new codes, each with its own random PIN, for a teacher to hand out. Returns a list of
 * array( 'code' => ..., 'pin' => ... ), or a WP_Error. The PINs exist only in what this returns: the database keeps
 * their hashes, as for any other code, and no names or class details are stored.
 */
function zsa_act_make_class_list( $count, $user_id ) {
	$count = (int) $count;
	if ( $count < 1 || $count > ZSA_ACT_CLASS_MAX ) {
		return new WP_Error( 'zsa_act_count', sprintf( 'Choose from 1 to %d students.', ZSA_ACT_CLASS_MAX ), array( 'status' => 400 ) );
	}
	// At most limit_class codes an hour for one teacher's account.
	$key  = 'zsa_act_class_' . (int) $user_id;
	$made = (int) get_transient( $key );
	if ( $made + $count > (int) zsa_act_settings()['limit_class'] ) {
		return new WP_Error( 'zsa_act_busy', 'That is more codes than one account can make in an hour. Try again later, or make a shorter list.', array( 'status' => 429 ) );
	}
	if ( function_exists( 'set_time_limit' ) ) {
		set_time_limit( 120 );
	}
	$rows = array();
	for ( $i = 0; $i < $count; $i++ ) {
		$pin  = zsa_act_random_pin();
		$code = zsa_act_create_code( $pin );
		if ( ! $code ) {
			break;
		}
		$rows[] = array(
			'code' => $code,
			'pin'  => $pin,
		);
	}
	set_transient( $key, $made + count( $rows ), HOUR_IN_SECONDS );
	if ( count( $rows ) < $count ) {
		foreach ( $rows as $r ) {
			zsa_act_delete_code( $r['code'] );
		}
		return new WP_Error( 'zsa_act_db', 'Could not make the codes. Try again.', array( 'status' => 500 ) );
	}
	return $rows;
}

/** The class list as a CSV file: a header row, then one row per student with the code and the PIN. */
function zsa_act_class_csv( $rows ) {
	$out = "Code,PIN\r\n";
	foreach ( $rows as $r ) {
		$out .= $r['code'] . ',' . $r['pin'] . "\r\n";
	}
	return $out;
}

/** "a year" for 365 days, otherwise "N days". */
function zsa_act_retention_words( $days ) {
	return 365 === (int) $days ? 'a year' : sprintf( '%d days', (int) $days );
}

/** Text for a PDF string: Windows-1252 (the built-in fonts' encoding), one line, with \ ( and ) escaped. */
function zsa_act_pdf_text( $text ) {
	$text = preg_replace( '/[\x00-\x1F\x7F]+/', ' ', (string) $text );
	$out  = function_exists( 'iconv' ) ? iconv( 'UTF-8', 'Windows-1252//TRANSLIT', $text ) : false;
	if ( false === $out ) {
		$out = preg_replace( '/[^\x20-\x7E]/', '?', $text );
	}
	return strtr(
		$out,
		array(
			'\\' => '\\\\',
			'('  => '\\(',
			')'  => '\\)',
		)
	);
}

/** Width in points of plain text in Helvetica (Helvetica-Bold is about 5% wider). */
function zsa_act_pdf_width( $text, $size ) {
	static $widths = null;
	if ( null === $widths ) {
		// Helvetica character widths for the characters from space (32) to tilde (126), per 1000 points.
		$widths = array_map( 'intval', explode( ',', '278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584' ) );
	}
	$sum = 0;
	$len = strlen( $text );
	for ( $i = 0; $i < $len; $i++ ) {
		$c    = ord( $text[ $i ] );
		$sum += ( $c >= 32 && $c <= 126 ) ? $widths[ $c - 32 ] : 556;
	}
	return $sum * $size / 1000;
}

/** Splits text into lines no wider than $max points. */
function zsa_act_pdf_wrap( $text, $size, $max ) {
	$lines = array();
	$line  = '';
	foreach ( preg_split( '/\s+/', trim( $text ) ) as $word ) {
		$try = '' === $line ? $word : $line . ' ' . $word;
		if ( '' !== $line && zsa_act_pdf_width( $try, $size ) > $max ) {
			$lines[] = $line;
			$line    = $word;
		} else {
			$line = $try;
		}
	}
	if ( '' !== $line ) {
		$lines[] = $line;
	}
	return $lines;
}

/**
 * The class list as a printable PDF (US Letter): the ZornScience logo and name, the class name and date, how students
 * use the codes, then a table with a row per student (number, code, PIN, and blank last name and first name columns
 * to fill in by hand), and the ACT trademark notice on every page. Written by hand with the PDF's built-in fonts, so
 * the plugin needs no PDF library.
 */
function zsa_act_class_pdf( $rows, $class_name, $date, $retention_days ) {
	$m      = 54;
	$right  = 612 - $m;
	$bottom = 70;
	$navy   = '0.043 0.165 0.357';
	$slate  = '0.200 0.255 0.333';
	$sky    = '0.933 0.957 1.000';
	$line   = '0.780 0.839 0.933';
	$cols   = array( 28, 92, 64, 160, 160 );
	$heads  = array( '#', 'Code', 'PIN', 'Last name', 'First name' );
	$row_h  = 26;
	$head_h = 22;
	$class  = trim( (string) $class_name );
	$legal  = 'Practice tool by ZornScience. ACT is a registered trademark of ACT Education Corp. This tool is not affiliated with or endorsed by ACT.';
	$how    = 'How students use these: go to activities.zornscience.org/act, choose a practice, select "Yes, I have a code and PIN," and type the code and PIN on their row. Their scores are saved under that code, and View my history shows them. Each student should keep their code and PIN private. A code that is not used for ' . zsa_act_retention_words( $retention_days ) . ' is deleted with its scores. The PINs cannot be looked up later, so keep this list somewhere safe.';

	$text = function ( $font, $size, $x, $y, $str, $color ) {
		return sprintf( "BT %s rg /%s %s Tf %.2F %.2F Td (%s) Tj ET\n", $color, $font, $size, $x, $y, zsa_act_pdf_text( $str ) );
	};
	$table_head = function ( $y ) use ( $m, $cols, $heads, $head_h, $navy, $text ) {
		$s = sprintf( "%s rg %.2F %.2F %.2F %.2F re f\n", $navy, $m, $y - $head_h, array_sum( $cols ), $head_h );
		$x = $m;
		foreach ( $cols as $i => $w ) {
			$s .= $text( 'F2', 10, $x + 6, $y - $head_h + 7, $heads[ $i ], '1 1 1' );
			$x += $w;
		}
		return $s;
	};

	// Lay out the pages: a content stream for each.
	$pages = array();
	$next  = 0;
	$total = count( $rows );
	do {
		$s = '';
		if ( ! $pages ) {
			$s .= sprintf( "q 46 0 0 44.3 %.2F 693.7 cm /Im1 Do Q\n", $m );
			$s .= $text( 'F2', 22, $m + 58, 717, 'ZornScience', $navy );
			$s .= $text( 'F1', 12, $m + 58, 699, 'ACT Practice class codes', $slate );
			$s .= $text( 'F1', 10, $right - zsa_act_pdf_width( $date, 10 ), 717, $date, $slate );
			$s .= sprintf( "%s RG 1.5 w %.2F 680 m %.2F 680 l S\n", $navy, $m, $right );
			$y  = 660;
			if ( '' !== $class ) {
				$s .= $text( 'F2', 14, $m, $y, $class, $navy );
				$y -= 22;
			}
			foreach ( zsa_act_pdf_wrap( $how, 10, $right - $m ) as $l ) {
				$s .= $text( 'F1', 10, $m, $y, $l, $slate );
				$y -= 14;
			}
			$y -= 6;
		} else {
			$s .= sprintf( "q 24 0 0 23.1 %.2F 714.9 cm /Im1 Do Q\n", $m );
			$s .= $text( 'F2', 12, $m + 32, 722, 'ZornScience', $navy );
			$s .= $text( 'F1', 10, $m + 32 + zsa_act_pdf_width( 'ZornScience', 12 ) * 1.05 + 8, 722, 'ACT Practice class codes' . ( '' !== $class ? ', ' . $class : '' ), $slate );
			$y  = 702;
		}
		$s   .= $table_head( $y );
		$y   -= $head_h;
		$top  = $y;
		while ( $next < $total && $y - $row_h >= $bottom ) {
			$r = $rows[ $next ];
			if ( 1 === $next % 2 ) {
				$s .= sprintf( "%s rg %.2F %.2F %.2F %.2F re f\n", $sky, $m, $y - $row_h, array_sum( $cols ), $row_h );
			}
			$s .= sprintf( "%s RG 0.5 w %.2F %.2F m %.2F %.2F l S\n", $line, $m, $y - $row_h, $right, $y - $row_h );
			$x  = $m;
			$s .= $text( 'F1', 10, $x + 6, $y - 17, (string) ( $next + 1 ), $slate );
			$x += $cols[0];
			$s .= $text( 'F3', 13, $x + 6, $y - 17.5, $r['code'], $navy );
			$x += $cols[1];
			$s .= $text( 'F3', 13, $x + 6, $y - 17.5, $r['pin'], $navy );
			$y -= $row_h;
			$next++;
		}
		// Column lines and the table's sides, from the header to the last row.
		$x = $m;
		foreach ( $cols as $w ) {
			$s .= sprintf( "%s RG 0.5 w %.2F %.2F m %.2F %.2F l S\n", $line, $x, $top, $x, $y );
			$x += $w;
		}
		$s      .= sprintf( "%s RG 0.5 w %.2F %.2F m %.2F %.2F l S\n", $line, $right, $top, $right, $y );
		$pages[] = $s;
	} while ( $next < $total );

	// Page numbers and the footer, now that the page count is known.
	$n = count( $pages );
	foreach ( $pages as $i => $s ) {
		$label = sprintf( 'Page %d of %d', $i + 1, $n );
		$s    .= sprintf( "%s RG 0.5 w %.2F 58 m %.2F 58 l S\n", $line, $m, $right );
		$y     = 46;
		foreach ( zsa_act_pdf_wrap( $legal, 7.5, $right - $m - 80 ) as $l ) {
			$s .= $text( 'F1', 7.5, $m, $y, $l, $slate );
			$y -= 9;
		}
		$s          .= $text( 'F1', 8, $right - zsa_act_pdf_width( $label, 8 ), 46, $label, $slate );
		$pages[ $i ] = $s;
	}

	// Objects: 1 catalog, 2 page tree, 3 to 5 fonts, 6 logo, 7 document info, then a page and its contents for each page.
	$logo    = (string) file_get_contents( __DIR__ . '/zornscience-logo.jpg' );
	$size    = getimagesizefromstring( $logo );
	$kids    = array();
	$objects = array(
		1 => '<< /Type /Catalog /Pages 2 0 R >>',
		3 => '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
		4 => '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
		5 => '<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold /Encoding /WinAnsiEncoding >>',
		6 => sprintf( "<< /Type /XObject /Subtype /Image /Width %d /Height %d /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length %d >>\nstream\n%s\nendstream", $size[0], $size[1], strlen( $logo ), $logo ),
		7 => '<< /Title (' . zsa_act_pdf_text( 'ACT Practice class codes' . ( '' !== $class ? ', ' . $class : '' ) ) . ') /Author (ZornScience) /Creator (ZornScience ACT Practice History) >>',
	);
	foreach ( $pages as $i => $stream ) {
		$page_id             = 8 + 2 * $i;
		$kids[]              = $page_id . ' 0 R';
		$objects[ $page_id ] = '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> /XObject << /Im1 6 0 R >> >> /Contents ' . ( $page_id + 1 ) . ' 0 R >>';
		$objects[ $page_id + 1 ] = sprintf( "<< /Length %d >>\nstream\n%s\nendstream", strlen( $stream ), $stream );
	}
	$objects[2] = '<< /Type /Pages /Kids [' . implode( ' ', $kids ) . '] /Count ' . count( $kids ) . ' >>';
	ksort( $objects );

	$pdf     = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
	$offsets = array();
	foreach ( $objects as $id => $body ) {
		$offsets[ $id ] = strlen( $pdf );
		$pdf           .= $id . " 0 obj\n" . $body . "\nendobj\n";
	}
	$xref = strlen( $pdf );
	$pdf .= 'xref' . "\n0 " . ( count( $objects ) + 1 ) . "\n0000000000 65535 f \n";
	foreach ( $offsets as $off ) {
		$pdf .= sprintf( "%010d 00000 n \n", $off );
	}
	$pdf .= 'trailer' . "\n<< /Size " . ( count( $objects ) + 1 ) . " /Root 1 0 R /Info 7 0 R >>\nstartxref\n" . $xref . "\n%%EOF\n";
	return $pdf;
}

// ---------- Admin page (Tools > ACT Practice History) ----------

add_action( 'admin_menu', 'zsa_act_admin_menu' );

function zsa_act_admin_menu() {
	add_management_page( 'ACT Practice History', 'ACT Practice History', 'manage_options', 'zsa-act-history', 'zsa_act_admin_page' );
	add_menu_page( 'ACT Class Codes', 'ACT Class Codes', ZSA_ACT_CAP, 'zsa-act-class-codes', 'zsa_act_class_page', 'dashicons-id-alt', 76 );
}

/** A data: address for a download link, so both files come from the one list without the PINs being kept anywhere. */
function zsa_act_data_url( $type, $bytes ) {
	return 'data:' . $type . ';base64,' . base64_encode( $bytes );
}

/**
 * ACT Class Codes: a teacher picks how many students (and, if they like, a class name for the top of the PDF) and
 * gets that many new codes and PINs, as a CSV file and a PDF. The files are made once, in this page, and the PINs are
 * not kept anywhere else, so the page asks the teacher to download both before leaving.
 */
function zsa_act_class_page() {
	if ( ! current_user_can( ZSA_ACT_CAP ) ) {
		wp_die( esc_html__( 'You do not have permission to view this page.', 'zornscience-act-history' ) );
	}
	$s       = zsa_act_settings();
	$request = wp_unslash( $_POST );
	$error   = '';
	$list    = null;
	$count   = 30;
	$class   = '';
	if ( isset( $request['zsa_act_action'] ) && 'class' === $request['zsa_act_action'] ) {
		check_admin_referer( 'zsa_act_class' );
		$count = absint( isset( $request['count'] ) ? $request['count'] : 0 );
		$class = substr( sanitize_text_field( isset( $request['class_name'] ) ? $request['class_name'] : '' ), 0, 60 );
		$rows  = zsa_act_make_class_list( $count, get_current_user_id() );
		if ( is_wp_error( $rows ) ) {
			$error = $rows->get_error_message();
		} else {
			$date = function_exists( 'wp_date' ) ? wp_date( 'F j, Y' ) : gmdate( 'F j, Y' );
			$slug = trim( preg_replace( '/[^a-z0-9]+/', '-', strtolower( $class ) ), '-' );
			$list = array(
				'rows' => $rows,
				'csv'  => zsa_act_data_url( 'text/csv', zsa_act_class_csv( $rows ) ),
				'pdf'  => zsa_act_data_url( 'application/pdf', zsa_act_class_pdf( $rows, $class, $date, $s['retention_days'] ) ),
				'name' => 'act-class-codes-' . ( '' !== $slug ? $slug . '-' : '' ) . gmdate( 'Y-m-d' ),
			);
		}
	}
	?>
	<div class="wrap">
		<h1>ACT Class Codes</h1>
		<?php if ( empty( $s['enabled'] ) ) : ?>
			<div class="notice notice-warning"><p>Practice codes are turned off right now, so students cannot use these codes until an administrator turns them back on (Tools &gt; ACT Practice History).</p></div>
		<?php endif; ?>
		<?php if ( $error ) : ?>
			<div class="notice notice-error"><p><?php echo esc_html( $error ); ?></p></div>
		<?php endif; ?>
		<?php if ( $list ) : ?>
			<div class="notice notice-success">
				<h2><?php echo esc_html( sprintf( 'Your class list is ready: %d codes and PINs', count( $list['rows'] ) ) ); ?></h2>
				<p><strong>Download both files now. The PINs are not saved anywhere and cannot be shown again after you leave or reload this page.</strong></p>
				<p>
					<a class="button button-primary" download="<?php echo esc_attr( $list['name'] . '.pdf' ); ?>" href="<?php echo esc_attr( $list['pdf'] ); ?>">Download PDF to print</a>
					<a class="button" download="<?php echo esc_attr( $list['name'] . '.csv' ); ?>" href="<?php echo esc_attr( $list['csv'] ); ?>">Download CSV file</a>
				</p>
				<p class="description">The PDF has the ZornScience logo, a row for each student with their code and PIN, and blank last name and first name columns to fill in. The CSV file has the code in the first column and the PIN in the second.</p>
				<details>
					<summary>Show the codes and PINs on this page</summary>
					<table class="widefat striped">
						<thead><tr><th scope="col">#</th><th scope="col">Code</th><th scope="col">PIN</th></tr></thead>
						<tbody>
						<?php foreach ( $list['rows'] as $i => $r ) : ?>
							<tr><td><?php echo esc_html( (string) ( $i + 1 ) ); ?></td><td><code><?php echo esc_html( $r['code'] ); ?></code></td><td><code><?php echo esc_html( $r['pin'] ); ?></code></td></tr>
						<?php endforeach; ?>
						</tbody>
					</table>
				</details>
			</div>
		<?php endif; ?>
		<p>Make practice codes and PINs for a class ahead of time, for example before a practice test. Each student gets their own code and PIN. On the ACT Practice page they choose <strong>Yes, I have a code and PIN</strong>, and their scores are saved under their code.</p>
		<p>No names are sent or stored: write names only on the printed PDF or in your copy of the CSV file. <?php echo esc_html( sprintf( 'A code that is not used for %s is deleted with its scores.', zsa_act_retention_words( $s['retention_days'] ) ) ); ?></p>
		<form method="post">
			<?php wp_nonce_field( 'zsa_act_class' ); ?>
			<table class="form-table" role="presentation">
				<tr><th scope="row"><label for="zsa-act-count">Number of students</label></th><td><input id="zsa-act-count" name="count" type="number" min="1" max="<?php echo esc_attr( (string) ZSA_ACT_CLASS_MAX ); ?>" required value="<?php echo esc_attr( (string) $count ); ?>"><p class="description"><?php echo esc_html( sprintf( 'From 1 to %d. Making the list takes a few seconds.', ZSA_ACT_CLASS_MAX ) ); ?></p></td></tr>
				<tr><th scope="row"><label for="zsa-act-class">Class name (optional)</label></th><td><input id="zsa-act-class" name="class_name" type="text" maxlength="60" class="regular-text" value="<?php echo esc_attr( $class ); ?>"><p class="description">Printed at the top of the PDF and used in the file names, for example Period 3 Chemistry. It is not saved.</p></td></tr>
			</table>
			<button class="button button-primary" name="zsa_act_action" value="class">Make class list</button>
		</form>
	</div>
	<?php
}

function zsa_act_admin_page() {
	global $wpdb;
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( esc_html__( 'You do not have permission to view this page.', 'zornscience-act-history' ) );
	}
	$t       = zsa_act_tables();
	$notice  = '';
	$s       = zsa_act_settings();
	$lookup  = null;
	$request = wp_unslash( $_POST );

	if ( isset( $request['zsa_act_action'] ) ) {
		check_admin_referer( 'zsa_act_admin' );
		$action = sanitize_key( $request['zsa_act_action'] );
		if ( 'settings' === $action ) {
			$s['enabled']        = empty( $request['enabled'] ) ? 0 : 1;
			$s['origins']        = sanitize_textarea_field( isset( $request['origins'] ) ? $request['origins'] : '' );
			$s['retention_days'] = max( 30, min( 3650, absint( isset( $request['retention_days'] ) ? $request['retention_days'] : 365 ) ) );
			update_option( 'zsa_act_settings', $s );
			$notice = 'Settings saved.';
		} elseif ( 'purge' === $action ) {
			$n      = zsa_act_cleanup();
			$notice = sprintf( '%d inactive codes were deleted, with their PINs and scores.', $n );
		} elseif ( 'lookup' === $action || 'delete' === $action || 'pin' === $action ) {
			$code = zsa_act_clean_code( isset( $request['code'] ) ? $request['code'] : '' );
			if ( ! $code || ! zsa_act_find_code( $code ) ) {
				$notice = 'No history was found for that code.';
			} elseif ( 'delete' === $action ) {
				zsa_act_delete_code( $code );
				$notice = 'Code ' . $code . ' and its scores were deleted.';
			} elseif ( 'pin' === $action ) {
				// For a student who lost their PIN: a new one replaces it, shown here once.
				$pin = zsa_act_random_pin();
				$wpdb->update( $t['codes'], array( 'pin_hash' => zsa_act_hash_pin( $pin ) ), array( 'code' => $code ), array( '%s' ), array( '%s' ) );
				delete_transient( 'zsa_act_pin_' . $code );
				$notice = 'The new PIN for code ' . $code . ' is ' . $pin . '. Give it to the student now; it will not be shown again.';
			} else {
				$lookup = array(
					'code'     => $code,
					'attempts' => zsa_act_attempts( $code ),
				);
			}
		}
	}

	$codes    = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$t['codes']}" );
	$attempts = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$t['attempts']}" );
	$recent   = (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$t['attempts']} WHERE created_at >= %s", gmdate( 'Y-m-d H:i:s', time() - 30 * DAY_IN_SECONDS ) ) );
	$inactive = count( zsa_act_inactive_codes() );
	?>
	<div class="wrap">
		<h1>ACT Practice History</h1>
		<?php if ( $notice ) : ?>
			<div class="notice notice-info"><p><?php echo esc_html( $notice ); ?></p></div>
		<?php endif; ?>
		<p>Practice codes let students see their ACT Practice scores over time without an account. Each code has a four-digit PIN, which is stored only in scrambled (hashed) form. Only the code, the date, the section, the mode, the number correct, the estimated score and the time are stored. No names, emails or IP addresses are stored.</p>
		<p><?php echo esc_html( sprintf( '%d codes, %d saved attempts, %d in the last 30 days.', $codes, $attempts, $recent ) ); ?></p>
		<p>To make codes and PINs for a whole class, use <a href="<?php echo esc_url( admin_url( 'admin.php?page=zsa-act-class-codes' ) ); ?>">ACT Class Codes</a> in the menu. Other teachers can make class lists too: give their account the <strong>ACT Practice teacher</strong> role, which can make class lists and nothing else.</p>

		<h2>Look up or delete a code</h2>
		<p>Use this when a student shares their code with you, or asks for their history to be deleted.</p>
		<form method="post">
			<?php wp_nonce_field( 'zsa_act_admin' ); ?>
			<label for="zsa-act-code">Practice code</label>
			<input id="zsa-act-code" name="code" type="text" maxlength="12" autocomplete="off" value="<?php echo esc_attr( $lookup ? $lookup['code'] : '' ); ?>">
			<button class="button" name="zsa_act_action" value="lookup">Look up</button>
			<button class="button" name="zsa_act_action" value="pin" onclick="return confirm('Replace this code\'s PIN with a new one? The old PIN will stop working.');">Make a new PIN</button>
			<button class="button" name="zsa_act_action" value="delete" onclick="return confirm('Delete this code and all of its scores?');">Delete</button>
		</form>
		<p class="description">Make a new PIN is for a student who still has their code but lost their PIN. Codes are never shown or found by PIN.</p>

		<h2>Inactive codes</h2>
		<p><?php echo esc_html( sprintf( '%d codes have not been used in the last %d days. They are deleted automatically once a day, with their PINs and scores.', $inactive, (int) $s['retention_days'] ) ); ?></p>
		<form method="post">
			<?php wp_nonce_field( 'zsa_act_admin' ); ?>
			<button class="button" name="zsa_act_action" value="purge" onclick="return confirm('Delete every inactive code, with its PIN and scores, now?');">Delete inactive codes now</button>
		</form>
		<?php if ( $lookup ) : ?>
			<h3><?php echo esc_html( 'Code ' . $lookup['code'] . ': ' . count( $lookup['attempts'] ) . ' saved attempts' ); ?></h3>
			<table class="widefat striped">
				<thead><tr><th scope="col">Date (UTC)</th><th scope="col">Section</th><th scope="col">Mode</th><th scope="col">Correct</th><th scope="col">Estimated score</th><th scope="col">Minutes</th></tr></thead>
				<tbody>
				<?php foreach ( $lookup['attempts'] as $a ) : ?>
					<tr>
						<td><?php echo esc_html( substr( str_replace( 'T', ' ', $a['date'] ), 0, 16 ) ); ?></td>
						<td><?php echo esc_html( ucfirst( $a['section'] ) ); ?></td>
						<td><?php echo esc_html( $a['mode'] ); ?></td>
						<td><?php echo esc_html( $a['correct'] . ' / ' . $a['questions'] ); ?></td>
						<td><?php echo esc_html( null === $a['score'] ? ( null === $a['low'] ? '' : $a['low'] . ' to ' . $a['high'] ) : (string) $a['score'] ); ?></td>
						<td><?php echo esc_html( (string) round( $a['seconds'] / 60 ) ); ?></td>
					</tr>
				<?php endforeach; ?>
				</tbody>
			</table>
		<?php endif; ?>

		<h2>Settings</h2>
		<form method="post">
			<?php wp_nonce_field( 'zsa_act_admin' ); ?>
			<table class="form-table" role="presentation">
				<tr><th scope="row">Practice codes</th><td><label><input type="checkbox" name="enabled" value="1" <?php checked( ! empty( $s['enabled'] ) ); ?>> Turned on</label></td></tr>
				<tr><th scope="row"><label for="zsa-act-origins">Allowed sites</label></th><td><textarea id="zsa-act-origins" name="origins" rows="2" cols="50"><?php echo esc_textarea( $s['origins'] ); ?></textarea><p class="description">Web addresses that may use practice codes, one per line.</p></td></tr>
				<tr><th scope="row"><label for="zsa-act-retention">Keep unused codes for</label></th><td><input id="zsa-act-retention" name="retention_days" type="number" min="30" max="3650" value="<?php echo esc_attr( (string) $s['retention_days'] ); ?>"> days<p class="description">A code that is not used for this long is deleted with its scores, once a day.</p></td></tr>
			</table>
			<button class="button button-primary" name="zsa_act_action" value="settings">Save settings</button>
		</form>
	</div>
	<?php
}
