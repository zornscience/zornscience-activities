<?php
// Tests for the ZornScience Language WordPress plugin, run by tests/unit/language.test.js with `php`.
// WordPress is replaced by small stand-ins below. Prints "OK n" on success; any failed check exits with status 1.

define( 'ABSPATH', __DIR__ . '/' );
define( 'DAY_IN_SECONDS', 86400 );

$GLOBALS['zsl_hooks'] = array();
function add_filter( $tag, $cb, $priority = 10, $args = 1 ) { $GLOBALS['zsl_hooks'][ $tag ][] = array( $cb, $args ); }
function add_action( $tag, $cb, $priority = 10, $args = 1 ) { add_filter( $tag, $cb, $priority, $args ); }
function zsl_apply( $tag, ...$args ) {
	$value = $args[0] ?? null;
	foreach ( $GLOBALS['zsl_hooks'][ $tag ] ?? array() as $hook ) {
		$args[0] = $value = $hook[0]( ...array_slice( $args, 0, $hook[1] ) );
	}
	return $value;
}
function zsl_do( $tag ) { foreach ( $GLOBALS['zsl_hooks'][ $tag ] ?? array() as $hook ) { $hook[0](); } }
function esc_url( $u ) { return htmlspecialchars( $u, ENT_QUOTES ); }
function esc_html( $t ) { return htmlspecialchars( $t, ENT_QUOTES ); }

// Pages: id => [ slug, parent, title ]. Spanish twins exist for Atomic Structure and Ions, not Average Atomic Mass.
$GLOBALS['zsl_pages'] = array(
	7 => array( 'home', 0, 'Home' ), 8 => array( 'science', 0, 'Science' ), 29 => array( 'chemistry', 8, 'Chemistry' ),
	32 => array( 'unit-1-atomic-structure', 29, 'Atomic Structure' ), 33 => array( 'unit-2-quantum', 29, 'Quantum' ),
	500 => array( 'atomic-structure', 32, 'Atomic Structure' ), 501 => array( 'ions', 32, 'Ions' ), 502 => array( 'average-atomic-mass', 32, 'Average Atomic Mass' ),
	9 => array( 'teaching', 0, 'Teaching' ), 3611 => array( 'virtual-labs', 9, 'Virtual Labs' ), 4524 => array( 'chemistry', 3611, 'Chemistry Virtual Labs' ),
	4650 => array( 'es', 0, 'ZornScience en español' ), 4651 => array( 'science', 4650, 'Ciencias' ), 4652 => array( 'chemistry', 4651, 'Química' ),
	4653 => array( 'unit-1-atomic-structure', 4652, 'Estructura atómica' ), 4654 => array( 'atomic-structure', 4653, 'Estructura del átomo' ),
	4655 => array( 'ions', 4653, 'Iones' ),
);
// The page being viewed: a Spanish lesson by default, or an ID passed on the command line.
$GLOBALS['zsl_current'] = isset( $argv[1] ) ? (int) $argv[1] : 4655;
function get_page_uri( $p ) {
	$id = is_object( $p ) ? $p->ID : $p;
	$parts = array();
	while ( $id ) { array_unshift( $parts, $GLOBALS['zsl_pages'][ $id ][0] ); $id = $GLOBALS['zsl_pages'][ $id ][1]; }
	return implode( '/', $parts );
}
function get_posts( $a ) {
	$out = array();
	foreach ( $GLOBALS['zsl_pages'] as $id => $p ) { $out[] = (object) array( 'ID' => $id, 'post_title' => $p[2], 'post_parent' => $p[1] ); }
	return $out;
}
function get_option( $k ) { return 'page_on_front' === $k ? 7 : false; }
function is_front_page() { return 7 === $GLOBALS['zsl_current']; }
function is_page() { return true; }
function get_queried_object_id() { return $GLOBALS['zsl_current']; }
function wp_cache_get_last_changed( $g ) { return '1'; }
function get_transient( $k ) { return false; }
function set_transient() { return true; }
function home_url( $p = '' ) { return 'https://zornscience.org' . $p; }
function trailingslashit( $s ) { return rtrim( $s, '/' ) . '/'; }
function wp_parse_url( $u, $c = -1 ) { return parse_url( $u, $c ); }
function wp_get_post_parent_id( $id ) { return $GLOBALS['zsl_pages'][ $id ][1]; }
function get_post_field( $f, $id ) { return $GLOBALS['zsl_pages'][ $id ][2]; }
function is_admin() { return false; }
function is_feed() { return false; }
function is_preview() { return false; }
function wp_doing_ajax() { return false; }

require dirname( __DIR__, 2 ) . '/wordpress/zornscience-language/zornscience-language.php';

$checks = 0;
function check( $cond, $msg ) {
	global $checks;
	$checks++;
	if ( ! $cond ) { fwrite( STDERR, "FAIL: $msg\n" ); exit( 1 ); }
}

// Pure helpers.
check( zs_lang_twin_path( 'science/chemistry' ) === 'es/science/chemistry', 'English path pairs with es/' );
check( zs_lang_twin_path( 'es/science/chemistry' ) === 'science/chemistry', 'Spanish path pairs with English' );
check( zs_lang_twin_path( '' ) === 'es' && zs_lang_twin_path( 'es' ) === '', 'front page pairs with es' );
check( zs_lang_is_es_path( 'es' ) && zs_lang_is_es_path( 'es/x' ) && ! zs_lang_is_es_path( 'essays' ), 'es paths detected, essays is not' );
check( zs_lang_norm( "Forces and Newton&#8217;s Laws " ) === "Forces and Newton's Laws", 'titles normalized' );

$map  = zs_lang_map();
$home = 'https://zornscience.org/';
$r    = zs_lang_localize_href( 'https://zornscience.org/science/chemistry/unit-1-atomic-structure/ions/', $map, 'zornscience.org', $home );
check( $r && $r[0] === 'https://zornscience.org/es/science/chemistry/unit-1-atomic-structure/ions/' && 'es' === $r[3], 'English link goes to published Spanish twin' );
$r = zs_lang_localize_href( '/es/science/chemistry/unit-1-atomic-structure/average-atomic-mass/#lesson', $map, 'zornscience.org', $home );
check( $r && $r[0] === '/science/chemistry/unit-1-atomic-structure/average-atomic-mass/#lesson' && 'fallback' === $r[3], 'unpublished Spanish link falls back to English, keeps fragment' );
check( null === zs_lang_localize_href( '/science/chemistry/unit-2-quantum/', $map, 'zornscience.org', $home ), 'English link without twin stays' );
check( null === zs_lang_localize_href( 'https://zornscience.org/wp-content/uploads/x.pdf', $map, 'zornscience.org', $home ), 'media left alone' );
check( null === zs_lang_localize_href( 'https://activities.zornscience.org/metals-lab/', $map, 'zornscience.org', $home ), 'activities left alone' );
check( null === zs_lang_localize_href( '#examples', $map, 'zornscience.org', $home ), 'anchors left alone' );
check( null === zs_lang_localize_href( 'mailto:a@b.c', $map, 'zornscience.org', $home ), 'mailto left alone' );
$r = zs_lang_localize_href( '/', $map, 'zornscience.org', $home );
check( $r && '/es/' === $r[0], 'home link goes to /es/' );

// English pages and the front page (run with an ID): a toggle only when the Spanish twin is published.
$header = '<div class="wp-block-group zs-header-tools"><nav class="zs-desktop-menu">D</nav><nav class="wp-block-navigation zs-mobile-menu">M</nav></div>';
$block  = array( 'blockName' => 'core/group', 'attrs' => array( 'className' => 'zs-header-tools' ) );
$mobile = '<nav class="wp-block-navigation zs-mobile-menu"><div class="wp-block-navigation__responsive-container-content"><form role="search"></form><ul class="wp-block-navigation__container"><li><a href="/science/">Lessons</a><ul class="wp-block-navigation__submenu-container"><li>x</li></ul></li><li><a href="/tutor/">Tutor</a></li></ul></div></nav>';
$mblock = array( 'blockName' => 'core/navigation', 'attrs' => array( 'className' => 'zs-mobile-menu' ) );
if ( 4655 !== $GLOBALS['zsl_current'] ) {
	check( 'lang="en-US"' === zsl_apply( 'language_attributes', 'lang="en-US"' ), 'English lang unchanged' );
	check( ! in_array( 'zs-lang-es', zsl_apply( 'body_class', array() ), true ), 'no Spanish body class' );
	check( '<p>x</p>' === zsl_apply( 'render_block', '<p>x</p>', array( 'blockName' => 'core/post-content', 'attrs' => array() ) ), 'English content not marked' );
	$out = zsl_apply( 'render_block', $header, $block );
	ob_start();
	zsl_do( 'wp_head' );
	$head = ob_get_clean();
	if ( 502 === $GLOBALS['zsl_current'] ) {
		check( $header === $out, 'no toggle without a published Spanish twin' );
		check( $mobile === zsl_apply( 'render_block', $mobile, $mblock ), 'no phone menu switch without a published Spanish twin' );
		check( false === strpos( $head, 'hreflang' ), 'no hreflang without a twin' );
	} else {
		$es = 7 === $GLOBALS['zsl_current'] ? 'https://zornscience.org/es/' : 'https://zornscience.org/es/science/chemistry/unit-1-atomic-structure/atomic-structure/';
		check( false !== strpos( $out, 'class="zs-lang-toggle" href="' . $es . '"' ), 'toggle links to the Spanish twin' );
		check( false !== strpos( $out, '>Español<' ) && false !== strpos( $out, 'lang="es"' ), 'toggle text in Spanish' );
		check( false !== strpos( $head, 'hreflang="es-MX" href="' . $es . '"' ), 'hreflang es-MX' );
		$mout = zsl_apply( 'render_block', $mobile, $mblock );
		check( false !== strpos( $mout, '<a class="zs-lang-toggle-opt" href="' . $es . '" hreflang="es-MX" lang="es">' ), 'phone menu switch links to the Spanish twin' );
		check( false !== strpos( $mout, 'class="zs-lang-toggle-opt is-current"' ) && false !== strpos( $mout, 'aria-label="Language"' ), 'English marked current in the phone menu switch' );
		check( strpos( $mout, 'zs-lang-switch' ) > strpos( $mout, '/tutor/' ) && '</ul></div></nav>' === substr( $mout, -17 ), 'switch is the last item of the top-level menu list' );
		check( 1 === substr_count( $mout, 'zs-lang-switch' ), 'switch added once' );
		check( $mobile === zsl_apply( 'render_block', $mobile, array( 'blockName' => 'core/navigation', 'attrs' => array( 'className' => 'zs-desktop-menu' ) ) ), 'desktop menu gets no switch' );
	}
	echo "OK $checks\n";
	exit( 0 );
}

// Spanish lesson page: hooks.
check( 'lang="es-MX"' === zsl_apply( 'language_attributes', 'lang="en-US"' ), 'Spanish page lang is es-MX' );
check( in_array( 'zs-lang-es', zsl_apply( 'body_class', array() ), true ), 'Spanish body class' );
$header = '<div class="wp-block-group zs-header-tools"><nav class="zs-desktop-menu">D</nav><details><summary>Search</summary></details><nav class="wp-block-navigation zs-mobile-menu">M</nav></div>';
$block  = array( 'blockName' => 'core/group', 'attrs' => array( 'className' => 'zs-header-tools' ) );
$out    = zsl_apply( 'render_block', $header, $block );
check( false !== strpos( $out, 'class="zs-lang-toggle" href="https://zornscience.org/science/chemistry/unit-1-atomic-structure/ions/"' ), 'Spanish page toggle links to English twin' );
check( strpos( $out, 'zs-lang-toggle' ) < strpos( $out, 'zs-mobile-menu' ), 'toggle sits before the phone menu' );
check( false !== strpos( $out, '>English<' ) && false !== strpos( $out, '>EN<' ), 'toggle text' );
$mout = zsl_apply( 'render_block', $mobile, $mblock );
check( false !== strpos( $mout, '<a class="zs-lang-toggle-opt" href="https://zornscience.org/science/chemistry/unit-1-atomic-structure/ions/" hreflang="en-US" lang="en">' ), 'Spanish phone menu switch links to English twin' );
check( false !== strpos( $mout, '<a class="zs-lang-toggle-opt is-current" href="https://zornscience.org/es/science/chemistry/unit-1-atomic-structure/ions/" hreflang="es-MX" lang="es" aria-current="true">' ) && false !== strpos( $mout, 'aria-label="Idioma"' ), 'Español marked current in the Spanish phone menu switch' );
$content = zsl_apply( 'render_block', '<p>x</p>', array( 'blockName' => 'core/post-content', 'attrs' => array() ) );
check( ZS_LANG_CONTENT_START . '<p>x</p>' . ZS_LANG_CONTENT_END === $content, 'content is marked on Spanish pages' );
ob_start();
zsl_do( 'wp_head' );
$head = ob_get_clean();
check( false !== strpos( $head, 'hreflang="es-MX" href="https://zornscience.org/es/science/chemistry/unit-1-atomic-structure/ions/"' ), 'hreflang es-MX' );
check( false !== strpos( $head, 'hreflang="x-default" href="https://zornscience.org/science/chemistry/unit-1-atomic-structure/ions/"' ), 'hreflang x-default is English' );

// Whole page processing.
$page = '<html><head><style>.a>.b{x}</style><script>var s="<a href=\'/science/\'>Science</a>";</script></head><body>'
	. '<nav><a href="/"><span>Home</span></a><a href="/science/"><span>Science Lessons</span></a><a href="/science/"><span>Lessons</span></a>'
	. '<a href="/science/chemistry/unit-1-atomic-structure/"><span>Atomic Structure</span></a>'
	. '<a href="/science/chemistry/unit-2-quantum/"><span>Quantum</span></a>'
	. '<a href="/teaching/virtual-labs/chemistry/"><span>Chemistry</span></a></nav>'
	. '<details><summary>Search</summary><input placeholder="Search lessons, labs, topics"/></details>'
	. '<p class="zs-back-link"><a href="https://zornscience.org/science/chemistry/">&larr; All Chemistry Units</a></p>'
	. '<ul class="wp-block-page-list"><li class="wp-block-pages-list__item"><a class="wp-block-pages-list__item__link" href="https://zornscience.org/science/chemistry/unit-1-atomic-structure/ions/">Ions</a></li>'
	. '<li class="wp-block-pages-list__item"><a class="wp-block-pages-list__item__link" href="https://zornscience.org/science/chemistry/unit-1-atomic-structure/average-atomic-mass/">Average Atomic Mass</a></li></ul>'
	. '<p class="zs-lesson-label has-navy-color"><a href="https://zornscience.org/science/chemistry/">Chemistry</a> · Atomic Structure</p>'
	. ZS_LANG_CONTENT_START . '<p>Units and Search stay. <a href="https://zornscience.org/es/science/chemistry/unit-1-atomic-structure/average-atomic-mass/">siguiente</a></p>' . ZS_LANG_CONTENT_END
	. '<footer><h4>Explore</h4><p>Nick Zorn. Materials licensed under <a href="https://creativecommons.org/">CC</a> unless otherwise noted.</p></footer></body></html>';
$page = str_replace( '</body>', '<ul><li class="zs-lang-switch"><div><a class="zs-lang-toggle-opt" href="https://zornscience.org/science/chemistry/unit-1-atomic-structure/ions/" lang="en"><span>English</span></a></div></li></ul></body>', $page );
$out = zs_lang_process_page( $page, array(
	'map' => $map, 'site_host' => 'zornscience.org', 'home' => $home,
	'current_url' => 'https://zornscience.org/es/science/chemistry/unit-1-atomic-structure/ions/', 'unit_title' => 'Estructura atómica',
) );
check( false !== strpos( $out, '<style>.a>.b{x}</style>' ), 'styles untouched' );
check( false !== strpos( $out, 'var s="<a href=\'/science/\'>Science</a>";' ), 'scripts untouched' );
check( false !== strpos( $out, '<a href="/es/"><span>Inicio</span></a>' ), 'Home becomes Inicio and links to /es/' );
check( false !== strpos( $out, '<a href="/es/science/"><span>Lecciones de ciencias</span></a>' ), 'menu label translated' );
check( false !== strpos( $out, '<a href="/es/science/"><span>Lecciones</span></a>' ), 'short Lessons label translated' );
check( false !== strpos( $out, '<a href="/es/science/chemistry/unit-1-atomic-structure/"><span>Estructura atómica</span></a>' ), 'unit link and title swapped to Spanish' );
check( false !== strpos( $out, '<a href="/science/chemistry/unit-2-quantum/"><span>Quantum</span></a>' ), 'untranslated unit stays English' );
check( false !== strpos( $out, '<a href="/teaching/virtual-labs/chemistry/"><span>Química</span></a>' ), 'fixed labels translate even on English links' );
check( false !== strpos( $out, '<summary>Buscar</summary>' ) && false !== strpos( $out, 'placeholder="Busca lecciones, laboratorios y temas"' ), 'search translated' );
check( false !== strpos( $out, '← Todas las unidades de Química' ), 'back link translated' );
check( false !== strpos( $out, 'wp-block-pages-list__item current-menu-item"><a class="wp-block-pages-list__item__link" href="https://zornscience.org/es/science/chemistry/unit-1-atomic-structure/ions/" aria-current="page">Iones</a>' ), 'current sidebar item marked, title Spanish' );
check( false !== strpos( $out, 'href="https://zornscience.org/science/chemistry/unit-1-atomic-structure/average-atomic-mass/">Average Atomic Mass</a>' ), 'sidebar falls back to English for unpublished lesson' );
check( false !== strpos( $out, '<a href="https://zornscience.org/es/science/chemistry/">Química</a> · Estructura atómica</p>' ), 'lesson label in Spanish' );
check( false !== strpos( $out, '<p>Units and Search stay. <a href="https://zornscience.org/science/chemistry/unit-1-atomic-structure/average-atomic-mass/">siguiente</a></p>' ), 'content text untouched, link falls back' );
check( false !== strpos( $out, '<h4>Explora</h4>' ) && false !== strpos( $out, 'Materiales con licencia' ) && false !== strpos( $out, 'salvo que se indique lo contrario.' ), 'footer translated' );
check( false !== strpos( $out, '<a class="zs-lang-toggle-opt" href="https://zornscience.org/science/chemistry/unit-1-atomic-structure/ions/" lang="en"><span>English</span></a>' ), 'switch links are not rewritten to Spanish' );
check( false === strpos( $out, ZS_LANG_CONTENT_START ) && false === strpos( $out, ZS_LANG_CONTENT_END ), 'markers removed' );

echo "OK $checks\n";
