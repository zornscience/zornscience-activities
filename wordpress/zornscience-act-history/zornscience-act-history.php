<?php
/**
 * Plugin Name: ZornScience ACT Practice History
 * Description: Saves ACT Practice scores under anonymous six-character practice codes, each with a four-digit PIN, so students can see how their scores change over time without making an account. Teachers can make a class set of codes and PINs on the ACT Practice page. Stores no names, emails, or IP addresses.
 * Version: 1.3.0
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Author: ZornScience
 * License: GPL-2.0-or-later
 * Text Domain: zornscience-act-history
 *
 * How it works: the ACT Practice page (activities.zornscience.org/act/) calls four REST routes under
 * /wp-json/zsa-act/v1/. A student gets a new random code and PIN, or enters a code and PIN they already have; each
 * finished section is saved under that code with its date, section, mode, number correct, and estimated score. A
 * history opens, and a score saves, only when the code and PIN match, so a student who mistypes a code cannot add to
 * or see someone else's history. PINs are checked against one-way hashes, and also kept encrypted so an administrator
 * can look one up for a student who forgot it. Wrong PINs lock a code for an hour after ten tries. Teachers can make a
 * class set of codes and PINs on the ACT Practice page, downloaded as a CSV file and a ZornScience PDF. Every route is
 * rate limited, and new codes have a site-wide limit per 24 hours, so no one can make codes without end.
 */

defined( 'ABSPATH' ) || exit;

define( 'ZSA_ACT_VERSION', '1.3.0' );
define( 'ZSA_ACT_NS', 'zsa-act/v1' );
// Code alphabet: capital letters and digits without look-alikes (no I, O, 0 or 1). 32 symbols, so 32^6, about a
// billion, possible codes.
define( 'ZSA_ACT_ALPHABET', 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' );
define( 'ZSA_ACT_SECTIONS', 'english,math,reading,science,composite' );
define( 'ZSA_ACT_MODES', 'one,mixed,full,fullact' );
define( 'ZSA_ACT_MAX_ATTEMPTS', 1000 );
// The most students the class list setting can allow in one list.
define( 'ZSA_ACT_CLASS_MAX', 100 );

/** Default settings, merged with what the admin page saves. */
function zsa_act_settings() {
	$defaults = array(
		'enabled'        => 1,
		'origins'        => 'https://activities.zornscience.org',
		// Codes (with their PINs and scores) not used for this many days are deleted once a day.
		'retention_days' => 365,
		// Wrong PINs allowed for one code in an hour before it locks for the rest of that hour.
		'pin_tries'      => 10,
		// Requests allowed per hour from one network address, by kind. A whole school usually shares one address.
		'limit_new'      => 100,
		'limit_lookup'   => 300,
		'limit_save'     => 600,
		// Class lists: on or off, the most students in one list, and lists per hour from one network address.
		'class_enabled'  => 1,
		'class_max'      => 50,
		'class_per_hour' => 5,
		// New codes the whole site may make in any 24 hours, from students and class lists together.
		'daily_codes'    => 2000,
	);
	$saved = get_option( 'zsa_act_settings', array() );
	return array_merge( $defaults, is_array( $saved ) ? $saved : array() );
}

/** The settings the admin page can change, with their lowest and highest values (null for text and on/off). */
function zsa_act_editable() {
	return array(
		'enabled'        => null,
		'origins'        => null,
		'retention_days' => array( 30, 3650 ),
		'class_enabled'  => null,
		'class_max'      => array( 1, ZSA_ACT_CLASS_MAX ),
		'class_per_hour' => array( 1, 100 ),
		'daily_codes'    => array( 10, 100000 ),
	);
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
			pin_box varchar(255) NOT NULL DEFAULT '',
			kind tinyint(1) unsigned NOT NULL DEFAULT 0,
			PRIMARY KEY  (code),
			KEY last_used (last_used),
			KEY created_at (created_at)
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
	update_option( 'zsa_act_db_version', ZSA_ACT_VERSION );
	if ( ! wp_next_scheduled( 'zsa_act_cleanup' ) ) {
		wp_schedule_event( time() + HOUR_IN_SECONDS, 'daily', 'zsa_act_cleanup' );
	}
}

/**
 * Uploading a new version replaces the files without running the activation hook, so the tables are brought up to
 * date (dbDelta adds new columns) on the first page load after an update. Also: settings saved with the old default of
 * 400 days move to a year; request limits saved by older versions (which saved every setting, though the page could not
 * change them) give way to the current defaults; and version 1.2.0's teacher role is removed, since class lists are
 * now made on the ACT Practice page.
 */
function zsa_act_maybe_upgrade() {
	if ( get_option( 'zsa_act_db_version' ) === ZSA_ACT_VERSION ) {
		return;
	}
	zsa_act_activate();
	$saved = get_option( 'zsa_act_settings', array() );
	if ( is_array( $saved ) ) {
		if ( isset( $saved['retention_days'] ) && 400 === (int) $saved['retention_days'] ) {
			$saved['retention_days'] = 365;
		}
		update_option( 'zsa_act_settings', array_intersect_key( $saved, zsa_act_editable() ) );
	}
	// Codes issued start counting from the codes already stored.
	if ( false === get_option( 'zsa_act_stats' ) ) {
		global $wpdb;
		$t     = zsa_act_tables();
		$first = $wpdb->get_var( "SELECT MIN(created_at) FROM {$t['codes']}" );
		update_option(
			'zsa_act_stats',
			array(
				'since'   => $first ? $first : '',
				'student' => (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$t['codes']} WHERE kind = 0" ),
				'class'   => (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$t['codes']} WHERE kind = 1" ),
				'lists'   => 0,
			),
			false
		);
	}
	if ( get_role( 'zsa_act_teacher' ) ) {
		remove_role( 'zsa_act_teacher' );
	}
	$admin = get_role( 'administrator' );
	if ( $admin ) {
		$admin->remove_cap( 'zsa_act_class_lists' );
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

/**
 * PINs are also kept encrypted (libsodium's secretbox, which WordPress includes) so an administrator can look one up
 * for a student who forgot it. The key comes from this site's secret keys in wp-config.php, so the database alone does
 * not reveal PINs. If those keys are ever changed, old PINs can no longer be shown (Make a new PIN still works).
 */
function zsa_act_pin_key() {
	return sodium_crypto_generichash( 'zsa_act_pin|' . wp_salt( 'auth' ), '', SODIUM_CRYPTO_SECRETBOX_KEYBYTES );
}

function zsa_act_seal_pin( $pin ) {
	if ( ! function_exists( 'sodium_crypto_secretbox' ) ) {
		return '';
	}
	$nonce = random_bytes( SODIUM_CRYPTO_SECRETBOX_NONCEBYTES );
	return base64_encode( $nonce . sodium_crypto_secretbox( $pin, $nonce, zsa_act_pin_key() ) );
}

/** The PIN in a sealed box, or null if there is none or it cannot be opened. */
function zsa_act_unseal_pin( $box ) {
	$raw = base64_decode( (string) $box, true );
	if ( ! $raw || ! function_exists( 'sodium_crypto_secretbox_open' ) || strlen( $raw ) <= SODIUM_CRYPTO_SECRETBOX_NONCEBYTES ) {
		return null;
	}
	$pin = sodium_crypto_secretbox_open( substr( $raw, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES ), substr( $raw, 0, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES ), zsa_act_pin_key() );
	return false === $pin ? null : $pin;
}

/** Counts of codes issued since the plugin started counting. They keep counting when codes are deleted. */
function zsa_act_stats() {
	$saved = get_option( 'zsa_act_stats', array() );
	return array_merge(
		array(
			'since'   => '',
			'student' => 0,
			'class'   => 0,
			'lists'   => 0,
		),
		is_array( $saved ) ? $saved : array()
	);
}

function zsa_act_count_issued( $student, $class, $lists ) {
	$st = zsa_act_stats();
	if ( '' === $st['since'] ) {
		$st['since'] = zsa_act_now();
	}
	$st['student'] += $student;
	$st['class']   += $class;
	$st['lists']   += $lists;
	update_option( 'zsa_act_stats', $st, false );
}

/** New codes made in the last 24 hours, by students and class lists together. */
function zsa_act_made_recently() {
	global $wpdb;
	$t = zsa_act_tables();
	return (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$t['codes']} WHERE created_at >= %s", gmdate( 'Y-m-d H:i:s', time() - DAY_IN_SECONDS ) ) );
}

/** A WP_Error (429) when $n more codes would pass the site-wide limit for 24 hours, otherwise true. */
function zsa_act_daily_room( $n ) {
	if ( zsa_act_made_recently() + $n > (int) zsa_act_settings()['daily_codes'] ) {
		return new WP_Error( 'zsa_act_daily', 'ZornScience has made as many new codes as it can for today. Try again tomorrow.', array( 'status' => 429 ) );
	}
	return true;
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
	register_rest_route(
		ZSA_ACT_NS,
		'/class-lists',
		array(
			'methods'             => 'POST',
			'callback'            => 'zsa_act_rest_class_list',
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
	$room = zsa_act_daily_room( 1 );
	if ( true !== $room ) {
		return $room;
	}
	$pin  = zsa_act_random_pin();
	$code = zsa_act_create_code( $pin, 0 );
	if ( ! $code ) {
		return new WP_Error( 'zsa_act_db', 'Could not create a code. Try again.', array( 'status' => 500 ) );
	}
	zsa_act_count_issued( 1, 0, 0 );
	// The only time the PIN is ever sent: the page shows it once for the student to write down.
	return zsa_act_response(
		array(
			'code' => $code,
			'pin'  => $pin,
		),
		201
	);
}

/**
 * Saves a new random code with this PIN (its hash and its sealed box). $kind is 0 for a student's own code and 1 for a
 * class list. Returns the code, or null if five tries all collided.
 */
function zsa_act_create_code( $pin, $kind ) {
	global $wpdb;
	$t    = zsa_act_tables();
	$now  = zsa_act_now();
	$hash = zsa_act_hash_pin( $pin );
	$box  = zsa_act_seal_pin( $pin );
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
				'pin_box'    => $box,
				'kind'       => (int) $kind,
			),
			array( '%s', '%s', '%s', '%d', '%s', '%s', '%d' )
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
	return $wpdb->get_row( $wpdb->prepare( "SELECT code, created_at, last_used, attempts, pin_hash, pin_box, kind FROM {$t['codes']} WHERE code = %s", $code ), ARRAY_A );
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
 * array( 'code' => ..., 'pin' => ... ), or a WP_Error. No names or class details are stored.
 */
function zsa_act_make_class_list( $count ) {
	if ( function_exists( 'set_time_limit' ) ) {
		set_time_limit( 120 );
	}
	$rows = array();
	for ( $i = 0; $i < $count; $i++ ) {
		$pin  = zsa_act_random_pin();
		$code = zsa_act_create_code( $pin, 1 );
		if ( ! $code ) {
			foreach ( $rows as $r ) {
				zsa_act_delete_code( $r['code'] );
			}
			return new WP_Error( 'zsa_act_db', 'Could not make the codes. Try again.', array( 'status' => 500 ) );
		}
		$rows[] = array(
			'code' => $code,
			'pin'  => $pin,
		);
	}
	zsa_act_count_issued( 0, $count, 1 );
	return $rows;
}

/**
 * POST /class-lists with {count, name}: a class set for a teacher. Each request is checked, cheapest first, before any
 * code is made: class lists are on; the count is from 1 to the class list maximum; this network address has made
 * fewer than class_per_hour lists in the last hour; and the codes fit in the site-wide limit for 24 hours. The
 * response has the codes and PINs, the CSV file and the PDF (base64). The class name is used only in the files.
 */
function zsa_act_rest_class_list( $request ) {
	if ( ! defined( 'DONOTCACHEPAGE' ) ) {
		define( 'DONOTCACHEPAGE', true );
	}
	$s = zsa_act_settings();
	if ( empty( $s['enabled'] ) || empty( $s['class_enabled'] ) ) {
		return new WP_Error( 'zsa_act_off', 'Class codes are turned off.', array( 'status' => 503 ) );
	}
	$p     = $request->get_json_params();
	$p     = is_array( $p ) ? $p : array();
	$count = isset( $p['count'] ) && ( is_int( $p['count'] ) || ( is_string( $p['count'] ) && ctype_digit( $p['count'] ) ) ) ? (int) $p['count'] : 0;
	$max   = max( 1, min( ZSA_ACT_CLASS_MAX, (int) $s['class_max'] ) );
	if ( $count < 1 || $count > $max ) {
		return new WP_Error(
			'zsa_act_count',
			sprintf( 'Choose from 1 to %d students.', $max ),
			array(
				'status' => 400,
				'max'    => $max,
			)
		);
	}
	$name = isset( $p['name'] ) && is_string( $p['name'] ) ? substr( sanitize_text_field( $p['name'] ), 0, 60 ) : '';
	if ( ! zsa_act_rate_ok( 'class', (int) $s['class_per_hour'] ) ) {
		return new WP_Error( 'zsa_act_busy', 'Too many class sets from this network in the last hour. Try again later.', array( 'status' => 429 ) );
	}
	$room = zsa_act_daily_room( $count );
	if ( true !== $room ) {
		return $room;
	}
	$rows = zsa_act_make_class_list( $count );
	if ( is_wp_error( $rows ) ) {
		return $rows;
	}
	$date = function_exists( 'wp_date' ) ? wp_date( 'F j, Y' ) : gmdate( 'F j, Y' );
	$slug = trim( preg_replace( '/[^a-z0-9]+/', '-', strtolower( $name ) ), '-' );
	return zsa_act_response(
		array(
			'codes' => $rows,
			'csv'   => zsa_act_class_csv( $rows ),
			'pdf'   => base64_encode( zsa_act_class_pdf( $rows, $name, $date, $s['retention_days'] ) ),
			'file'  => 'act-class-codes-' . ( '' !== $slug ? trim( substr( $slug, 0, 40 ), '-' ) . '-' : '' ) . gmdate( 'Y-m-d' ),
		),
		201
	);
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
}

/** Deletes every code, PIN and score (the counts of codes issued are kept). Returns how many codes there were. */
function zsa_act_delete_all() {
	global $wpdb;
	$t = zsa_act_tables();
	$n = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$t['codes']}" );
	$wpdb->query( "DELETE FROM {$t['attempts']}" );
	$wpdb->query( "DELETE FROM {$t['codes']}" );
	return $n;
}

/** Saves the settings the admin page can change, each kept within its range. */
function zsa_act_save_settings( $request ) {
	$s = zsa_act_settings();
	foreach ( zsa_act_editable() as $key => $range ) {
		if ( 'origins' === $key ) {
			$s[ $key ] = sanitize_textarea_field( isset( $request[ $key ] ) ? $request[ $key ] : '' );
		} elseif ( null === $range ) {
			$s[ $key ] = empty( $request[ $key ] ) ? 0 : 1;
		} elseif ( isset( $request[ $key ] ) && '' !== $request[ $key ] ) {
			$s[ $key ] = max( $range[0], min( $range[1], absint( $request[ $key ] ) ) );
		}
	}
	update_option( 'zsa_act_settings', array_intersect_key( $s, zsa_act_editable() ) );
}

function zsa_act_admin_page() {
	global $wpdb;
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( esc_html__( 'You do not have permission to view this page.', 'zornscience-act-history' ) );
	}
	$t       = zsa_act_tables();
	$notice  = '';
	$lookup  = null;
	$request = wp_unslash( $_POST );

	if ( isset( $request['zsa_act_action'] ) ) {
		check_admin_referer( 'zsa_act_admin' );
		$action = sanitize_key( $request['zsa_act_action'] );
		if ( 'settings' === $action ) {
			zsa_act_save_settings( $request );
			$notice = 'Settings saved.';
		} elseif ( 'purge' === $action ) {
			$n      = zsa_act_cleanup();
			$notice = sprintf( '%d inactive codes were deleted, with their PINs and scores.', $n );
		} elseif ( 'purge_all' === $action ) {
			if ( isset( $request['confirm'] ) && 'DELETE' === trim( $request['confirm'] ) ) {
				$n      = zsa_act_delete_all();
				$notice = sprintf( 'All %d codes were deleted, with their PINs and scores.', $n );
			} else {
				$notice = 'Nothing was deleted. To delete everything, type DELETE in the box first.';
			}
		} elseif ( 'lookup' === $action || 'delete' === $action || 'pin' === $action ) {
			$code = zsa_act_clean_code( isset( $request['code'] ) ? $request['code'] : '' );
			$row  = $code ? zsa_act_find_code( $code ) : null;
			if ( ! $row ) {
				$notice = 'No code like that was found.';
			} elseif ( 'delete' === $action ) {
				zsa_act_delete_code( $code );
				$notice = 'Code ' . $code . ' and its scores were deleted.';
			} else {
				if ( 'pin' === $action ) {
					// A new PIN replaces the old one, for example if the old one was shared.
					$pin = zsa_act_random_pin();
					$wpdb->update(
						$t['codes'],
						array(
							'pin_hash' => zsa_act_hash_pin( $pin ),
							'pin_box'  => zsa_act_seal_pin( $pin ),
						),
						array( 'code' => $code ),
						array( '%s', '%s' ),
						array( '%s' )
					);
					delete_transient( 'zsa_act_pin_' . $code );
					$notice = 'Code ' . $code . ' has a new PIN: ' . $pin . '. The old PIN no longer works.';
					$row    = zsa_act_find_code( $code );
				}
				$lookup = array(
					'row'      => $row,
					'pin'      => zsa_act_unseal_pin( $row['pin_box'] ),
					'attempts' => zsa_act_attempts( $code ),
				);
			}
		}
	}

	$s        = zsa_act_settings();
	$st       = zsa_act_stats();
	$issued   = $st['student'] + $st['class'];
	$codes    = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$t['codes']}" );
	$classes  = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$t['codes']} WHERE kind = 1" );
	$attempts = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$t['attempts']}" );
	$recent   = (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$t['attempts']} WHERE created_at >= %s", gmdate( 'Y-m-d H:i:s', time() - 30 * DAY_IN_SECONDS ) ) );
	$today    = zsa_act_made_recently();
	$inactive = count( zsa_act_inactive_codes() );
	$date     = function ( $mysql ) {
		return substr( $mysql, 0, 10 );
	};
	?>
	<div class="wrap">
		<h1>ACT Practice History</h1>
		<?php if ( $notice ) : ?>
			<div class="notice notice-info"><p><?php echo esc_html( $notice ); ?></p></div>
		<?php endif; ?>
		<p>Practice codes let students see their ACT Practice scores over time without an account. Each code has a four-digit PIN. Only the code, its PIN (as a hash, and encrypted so you can look it up here), the date, the section, the mode, the number correct, the estimated score and the time are stored. No names, emails or IP addresses are stored.</p>
		<p>Teachers make class sets of codes and PINs on the ACT Practice page: <a href="https://activities.zornscience.org/act/#teachers">activities.zornscience.org/act/#teachers</a>.</p>

		<h2>Codes issued</h2>
		<ul>
			<li><strong><?php echo esc_html( number_format( $issued ) ); ?> codes issued</strong><?php echo esc_html( '' !== $st['since'] ? ' since ' . $date( $st['since'] ) : '' ); ?>: <?php echo esc_html( sprintf( '%s by students for themselves, and %s in %s class sets.', number_format( $st['student'] ), number_format( $st['class'] ), number_format( $st['lists'] ) ) ); ?> This count keeps going when codes are deleted.</li>
			<li><?php echo esc_html( sprintf( '%s new codes in the last 24 hours, of the limit of %s.', number_format( $today ), number_format( (int) $s['daily_codes'] ) ) ); ?></li>
			<li><?php echo esc_html( sprintf( 'Stored now: %s codes (%s from class sets), with %s saved scores, %s of them in the last 30 days.', number_format( $codes ), number_format( $classes ), number_format( $attempts ), number_format( $recent ) ) ); ?></li>
		</ul>

		<h2>Look up a code</h2>
		<p>For a student who forgot their PIN, or who shares their code with you. The lookup shows the code's PIN and every saved score.</p>
		<form method="post">
			<?php wp_nonce_field( 'zsa_act_admin' ); ?>
			<label for="zsa-act-code">Practice code</label>
			<input id="zsa-act-code" name="code" type="text" maxlength="12" autocomplete="off" value="<?php echo esc_attr( $lookup ? $lookup['row']['code'] : '' ); ?>">
			<button class="button button-primary" name="zsa_act_action" value="lookup">Look up</button>
			<button class="button" name="zsa_act_action" value="pin" onclick="return confirm('Replace this code\'s PIN with a new one? The old PIN will stop working.');">Make a new PIN</button>
			<button class="button" name="zsa_act_action" value="delete" onclick="return confirm('Delete this code and all of its scores?');">Delete</button>
		</form>
		<p class="description">Make a new PIN is for a PIN that cannot be shown (codes made before version 1.3.0) or that someone else has learned.</p>
		<?php if ( $lookup ) : ?>
			<h3><?php echo esc_html( 'Code ' . $lookup['row']['code'] ); ?></h3>
			<table class="widefat striped" role="presentation">
				<tbody>
					<tr><th scope="row">PIN</th><td><?php echo null === $lookup['pin'] ? esc_html( 'This PIN cannot be shown (the code was made before version 1.3.0, or the site\'s secret keys have changed). Use Make a new PIN.' ) : '<strong style="font-size:1.4em;letter-spacing:.1em">' . esc_html( $lookup['pin'] ) . '</strong>'; ?></td></tr>
					<tr><th scope="row">Made</th><td><?php echo esc_html( $date( $lookup['row']['created_at'] ) . ( 1 === (int) $lookup['row']['kind'] ? ', in a class set' : ', by a student' ) ); ?></td></tr>
					<tr><th scope="row">Last used</th><td><?php echo esc_html( $date( $lookup['row']['last_used'] ) ); ?></td></tr>
				</tbody>
			</table>
			<h3><?php echo esc_html( count( $lookup['attempts'] ) . ' saved scores' ); ?></h3>
			<?php if ( $lookup['attempts'] ) : ?>
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
		<?php endif; ?>

		<h2>Inactive codes</h2>
		<p><?php echo esc_html( sprintf( '%d codes have not been used in the last %d days. They are deleted automatically once a day, with their PINs and scores.', $inactive, (int) $s['retention_days'] ) ); ?></p>
		<form method="post">
			<?php wp_nonce_field( 'zsa_act_admin' ); ?>
			<button class="button" name="zsa_act_action" value="purge" onclick="return confirm('Delete every inactive code, with its PIN and scores, now?');">Delete inactive codes now</button>
		</form>

		<h2>Delete everything</h2>
		<p>Deletes every code, PIN and saved score, for example at the end of a school year. This cannot be undone. Students' codes stop working, and the count of codes issued keeps its total.</p>
		<form method="post">
			<?php wp_nonce_field( 'zsa_act_admin' ); ?>
			<label for="zsa-act-confirm">Type DELETE to confirm</label>
			<input id="zsa-act-confirm" name="confirm" type="text" autocomplete="off">
			<button class="button button-link-delete" name="zsa_act_action" value="purge_all" onclick="return confirm('Delete every code, PIN and score? This cannot be undone.');">Delete all codes and scores</button>
		</form>

		<h2>Settings</h2>
		<form method="post">
			<?php wp_nonce_field( 'zsa_act_admin' ); ?>
			<table class="form-table" role="presentation">
				<tr><th scope="row">Practice codes</th><td><label><input type="checkbox" name="enabled" value="1" <?php checked( ! empty( $s['enabled'] ) ); ?>> Turned on</label></td></tr>
				<tr><th scope="row"><label for="zsa-act-origins">Allowed sites</label></th><td><textarea id="zsa-act-origins" name="origins" rows="2" cols="50"><?php echo esc_textarea( $s['origins'] ); ?></textarea><p class="description">Web addresses that may use practice codes, one per line.</p></td></tr>
				<tr><th scope="row"><label for="zsa-act-retention">Keep unused codes for</label></th><td><input id="zsa-act-retention" name="retention_days" type="number" min="30" max="3650" value="<?php echo esc_attr( (string) $s['retention_days'] ); ?>"> days<p class="description">A code that is not used for this long is deleted with its scores, once a day.</p></td></tr>
				<tr><th scope="row">Class sets for teachers</th><td><label><input type="checkbox" name="class_enabled" value="1" <?php checked( ! empty( $s['class_enabled'] ) ); ?>> Turned on</label></td></tr>
				<tr><th scope="row"><label for="zsa-act-class-max">Most students in one class set</label></th><td><input id="zsa-act-class-max" name="class_max" type="number" min="1" max="<?php echo esc_attr( (string) ZSA_ACT_CLASS_MAX ); ?>" value="<?php echo esc_attr( (string) $s['class_max'] ); ?>"></td></tr>
				<tr><th scope="row"><label for="zsa-act-class-hour">Class sets per hour from one network</label></th><td><input id="zsa-act-class-hour" name="class_per_hour" type="number" min="1" max="100" value="<?php echo esc_attr( (string) $s['class_per_hour'] ); ?>"><p class="description">A whole school usually shares one network address, so this is shared by its teachers.</p></td></tr>
				<tr><th scope="row"><label for="zsa-act-daily">New codes per 24 hours (whole site)</label></th><td><input id="zsa-act-daily" name="daily_codes" type="number" min="10" max="100000" value="<?php echo esc_attr( (string) $s['daily_codes'] ); ?>"><p class="description">Students' own codes and class sets together. Once the limit is reached, no new codes are made until older ones pass 24 hours; existing codes keep working.</p></td></tr>
			</table>
			<button class="button button-primary" name="zsa_act_action" value="settings">Save settings</button>
		</form>
	</div>
	<?php
}
