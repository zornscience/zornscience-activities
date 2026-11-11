<?php
// Removes the plugin's saved settings, API key, and usage numbers when it is deleted.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}
delete_option( 'zst_settings' );
delete_option( 'zst_api_key' );
delete_option( 'zst_usage_stats' );
