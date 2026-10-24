<?php
// Stand-in for WordPress's wp-admin/includes/upgrade.php in tests/php/act-history-test.php: records dbDelta calls.
function dbDelta( $sql ) {
	$GLOBALS['zsa_dbdelta'][] = $sql;
	return array();
}
