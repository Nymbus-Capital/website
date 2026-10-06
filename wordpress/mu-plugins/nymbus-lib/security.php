<?php
/**
 * Pure helpers of the security must-use plugin (no WordPress calls: unit-tested with plain PHP, see
 * wordpress/tests/security-test.php). Loaded by ../nymbus-security.php.
 *
 * @package NymbusHeadless
 */

if ( ! defined( 'ABSPATH' ) && ! defined( 'NYMBUS_SC_TESTING' ) ) {
	exit;
}

/** Roles a Microsoft sign-in may receive on first login (never Administrator). */
function nymbus_sso_allowed_roles() {
	return array( 'editor', 'author', 'contributor', 'subscriber' );
}

/** Comma / space separated list → lower-case, trimmed, de-duplicated, non-empty entries. */
function nymbus_csv_list( $s ) {
	if ( ! is_string( $s ) ) {
		return array();
	}
	$out = array();
	foreach ( preg_split( '/[\s,;]+/', strtolower( $s ) ) as $x ) {
		$x = trim( $x );
		if ( '' !== $x && ! in_array( $x, $out, true ) ) {
			$out[] = $x;
		}
	}
	return $out;
}

/** True for a canonical GUID (Entra tenant and client ids). */
function nymbus_is_guid( $s ) {
	return is_string( $s ) && 1 === preg_match( '/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', trim( $s ) );
}

/**
 * Microsoft Entra single sign-on settings from the environment, or null when it is not (fully, validly) configured.
 * Returns the OIDC_* constants of the "OpenID Connect Generic Client" plugin plus our own policy values.
 *
 * @param array $env NYMBUS_SSO_* values (strings).
 * @return array|null
 */
function nymbus_sso_settings( array $env ) {
	$tenant = isset( $env['NYMBUS_SSO_TENANT_ID'] ) ? strtolower( trim( (string) $env['NYMBUS_SSO_TENANT_ID'] ) ) : '';
	$client = isset( $env['NYMBUS_SSO_CLIENT_ID'] ) ? strtolower( trim( (string) $env['NYMBUS_SSO_CLIENT_ID'] ) ) : '';
	$secret = isset( $env['NYMBUS_SSO_CLIENT_SECRET'] ) ? trim( (string) $env['NYMBUS_SSO_CLIENT_SECRET'] ) : '';
	if ( ! nymbus_is_guid( $tenant ) || ! nymbus_is_guid( $client ) || '' === $secret ) {
		return null;
	}
	$domains = nymbus_csv_list( isset( $env['NYMBUS_SSO_ALLOWED_DOMAINS'] ) ? $env['NYMBUS_SSO_ALLOWED_DOMAINS'] : '' );
	$domains = array_values( array_filter( $domains, function ( $d ) {
		return 1 === preg_match( '/^[a-z0-9-]+(\.[a-z0-9-]+)+$/', $d );
	} ) );
	if ( ! $domains ) {
		$domains = array( 'nymbus.ca' );
	}
	$role = isset( $env['NYMBUS_SSO_DEFAULT_ROLE'] ) ? strtolower( trim( (string) $env['NYMBUS_SSO_DEFAULT_ROLE'] ) ) : '';
	$base = 'https://login.microsoftonline.com/' . $tenant;
	return array(
		'tenant'    => $tenant,
		'domains'   => $domains,
		'role'      => in_array( $role, nymbus_sso_allowed_roles(), true ) ? $role : 'editor',
		'constants' => array(
			'OIDC_LOGIN_TYPE'               => 'button',
			'OIDC_CLIENT_ID'                => $client,
			'OIDC_CLIENT_SECRET'            => $secret,
			'OIDC_CLIENT_SCOPE'             => 'openid email profile',
			'OIDC_ENDPOINT_LOGIN_URL'       => $base . '/oauth2/v2.0/authorize',
			'OIDC_ENDPOINT_TOKEN_URL'       => $base . '/oauth2/v2.0/token',
			// no userinfo endpoint: the user claim is the signed ID token (it carries `tid`), verified against the JWKS
			'OIDC_ENDPOINT_USERINFO_URL'    => '',
			'OIDC_ENDPOINT_JWKS_URL'        => $base . '/discovery/v2.0/keys',
			'OIDC_ISSUER'                   => $base . '/v2.0',
			'OIDC_ENDPOINT_LOGOUT_URL'      => $base . '/oauth2/v2.0/logout',
			'OIDC_CREATE_IF_DOES_NOT_EXIST' => 1,
			'OIDC_LINK_EXISTING_USERS'      => ( isset( $env['NYMBUS_SSO_LINK_EXISTING_USERS'] ) && '1' === trim( (string) $env['NYMBUS_SSO_LINK_EXISTING_USERS'] ) ) ? 1 : 0,
			'OIDC_ENFORCE_PRIVACY'          => 0,
			'OIDC_REDIRECT_USER_BACK'       => 0,
			'OIDC_REDIRECT_ON_LOGOUT'       => 1,
		),
	);
}

/** The sign-in name of an Entra ID token (preferred_username, else email, else upn), lower-case, or ''. */
function nymbus_sso_account( array $claim ) {
	foreach ( array( 'preferred_username', 'email', 'upn' ) as $k ) {
		if ( isset( $claim[ $k ] ) && is_string( $claim[ $k ] ) && false !== strpos( $claim[ $k ], '@' ) ) {
			return strtolower( trim( $claim[ $k ] ) );
		}
	}
	return '';
}

/**
 * Whether a (signature-verified) Entra ID token may sign in: issued by OUR tenant, for a member account (no guest:
 * `acct` = 1 marks a guest when present), with a sign-in name in one of the allowed domains.
 */
function nymbus_sso_claim_allowed( $claim, $tenant, array $domains ) {
	if ( ! is_array( $claim ) || ! isset( $claim['tid'] ) || ! is_string( $claim['tid'] ) || strtolower( $claim['tid'] ) !== strtolower( (string) $tenant ) ) {
		return false;
	}
	if ( isset( $claim['acct'] ) && 0 !== (int) $claim['acct'] ) {
		return false;
	}
	$account = nymbus_sso_account( $claim );
	// guests invited into our tenant carry our tid and a "...#EXT#@<tenant domain>" sign-in name
	if ( '' === $account || 1 !== substr_count( $account, '@' ) || false !== strpos( $account, '#ext#' ) ) {
		return false;
	}
	$domain = substr( $account, strpos( $account, '@' ) + 1 );
	return in_array( $domain, $domains, true );
}

/**
 * Password sign-in policy. Without Microsoft sign-in configured everyone may use a password (local copy, first
 * install). With it, only the emergency account(s) named in NYMBUS_EMERGENCY_ADMIN may; when none is named, only
 * administrators may (so a forgotten variable cannot lock everyone out).
 *
 * @param string $login        user_login of the account that just passed the password check.
 * @param bool   $is_admin     whether that account can manage_options.
 * @param bool   $sso_on       Microsoft sign-in configured.
 * @param string $emergency    NYMBUS_EMERGENCY_ADMIN (comma separated logins).
 */
function nymbus_password_login_allowed( $login, $is_admin, $sso_on, $emergency ) {
	if ( ! $sso_on ) {
		return true;
	}
	$list = nymbus_csv_list( $emergency );
	if ( ! $list ) {
		return (bool) $is_admin;
	}
	return is_string( $login ) && in_array( strtolower( $login ), $list, true );
}
