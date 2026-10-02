<?php
/**
 * Tells the website to refetch the content right after an editor saves, instead of waiting for its own refresh
 * (about a minute). Configured by environment variables / constants (never stored in the database):
 *
 *   NYMBUS_REVALIDATE_URL     e.g. https://<website host>/api/cms/revalidate
 *   NYMBUS_REVALIDATE_SECRET  same value as WP_REVALIDATE_SECRET on the website
 *
 * The call is fire-and-forget (non-blocking, one per request at most, at shutdown): a failure never affects saving.
 * The URL comes from the server configuration, not from editors, so a private-network address is allowed.
 *
 * @package NymbusSiteContent
 */

defined( 'ABSPATH' ) || exit;

$GLOBALS['nymbus_sc_notify_queued'] = false;

function nymbus_sc_queue_notify() {
	if ( ! empty( $GLOBALS['nymbus_sc_notify_queued'] ) ) {
		return;
	}
	if ( '' === nymbus_sc_config( 'NYMBUS_REVALIDATE_URL' ) || '' === nymbus_sc_config( 'NYMBUS_REVALIDATE_SECRET' ) ) {
		return;
	}
	$GLOBALS['nymbus_sc_notify_queued'] = true;
	add_action( 'shutdown', 'nymbus_sc_notify_site' );
}

function nymbus_sc_notify_site() {
	$url    = nymbus_sc_config( 'NYMBUS_REVALIDATE_URL' );
	$secret = nymbus_sc_config( 'NYMBUS_REVALIDATE_SECRET' );
	$parts  = wp_parse_url( $url );
	// the secret travels only over https, or over plain http to a single-label private host / localhost
	$scheme = is_array( $parts ) && isset( $parts['scheme'] ) ? strtolower( $parts['scheme'] ) : '';
	$host   = is_array( $parts ) && isset( $parts['host'] ) ? strtolower( $parts['host'] ) : '';
	$ok     = 'https' === $scheme || ( 'http' === $scheme && ( 'localhost' === $host || '127.0.0.1' === $host || false === strpos( $host, '.' ) ) );
	if ( ! $ok || '' === $host ) {
		return;
	}
	wp_remote_post(
		$url,
		array(
			'blocking'    => false,
			'timeout'     => 2,
			'redirection' => 0,
			'headers'     => array( 'Authorization' => 'Bearer ' . $secret ),
			'body'        => '',
		)
	);
}
