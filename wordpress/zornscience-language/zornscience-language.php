<?php
/**
 * Plugin Name: ZornScience Language
 * Description: Connects the Spanish pages under /es/ to their English twins: a language toggle in the header, Spanish menus, sidebars and labels on Spanish pages, links that fall back to English until a Spanish page is published, and hreflang tags for search engines.
 * Version: 1.0.0
 * Author: Nick Zorn
 * License: GPL-2.0-or-later
 * Requires at least: 6.4
 * Requires PHP: 7.4
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'ZS_LANG_VERSION', '1.0.0' );
define( 'ZS_LANG_ES_ROOT', 'es' );
define( 'ZS_LANG_CONTENT_START', '<!--zs-lang-content-start-->' );
define( 'ZS_LANG_CONTENT_END', '<!--zs-lang-content-end-->' );

/* -------------------------------------------------------------------------
 * Fixed interface text shown on Spanish pages (menus, sidebars, footer).
 * Keys are matched against whole text nodes outside the page content.
 * ---------------------------------------------------------------------- */
function zs_lang_ui_strings() {
	return array(
		'Home'                                        => 'Inicio',
		'Science Lessons'                             => 'Lecciones de ciencias',
		'Science'                                     => 'Ciencias',
		'Chemistry'                                   => 'Química',
		'AP Chemistry'                                => 'Química AP',
		'Physics'                                     => 'Física',
		'Quantitative Skills'                         => 'Habilidades cuantitativas',
		'Numbers'                                     => 'Números',
		'Units'                                       => 'Unidades',
		'Ratios and Percents'                         => 'Razones y porcentajes',
		'Equations'                                   => 'Ecuaciones',
		'Graphs and Change'                           => 'Gráficas y cambio',
		'Advanced Tools'                              => 'Herramientas avanzadas',
		'Teaching'                                    => 'Enseñanza',
		'Virtual Labs'                                => 'Laboratorios virtuales',
		'Physical Labs'                               => 'Laboratorios presenciales',
		'Classroom Strategies'                        => 'Estrategias de clase',
		'Brain Breaks'                                => 'Pausas activas',
		'Instructional Technology'                    => 'Tecnología educativa',
		'ACT Practice'                                => 'Práctica para el ACT',
		'ACT Question Generator'                      => 'Generador de preguntas del ACT',
		'Practice Activities'                         => 'Actividades de práctica',
		'About'                                       => 'Acerca de',
		'Contact'                                     => 'Contacto',
		'Explore'                                     => 'Explora',
		'Buy Me a Coffee'                             => 'Invítame un café',
		'Unit Overview'                               => 'Resumen de la unidad',
		'← All Chemistry Units'                       => '← Todas las unidades de Química',
		'← All AP Chemistry Units'                    => '← Todas las unidades de Química AP',
		'← All Physics Units'                         => '← Todas las unidades de Física',
		'← All Quantitative Skills'                   => '← Todas las habilidades cuantitativas',
		'Chemistry, teaching, and life outside the lab' => 'Química, enseñanza y la vida fuera del laboratorio',
		'Search'                                      => 'Buscar',
		'Nick Zorn. Materials licensed under'         => 'Nick Zorn. Materiales con licencia',
		'unless otherwise noted.'                     => 'salvo que se indique lo contrario.',
	);
}

/* Attribute text on Spanish pages (search box and similar). */
function zs_lang_attr_strings() {
	return array(
		'placeholder="Search lessons, labs, topics"' => 'placeholder="Busca lecciones, laboratorios y temas"',
		'aria-label="Search ZornScience"'            => 'aria-label="Buscar en ZornScience"',
		'aria-label="Search"'                        => 'aria-label="Buscar"',
	);
}

/* -------------------------------------------------------------------------
 * Page map: every published page, keyed by its path ('' is the front page).
 * ---------------------------------------------------------------------- */
function zs_lang_map() {
	static $map = null;
	if ( null !== $map ) {
		return $map;
	}
	$key    = 'zs_lang_map_' . md5( wp_cache_get_last_changed( 'posts' ) );
	$cached = get_transient( $key );
	if ( is_array( $cached ) ) {
		$map = $cached;
		return $map;
	}
	$map   = array();
	$pages = get_posts(
		array(
			'post_type'              => 'page',
			'post_status'            => 'publish',
			'numberposts'            => -1,
			'orderby'                => 'ID',
			'order'                  => 'ASC',
			'no_found_rows'          => true,
			'update_post_term_cache' => false,
			'update_post_meta_cache' => false,
		)
	);
	$front = (int) get_option( 'page_on_front' );
	foreach ( $pages as $page ) {
		$path = ( $page->ID === $front ) ? '' : trim( (string) get_page_uri( $page ), '/' );
		$map[ $path ] = array(
			'id'     => (int) $page->ID,
			'title'  => (string) $page->post_title,
			'parent' => (int) $page->post_parent,
		);
	}
	set_transient( $key, $map, DAY_IN_SECONDS );
	return $map;
}

/* -------------------------------------------------------------------------
 * Pure helpers (no WordPress state beyond the map passed in).
 * ---------------------------------------------------------------------- */
function zs_lang_is_es_path( $path ) {
	return ZS_LANG_ES_ROOT === $path || 0 === strpos( $path, ZS_LANG_ES_ROOT . '/' );
}

function zs_lang_twin_path( $path ) {
	if ( zs_lang_is_es_path( $path ) ) {
		return ltrim( substr( $path, strlen( ZS_LANG_ES_ROOT ) ), '/' );
	}
	return '' === $path ? ZS_LANG_ES_ROOT : ZS_LANG_ES_ROOT . '/' . $path;
}

function zs_lang_norm( $text ) {
	$text = html_entity_decode( (string) $text, ENT_QUOTES | ENT_HTML5, 'UTF-8' );
	$text = str_replace( array( "\u{2019}", "\u{2018}", "\u{201C}", "\u{201D}", "\u{00A0}" ), array( "'", "'", '"', '"', ' ' ), $text );
	$text = preg_replace( '/\s+/u', ' ', $text );
	return trim( $text );
}

/**
 * Work out where a link should point on a Spanish page.
 *
 * @param string $href      The link as written.
 * @param array  $map       Page map (path => info).
 * @param string $site_host Host of the site, for example zornscience.org.
 * @param string $home      Home URL with trailing slash.
 * @return array|null [ new_href, from_path, to_path, direction ] or null to leave alone.
 */
function zs_lang_localize_href( $href, $map, $site_host, $home ) {
	$raw = html_entity_decode( $href, ENT_QUOTES | ENT_HTML5, 'UTF-8' );
	if ( '' === $raw || '#' === $raw[0] || preg_match( '#^(mailto|tel|javascript|data):#i', $raw ) || 0 === strpos( $raw, '//' ) ) {
		return null;
	}
	$parts = parse_url( $raw );
	if ( false === $parts ) {
		return null;
	}
	$absolute = isset( $parts['host'] );
	if ( $absolute ) {
		$host = strtolower( preg_replace( '/^www\./i', '', $parts['host'] ) );
		if ( strtolower( preg_replace( '/^www\./i', '', $site_host ) ) !== $host ) {
			return null;
		}
	} elseif ( ! isset( $parts['path'] ) || '/' !== substr( $parts['path'], 0, 1 ) ) {
		return null; // Relative links like "ions/" are left alone.
	}
	$path = trim( isset( $parts['path'] ) ? $parts['path'] : '', '/' );
	if ( preg_match( '#^(wp-content|wp-admin|wp-includes|wp-json|wp-login\.php|feed)(/|$)#', $path ) ) {
		return null;
	}
	if ( ! array_key_exists( $path, $map ) && ! array_key_exists( zs_lang_twin_path( $path ), $map ) ) {
		return null;
	}

	$target    = null;
	$direction = null;
	if ( zs_lang_is_es_path( $path ) ) {
		if ( ! isset( $map[ $path ] ) && isset( $map[ zs_lang_twin_path( $path ) ] ) ) {
			$target    = zs_lang_twin_path( $path );
			$direction = 'fallback';
		}
	} elseif ( isset( $map[ zs_lang_twin_path( $path ) ] ) ) {
		$target    = zs_lang_twin_path( $path );
		$direction = 'es';
	}
	if ( null === $target ) {
		return null;
	}

	$suffix = '' === $target ? '' : $target . '/';
	$new    = $absolute ? $home . $suffix : '/' . $suffix;
	if ( isset( $parts['query'] ) ) {
		$new .= '?' . $parts['query'];
	}
	if ( isset( $parts['fragment'] ) ) {
		$new .= '#' . $parts['fragment'];
	}
	return array( $new, $path, $target, $direction );
}

/* Replace text nodes whose whole text equals $from with $to (already escaped). */
function zs_lang_swap_text_nodes( $html, $from, $to_escaped ) {
	$from_norm = zs_lang_norm( $from );
	if ( '' === $from_norm ) {
		return $html;
	}
	$result = preg_replace_callback(
		'/>([^<]+)</u',
		function ( $m ) use ( $from_norm, $to_escaped ) {
			if ( zs_lang_norm( $m[1] ) !== $from_norm ) {
				return $m[0];
			}
			$lead  = preg_match( '/^\s*/u', $m[1], $a ) ? $a[0] : '';
			$trail = preg_match( '/\s*$/u', $m[1], $b ) ? $b[0] : '';
			return '>' . $lead . $to_escaped . $trail . '<';
		},
		'>' . $html . '<'
	);
	return null === $result ? $html : substr( $result, 1, -1 );
}

/* Rewrite every link in an HTML fragment for a Spanish page. */
function zs_lang_rewrite_links( $html, $map, $site_host, $home ) {
	return preg_replace_callback(
		'#<a\b([^>]*)>(.*?)</a>#is',
		function ( $m ) use ( $map, $site_host, $home ) {
			$attrs = $m[1];
			$inner = $m[2];
			if ( false !== strpos( $attrs, 'zs-lang-toggle' ) ) {
				return $m[0];
			}
			if ( ! preg_match( '/\shref\s*=\s*(["\'])(.*?)\1/is', $attrs, $hm ) ) {
				return $m[0];
			}
			$result = zs_lang_localize_href( $hm[2], $map, $site_host, $home );
			if ( null === $result ) {
				return $m[0];
			}
			list( $new_href, $from, $to, $direction ) = $result;
			$new_attrs = str_replace( $hm[0], ' href=' . $hm[1] . esc_url( $new_href ) . $hm[1], $attrs );
			if ( 'es' === $direction && ZS_LANG_ES_ROOT !== $to && isset( $map[ $from ], $map[ $to ] ) ) {
				$inner = zs_lang_swap_text_nodes( $inner, $map[ $from ]['title'], esc_html( $map[ $to ]['title'] ) );
			}
			return '<a' . $new_attrs . '>' . $inner . '</a>';
		},
		$html
	);
}

/* Translate fixed interface text nodes and attributes. */
function zs_lang_translate_ui( $html ) {
	$strings = array();
	foreach ( zs_lang_ui_strings() as $en => $es ) {
		$strings[ zs_lang_norm( $en ) ] = $es;
	}
	$html = preg_replace_callback(
		'/>([^<]+)</u',
		function ( $m ) use ( $strings ) {
			$key = zs_lang_norm( $m[1] );
			if ( '' === $key || ! isset( $strings[ $key ] ) ) {
				return $m[0];
			}
			$lead  = preg_match( '/^\s*/u', $m[1], $a ) ? $a[0] : '';
			$trail = preg_match( '/\s*$/u', $m[1], $b ) ? $b[0] : '';
			return '>' . $lead . esc_html( $strings[ $key ] ) . $trail . '<';
		},
		$html
	);
	return strtr( $html, zs_lang_attr_strings() );
}

/* Put the Spanish unit name in the "Course · Unit" label above lesson titles. */
function zs_lang_fix_label( $html, $unit_title ) {
	if ( '' === $unit_title ) {
		return $html;
	}
	return preg_replace_callback(
		'#(<p\b[^>]*class="[^"]*\bzs-lesson-label\b[^"]*"[^>]*>)(.*?)(</p>)#is',
		function ( $m ) use ( $unit_title ) {
			$inner = preg_replace( '/(·|&middot;|&#183;)\s*[^<]*$/u', '· ' . esc_html( $unit_title ), $m[2], 1 );
			return $m[1] . $inner . $m[3];
		},
		$html
	);
}

/* Mark the current page in sidebar page lists after links were rewritten. */
function zs_lang_mark_current( $html, $current_url ) {
	$href   = esc_url( $current_url );
	$quoted = preg_quote( $href, '#' );
	$result = preg_replace_callback(
		'#<li\b([^>]*?)class="([^"]*\bwp-block-pages-list__item\b[^"]*)"([^>]*)>(\s*)<a\b([^>]*?)\s?href="' . $quoted . '"([^>]*)>#i',
		function ( $m ) use ( $href ) {
			$class = false === strpos( $m[2], 'current-menu-item' ) ? $m[2] . ' current-menu-item' : $m[2];
			$attrs = preg_replace( '/\saria-current="[^"]*"/', '', $m[5] . ' ' . $m[6] );
			return '<li' . $m[1] . 'class="' . $class . '"' . $m[3] . '>' . $m[4] . '<a' . rtrim( $attrs ) . ' href="' . $href . '" aria-current="page">';
		},
		$html
	);
	return null === $result ? $html : $result;
}

/**
 * Process a whole Spanish page. Scripts, styles and textareas are never touched.
 * Fixed interface text is translated only outside the page content.
 */
function zs_lang_process_page( $html, $args ) {
	$map       = $args['map'];
	$site_host = $args['site_host'];
	$home      = $args['home'];

	// Split off the page content so interface translations never touch it.
	$start = strpos( $html, ZS_LANG_CONTENT_START );
	$end   = strrpos( $html, ZS_LANG_CONTENT_END );
	if ( false !== $start && false !== $end && $end > $start ) {
		$chunks = array(
			array( substr( $html, 0, $start ), true ),
			array( substr( $html, $start, $end - $start ), false ),
			array( substr( $html, $end ), true ),
		);
	} else {
		$chunks = array( array( $html, true ) );
	}

	$out = '';
	foreach ( $chunks as $chunk ) {
		list( $text, $is_chrome ) = $chunk;
		$out .= zs_lang_process_safe_segments(
			$text,
			function ( $segment ) use ( $is_chrome, $map, $site_host, $home, $args ) {
				$segment = zs_lang_rewrite_links( $segment, $map, $site_host, $home );
				if ( $is_chrome ) {
					$segment = zs_lang_fix_label( $segment, $args['unit_title'] );
					$segment = zs_lang_translate_ui( $segment );
					$segment = zs_lang_mark_current( $segment, $args['current_url'] );
				}
				return $segment;
			}
		);
	}
	return str_replace( array( ZS_LANG_CONTENT_START, ZS_LANG_CONTENT_END ), '', $out );
}

/* Run $fn on everything except <script>, <style>, <textarea> and comments. */
function zs_lang_process_safe_segments( $html, $fn ) {
	$pattern = '#<(script|style|textarea)\b[^>]*>.*?</\1\s*>|<!--.*?-->#is';
	if ( ! preg_match_all( $pattern, $html, $found, PREG_OFFSET_CAPTURE ) ) {
		return $fn( $html );
	}
	$out = '';
	$pos = 0;
	foreach ( $found[0] as $match ) {
		list( $protected, $offset ) = $match;
		$out .= $fn( substr( $html, $pos, $offset - $pos ) ) . $protected;
		$pos  = $offset + strlen( $protected );
	}
	return $out . $fn( substr( $html, $pos ) );
}

/* -------------------------------------------------------------------------
 * Current page context.
 * ---------------------------------------------------------------------- */
function zs_lang_current_path() {
	static $path = false;
	if ( false !== $path ) {
		return $path;
	}
	$path = null;
	if ( is_front_page() && get_option( 'page_on_front' ) ) {
		$path = '';
	} elseif ( is_page() ) {
		$path = trim( (string) get_page_uri( get_queried_object_id() ), '/' );
	}
	return $path;
}

function zs_lang_is_spanish_page() {
	$path = zs_lang_current_path();
	return null !== $path && zs_lang_is_es_path( $path );
}

function zs_lang_url( $path ) {
	return home_url( '/' . ( '' === $path ? '' : $path . '/' ) );
}

/* -------------------------------------------------------------------------
 * Hooks.
 * ---------------------------------------------------------------------- */
add_filter(
	'language_attributes',
	function ( $output ) {
		if ( is_admin() || ! zs_lang_is_spanish_page() ) {
			return $output;
		}
		if ( preg_match( '/lang="[^"]*"/', $output ) ) {
			return preg_replace( '/lang="[^"]*"/', 'lang="es-MX"', $output );
		}
		return trim( $output . ' lang="es-MX"' );
	},
	20
);

add_filter(
	'body_class',
	function ( $classes ) {
		if ( zs_lang_is_spanish_page() ) {
			$classes[] = 'zs-lang-es';
		}
		return $classes;
	}
);

add_action(
	'wp_head',
	function () {
		$path = zs_lang_current_path();
		if ( null === $path ) {
			return;
		}
		$map  = zs_lang_map();
		$twin = zs_lang_twin_path( $path );
		if ( isset( $map[ $path ], $map[ $twin ] ) ) {
			$en = zs_lang_is_es_path( $path ) ? $twin : $path;
			$es = zs_lang_is_es_path( $path ) ? $path : $twin;
			printf( "<link rel=\"alternate\" hreflang=\"en-US\" href=\"%s\" />\n", esc_url( zs_lang_url( $en ) ) );
			printf( "<link rel=\"alternate\" hreflang=\"es-MX\" href=\"%s\" />\n", esc_url( zs_lang_url( $es ) ) );
			printf( "<link rel=\"alternate\" hreflang=\"x-default\" href=\"%s\" />\n", esc_url( zs_lang_url( $en ) ) );
		}
		?>
<style id="zs-lang-style">
.zs-lang-toggle{display:inline-flex;align-items:center;gap:7px;padding:6px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.4);color:#fff!important;text-decoration:none!important;font-size:15px;font-weight:600;line-height:1;white-space:nowrap;transition:background-color .18s ease}
.zs-lang-toggle:hover,.zs-lang-toggle:focus-visible{background:rgba(255,255,255,.14)}
.zs-lang-toggle svg{flex:none;width:21px;height:14px;border-radius:2px;box-shadow:0 0 0 1px rgba(255,255,255,.35)}
.zs-lang-toggle .zs-lang-short{display:none}
@media (max-width:781px){.zs-lang-toggle{padding:6px 9px;font-size:14px}.zs-lang-toggle .zs-lang-long{display:none}.zs-lang-toggle .zs-lang-short{display:inline}}
</style>
		<?php
	},
	5
);

function zs_lang_flag_svg( $lang ) {
	if ( 'es' === $lang ) {
		return '<svg viewBox="0 0 21 14" aria-hidden="true" focusable="false"><rect width="7" height="14" fill="#006847"/><rect x="7" width="7" height="14" fill="#fff"/><rect x="14" width="7" height="14" fill="#ce1126"/><circle cx="10.5" cy="7" r="1.9" fill="#8c5a2b"/></svg>';
	}
	$stripes = '';
	for ( $i = 0; $i < 7; $i++ ) {
		$stripes .= '<rect y="' . ( $i * 2 ) . '" width="21" height="1.08" fill="#b22234"/>';
	}
	return '<svg viewBox="0 0 21 14" aria-hidden="true" focusable="false"><rect width="21" height="14" fill="#fff"/>' . $stripes . '<rect width="9" height="7.5" fill="#3c3b6e"/></svg>';
}

function zs_lang_toggle_html() {
	$path = zs_lang_current_path();
	if ( null === $path ) {
		return '';
	}
	$map  = zs_lang_map();
	$twin = zs_lang_twin_path( $path );
	if ( zs_lang_is_es_path( $path ) ) {
		$href = isset( $map[ $twin ] ) ? zs_lang_url( $twin ) : home_url( '/' );
		return sprintf(
			'<a class="zs-lang-toggle" href="%s" hreflang="en-US" lang="en" aria-label="View this page in English">%s<span class="zs-lang-long">English</span><span class="zs-lang-short">EN</span></a>',
			esc_url( $href ),
			zs_lang_flag_svg( 'en' )
		);
	}
	if ( ! isset( $map[ $twin ] ) ) {
		return '';
	}
	return sprintf(
		'<a class="zs-lang-toggle" href="%s" hreflang="es-MX" lang="es" aria-label="Ver esta página en español">%s<span class="zs-lang-long">Español</span><span class="zs-lang-short">ES</span></a>',
		esc_url( zs_lang_url( $twin ) ),
		zs_lang_flag_svg( 'es' )
	);
}

add_filter(
	'render_block',
	function ( $content, $block ) {
		if ( is_admin() || empty( $block['blockName'] ) ) {
			return $content;
		}
		if ( 'core/group' === $block['blockName'] && ! empty( $block['attrs']['className'] ) && false !== strpos( $block['attrs']['className'], 'zs-header-tools' ) ) {
			$toggle = zs_lang_toggle_html();
			if ( '' === $toggle ) {
				return $content;
			}
			$nav = strrpos( $content, '<nav' );
			if ( false !== $nav && false !== strpos( substr( $content, $nav, 400 ), 'zs-mobile-menu' ) ) {
				return substr( $content, 0, $nav ) . $toggle . substr( $content, $nav );
			}
			$close = strrpos( $content, '</div>' );
			return false === $close ? $content . $toggle : substr( $content, 0, $close ) . $toggle . substr( $content, $close );
		}
		if ( 'core/post-content' === $block['blockName'] && zs_lang_is_spanish_page() ) {
			return ZS_LANG_CONTENT_START . $content . ZS_LANG_CONTENT_END;
		}
		return $content;
	},
	10,
	2
);

add_action(
	'template_redirect',
	function () {
		if ( is_admin() || is_feed() || is_preview() || wp_doing_ajax() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
			return;
		}
		if ( ! zs_lang_is_spanish_page() ) {
			return;
		}
		$path       = zs_lang_current_path();
		$map        = zs_lang_map();
		$unit_title = '';
		$current_id = get_queried_object_id();
		$parent_id  = (int) wp_get_post_parent_id( $current_id );
		if ( $parent_id ) {
			$unit_title = (string) get_post_field( 'post_title', $parent_id );
		}
		$args = array(
			'map'         => $map,
			'site_host'   => (string) wp_parse_url( home_url(), PHP_URL_HOST ),
			'home'        => trailingslashit( home_url() ),
			'current_url' => zs_lang_url( $path ),
			'unit_title'  => $unit_title,
		);
		ob_start(
			function ( $html ) use ( $args ) {
				if ( '' === $html || false === stripos( $html, '<html' ) ) {
					return $html;
				}
				try {
					$processed = zs_lang_process_page( $html, $args );
					return is_string( $processed ) && '' !== $processed ? $processed : $html;
				} catch ( \Throwable $e ) {
					return str_replace( array( ZS_LANG_CONTENT_START, ZS_LANG_CONTENT_END ), '', $html );
				}
			}
		);
	},
	99
);
