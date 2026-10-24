<?php
/**
 * Removes everything the plugin added when it is deleted (not just deactivated): both tables, all saved codes and
 * scores, the settings, and the ACT Practice teacher role.
 */

defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

global $wpdb;
$wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}zsa_act_attempts" );
$wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}zsa_act_codes" );
delete_option( 'zsa_act_settings' );
delete_option( 'zsa_act_db_version' );
wp_clear_scheduled_hook( 'zsa_act_cleanup' );
remove_role( 'zsa_act_teacher' );
$zsa_act_admin = get_role( 'administrator' );
if ( $zsa_act_admin ) {
	$zsa_act_admin->remove_cap( 'zsa_act_class_lists' );
}
