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
	// a guest (B2B, personal Microsoft account) carries `idp` = its home issuer; our own members carry none or ours
	if ( isset( $claim['idp'] ) && ( ! is_string( $claim['idp'] ) || strtolower( $claim['idp'] ) !== 'https://sts.windows.net/' . strtolower( (string) $tenant ) . '/' ) ) {
		return false;
	}
	// a stable, tenant-scoped identity is required (users are identified by tid + oid, never by e-mail)
	if ( ! isset( $claim['oid'], $claim['sub'] ) || ! nymbus_is_guid( $claim['oid'] ) || ! is_string( $claim['sub'] ) || '' === $claim['sub'] ) {
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

/** The identity marker stored on accounts created by a Microsoft sign-in: "<tid>/<oid>" (lower case), or ''. */
function nymbus_sso_identity( $claim ) {
	if ( ! is_array( $claim ) || ! isset( $claim['tid'], $claim['oid'] ) || ! nymbus_is_guid( $claim['tid'] ) || ! nymbus_is_guid( $claim['oid'] ) ) {
		return '';
	}
	return strtolower( $claim['tid'] . '/' . $claim['oid'] );
}

/**
 * Whether a Microsoft sign-in may open the WordPress account the OIDC plugin resolved. Never the emergency account(s).
 * Unless linking is explicitly on, only an account that this sign-in itself created: its stored subject equals the
 * token's `sub` AND its identity marker equals the token's tid/oid. So an existing (password) account, an
 * administrator, or an account matched by e-mail is never taken over.
 *
 * @param string $login           user_login of the resolved account.
 * @param string $stored_subject  its `openid-connect-generic-subject-identity` user option ('' when none).
 * @param string $stored_identity its `nymbus_sso_identity` user meta ('' when none).
 * @param array  $claim           the verified ID token claims.
 * @param bool   $link_on         NYMBUS_SSO_LINK_EXISTING_USERS = 1.
 * @param string $emergency       NYMBUS_EMERGENCY_ADMIN.
 */
function nymbus_sso_account_allowed( $login, $stored_subject, $stored_identity, $claim, $link_on, $emergency ) {
	if ( ! is_string( $login ) || '' === $login || in_array( strtolower( $login ), nymbus_csv_list( $emergency ), true ) ) {
		return false;
	}
	$identity = nymbus_sso_identity( $claim );
	if ( '' === $identity || ! isset( $claim['sub'] ) || ! is_string( $claim['sub'] ) ) {
		return false;
	}
	if ( $link_on ) {
		return true;
	}
	return is_string( $stored_subject ) && '' !== $stored_subject && hash_equals( $stored_subject, $claim['sub'] )
		&& is_string( $stored_identity ) && hash_equals( $identity, strtolower( $stored_identity ) );
}

/** Upload types editors may add (web pictures only; documents are handled in the website admin). */
function nymbus_upload_mimes() {
	return array(
		'jpg|jpeg|jpe' => 'image/jpeg',
		'png'          => 'image/png',
		'gif'          => 'image/gif',
		'webp'         => 'image/webp',
	);
}

/** `pre_update_option_active_plugins` body: the required plugins (present on disk) can never leave the active list. */
function nymbus_keep_required_active( $new, array $required, array $present ) {
	$new = is_array( $new ) ? array_values( $new ) : array();
	foreach ( $required as $p ) {
		if ( in_array( $p, $present, true ) && ! in_array( $p, $new, true ) ) {
			$new[] = $p;
		}
	}
	return $new;
}
