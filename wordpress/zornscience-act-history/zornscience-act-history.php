<?php
/**
 * Plugin Name: ZornScience ACT Practice History
 * Description: Saves ACT Practice scores under anonymous six-character practice codes, so students can see how their scores change over time without making an account. Stores no names, emails, or IP addresses.
 * Version: 1.0.0
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Author: ZornScience
 * License: GPL-2.0-or-later
 * Text Domain: zornscience-act-history
 *
 * How it works: the ACT Practice page (activities.zornscience.org/act/) calls three REST routes under
 * /wp-json/zsa-act/v1/. A student gets a new random code, or enters one they already have; each finished section is
 * saved under that code with its date, section, mode, number correct, and estimated score. Anyone who knows a code
 * can read its scores, so codes are long enough to be hard to guess, and lookups are rate limited.
 */

defined( 'ABSPATH' ) || exit;

define( 'ZSA_ACT_VERSION', '1.0.0' );
define( 'ZSA_ACT_NS', 'zsa-act/v1' );
// Code alphabet: capital letters and digits without look-alikes (no I, O, 0 or 1). 32 symbols, so 32^6, about a
// billion, possible codes.
define( 'ZSA_ACT_ALPHABET', 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' );
define( 'ZSA_ACT_SECTIONS', 'english,math,reading,science,composite' );
define( 'ZSA_ACT_MODES', 'one,mixed,full,fullact' );
define( 'ZSA_ACT_MAX_ATTEMPTS', 1000 );

/** Default settings, merged with what the admin page saves. */
function zsa_act_settings() {
	$defaults = array(
		'enabled'        => 1,
		'origins'        => 'https://activities.zornscience.org',
		'retention_days' => 400,
		// Requests allowed per hour from one network address, by kind.
		'limit_new'      => 20,
		'limit_lookup'   => 60,
		'limit_save'     => 120,
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
	update_option( 'zsa_act_db_version', ZSA_ACT_VERSION );
	if ( ! wp_next_scheduled( 'zsa_act_cleanup' ) ) {
		wp_schedule_event( time() + HOUR_IN_SECONDS, 'daily', 'zsa_act_cleanup' );
	}
}

function zsa_act_deactivate() {
	wp_clear_scheduled_hook( 'zsa_act_cleanup' );
}

/** Deletes codes (and their scores) not used for the retention period. Runs once a day. */
function zsa_act_cleanup() {
	global $wpdb;
	$t      = zsa_act_tables();
	$days   = max( 30, (int) zsa_act_settings()['retention_days'] );
	$cutoff = gmdate( 'Y-m-d H:i:s', time() - $days * DAY_IN_SECONDS );
	$old    = $wpdb->get_col( $wpdb->prepare( "SELECT code FROM {$t['codes']} WHERE last_used < %s", $cutoff ) );
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

function zsa_act_random_code() {
	$code = '';
	for ( $i = 0; $i < 6; $i++ ) {
		$code .= ZSA_ACT_ALPHABET[ random_int( 0, strlen( ZSA_ACT_ALPHABET ) - 1 ) ];
	}
	return $code;
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
	register_rest_route(
		ZSA_ACT_NS,
		'/codes/' . $code,
		array(
			'methods'             => 'GET',
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
	global $wpdb;
	$ok = zsa_act_gate( 'new' );
	if ( true !== $ok ) {
		return $ok;
	}
	$t   = zsa_act_tables();
	$now = zsa_act_now();
	for ( $try = 0; $try < 5; $try++ ) {
		$code     = zsa_act_random_code();
		$inserted = $wpdb->insert(
			$t['codes'],
			array(
				'code'       => $code,
				'created_at' => $now,
				'last_used'  => $now,
				'attempts'   => 0,
			),
			array( '%s', '%s', '%s', '%d' )
		);
		if ( $inserted ) {
			return zsa_act_response( array( 'code' => $code ), 201 );
		}
	}
	return new WP_Error( 'zsa_act_db', 'Could not create a code. Try again.', array( 'status' => 500 ) );
}

function zsa_act_find_code( $code ) {
	global $wpdb;
	$t = zsa_act_tables();
	return $wpdb->get_row( $wpdb->prepare( "SELECT code, created_at, attempts FROM {$t['codes']} WHERE code = %s", $code ), ARRAY_A );
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

function zsa_act_rest_history( $request ) {
	global $wpdb;
	$ok = zsa_act_gate( 'lookup' );
	if ( true !== $ok ) {
		return $ok;
	}
	$code = zsa_act_clean_code( $request['code'] );
	$row  = $code ? zsa_act_find_code( $code ) : null;
	if ( ! $row ) {
		return new WP_Error( 'zsa_act_unknown', 'No history was found for that code.', array( 'status' => 404 ) );
	}
	$t = zsa_act_tables();
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
	$code = zsa_act_clean_code( $request['code'] );
	$row  = $code ? zsa_act_find_code( $code ) : null;
	if ( ! $row ) {
		return new WP_Error( 'zsa_act_unknown', 'No history was found for that code.', array( 'status' => 404 ) );
	}
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
		header( 'Access-Control-Allow-Methods: GET, POST, OPTIONS' );
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

// ---------- Admin page (Tools > ACT Practice History) ----------

add_action( 'admin_menu', 'zsa_act_admin_menu' );

function zsa_act_admin_menu() {
	add_management_page( 'ACT Practice History', 'ACT Practice History', 'manage_options', 'zsa-act-history', 'zsa_act_admin_page' );
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
			$s['retention_days'] = max( 30, min( 3650, absint( isset( $request['retention_days'] ) ? $request['retention_days'] : 400 ) ) );
			update_option( 'zsa_act_settings', $s );
			$notice = 'Settings saved.';
		} elseif ( 'lookup' === $action || 'delete' === $action ) {
			$code = zsa_act_clean_code( isset( $request['code'] ) ? $request['code'] : '' );
			if ( ! $code || ! zsa_act_find_code( $code ) ) {
				$notice = 'No history was found for that code.';
			} elseif ( 'delete' === $action ) {
				zsa_act_delete_code( $code );
				$notice = 'Code ' . $code . ' and its scores were deleted.';
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
	?>
	<div class="wrap">
		<h1>ACT Practice History</h1>
		<?php if ( $notice ) : ?>
			<div class="notice notice-info"><p><?php echo esc_html( $notice ); ?></p></div>
		<?php endif; ?>
		<p>Practice codes let students see their ACT Practice scores over time without an account. Only the code, the date, the section, the mode, the number correct, the estimated score and the time are stored. No names, emails or IP addresses are stored.</p>
		<p><?php echo esc_html( sprintf( '%d codes, %d saved attempts, %d in the last 30 days.', $codes, $attempts, $recent ) ); ?></p>

		<h2>Look up or delete a code</h2>
		<p>Use this when a student shares their code with you, or asks for their history to be deleted.</p>
		<form method="post">
			<?php wp_nonce_field( 'zsa_act_admin' ); ?>
			<label for="zsa-act-code">Practice code</label>
			<input id="zsa-act-code" name="code" type="text" maxlength="12" autocomplete="off" value="<?php echo esc_attr( $lookup ? $lookup['code'] : '' ); ?>">
			<button class="button" name="zsa_act_action" value="lookup">Look up</button>
			<button class="button" name="zsa_act_action" value="delete" onclick="return confirm('Delete this code and all of its scores?');">Delete</button>
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
