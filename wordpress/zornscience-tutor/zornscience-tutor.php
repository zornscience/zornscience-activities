<?php
/**
 * Plugin Name:       ZornScience Tutor
 * Description:       A chemistry, physics, and biology tutor for students. Guides students with questions instead of giving answers. Supports photos of student work and voice typing. Use the [zornscience_tutor] shortcode on any page.
 * Version:           1.6.0
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Author:            ZornScience
 * License:           GPL-2.0-or-later
 * Text Domain:       zornscience-tutor
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'ZST_VERSION', '1.6.0' );
define( 'ZST_FILE', __FILE__ );
define( 'ZST_DIR', plugin_dir_path( __FILE__ ) );
define( 'ZST_URL', plugin_dir_url( __FILE__ ) );
define( 'ZST_OPTION', 'zst_settings' );
define( 'ZST_KEY_OPTION', 'zst_api_key' );
define( 'ZST_STATS_OPTION', 'zst_usage_stats' );
define( 'ZST_API_URL', 'https://api.anthropic.com/v1/messages' );

/* -------------------------------------------------------------------------
 * Settings
 * ---------------------------------------------------------------------- */

/**
 * Default settings. Limits are tuned for a public site.
 */
function zst_defaults() {
	return array(
		'enabled'            => 1,
		'model'              => 'claude-haiku-5-5',
		'bot_name'           => 'ZornScience Tutor',
		'welcome'            => "Hey there! I'm the ZornScience Tutor. Stuck on a chemistry, physics, or biology problem? Tell me what you're working on and how far you've gotten, and we'll figure it out together.",
		'welcome_es'         => "¡Hola! Soy el ZornScience Tutor. ¿Tienes un problema de química, física o biología que no te sale? Cuéntame en qué estás trabajando y hasta dónde llegaste, y lo resolvemos juntos.",
		'avatar_url'         => '',
		'max_tokens'         => 1500,
		'history_messages'   => 12,
		'max_input_chars'    => 1500,
		'per_visitor_hour'   => 15,
		'per_visitor_day'    => 50,
		'site_daily_cap'     => 2000,
		'images_enabled'     => 1,
		'images_per_day'     => 10,
		'voice_enabled'      => 1,
		'link_pages'         => 1,
		'exclude_slugs'      => '',
		'price_input'        => 0.10,
		'price_output'       => 0.50,
		'system_prompt'      => '',
	);
}

function zst_default_prompt() {
	$file = ZST_DIR . 'includes/default-prompt.txt';
	return file_exists( $file ) ? trim( (string) file_get_contents( $file ) ) : '';
}

/**
 * Compares prompts while ignoring line endings and extra spaces, which
 * browsers change when a settings form is submitted.
 */
function zst_prompt_norm( $text ) {
	return trim( preg_replace( '/\s+/', ' ', str_replace( "\r\n", "\n", (string) $text ) ) );
}

/**
 * True when a saved prompt is just a built-in prompt (current or older),
 * so the plugin keeps using its newest built-in version.
 */
function zst_is_builtin_prompt( $text ) {
	$n = zst_prompt_norm( $text );
	if ( '' === $n || zst_prompt_norm( zst_default_prompt() ) === $n ) {
		return true;
	}
	// Built-in prompts from versions 1.0, 1.1, and 1.5 (chemistry and physics only).
	$older = array( '2422d53521c4fe4750b991e03ef86d27', 'a5a2b5b0158f1139b114c4f6fead96a5', '85147c4d9bbbb25b4e1e67a01052cc0f' );
	return in_array( md5( $n ), $older, true );
}

function zst_get_settings() {
	$saved    = get_option( ZST_OPTION, array() );
	$settings = wp_parse_args( is_array( $saved ) ? $saved : array(), zst_defaults() );
	// Move sites that saved the old default name and welcome to the new ones.
	if ( 'ZornScience Bot' === $settings['bot_name'] ) {
		$settings['bot_name'] = 'ZornScience Tutor';
	}
	$old_welcome_en = array(
		"Hi! I'm the ZornScience Bot. I can help you work through chemistry and physics problems. Tell me what you're working on and what you've tried so far.",
		"Hey there! I'm the ZornScience Tutor. Stuck on a chemistry or physics problem? Tell me what you're working on and how far you've gotten, and we'll figure it out together.",
	);
	$old_welcome_es = array(
		'¡Hola! Soy el ZornScience Tutor. ¿Tienes un problema de química o física que no te sale? Cuéntame en qué estás trabajando y hasta dónde llegaste, y lo resolvemos juntos.',
	);
	foreach ( $old_welcome_en as $old ) {
		if ( zst_prompt_norm( $settings['welcome'] ) === zst_prompt_norm( $old ) ) {
			$settings['welcome'] = zst_defaults()['welcome'];
		}
	}
	foreach ( $old_welcome_es as $old ) {
		if ( zst_prompt_norm( $settings['welcome_es'] ) === zst_prompt_norm( $old ) ) {
			$settings['welcome_es'] = zst_defaults()['welcome_es'];
		}
	}
	if ( zst_is_builtin_prompt( $settings['system_prompt'] ) ) {
		$settings['system_prompt'] = zst_default_prompt();
	}
	return $settings;
}

register_activation_hook( __FILE__, 'zst_activate' );
function zst_activate() {
	if ( false === get_option( ZST_OPTION ) ) {
		add_option( ZST_OPTION, zst_defaults(), '', false );
	}
}

add_action( 'admin_menu', 'zst_admin_menu' );
function zst_admin_menu() {
	add_options_page(
		'ZornScience Tutor',
		'ZornScience Tutor',
		'manage_options',
		'zornscience-tutor',
		'zst_render_settings_page'
	);
}

add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), 'zst_action_links' );
function zst_action_links( $links ) {
	array_unshift( $links, '<a href="' . esc_url( admin_url( 'options-general.php?page=zornscience-tutor' ) ) . '">Settings</a>' );
	return $links;
}

add_action( 'admin_post_zst_save_settings', 'zst_handle_save_settings' );
function zst_handle_save_settings() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( 'Not allowed.' );
	}
	check_admin_referer( 'zst_save_settings' );

	$in  = wp_unslash( $_POST );
	$def = zst_defaults();
	$out = array();

	$out['enabled']          = empty( $in['enabled'] ) ? 0 : 1;
	$out['model']            = sanitize_text_field( $in['model'] ?? $def['model'] );
	$out['bot_name']         = sanitize_text_field( $in['bot_name'] ?? $def['bot_name'] );
	$out['welcome']          = sanitize_textarea_field( $in['welcome'] ?? $def['welcome'] );
	$out['welcome_es']       = sanitize_textarea_field( $in['welcome_es'] ?? $def['welcome_es'] );
	$out['avatar_url']       = esc_url_raw( $in['avatar_url'] ?? '' );
	$out['max_tokens']       = max( 300, min( 8000, absint( $in['max_tokens'] ?? $def['max_tokens'] ) ) );
	$out['history_messages'] = max( 2, min( 40, absint( $in['history_messages'] ?? $def['history_messages'] ) ) );
	$out['max_input_chars']  = max( 100, min( 6000, absint( $in['max_input_chars'] ?? $def['max_input_chars'] ) ) );
	$out['per_visitor_hour'] = max( 1, absint( $in['per_visitor_hour'] ?? $def['per_visitor_hour'] ) );
	$out['per_visitor_day']  = max( 1, absint( $in['per_visitor_day'] ?? $def['per_visitor_day'] ) );
	$out['site_daily_cap']   = max( 1, absint( $in['site_daily_cap'] ?? $def['site_daily_cap'] ) );
	$out['images_enabled']   = empty( $in['images_enabled'] ) ? 0 : 1;
	$out['images_per_day']   = max( 1, absint( $in['images_per_day'] ?? $def['images_per_day'] ) );
	$out['voice_enabled']    = empty( $in['voice_enabled'] ) ? 0 : 1;
	$out['link_pages']       = empty( $in['link_pages'] ) ? 0 : 1;
	$out['exclude_slugs']    = sanitize_text_field( $in['exclude_slugs'] ?? '' );
	$out['price_input']      = max( 0, (float) ( $in['price_input'] ?? $def['price_input'] ) );
	$out['price_output']     = max( 0, (float) ( $in['price_output'] ?? $def['price_output'] ) );

	if ( '' === $out['model'] ) {
		$out['model'] = $def['model'];
	}

	if ( ! empty( $in['reset_prompt'] ) ) {
		$out['system_prompt'] = '';
	} else {
		$prompt = (string) ( $in['system_prompt'] ?? '' );
		// Store blank if identical to the built-in prompt, so plugin updates can improve it.
		$out['system_prompt'] = zst_is_builtin_prompt( $prompt ) ? '' : trim( str_replace( "\r\n", "\n", wp_kses_no_null( $prompt ) ) );
	}

	update_option( ZST_OPTION, $out, false );
	delete_transient( 'zst_site_catalog' );

	// API key: only change when a new value is typed, or when "remove" is checked.
	if ( ! empty( $in['remove_key'] ) ) {
		delete_option( ZST_KEY_OPTION );
	} elseif ( ! empty( $in['api_key'] ) ) {
		$key = trim( sanitize_text_field( $in['api_key'] ) );
		if ( '' !== $key ) {
			update_option( ZST_KEY_OPTION, $key, false );
		}
	}

	if ( ! empty( $in['reset_stats'] ) ) {
		delete_option( ZST_STATS_OPTION );
	}

	wp_safe_redirect( admin_url( 'options-general.php?page=zornscience-tutor&saved=1' ) );
	exit;
}

add_action( 'admin_post_zst_test_connection', 'zst_handle_test_connection' );
function zst_handle_test_connection() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( 'Not allowed.' );
	}
	check_admin_referer( 'zst_test_connection' );

	$result = zst_call_claude(
		array(
			array(
				'role'    => 'user',
				'content' => 'In one short sentence, what is a mole in chemistry?',
			),
		),
		zst_get_settings()
	);

	$msg = is_wp_error( $result ) ? 'error:' . $result->get_error_message() : 'ok:' . $result['text'];
	set_transient( 'zst_test_result_' . get_current_user_id(), $msg, 120 );
	wp_safe_redirect( admin_url( 'options-general.php?page=zornscience-tutor&tested=1' ) );
	exit;
}

function zst_render_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	$s       = zst_get_settings();
	$key     = (string) get_option( ZST_KEY_OPTION, '' );
	$has_key = '' !== $key;
	$stats   = zst_get_stats();
	?>
	<div class="wrap">
		<h1>ZornScience Tutor</h1>

		<?php if ( isset( $_GET['saved'] ) ) : ?>
			<div class="notice notice-success is-dismissible"><p>Settings saved.</p></div>
		<?php endif; ?>

		<?php
		if ( isset( $_GET['tested'] ) ) {
			$res = get_transient( 'zst_test_result_' . get_current_user_id() );
			delete_transient( 'zst_test_result_' . get_current_user_id() );
			if ( $res ) {
				$ok   = 0 === strpos( $res, 'ok:' );
				$body = substr( $res, $ok ? 3 : 6 );
				echo '<div class="notice ' . ( $ok ? 'notice-success' : 'notice-error' ) . '"><p><strong>' . ( $ok ? 'Connection works.' : 'Connection failed.' ) . '</strong> ' . esc_html( $body ) . '</p></div>';
			}
		}
		?>

		<p>Add the chat to any page or post with the shortcode <code>[zornscience_tutor]</code>.</p>

		<h2>Usage</h2>
		<table class="widefat striped" style="max-width:720px">
			<thead><tr><th>Period</th><th>Messages</th><th>Input tokens</th><th>Cached input</th><th>Output tokens</th><th>Estimated cost</th><th>Saved by caching</th></tr></thead>
			<tbody>
				<?php
				foreach ( array( 'Today' => $stats['today'], 'This month' => $stats['month'], 'All time' => $stats['total'] ) as $label => $row ) {
					$pi    = $s['price_input'] / 1000000;
					$cost  = $row['in'] * $pi + $row['cw'] * $pi * 1.25 + $row['cr'] * $pi * 0.1 + ( $row['out'] / 1000000 ) * $s['price_output'];
					$saved = $row['cr'] * $pi * 0.9 - $row['cw'] * $pi * 0.25;
					printf(
						'<tr><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>$%s</td><td>$%s</td></tr>',
						esc_html( $label ),
						esc_html( number_format_i18n( $row['msgs'] ) ),
						esc_html( number_format_i18n( $row['in'] + $row['cw'] ) ),
						esc_html( number_format_i18n( $row['cr'] ) ),
						esc_html( number_format_i18n( $row['out'] ) ),
						esc_html( number_format( $cost, 2 ) ),
						esc_html( number_format( max( 0, $saved ), 2 ) )
					);
				}
				?>
			</tbody>
		</table>
		<p class="description">Cached input is billed at a tenth of the normal input price. Cost is an estimate from the prices below. Your Anthropic Console shows the exact bill. Messages blocked by limits today: <?php echo esc_html( number_format_i18n( $stats['today']['blocked'] ) ); ?>.</p>

		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
			<input type="hidden" name="action" value="zst_save_settings">
			<?php wp_nonce_field( 'zst_save_settings' ); ?>

			<h2>Connection</h2>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row">Chat enabled</th>
					<td><label><input type="checkbox" name="enabled" value="1" <?php checked( $s['enabled'], 1 ); ?>> Turn the tutor on for visitors</label>
					<p class="description">Uncheck to pause the bot instantly. Visitors will see a "taking a break" message.</p></td>
				</tr>
				<tr>
					<th scope="row"><label for="zst_api_key">Anthropic API key</label></th>
					<td>
						<input type="password" id="zst_api_key" name="api_key" class="regular-text" autocomplete="new-password" placeholder="<?php echo $has_key ? esc_attr( 'Saved (ends in ' . substr( $key, -4 ) . '). Type a new key to replace it.' ) : 'sk-ant-...'; ?>">
						<?php if ( $has_key ) : ?>
							<br><label><input type="checkbox" name="remove_key" value="1"> Remove saved key</label>
						<?php endif; ?>
						<p class="description">Stored on your server only. It is never sent to visitors' browsers. Use a key from a dedicated Console workspace with a monthly spend limit.</p>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="zst_model">Model ID</label></th>
					<td><input type="text" id="zst_model" name="model" value="<?php echo esc_attr( $s['model'] ); ?>" class="regular-text">
					<p class="description">Default: <code>claude-haiku-5-5</code></p></td>
				</tr>
			</table>

			<h2>Limits and cost controls</h2>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row">Messages per visitor</th>
					<td>
						<input type="number" min="1" name="per_visitor_hour" value="<?php echo esc_attr( $s['per_visitor_hour'] ); ?>" class="small-text"> per hour,
						<input type="number" min="1" name="per_visitor_day" value="<?php echo esc_attr( $s['per_visitor_day'] ); ?>" class="small-text"> per day
						<p class="description">Visitors are identified by an anonymous hash of their IP address. No names or accounts.</p>
					</td>
				</tr>
				<tr>
					<th scope="row">Site-wide daily cap</th>
					<td><input type="number" min="1" name="site_daily_cap" value="<?php echo esc_attr( $s['site_daily_cap'] ); ?>" class="small-text"> messages per day for all visitors combined
					<p class="description">A safety net if someone gets around the per-visitor limits.</p></td>
				</tr>
				<tr>
					<th scope="row">Photo uploads</th>
					<td>
						<label><input type="checkbox" name="images_enabled" value="1" <?php checked( $s['images_enabled'], 1 ); ?>> Let students attach a photo or screenshot of their work</label><br>
						<input type="number" min="1" name="images_per_day" value="<?php echo esc_attr( $s['images_per_day'] ); ?>" class="small-text"> photos per visitor per day
						<p class="description">Photos are shrunk in the browser before upload and only the newest one is sent, so each costs a fraction of a cent. Photos are not saved on your server.</p>
					</td>
				</tr>
				<tr>
					<th scope="row">Max reply length</th>
					<td><input type="number" min="300" max="8000" name="max_tokens" value="<?php echo esc_attr( $s['max_tokens'] ); ?>" class="small-text"> tokens
					<p class="description">Includes any thinking the model does before replying. 1500 is plenty for short tutoring replies.</p></td>
				</tr>
				<tr>
					<th scope="row">Conversation memory</th>
					<td><input type="number" min="2" max="40" name="history_messages" value="<?php echo esc_attr( $s['history_messages'] ); ?>" class="small-text"> most recent messages sent with each request</td>
				</tr>
				<tr>
					<th scope="row">Max student message</th>
					<td><input type="number" min="100" max="6000" name="max_input_chars" value="<?php echo esc_attr( $s['max_input_chars'] ); ?>" class="small-text"> characters</td>
				</tr>
				<tr>
					<th scope="row">Prices (for the estimate)</th>
					<td>$<input type="number" step="0.01" min="0" name="price_input" value="<?php echo esc_attr( $s['price_input'] ); ?>" class="small-text"> input /
						$<input type="number" step="0.01" min="0" name="price_output" value="<?php echo esc_attr( $s['price_output'] ); ?>" class="small-text"> output, per million tokens</td>
				</tr>
			</table>

			<h2>Appearance</h2>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row"><label for="zst_bot_name">Tutor name</label></th>
					<td><input type="text" id="zst_bot_name" name="bot_name" value="<?php echo esc_attr( $s['bot_name'] ); ?>" class="regular-text"></td>
				</tr>
				<tr>
					<th scope="row"><label for="zst_avatar">Avatar image URL</label></th>
					<td><input type="url" id="zst_avatar" name="avatar_url" value="<?php echo esc_attr( $s['avatar_url'] ); ?>" class="regular-text">
					<p class="description">Optional. Upload your cartoon avatar to the Media Library and paste its URL here. Leave blank for an atom icon.</p></td>
				</tr>
				<tr>
					<th scope="row">Voice</th>
					<td><label><input type="checkbox" name="voice_enabled" value="1" <?php checked( $s['voice_enabled'], 1 ); ?>> Show the microphone and read-aloud buttons</label>
					<p class="description">Uses the visitor's browser speech features, so there is no extra cost. The microphone works in Chrome, Edge, and Safari.</p></td>
				</tr>
				<tr>
					<th scope="row"><label for="zst_welcome">Welcome message</label></th>
					<td><textarea id="zst_welcome" name="welcome" rows="3" class="large-text"><?php echo esc_textarea( $s['welcome'] ); ?></textarea></td>
				</tr>
				<tr>
					<th scope="row"><label for="zst_welcome_es">Welcome message (Spanish)</label></th>
					<td><textarea id="zst_welcome_es" name="welcome_es" rows="3" class="large-text"><?php echo esc_textarea( $s['welcome_es'] ); ?></textarea>
					<p class="description">Shown when a student switches the chat to Español.</p></td>
				</tr>
			</table>

			<h2>Linking to ZornScience pages</h2>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row">Suggest site pages</th>
					<td><label><input type="checkbox" name="link_pages" value="1" <?php checked( $s['link_pages'], 1 ); ?>> Let the tutor link students to relevant lessons and resources on this site</label>
					<p class="description">The tutor gets a list of your published pages and posts (titles and links only). The list updates automatically when you publish or edit content. Currently listed: <?php echo esc_html( number_format_i18n( count( zst_site_entries() ) ) ); ?> items.</p></td>
				</tr>
				<tr>
					<th scope="row"><label for="zst_exclude">Leave out</label></th>
					<td><input type="text" id="zst_exclude" name="exclude_slugs" value="<?php echo esc_attr( $s['exclude_slugs'] ); ?>" class="regular-text" placeholder="contact, privacy-policy">
					<p class="description">Optional. Page or post slugs (the last part of the URL) the tutor should never link to, separated by commas. The tutor page itself is always left out.</p></td>
				</tr>
			</table>

			<h2>Tutor instructions (system prompt)</h2>
			<p>These are the hidden instructions the bot follows. Edit carefully, and test after changes.</p>
			<textarea name="system_prompt" rows="24" class="large-text code"><?php echo esc_textarea( $s['system_prompt'] ); ?></textarea>
			<p><label><input type="checkbox" name="reset_prompt" value="1"> Restore the built-in prompt</label></p>

			<h2>Maintenance</h2>
			<p><label><input type="checkbox" name="reset_stats" value="1"> Reset usage numbers</label></p>

			<?php submit_button( 'Save settings' ); ?>
		</form>

		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
			<input type="hidden" name="action" value="zst_test_connection">
			<?php wp_nonce_field( 'zst_test_connection' ); ?>
			<?php submit_button( 'Test connection', 'secondary', 'submit', false, $has_key ? array() : array( 'disabled' => 'disabled' ) ); ?>
			<span class="description">&nbsp;Sends one short test question to Claude using the saved key.</span>
		</form>
	</div>
	<?php
}

/* -------------------------------------------------------------------------
 * Language (English and Spanish)
 * ---------------------------------------------------------------------- */

/**
 * Gets or sets the language for the current chat request.
 */
function zst_lang( $set = null ) {
	static $lang = 'en';
	if ( null !== $set ) {
		$lang = ( 'es' === $set ) ? 'es' : 'en';
	}
	return $lang;
}

/**
 * Translates a visitor-facing message when the chat is in Spanish.
 */
function zst_t( $text ) {
	if ( 'es' !== zst_lang() ) {
		return $text;
	}
	static $es = array(
		'The tutor has helped a lot of students today and is resting until tomorrow. Try again then!' => 'El tutor ha ayudado a muchos estudiantes hoy y descansa hasta mañana. ¡Vuelve a intentarlo entonces!',
		'You\'ve reached the limit for this hour. Take a few minutes to try the next step on your own, then come back. You\'ve got this!' => 'Llegaste al límite de esta hora. Tómate unos minutos para intentar el siguiente paso por tu cuenta y luego regresa. ¡Tú puedes!',
		'You\'ve reached today\'s limit. Come back tomorrow, and keep practicing in the meantime!' => 'Llegaste al límite de hoy. Regresa mañana y sigue practicando mientras tanto.',
		'That photo could not be read. Please try another one.' => 'No se pudo leer esa foto. Prueba con otra.',
		'That photo is too large. Please try a smaller one.' => 'Esa foto es demasiado grande. Prueba con una más pequeña.',
		'Please upload a JPG, PNG, or WebP image.' => 'Sube una imagen JPG, PNG o WebP.',
		'That photo size is not supported. Please try another one.' => 'Ese tamaño de foto no es compatible. Prueba con otra.',
		'I can\'t help with that one. Let\'s get back to chemistry, physics, or biology. What are you working on?' => 'No puedo ayudarte con eso. Volvamos a la química, la física o la biología. ¿En qué estás trabajando?',
		'Sorry, I lost my train of thought there. Could you ask that again, maybe in a shorter way?' => 'Perdón, perdí el hilo. ¿Me lo puedes preguntar otra vez, quizás de forma más corta?',
		'

(I ran out of room. Ask me to continue if you need the rest.)' => '

(Me quedé sin espacio. Pídeme que continúe si necesitas el resto.)',
		'Invalid conversation.' => 'Conversación no válida.',
		'Please type a question.' => 'Escribe una pregunta, por favor.',
		'The tutor is taking a break right now. Please check back later.' => 'El tutor está tomando un descanso. Vuelve más tarde, por favor.',
		'This chat only works on ZornScience.org.' => 'Este chat solo funciona en ZornScience.org.',
		'Photo uploads are turned off right now. Please type out the problem instead.' => 'Subir fotos está desactivado por ahora. Escribe el problema, por favor.',
		'You\'ve used today\'s photo uploads. You can still type out the problem and I\'ll help!' => 'Ya usaste las fotos de hoy. Todavía puedes escribir el problema y te ayudo.',
		'The tutor is very busy right now. Please wait a moment and try again.' => 'El tutor está muy ocupado ahora. Espera un momento e inténtalo de nuevo.',
		'Something went wrong on my end. Please try again in a minute.' => 'Algo salió mal de mi lado. Inténtalo de nuevo en un minuto.',
		'That message is too long. Please keep it under %d characters.' => 'Ese mensaje es demasiado largo. Escribe menos de %d caracteres, por favor.',
	);
	return isset( $es[ $text ] ) ? $es[ $text ] : $text;
}

/**
 * Language instructions added to the tutor prompt for each request.
 */
function zst_language_instruction( $lang ) {
	if ( 'es' === $lang ) {
		return "\n\nLANGUAGE\nThe student switched the chat to Spanish. Reply in natural, friendly Spanish, the kind a bilingual tutor in a US high school would use (neutral Latin American Spanish, using tú). Keep the same personality and tutoring rules. Use standard chemical symbols, formulas, and SI units. The first time a key term comes up, you may add the English term in parentheses, for example \"reactivo limitante (limiting reactant)\", since many students take the class in English. If the student writes to you in English anyway, it's fine to answer in English.\n\nFor Biology, use Mexican Spanish science terms: célula, fotosíntesis, respiración celular, ADN, ARN, herencia, selección natural, ecosistema, población, comunidad, biodiversidad, mitosis, meiosis, cromosoma, gen, alelo, cuadro de Punnett, homeostasis, enzima, proteína. Write the accents correctly, and add the English term in parentheses the first time a key term comes up, for example \"fotosíntesis (photosynthesis)\".";
	}
	return "\n\nLANGUAGE\nReply in English. If the student writes to you in another language, such as Spanish, reply in that language instead.";
}

/* -------------------------------------------------------------------------
 * Usage stats
 * ---------------------------------------------------------------------- */

function zst_empty_row() {
	return array( 'msgs' => 0, 'in' => 0, 'out' => 0, 'blocked' => 0, 'cr' => 0, 'cw' => 0 );
}

function zst_get_stats() {
	$raw   = get_option( ZST_STATS_OPTION, array() );
	$raw   = is_array( $raw ) ? $raw : array();
	$today = current_time( 'Y-m-d' );
	$month = current_time( 'Y-m' );

	$stats = array(
		'today' => ( isset( $raw['today_key'], $raw['today'] ) && $raw['today_key'] === $today ) ? $raw['today'] : zst_empty_row(),
		'month' => ( isset( $raw['month_key'], $raw['month'] ) && $raw['month_key'] === $month ) ? $raw['month'] : zst_empty_row(),
		'total' => isset( $raw['total'] ) ? $raw['total'] : zst_empty_row(),
	);
	foreach ( $stats as $k => $row ) {
		$stats[ $k ] = wp_parse_args( $row, zst_empty_row() );
	}
	return $stats;
}

function zst_record_stats( $in_tokens, $out_tokens, $blocked = false, $cache_read = 0, $cache_write = 0 ) {
	$stats = zst_get_stats();
	foreach ( array( 'today', 'month', 'total' ) as $k ) {
		if ( $blocked ) {
			$stats[ $k ]['blocked']++;
		} else {
			$stats[ $k ]['msgs']++;
			$stats[ $k ]['in']  += (int) $in_tokens;
			$stats[ $k ]['out'] += (int) $out_tokens;
			$stats[ $k ]['cr']  += (int) $cache_read;
			$stats[ $k ]['cw']  += (int) $cache_write;
		}
	}
	update_option(
		ZST_STATS_OPTION,
		array(
			'today_key' => current_time( 'Y-m-d' ),
			'today'     => $stats['today'],
			'month_key' => current_time( 'Y-m' ),
			'month'     => $stats['month'],
			'total'     => $stats['total'],
		),
		false
	);
}

/* -------------------------------------------------------------------------
 * Rate limiting
 * ---------------------------------------------------------------------- */

function zst_visitor_id() {
	$ip = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : 'unknown';
	// Anonymous, salted hash. The raw IP is never stored.
	return substr( hash_hmac( 'sha256', $ip, wp_salt( 'auth' ) ), 0, 20 );
}

/**
 * Returns an array of counter keys with their limits and lifetimes.
 */
function zst_limit_buckets( $settings ) {
	$vid = zst_visitor_id();
	return array(
		array( 'key' => 'zst_h_' . $vid . '_' . gmdate( 'YmdH' ), 'limit' => (int) $settings['per_visitor_hour'], 'ttl' => HOUR_IN_SECONDS, 'msg' => 'hour' ),
		array( 'key' => 'zst_d_' . $vid . '_' . gmdate( 'Ymd' ), 'limit' => (int) $settings['per_visitor_day'], 'ttl' => DAY_IN_SECONDS, 'msg' => 'day' ),
		array( 'key' => 'zst_site_' . gmdate( 'Ymd' ), 'limit' => (int) $settings['site_daily_cap'], 'ttl' => DAY_IN_SECONDS, 'msg' => 'site' ),
	);
}

/**
 * Checks limits and, if allowed, reserves one message. Returns true or a WP_Error.
 */
function zst_reserve_message( $settings ) {
	$buckets = zst_limit_buckets( $settings );
	foreach ( $buckets as $b ) {
		$count = (int) get_transient( $b['key'] );
		if ( $count >= $b['limit'] ) {
			if ( 'site' === $b['msg'] ) {
				$text = zst_t( "The tutor has helped a lot of students today and is resting until tomorrow. Try again then!" );
			} elseif ( 'hour' === $b['msg'] ) {
				$text = zst_t( "You've reached the limit for this hour. Take a few minutes to try the next step on your own, then come back. You've got this!" );
			} else {
				$text = zst_t( "You've reached today's limit. Come back tomorrow, and keep practicing in the meantime!" );
			}
			return new WP_Error( 'zst_limited', $text, array( 'status' => 429 ) );
		}
	}
	foreach ( $buckets as $b ) {
		set_transient( $b['key'], (int) get_transient( $b['key'] ) + 1, $b['ttl'] );
	}
	return true;
}

/**
 * Gives back a reserved message when the API call fails, so students are not penalized.
 */
function zst_release_message( $settings ) {
	foreach ( zst_limit_buckets( $settings ) as $b ) {
		$count = (int) get_transient( $b['key'] );
		if ( $count > 0 ) {
			set_transient( $b['key'], $count - 1, $b['ttl'] );
		}
	}
}

function zst_image_bucket( $settings ) {
	return array(
		'key'   => 'zst_img_' . zst_visitor_id() . '_' . gmdate( 'Ymd' ),
		'limit' => (int) $settings['images_per_day'],
		'ttl'   => DAY_IN_SECONDS,
	);
}

/**
 * Validates an uploaded image. Returns array( media_type, data ) or WP_Error.
 */
function zst_validate_image( $image ) {
	if ( ! is_array( $image ) || empty( $image['data'] ) || ! is_string( $image['data'] ) ) {
		return new WP_Error( 'zst_img', zst_t( 'That photo could not be read. Please try another one.' ) );
	}
	$allowed = array( 'image/jpeg', 'image/png', 'image/webp', 'image/gif' );
	$data    = preg_replace( '/^data:[^,]*,/', '', $image['data'] );
	if ( strlen( $data ) > 3000000 ) {
		return new WP_Error( 'zst_img', zst_t( 'That photo is too large. Please try a smaller one.' ) );
	}
	$bin = base64_decode( $data, true );
	if ( false === $bin ) {
		return new WP_Error( 'zst_img', zst_t( 'That photo could not be read. Please try another one.' ) );
	}
	$info = @getimagesizefromstring( $bin ); // phpcs:ignore
	if ( ! $info || empty( $info['mime'] ) || ! in_array( $info['mime'], $allowed, true ) ) {
		return new WP_Error( 'zst_img', zst_t( 'Please upload a JPG, PNG, or WebP image.' ) );
	}
	if ( $info[0] < 10 || $info[1] < 10 || $info[0] > 8000 || $info[1] > 8000 ) {
		return new WP_Error( 'zst_img', zst_t( 'That photo size is not supported. Please try another one.' ) );
	}
	return array(
		'media_type' => $info['mime'],
		'data'       => base64_encode( $bin ),
	);
}

/* -------------------------------------------------------------------------
 * Claude API
 * ---------------------------------------------------------------------- */

/**
 * Calls the Messages API. Returns array( text, in, out, stop ) or WP_Error.
 */
function zst_call_claude( $messages, $settings ) {
	$key = (string) get_option( ZST_KEY_OPTION, '' );
	if ( '' === $key ) {
		return new WP_Error( 'zst_no_key', 'No API key saved.' );
	}

	// Haiku 5.5 rejects non-default sampling parameters and assistant prefill,
	// so the request sends only the essentials and always ends on a user turn.
	// Prompt caching: the long, unchanging part (tutor instructions plus the
	// site page list) is marked for caching so repeat requests read it at a
	// tenth of the price. The top-level cache_control also caches the growing
	// conversation. The short language note comes after the cached part.
	$system = array(
		array(
			'type'          => 'text',
			'text'          => $settings['system_prompt'],
			'cache_control' => array( 'type' => 'ephemeral' ),
		),
	);
	if ( ! empty( $settings['system_extra'] ) ) {
		$system[] = array(
			'type' => 'text',
			'text' => $settings['system_extra'],
		);
	}
	$body = array(
		'model'         => $settings['model'],
		'max_tokens'    => (int) $settings['max_tokens'],
		'system'        => $system,
		'messages'      => $messages,
		'cache_control' => array( 'type' => 'ephemeral' ),
	);

	$response = wp_remote_post(
		ZST_API_URL,
		array(
			'timeout' => 60,
			'headers' => array(
				'x-api-key'         => $key,
				'anthropic-version' => '2023-06-01',
				'content-type'      => 'application/json',
			),
			'body'    => wp_json_encode( $body ),
		)
	);

	if ( is_wp_error( $response ) ) {
		return new WP_Error( 'zst_http', 'Could not reach Claude: ' . $response->get_error_message() );
	}

	$code = (int) wp_remote_retrieve_response_code( $response );
	$data = json_decode( wp_remote_retrieve_body( $response ), true );

	if ( 200 !== $code ) {
		$detail = isset( $data['error']['message'] ) ? $data['error']['message'] : 'HTTP ' . $code;
		return new WP_Error( 'zst_api', $detail, array( 'http' => $code ) );
	}

	// Pick text blocks by type. Responses may begin with thinking blocks.
	$text = '';
	if ( isset( $data['content'] ) && is_array( $data['content'] ) ) {
		foreach ( $data['content'] as $block ) {
			if ( isset( $block['type'] ) && 'text' === $block['type'] && isset( $block['text'] ) ) {
				$text .= $block['text'];
			}
		}
	}

	$stop = isset( $data['stop_reason'] ) ? $data['stop_reason'] : '';
	$in   = isset( $data['usage']['input_tokens'] ) ? (int) $data['usage']['input_tokens'] : 0;
	$out  = isset( $data['usage']['output_tokens'] ) ? (int) $data['usage']['output_tokens'] : 0;
	$cr   = isset( $data['usage']['cache_read_input_tokens'] ) ? (int) $data['usage']['cache_read_input_tokens'] : 0;
	$cw   = isset( $data['usage']['cache_creation_input_tokens'] ) ? (int) $data['usage']['cache_creation_input_tokens'] : 0;

	if ( 'refusal' === $stop || '' === trim( $text ) ) {
		$text = ( 'refusal' === $stop )
			? zst_t( "I can't help with that one. Let's get back to chemistry, physics, or biology. What are you working on?" )
			: zst_t( "Sorry, I lost my train of thought there. Could you ask that again, maybe in a shorter way?" );
	} elseif ( 'max_tokens' === $stop ) {
		$text .= zst_t( "\n\n(I ran out of room. Ask me to continue if you need the rest.)" );
	}

	return array(
		'text' => trim( $text ),
		'in'   => $in,
		'out'  => $out,
		'cr'   => $cr,
		'cw'   => $cw,
		'stop' => $stop,
	);
}

/* -------------------------------------------------------------------------
 * ZornScience page list (so the tutor can link to lessons)
 * ---------------------------------------------------------------------- */

/**
 * Published pages and posts the tutor may link to, as arrays of
 * ( label, url ). Cached until content changes.
 */
function zst_site_entries() {
	$cached = get_transient( 'zst_site_catalog' );
	if ( is_array( $cached ) ) {
		return $cached;
	}

	$settings = zst_get_settings();
	$exclude  = array_filter( array_map( 'trim', explode( ',', strtolower( (string) $settings['exclude_slugs'] ) ) ) );
	$entries  = array();

	$items = get_posts(
		array(
			'post_type'        => array( 'page', 'post' ),
			'post_status'      => 'publish',
			'posts_per_page'   => 600,
			'orderby'          => 'menu_order title',
			'order'            => 'ASC',
			'has_password'     => false,
			'suppress_filters' => false,
		)
	);

	foreach ( $items as $item ) {
		if ( in_array( strtolower( $item->post_name ), $exclude, true ) ) {
			continue;
		}
		if ( false !== strpos( (string) $item->post_content, '[zornscience_tutor' ) ) {
			continue; // The tutor page itself.
		}
		$title = trim( wp_strip_all_tags( get_the_title( $item ) ) );
		if ( '' === $title ) {
			continue;
		}
		$trail = array();
		if ( 'page' === $item->post_type ) {
			foreach ( array_reverse( get_post_ancestors( $item ) ) as $ancestor_id ) {
				$trail[] = trim( wp_strip_all_tags( get_the_title( $ancestor_id ) ) );
			}
		} else {
			$trail[] = 'Lab Notes';
		}
		$trail[]   = $title;
		$entries[] = array(
			'label' => implode( ' > ', array_filter( $trail ) ),
			'url'   => get_permalink( $item ),
		);
	}

	usort(
		$entries,
		function ( $a, $b ) {
			return strnatcasecmp( $a['label'], $b['label'] );
		}
	);

	set_transient( 'zst_site_catalog', $entries, DAY_IN_SECONDS );
	return $entries;
}

/**
 * Rebuild the list whenever a page or post is published, edited, or removed.
 */
function zst_clear_site_catalog( $post_id = 0 ) {
	$type = $post_id ? get_post_type( $post_id ) : '';
	if ( ! $post_id || in_array( $type, array( 'page', 'post' ), true ) ) {
		delete_transient( 'zst_site_catalog' );
	}
}
add_action( 'save_post', 'zst_clear_site_catalog' );
add_action( 'deleted_post', 'zst_clear_site_catalog' );
add_action( 'trashed_post', 'zst_clear_site_catalog' );

/**
 * The page list section added to the tutor's instructions.
 */
function zst_site_prompt( $settings ) {
	if ( empty( $settings['link_pages'] ) ) {
		return '';
	}
	$entries = zst_site_entries();
	if ( empty( $entries ) ) {
		return '';
	}
	$lines = array();
	foreach ( $entries as $e ) {
		$lines[] = '- ' . $e['label'] . ' | ' . $e['url'];
	}
	return "\n\nZORNSCIENCE.ORG PAGES\n"
		. "Below is every lesson and resource on ZornScience.org (title path | link). When a student is learning or reviewing a concept, or is stuck on an idea rather than a single arithmetic step, you can point them to the one or two most relevant pages as a markdown link, for example [Dimensional Analysis](https://zornscience.org/science/quantitative-skills/units/dimensional-analysis/).\n"
		. "- Work the link in naturally, like a tutor saying \"this lesson has worked examples on exactly this\". It usually fits best right after your guiding question or when wrapping up a topic.\n"
		. "- Only link when it truly helps. Most replies should have no link, and never more than two.\n"
		. "- Use URLs exactly as written in this list. Never make up, shorten, or change a URL, and never link to any other website.\n"
		. "- If nothing in the list fits the question, don't link anything.\n"
		. "- The pages are in English. When chatting in Spanish, keep the page title in English and mention the page is in English.\n"
		. "- Linking to a lesson never replaces tutoring. Keep guiding the student with questions.\n\n"
		. implode( "\n", $lines );
}

/**
 * Keeps only links that point to pages in the list. Any other link is
 * turned back into plain text.
 */
function zst_filter_links( $text, $settings ) {
	$allowed = array();
	foreach ( zst_site_entries() as $e ) {
		$allowed[ untrailingslashit( strtolower( $e['url'] ) ) ] = true;
	}
	$link_ok = ! empty( $settings['link_pages'] );
	return preg_replace_callback(
		'/\[([^\]\n]{1,200})\]\(\s*<?(https?:\/\/[^\s)>]+)>?\s*\)/i',
		function ( $m ) use ( $allowed, $link_ok ) {
			$key = untrailingslashit( strtolower( $m[2] ) );
			if ( $link_ok && isset( $allowed[ $key ] ) ) {
				return $m[0];
			}
			return $m[1];
		},
		$text
	);
}

/* -------------------------------------------------------------------------
 * REST endpoint
 * ---------------------------------------------------------------------- */

add_action( 'rest_api_init', 'zst_register_routes' );
function zst_register_routes() {
	register_rest_route(
		'zst/v1',
		'/chat',
		array(
			'methods'             => 'POST',
			'callback'            => 'zst_rest_chat',
			'permission_callback' => '__return_true', // Public by design; protected by origin check and rate limits.
		)
	);
}

/**
 * Only accept requests coming from this site's own pages.
 */
function zst_origin_ok( WP_REST_Request $request ) {
	$site_host = wp_parse_url( home_url(), PHP_URL_HOST );
	$source    = $request->get_header( 'origin' );
	if ( empty( $source ) ) {
		$source = $request->get_header( 'referer' );
	}
	if ( empty( $source ) ) {
		return false;
	}
	$host = wp_parse_url( $source, PHP_URL_HOST );
	if ( ! $host || ! $site_host ) {
		return false;
	}
	$strip = function ( $h ) {
		return preg_replace( '/^www\./i', '', strtolower( $h ) );
	};
	return $strip( $host ) === $strip( $site_host );
}

/**
 * Cleans the conversation the browser sends: valid roles, alternating turns,
 * trimmed lengths, only the most recent messages, ending on a user turn.
 */
function zst_clean_messages( $raw, $settings ) {
	if ( ! is_array( $raw ) ) {
		return new WP_Error( 'zst_bad', zst_t( 'Invalid conversation.' ), array( 'status' => 400 ) );
	}

	$raw = array_slice( $raw, -1 * (int) $settings['history_messages'] );
	$out = array();

	foreach ( $raw as $m ) {
		if ( ! is_array( $m ) || ! isset( $m['role'], $m['content'] ) || ! is_string( $m['content'] ) ) {
			continue;
		}
		$role = ( 'assistant' === $m['role'] ) ? 'assistant' : 'user';
		$cap  = ( 'user' === $role ) ? (int) $settings['max_input_chars'] : 6000;
		$text = trim( wp_check_invalid_utf8( $m['content'] ) );
		if ( '' === $text ) {
			continue;
		}
		if ( mb_strlen( $text ) > $cap ) {
			$text = mb_substr( $text, 0, $cap );
		}
		// Merge consecutive messages from the same role so turns alternate.
		$last = count( $out ) - 1;
		if ( $last >= 0 && $out[ $last ]['role'] === $role ) {
			$out[ $last ]['content'] .= "\n\n" . $text;
		} else {
			$out[] = array( 'role' => $role, 'content' => $text );
		}
	}

	// Conversation must start and end with the student.
	while ( ! empty( $out ) && 'user' !== $out[0]['role'] ) {
		array_shift( $out );
	}
	if ( empty( $out ) || 'user' !== $out[ count( $out ) - 1 ]['role'] ) {
		return new WP_Error( 'zst_bad', zst_t( 'Please type a question.' ), array( 'status' => 400 ) );
	}

	return $out;
}

function zst_rest_chat( WP_REST_Request $request ) {
	$settings = zst_get_settings();
	$params   = $request->get_json_params();
	zst_lang( isset( $params['lang'] ) && is_string( $params['lang'] ) ? $params['lang'] : 'en' );
	$settings['system_prompt'] .= zst_site_prompt( $settings );
	$settings['system_extra']   = zst_language_instruction( zst_lang() );

	if ( empty( $settings['enabled'] ) || '' === (string) get_option( ZST_KEY_OPTION, '' ) ) {
		return new WP_REST_Response( array( 'error' => zst_t( 'The tutor is taking a break right now. Please check back later.' ) ), 503 );
	}

	if ( ! zst_origin_ok( $request ) ) {
		return new WP_REST_Response( array( 'error' => zst_t( 'This chat only works on ZornScience.org.' ) ), 403 );
	}

	$last   = is_array( $params['messages'] ?? null ) ? end( $params['messages'] ) : null;
	if ( is_array( $last ) && isset( $last['content'] ) && is_string( $last['content'] ) && mb_strlen( $last['content'] ) > (int) $settings['max_input_chars'] ) {
		return new WP_REST_Response( array( 'error' => sprintf( zst_t( 'That message is too long. Please keep it under %d characters.' ), (int) $settings['max_input_chars'] ) ), 400 );
	}

	$messages = zst_clean_messages( $params['messages'] ?? null, $settings );
	if ( is_wp_error( $messages ) ) {
		return new WP_REST_Response( array( 'error' => $messages->get_error_message() ), 400 );
	}

	// Optional photo, attached to the newest student message only.
	$image      = null;
	$img_bucket = null;
	if ( ! empty( $params['image'] ) ) {
		if ( empty( $settings['images_enabled'] ) ) {
			return new WP_REST_Response( array( 'error' => zst_t( 'Photo uploads are turned off right now. Please type out the problem instead.' ) ), 400 );
		}
		$image = zst_validate_image( $params['image'] );
		if ( is_wp_error( $image ) ) {
			return new WP_REST_Response( array( 'error' => $image->get_error_message() ), 400 );
		}
		$img_bucket = zst_image_bucket( $settings );
		if ( (int) get_transient( $img_bucket['key'] ) >= $img_bucket['limit'] ) {
			return new WP_REST_Response( array( 'error' => zst_t( "You've used today's photo uploads. You can still type out the problem and I'll help!" ), 'imageLimited' => true ), 429 );
		}
	}

	$reserved = zst_reserve_message( $settings );
	if ( is_wp_error( $reserved ) ) {
		zst_record_stats( 0, 0, true );
		return new WP_REST_Response( array( 'error' => $reserved->get_error_message(), 'limited' => true ), 429 );
	}

	if ( $image ) {
		set_transient( $img_bucket['key'], (int) get_transient( $img_bucket['key'] ) + 1, $img_bucket['ttl'] );
		$last                         = count( $messages ) - 1;
		$messages[ $last ]['content'] = array(
			array(
				'type'   => 'image',
				'source' => array(
					'type'       => 'base64',
					'media_type' => $image['media_type'],
					'data'       => $image['data'],
				),
			),
			array(
				'type' => 'text',
				'text' => $messages[ $last ]['content'],
			),
		);
	}

	$result = zst_call_claude( $messages, $settings );

	if ( is_wp_error( $result ) ) {
		zst_release_message( $settings );
		if ( $img_bucket ) {
			$n = (int) get_transient( $img_bucket['key'] );
			set_transient( $img_bucket['key'], max( 0, $n - 1 ), $img_bucket['ttl'] );
		}
		$data = $result->get_error_data();
		$http = is_array( $data ) && isset( $data['http'] ) ? (int) $data['http'] : 0;
		if ( in_array( $http, array( 429, 500, 502, 503, 529 ), true ) ) {
			$msg = zst_t( 'The tutor is very busy right now. Please wait a moment and try again.' );
		} else {
			$msg = zst_t( 'Something went wrong on my end. Please try again in a minute.' );
		}
		if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			error_log( 'ZornScience Tutor API error: ' . $result->get_error_message() ); // phpcs:ignore
		}
		return new WP_REST_Response( array( 'error' => $msg ), 502 );
	}

	zst_record_stats( $result['in'], $result['out'], false, $result['cr'], $result['cw'] );
	$result['text'] = zst_filter_links( $result['text'], $settings );

	$response = new WP_REST_Response( array( 'reply' => $result['text'] ), 200 );
	$response->header( 'Cache-Control', 'no-store' );
	return $response;
}

/* -------------------------------------------------------------------------
 * Shortcode and assets
 * ---------------------------------------------------------------------- */

// Registered on init so the shortcode works in block themes, which render page
// content before the wp_enqueue_scripts hook runs.
add_action( 'init', 'zst_register_assets' );
function zst_register_assets() {
	$katex = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/';
	wp_register_style( 'zst-katex', $katex . 'katex.min.css', array(), null );
	wp_register_script( 'zst-katex', $katex . 'katex.min.js', array(), null, true );
	wp_register_script( 'zst-katex-mhchem', $katex . 'contrib/mhchem.min.js', array( 'zst-katex' ), null, true );

	wp_register_style( 'zst-chat', ZST_URL . 'assets/chat.css', array(), ZST_VERSION );
	wp_register_script( 'zst-chat', ZST_URL . 'assets/chat.js', array( 'zst-katex', 'zst-katex-mhchem' ), ZST_VERSION, true );
}

add_shortcode( 'zornscience_tutor', 'zst_shortcode' );
function zst_shortcode( $atts ) {
	$s = zst_get_settings();

	wp_enqueue_style( 'zst-katex' );
	wp_enqueue_style( 'zst-chat' );
	wp_enqueue_script( 'zst-chat' );

	// Config goes on the element itself, which works in every theme type.
	$config = array(
		'endpoint'     => esc_url_raw( rest_url( 'zst/v1/chat' ) ),
		'botName'      => $s['bot_name'],
		'welcome'      => $s['welcome'],
		'welcomeEs'    => $s['welcome_es'],
		'avatar'       => $s['avatar_url'],
		'maxChars'     => (int) $s['max_input_chars'],
		'historyLimit' => (int) $s['history_messages'],
		'images'       => (bool) $s['images_enabled'],
		'voice'        => (bool) $s['voice_enabled'],
		'siteHost'     => wp_parse_url( home_url(), PHP_URL_HOST ),
	);

	ob_start();
	?>
	<div class="zst-chat" data-zst-chat data-zst-config="<?php echo esc_attr( wp_json_encode( $config ) ); ?>">
		<div class="zst-header">
			<div class="zst-avatar" aria-hidden="true"></div>
			<div class="zst-title">
				<strong class="zst-name"><?php echo esc_html( $s['bot_name'] ); ?></strong>
				<span class="zst-sub" data-zst-i18n="sub">Here to help with chemistry, physics, and biology</span>
			</div>
			<div class="zst-controls">
			<div class="zst-lang" role="group" aria-label="Language" data-zst-langgroup>
				<button type="button" data-zst-lang="en" aria-pressed="true" lang="en" title="English" aria-label="English"><svg viewBox="0 0 38 20" aria-hidden="true" focusable="false"><rect width="38" height="20" fill="#B22234"/><g fill="#fff"><rect y="1.54" width="38" height="1.54"/><rect y="4.62" width="38" height="1.54"/><rect y="7.69" width="38" height="1.54"/><rect y="10.77" width="38" height="1.54"/><rect y="13.85" width="38" height="1.54"/><rect y="16.92" width="38" height="1.54"/></g><rect width="15.2" height="10.77" fill="#3C3B6E"/><g fill="#fff"><circle cx="2.3" cy="1.9" r=".55"/><circle cx="5.3" cy="1.9" r=".55"/><circle cx="8.3" cy="1.9" r=".55"/><circle cx="11.3" cy="1.9" r=".55"/><circle cx="3.8" cy="3.8" r=".55"/><circle cx="6.8" cy="3.8" r=".55"/><circle cx="9.8" cy="3.8" r=".55"/><circle cx="12.8" cy="3.8" r=".55"/><circle cx="2.3" cy="5.7" r=".55"/><circle cx="5.3" cy="5.7" r=".55"/><circle cx="8.3" cy="5.7" r=".55"/><circle cx="11.3" cy="5.7" r=".55"/><circle cx="3.8" cy="7.6" r=".55"/><circle cx="6.8" cy="7.6" r=".55"/><circle cx="9.8" cy="7.6" r=".55"/><circle cx="12.8" cy="7.6" r=".55"/><circle cx="2.3" cy="9.4" r=".55"/><circle cx="5.3" cy="9.4" r=".55"/><circle cx="8.3" cy="9.4" r=".55"/><circle cx="11.3" cy="9.4" r=".55"/></g></svg></button>
				<button type="button" data-zst-lang="es" aria-pressed="false" lang="es" title="Español" aria-label="Español"><svg viewBox="0 0 28 16" aria-hidden="true" focusable="false"><rect width="9.34" height="16" fill="#006847"/><rect x="9.33" width="9.34" height="16" fill="#fff"/><rect x="18.66" width="9.34" height="16" fill="#CE1126"/><ellipse cx="14" cy="8.3" rx="2.6" ry="2.4" fill="none" stroke="#5C8A3A" stroke-width=".7"/><ellipse cx="14" cy="7.6" rx="1.4" ry="1.6" fill="#8C5A2B"/><path d="M12.6 9.6h2.8" stroke="#2E7D32" stroke-width=".6"/></svg></button>
			</div>
			<button type="button" class="zst-icon-btn zst-speak-toggle" data-zst-speak hidden aria-pressed="false" title="Read replies aloud" aria-label="Read replies aloud"></button>
			<button type="button" class="zst-new" data-zst-new title="New chat" aria-label="New chat"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg><span class="zst-btn-text" data-zst-i18n="newChat">New chat</span></button>
			<button type="button" class="zst-icon-btn zst-fs-toggle" data-zst-fs aria-pressed="false" title="Full screen" aria-label="Full screen"></button>
			</div>
		</div>
		<div class="zst-voicebar" data-zst-voicebar hidden>
			<label for="zst-voice" data-zst-i18n="voice">Voice</label>
			<select id="zst-voice" data-zst-voice></select>
		</div>
		<div class="zst-log" data-zst-log role="log" aria-live="polite"></div>
		<div class="zst-chips" data-zst-chips>
			<button type="button" data-zst-chip="I'm stuck on a stoichiometry problem. Can you help me get started?">Stuck on stoichiometry</button>
			<button type="button" data-zst-chip="Can you explain Newton's second law in simple terms?">Explain Newton's 2nd law</button>
			<button type="button" data-zst-chip="Can you help me understand how natural selection works?">How natural selection works</button>
			<button type="button" data-zst-chip="I solved a problem and want to check my work.">Check my work</button>
		</div>
		<div class="zst-preview" data-zst-preview hidden></div>
		<p class="zst-mic-status" data-zst-micstatus role="status" aria-live="polite" hidden></p>
		<form class="zst-form" data-zst-form>
			<button type="button" class="zst-icon-btn zst-attach" data-zst-attach hidden title="Attach a photo of your work" aria-label="Attach a photo of your work"></button>
			<input type="file" accept="image/*" data-zst-file hidden>
			<label class="zst-sr" for="zst-input" data-zst-i18n="yourQuestion">Your question</label>
			<textarea id="zst-input" class="zst-input" data-zst-input rows="2" placeholder="Type your chemistry, physics, or biology question..." maxlength="<?php echo esc_attr( (int) $s['max_input_chars'] ); ?>"></textarea>
			<button type="button" class="zst-icon-btn zst-mic" data-zst-mic hidden aria-pressed="false" title="Start voice input" aria-label="Start voice input"></button>
			<button type="submit" class="zst-send" data-zst-send aria-label="Send"><span class="zst-btn-text" data-zst-i18n="send">Send</span><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 12l15-7-5 15-2.6-5.4z M11.4 14.6L19 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg></button>
		</form>
		<p class="zst-note" data-zst-note>AI tutors can make mistakes, so double-check important work. Please don't share personal information, and crop names out of photos.</p>
	</div>
	<?php
	return ob_get_clean();
}
