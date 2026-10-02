<?php
/**
 * Plugin Name:       Nymbus Site Content
 * Description:       Lets editors manage the news, the team and a few texts of the Nymbus website (English and French). WordPress is only the editor: the website reads the content from /wp-json/nymbus/v1/site-content.
 * Version:           1.0.0
 * Requires at least: 6.2
 * Requires PHP:      7.4
 * Author:            Nymbus Capital
 * License:           Proprietary
 * Text Domain:       nymbus-site-content
 *
 * @package NymbusSiteContent
 */

defined( 'ABSPATH' ) || exit;

define( 'NYMBUS_SC_VERSION', '1.0.0' );
define( 'NYMBUS_SC_FILE', __FILE__ );
define( 'NYMBUS_SC_DIR', plugin_dir_path( __FILE__ ) );

require_once NYMBUS_SC_DIR . 'includes/normalize.php';
require_once NYMBUS_SC_DIR . 'includes/fields.php';
require_once NYMBUS_SC_DIR . 'includes/post-types.php';
require_once NYMBUS_SC_DIR . 'includes/editor.php';
require_once NYMBUS_SC_DIR . 'includes/settings.php';
require_once NYMBUS_SC_DIR . 'includes/revalidate.php';
require_once NYMBUS_SC_DIR . 'includes/rest.php';
if ( defined( 'WP_CLI' ) && WP_CLI ) {
	require_once NYMBUS_SC_DIR . 'includes/cli.php';
}

register_activation_hook( __FILE__, 'nymbus_sc_activate' );
function nymbus_sc_activate() {
	nymbus_sc_register_types();
	flush_rewrite_rules( false );
	nymbus_sc_invalidate();
}

register_deactivation_hook( __FILE__, 'nymbus_sc_invalidate' );
