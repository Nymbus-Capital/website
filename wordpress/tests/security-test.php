<?php
/**
 * Plain-PHP tests of the sign-in security helpers (mu-plugins/nymbus-lib/security.php):
 *   php wordpress/tests/security-test.php
 * Exit code 0 = all passed. Run in CI. Throw-away ids only.
 */

define( 'NYMBUS_SC_TESTING', true );
require __DIR__ . '/../mu-plugins/nymbus-lib/security.php';

$failures = 0;
$count    = 0;
function check( $name, $actual, $expected ) {
	global $failures, $count;
	++$count;
	if ( $actual !== $expected ) {
		++$failures;
		fwrite( STDERR, "FAIL: $name\n  expected: " . var_export( $expected, true ) . "\n  actual:   " . var_export( $actual, true ) . "\n" );
	}
}

$tenant = '11111111-2222-4333-8444-555555555555';
$client = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';

// --- SSO settings from the environment --------------------------------------------------------------------------
check( 'not configured', nymbus_sso_settings( array() ), null );
check( 'missing secret', nymbus_sso_settings( array( 'NYMBUS_SSO_TENANT_ID' => $tenant, 'NYMBUS_SSO_CLIENT_ID' => $client ) ), null );
check( 'tenant must be a GUID (no URL injection)', nymbus_sso_settings( array( 'NYMBUS_SSO_TENANT_ID' => 'evil.example/x', 'NYMBUS_SSO_CLIENT_ID' => $client, 'NYMBUS_SSO_CLIENT_SECRET' => 's' ) ), null );
check( 'common tenant refused', nymbus_sso_settings( array( 'NYMBUS_SSO_TENANT_ID' => 'common', 'NYMBUS_SSO_CLIENT_ID' => $client, 'NYMBUS_SSO_CLIENT_SECRET' => 's' ) ), null );
$s = nymbus_sso_settings( array( 'NYMBUS_SSO_TENANT_ID' => strtoupper( $tenant ), 'NYMBUS_SSO_CLIENT_ID' => $client, 'NYMBUS_SSO_CLIENT_SECRET' => ' s3cret ' ) );
check( 'tenant lower-cased', $s['tenant'], $tenant );
check( 'default domain', $s['domains'], array( 'nymbus.ca' ) );
check( 'default role editor', $s['role'], 'editor' );
check( 'secret trimmed', $s['constants']['OIDC_CLIENT_SECRET'], 's3cret' );
check( 'authorize endpoint of the tenant', $s['constants']['OIDC_ENDPOINT_LOGIN_URL'], "https://login.microsoftonline.com/$tenant/oauth2/v2.0/authorize" );
check( 'token endpoint of the tenant', $s['constants']['OIDC_ENDPOINT_TOKEN_URL'], "https://login.microsoftonline.com/$tenant/oauth2/v2.0/token" );
check( 'ID token signature checked against the tenant keys', $s['constants']['OIDC_ENDPOINT_JWKS_URL'], "https://login.microsoftonline.com/$tenant/discovery/v2.0/keys" );
check( 'issuer of the tenant', $s['constants']['OIDC_ISSUER'], "https://login.microsoftonline.com/$tenant/v2.0" );
check( 'user claim = signed ID token (no userinfo)', $s['constants']['OIDC_ENDPOINT_USERINFO_URL'], '' );
check( 'no account takeover by default', $s['constants']['OIDC_LINK_EXISTING_USERS'], 0 );
$s2 = nymbus_sso_settings( array( 'NYMBUS_SSO_TENANT_ID' => $tenant, 'NYMBUS_SSO_CLIENT_ID' => $client, 'NYMBUS_SSO_CLIENT_SECRET' => 's', 'NYMBUS_SSO_DEFAULT_ROLE' => 'administrator', 'NYMBUS_SSO_ALLOWED_DOMAINS' => 'Nymbus.ca, example.org;bad domain@x', 'NYMBUS_SSO_LINK_EXISTING_USERS' => '1' ) );
check( 'administrator never granted by SSO', $s2['role'], 'editor' );
check( 'domains parsed', $s2['domains'], array( 'nymbus.ca', 'example.org' ) );
check( 'link existing users when asked', $s2['constants']['OIDC_LINK_EXISTING_USERS'], 1 );
$s3 = nymbus_sso_settings( array( 'NYMBUS_SSO_TENANT_ID' => $tenant, 'NYMBUS_SSO_CLIENT_ID' => $client, 'NYMBUS_SSO_CLIENT_SECRET' => 's', 'NYMBUS_SSO_DEFAULT_ROLE' => 'Subscriber' ) );
check( 'subscriber allowed', $s3['role'], 'subscriber' );

// --- which Entra accounts may sign in ---------------------------------------------------------------------------
$d    = array( 'nymbus.ca' );
$good = array( 'tid' => $tenant, 'preferred_username' => 'Jane.Doe@Nymbus.ca', 'sub' => 'x' );
check( 'member of our tenant, our domain', nymbus_sso_claim_allowed( $good, $tenant, $d ), true );
check( 'other tenant', nymbus_sso_claim_allowed( array_merge( $good, array( 'tid' => '99999999-2222-4333-8444-555555555555' ) ), $tenant, $d ), false );
check( 'no tid', nymbus_sso_claim_allowed( array( 'preferred_username' => 'jane@nymbus.ca' ), $tenant, $d ), false );
check( 'guest (acct = 1)', nymbus_sso_claim_allowed( array_merge( $good, array( 'acct' => 1 ) ), $tenant, $d ), false );
check( 'member (acct = 0)', nymbus_sso_claim_allowed( array_merge( $good, array( 'acct' => 0 ) ), $tenant, $d ), true );
check( 'other domain', nymbus_sso_claim_allowed( array_merge( $good, array( 'preferred_username' => 'jane@gmail.com' ) ), $tenant, $d ), false );
check( 'look-alike domain', nymbus_sso_claim_allowed( array_merge( $good, array( 'preferred_username' => 'jane@evil-nymbus.ca' ) ), $tenant, $d ), false );
check( 'sub-domain trick', nymbus_sso_claim_allowed( array_merge( $good, array( 'preferred_username' => 'jane@nymbus.ca.evil.com' ) ), $tenant, $d ), false );
check( 'guest UPN shape refused', nymbus_sso_claim_allowed( array_merge( $good, array( 'preferred_username' => 'jane_gmail.com#EXT#@nymbus.ca' ) ), $tenant, $d ), false );
check( 'two @ refused', nymbus_sso_claim_allowed( array_merge( $good, array( 'preferred_username' => 'a@b@nymbus.ca' ) ), $tenant, $d ), false );
check( 'email used when no preferred_username', nymbus_sso_claim_allowed( array( 'tid' => $tenant, 'email' => 'jane@nymbus.ca' ), $tenant, $d ), true );
check( 'not an array', nymbus_sso_claim_allowed( 'x', $tenant, $d ), false );
check( 'account name lower-cased', nymbus_sso_account( $good ), 'jane.doe@nymbus.ca' );

// --- password sign-in policy ------------------------------------------------------------------------------------
check( 'SSO off: anyone', nymbus_password_login_allowed( 'editor1', false, false, '' ), true );
check( 'SSO on: emergency account', nymbus_password_login_allowed( 'Nymbus-Admin', true, true, 'nymbus-admin' ), true );
check( 'SSO on: other administrator', nymbus_password_login_allowed( 'other-admin', true, true, 'nymbus-admin' ), false );
check( 'SSO on: editor', nymbus_password_login_allowed( 'editor1', false, true, 'nymbus-admin' ), false );
check( 'SSO on, no emergency named: administrators only', nymbus_password_login_allowed( 'some-admin', true, true, ' ' ), true );
check( 'SSO on, no emergency named: editor refused', nymbus_password_login_allowed( 'editor1', false, true, '' ), false );
check( 'list of emergency accounts', nymbus_password_login_allowed( 'b', false, true, 'a, b' ), true );

echo "$count checks, $failures failure(s)\n";
exit( $failures ? 1 : 0 );
