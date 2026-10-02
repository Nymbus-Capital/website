<?php
/**
 * "Nymbus → Site texts": the editable texts of the website (home headline, AUM label, announcement banner, contact
 * details), English and French. One option (`nymbus_sc_texts`), saved through the Settings API (nonce + capability
 * handled by wp-admin/options.php), sanitised field by field.
 *
 * @package NymbusSiteContent
 */

defined( 'ABSPATH' ) || exit;

/** Who may edit the texts (and see the Nymbus menu): editors and administrators. */
function nymbus_sc_texts_capability() {
	return 'edit_others_posts';
}

add_action( 'admin_menu', 'nymbus_sc_menu', 9 );
function nymbus_sc_menu() {
	add_menu_page( __( 'Site texts', 'nymbus-site-content' ), __( 'Nymbus', 'nymbus-site-content' ), nymbus_sc_texts_capability(), 'nymbus-site-texts', 'nymbus_sc_texts_page', 'dashicons-admin-site-alt3', 26 );
	// the first sub-item replaces the automatic duplicate of the parent
	add_submenu_page( 'nymbus-site-texts', __( 'Site texts', 'nymbus-site-content' ), __( 'Site texts', 'nymbus-site-content' ), nymbus_sc_texts_capability(), 'nymbus-site-texts', 'nymbus_sc_texts_page' );
}

add_action( 'admin_init', 'nymbus_sc_register_settings' );
function nymbus_sc_register_settings() {
	register_setting(
		'nymbus_sc',
		'nymbus_sc_texts',
		array(
			'type'              => 'array',
			'sanitize_callback' => 'nymbus_sc_sanitize_texts',
			'default'           => array(),
			'show_in_rest'      => false,
		)
	);
}

// options.php requires `manage_options` unless told otherwise: editors may save this page.
add_filter( 'option_page_capability_nymbus_sc', 'nymbus_sc_texts_capability' );

/** Sanitiser of the whole option (unslashed submitted array → array of plain strings). */
function nymbus_sc_sanitize_texts( $input ) {
	$input = is_array( $input ) ? $input : array();
	$out   = array();
	foreach ( nymbus_sc_text_fields() as $f ) {
		$keys = array();
		if ( ! empty( $f['bi'] ) ) {
			$keys = array( $f['key'] . '_en', $f['key'] . '_fr' );
		} else {
			$keys = array( $f['key'] );
		}
		foreach ( $keys as $k ) {
			$v = nymbus_sc_sanitize_field( $f, isset( $input[ $k ] ) ? $input[ $k ] : '' );
			if ( '' !== $v && array() !== $v ) {
				$out[ $k ] = $v;
			}
		}
	}
	return $out;
}

/** The stored texts (empty array when none). */
function nymbus_sc_get_texts() {
	$t = get_option( 'nymbus_sc_texts', array() );
	return is_array( $t ) ? $t : array();
}

function nymbus_sc_texts_page() {
	if ( ! current_user_can( nymbus_sc_texts_capability() ) ) {
		wp_die( esc_html__( 'You do not have permission to edit the site texts.', 'nymbus-site-content' ), 403 );
	}
	$texts = nymbus_sc_get_texts();
	echo '<div class="wrap"><h1>' . esc_html__( 'Site texts', 'nymbus-site-content' ) . '</h1>';
	echo '<p>' . esc_html__( 'Texts that appear on the website, in English and in French. Leave a field empty to keep the website\'s built-in text.', 'nymbus-site-content' ) . '</p>';
	echo '<form method="post" action="options.php">';
	settings_fields( 'nymbus_sc' );
	nymbus_sc_render_fields(
		nymbus_sc_text_fields(),
		'nymbus_sc_texts',
		function ( $key, $lang ) use ( $texts ) {
			$k = '' !== $lang ? $key . '_' . $lang : $key;
			return isset( $texts[ $k ] ) ? $texts[ $k ] : '';
		},
		function ( $key, $lang ) {
			return '' !== $lang ? $key . '_' . $lang : $key;
		}
	);
	submit_button();
	echo '</form>';
	nymbus_sc_status_panel();
	echo '</div>';
}

/** Read-only status: what is published and whether the website connection is configured (never shows secrets). */
function nymbus_sc_status_panel() {
	$news = wp_count_posts( 'nymbus_news' );
	$team = wp_count_posts( 'nymbus_team' );
	$rows = array(
		__( 'Published news items', 'nymbus-site-content' )            => (string) (int) $news->publish,
		__( 'Published team members (including hidden)', 'nymbus-site-content' ) => (string) (int) $team->publish,
		__( 'Content access protected by a shared secret', 'nymbus-site-content' ) => '' !== nymbus_sc_config( 'NYMBUS_CONTENT_SECRET' ) ? __( 'Yes', 'nymbus-site-content' ) : __( 'No (public content only)', 'nymbus-site-content' ),
		__( 'Website notified after each change', 'nymbus-site-content' ) => ( '' !== nymbus_sc_config( 'NYMBUS_REVALIDATE_URL' ) && '' !== nymbus_sc_config( 'NYMBUS_REVALIDATE_SECRET' ) ) ? __( 'Yes', 'nymbus-site-content' ) : __( 'No (the website refreshes about every minute)', 'nymbus-site-content' ),
	);
	echo '<h2>' . esc_html__( 'Status', 'nymbus-site-content' ) . '</h2><table class="nymbus-sc-status"><tbody>';
	foreach ( $rows as $label => $value ) {
		echo '<tr><th scope="row" style="text-align:left">' . esc_html( $label ) . '</th><td>' . esc_html( $value ) . '</td></tr>';
	}
	echo '</tbody></table>';
}
