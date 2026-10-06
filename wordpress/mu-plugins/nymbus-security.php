<?php
/**
 * Plugin Name: Nymbus Sign-in Security (must-use)
 * Description: Microsoft Entra sign-in (configures the bundled "OpenID Connect Generic Client" plugin from environment variables, nymbus.ca accounts of our tenant only), password sign-in kept for the emergency administrator only, the bundled "Limit Login Attempts Reloaded" plugin counting the visitor address (never a forgeable header), and the bundled plugins kept active.
 * Version:     1.0.0
 *
 * Environment variables (nothing secret lives in the repository; see wordpress/README.md):
 *   NYMBUS_SSO_TENANT_ID, NYMBUS_SSO_CLIENT_ID, NYMBUS_SSO_CLIENT_SECRET  Entra app "Nymbus WordPress" (all three = SSO on)
 *   NYMBUS_SSO_ALLOWED_DOMAINS     sign-in name domains allowed (default nymbus.ca)
 *   NYMBUS_SSO_DEFAULT_ROLE        role of a first Microsoft sign-in: editor (default), author, contributor, subscriber
 *   NYMBUS_SSO_LINK_EXISTING_USERS 1 = a Microsoft sign-in takes over an existing account with the same e-mail / login
 *   NYMBUS_EMERGENCY_ADMIN         login(s) that may still sign in with a password once SSO is on
 *
 * @package NymbusHeadless
 */

defined( 'ABSPATH' ) || exit;

require_once __DIR__ . '/nymbus-lib/security.php';

/** An environment variable (or a constant of that name), trimmed, '' when unset. */
function nymbus_env( $name ) {
	if ( defined( $name ) && is_scalar( constant( $name ) ) ) {
		return trim( (string) constant( $name ) );
	}
	$v = getenv( $name );
	return is_string( $v ) ? trim( $v ) : '';
}

/* ---- visitor IP for the login limiter ------------------------------------------------------------------------- */

// The official WordPress image enables Apache mod_remoteip (RemoteIPHeader X-Forwarded-For, private ranges as internal
// proxies): behind the load balancer REMOTE_ADDR is already the visitor, taken from the RIGHT of X-Forwarded-For (what
// the balancer appended); the left part of that header is attacker-written. So Limit Login Attempts Reloaded must count
// REMOTE_ADDR only, never a raw header: forced here, the plugin's "trusted IP origins" setting cannot change it.
add_filter( 'pre_option_limit_login_trusted_ip_origins', function () {
	return array( 'REMOTE_ADDR' );
} );

/* ---- Microsoft Entra sign-in ---------------------------------------------------------------------------------- */

$GLOBALS['nymbus_sso'] = nymbus_sso_settings(
	array(
		'NYMBUS_SSO_TENANT_ID'           => nymbus_env( 'NYMBUS_SSO_TENANT_ID' ),
		'NYMBUS_SSO_CLIENT_ID'           => nymbus_env( 'NYMBUS_SSO_CLIENT_ID' ),
		'NYMBUS_SSO_CLIENT_SECRET'       => nymbus_env( 'NYMBUS_SSO_CLIENT_SECRET' ),
		'NYMBUS_SSO_ALLOWED_DOMAINS'     => nymbus_env( 'NYMBUS_SSO_ALLOWED_DOMAINS' ),
		'NYMBUS_SSO_DEFAULT_ROLE'        => nymbus_env( 'NYMBUS_SSO_DEFAULT_ROLE' ),
		'NYMBUS_SSO_LINK_EXISTING_USERS' => nymbus_env( 'NYMBUS_SSO_LINK_EXISTING_USERS' ),
	)
);

function nymbus_sso_on() {
	return is_array( $GLOBALS['nymbus_sso'] );
}

if ( nymbus_sso_on() ) {
	// must-use plugins load before the regular plugins: the OIDC plugin reads these constants when it boots
	foreach ( $GLOBALS['nymbus_sso']['constants'] as $nymbus_k => $nymbus_v ) {
		if ( ! defined( $nymbus_k ) ) {
			define( $nymbus_k, $nymbus_v );
		}
	}
	unset( $nymbus_k, $nymbus_v );

	// every sign-in (first or not): our tenant, a member account, an allowed domain
	$nymbus_gate = function ( $ok, $claim ) {
		return $ok && nymbus_sso_claim_allowed( $claim, $GLOBALS['nymbus_sso']['tenant'], $GLOBALS['nymbus_sso']['domains'] );
	};
	add_filter( 'openid-connect-generic-user-login-test', $nymbus_gate, 10, 2 );
	add_filter( 'openid-connect-generic-user-creation-test', $nymbus_gate, 10, 2 );
	unset( $nymbus_gate );

	// Entra puts the e-mail in `email` only when that optional claim is configured: fall back to the sign-in name
	add_filter( 'openid-connect-generic-alter-user-claim', function ( $claim ) {
		if ( is_array( $claim ) && ( empty( $claim['email'] ) || ! is_string( $claim['email'] ) ) ) {
			$account = nymbus_sso_account( $claim );
			if ( '' !== $account ) {
				$claim['email'] = $account;
			}
		}
		return $claim;
	} );

	// first Microsoft sign-in: the configured role (never Administrator)
	add_filter( 'openid-connect-generic-alter-user-data', function ( $data ) {
		if ( is_array( $data ) ) {
			$data['role'] = $GLOBALS['nymbus_sso']['role'];
		}
		return $data;
	} );

	// settings the OIDC screen would let an administrator weaken: forced to the safe values
	add_filter( 'option_openid_connect_generic_settings', function ( $v ) {
		return array_merge(
			is_array( $v ) ? $v : array(),
			array(
				'no_sslverify'           => 0,
				'allow_internal_idp'     => 0,
				'alternate_redirect_uri' => 0,
				'identity_key'           => 'preferred_username',
				'nickname_key'           => 'preferred_username',
				'email_format'           => '{email}',
				'identify_with_username' => false,
			)
		);
	} );

	// the login limiter replaces every sign-in error by "Incorrect username or password": say it on the page instead
	add_filter( 'login_message', function ( $message ) {
		return $message . '<p class="message">' . esc_html__( 'Nymbus staff: please use "Sign in with Microsoft". Password sign-in is reserved for the emergency administrator.', 'nymbus-site-content' ) . '</p>';
	} );

	add_filter( 'openid-connect-generic-login-button-text', function () {
		return __( 'Sign in with Microsoft', 'nymbus-site-content' );
	} );
}

/* ---- password sign-in: emergency administrator only once SSO is on -------------------------------------------- */

add_filter( 'authenticate', 'nymbus_password_gate', 100, 1 );
function nymbus_password_gate( $user ) {
	if ( $user instanceof WP_User && ! nymbus_password_login_allowed( $user->user_login, user_can( $user, 'manage_options' ), nymbus_sso_on(), nymbus_env( 'NYMBUS_EMERGENCY_ADMIN' ) ) ) {
		return new WP_Error( 'nymbus_sso_only', __( 'Please use "Sign in with Microsoft". Password sign-in is reserved for the emergency administrator.', 'nymbus-site-content' ) );
	}
	return $user;
}

add_filter( 'allow_password_reset', function ( $allow, $user_id ) {
	$u = get_userdata( $user_id );
	return $allow && $u && nymbus_password_login_allowed( $u->user_login, user_can( $u, 'manage_options' ), nymbus_sso_on(), nymbus_env( 'NYMBUS_EMERGENCY_ADMIN' ) );
}, 10, 2 );

/* ---- bundled plugins stay active ------------------------------------------------------------------------------ */

/** Plugins baked into the image that must be active (the OIDC client only once SSO is configured). */
function nymbus_required_plugins() {
	$list = array( 'nymbus-site-content/nymbus-site-content.php', 'limit-login-attempts-reloaded/limit-login-attempts-reloaded.php' );
	if ( nymbus_sso_on() ) {
		$list[] = 'daggerhart-openid-connect-generic/openid-connect-generic.php';
	}
	return $list;
}

add_action( 'admin_init', function () {
	if ( ! current_user_can( 'activate_plugins' ) || wp_doing_ajax() ) {
		return;
	}
	require_once ABSPATH . 'wp-admin/includes/plugin.php';
	foreach ( nymbus_required_plugins() as $p ) {
		if ( file_exists( WP_PLUGIN_DIR . '/' . $p ) && ! is_plugin_active( $p ) ) {
			activate_plugin( $p );
		}
	}
} );

add_filter( 'plugin_action_links', function ( $links, $file ) {
	if ( in_array( $file, nymbus_required_plugins(), true ) ) {
		unset( $links['deactivate'] );
	}
	return $links;
}, 10, 2 );

/** Administrators: say plainly when SSO is on but no emergency account is named. */
add_action( 'admin_notices', function () {
	if ( current_user_can( 'manage_options' ) && nymbus_sso_on() && array() === nymbus_csv_list( nymbus_env( 'NYMBUS_EMERGENCY_ADMIN' ) ) ) {
		echo '<div class="notice notice-warning"><p>' . esc_html__( 'Microsoft sign-in is on but NYMBUS_EMERGENCY_ADMIN is not set: every administrator can still sign in with a password. Set it to the one emergency account.', 'nymbus-site-content' ) . '</p></div>';
	}
} );
