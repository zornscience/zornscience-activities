<?php
// Prints the ZornScience Tutor shortcode's markup for the browser tests (tests/e2e/tutor.spec.js), so they run the
// plugin's real HTML and not a copy. WordPress is replaced by small stand-ins. Usage: php tutor-markup.php [origin]
define( 'ABSPATH', __DIR__ . '/' );
$GLOBALS['zst_origin'] = isset( $argv[1] ) ? rtrim( $argv[1], '/' ) : 'http://127.0.0.1:4173';

function plugin_dir_path( $f ) { return dirname( $f ) . '/'; }
function plugin_dir_url( $f ) { return $GLOBALS['zst_origin'] . '/wordpress/zornscience-tutor/'; }
function plugin_basename( $f ) { return basename( dirname( $f ) ) . '/' . basename( $f ); }
function register_activation_hook() {}
function add_action() {}
function add_filter() {}
function add_shortcode() {}
function wp_register_style() {}
function wp_register_script() {}
function wp_enqueue_style() {}
function wp_enqueue_script() {}
function get_option( $k, $d = false ) { return $d; }
function wp_parse_args( $a, $d ) { return array_merge( $d, $a ); }
function rest_url( $p ) { return $GLOBALS['zst_origin'] . '/wp-json/' . $p; }
function home_url( $p = '' ) { return $GLOBALS['zst_origin'] . $p; }
function wp_parse_url( $u, $c = -1 ) { return parse_url( $u, $c ); }
function esc_url_raw( $u ) { return $u; }
function esc_url( $u ) { return htmlspecialchars( $u, ENT_QUOTES ); }
function esc_attr( $t ) { return htmlspecialchars( $t, ENT_QUOTES ); }
function esc_html( $t ) { return htmlspecialchars( $t, ENT_QUOTES ); }
function wp_json_encode( $v ) { return json_encode( $v, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ); }

require dirname( __DIR__, 2 ) . '/wordpress/zornscience-tutor/zornscience-tutor.php';
// Second argument "es" prints the markup of [zornscience_tutor lang="es"].
echo zst_shortcode( isset( $argv[2] ) ? array( 'lang' => $argv[2] ) : array() );
