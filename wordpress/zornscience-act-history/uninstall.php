<?php
/**
 * Removes everything the plugin added when it is deleted (not just deactivated): both tables, all saved codes and
 * scores, and the settings.
 */

defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

global $wpdb;
$wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}zsa_act_attempts" );
$wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}zsa_act_codes" );
delete_option( 'zsa_act_settings' );
delete_option( 'zsa_act_db_version' );
wp_clear_scheduled_hook( 'zsa_act_cleanup' );
