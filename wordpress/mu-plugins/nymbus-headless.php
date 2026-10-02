<?php
/**
 * Plugin Name: Nymbus Headless Hardening (must-use)
 * Description: WordPress is only the editor backend of the Nymbus website: no public front end, no XML-RPC, no file editor, correct HTTPS behind the load balancer, no indexing. Loaded automatically (wp-content/mu-plugins).
 * Version:     1.0.0
 *
 * Optional environment variable: NYMBUS_PUBLIC_SITE_URL — where visitors who open the WordPress address itself are sent.
 *
 * @package NymbusHeadless
 */

defined( 'ABSPATH' ) || exit;

// Behind the platform's TLS terminator the request arrives as plain http with X-Forwarded-Proto.
if ( isset( $_SERVER['HTTP_X_FORWARDED_PROTO'] ) && false !== strpos( (string) $_SERVER['HTTP_X_FORWARDED_PROTO'], 'https' ) ) {
	$_SERVER['HTTPS'] = 'on';
}

// No theme / plugin code editor in wp-admin (a stolen editor session could otherwise run PHP).
if ( ! defined( 'DISALLOW_FILE_EDIT' ) ) {
	define( 'DISALLOW_FILE_EDIT', true );
}

add_filter( 'xmlrpc_enabled', '__return_false' );
add_filter( 'wp_headers', function ( $headers ) {
	$headers['X-Robots-Tag'] = 'noindex, nofollow';
	return $headers;
} );
remove_action( 'wp_head', 'wp_generator' );
add_filter( 'the_generator', '__return_empty_string' );

// The WordPress front end is not used: the website is the Next.js site.
add_action( 'template_redirect', function () {
	$target = getenv( 'NYMBUS_PUBLIC_SITE_URL' );
	if ( is_string( $target ) && preg_match( '#^https://[^\s]+$#', trim( $target ) ) ) {
		wp_redirect( trim( $target ), 302 ); // phpcs:ignore WordPress.Security.SafeRedirect -- operator-configured address, not user input.
		exit;
	}
	status_header( 404 );
	nocache_headers();
	header( 'Content-Type: text/plain; charset=utf-8' );
	echo 'Nymbus content backend. Sign in at /wp-login.php';
	exit;
} );
