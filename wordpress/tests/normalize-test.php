<?php
/**
 * Plain-PHP tests of the normalisation (no WordPress, no dependencies):  php wordpress/tests/normalize-test.php
 * Exit code 0 = all passed. Run in CI (.github/workflows/ci.yml, "PHP plugin").
 */

define( 'NYMBUS_SC_TESTING', true );
require __DIR__ . '/../plugins/nymbus-site-content/includes/normalize.php';

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

// --- plain text ---------------------------------------------------------------------------------------------
check( 'tags stripped', nymbus_sc_plain( 'Hello <b>world</b>', 100 ), 'Hello world' );
check( 'script body removed', nymbus_sc_plain( 'a<script>alert(1)</script>b', 100 ), 'ab' );
check( 'encoded markup cannot survive', nymbus_sc_plain( '&lt;script&gt;alert(1)&lt;/script&gt;ok', 100 ), 'ok' );
check( 'img onerror', nymbus_sc_plain( '<img src=x onerror=alert(1)>text', 100 ), 'text' );
check( 'entities decoded once', nymbus_sc_plain( 'Tom &amp; Jerry', 100 ), 'Tom & Jerry' );
check( 'control chars removed', nymbus_sc_plain( "a\x00b\u{202E}c", 100 ), 'abc' );
check( 'whitespace collapsed', nymbus_sc_plain( "  a \n\t b  ", 100 ), 'a b' );
check( 'capped', mb_strlen( nymbus_sc_plain( str_repeat( 'é', 500 ), 10 ), 'UTF-8' ), 10 );
check( 'non-string', nymbus_sc_plain( array( 'x' ), 10 ), '' );
check( 'invalid utf-8', nymbus_sc_plain( "\xff\xfe", 10 ), '' );
check( 'paragraphs', nymbus_sc_paragraphs( "One\nwrapped.\n\n\n\nTwo <i>x</i>.", 1000 ), "One wrapped.\n\nTwo x." );
check( 'lines', nymbus_sc_lines( "CFA\n\n <b>PhD</b> \r\nMBA", 5, 50 ), array( 'CFA', 'PhD', 'MBA' ) );
check( 'lines bounded', count( nymbus_sc_lines( "a\nb\nc\nd", 2, 50 ) ), 2 );

// --- urls ---------------------------------------------------------------------------------------------------
check( 'https ok', nymbus_sc_https_url( 'https://example.org/a?b=1' ), 'https://example.org/a?b=1' );
foreach ( array( 'http://example.org', 'javascript:alert(1)', 'data:text/html,x', '//example.org', 'https://u:p@example.org', 'https://', "https://exa mple.org", "https://example.org/a\x00b", '', 'ftp://example.org' ) as $bad ) {
	check( 'bad url ' . $bad, nymbus_sc_https_url( $bad ), '' );
}

// --- slug / date --------------------------------------------------------------------------------------------
check( 'slug ok', nymbus_sc_slug( 'my-post-1', 'x' ), 'my-post-1' );
check( 'slug upper-cased', nymbus_sc_slug( 'My-Post', 'x' ), 'my-post' );
check( 'slug bad', nymbus_sc_slug( 'bad slug!', 'x' ), 'x' );
check( 'date ok', nymbus_sc_date( '2026-02-28' ), '2026-02-28' );
check( 'date invalid', nymbus_sc_date( '2026-02-30' ), '' );
check( 'date garbage', nymbus_sc_date( 'tomorrow' ), '' );

// --- news ---------------------------------------------------------------------------------------------------
$news = array(
	'id' => 'first', 'date' => '2026-09-15', 'category' => 'esg', 'title_en' => 'T <b>one</b>', 'title_fr' => 'T un',
	'summary_en' => 'S', 'summary_fr' => '', 'body_en' => "P1\n\nP2", 'body_fr' => '', 'link' => 'javascript:alert(1)', 'image' => 'https://cms.example.org/a.jpg',
);
$s = nymbus_sc_shape_news( $news );
check( 'news title', $s['title']['en'], 'T one' );
check( 'news category', $s['category'], 'esg' );
check( 'news bad link dropped', $s['link'], null );
check( 'news image kept', $s['image'], 'https://cms.example.org/a.jpg' );
check( 'news body paragraphs', $s['body']['en'], "P1\n\nP2" );
check( 'news unknown category falls back', nymbus_sc_shape_news( array_merge( $news, array( 'category' => 'nope' ) ) )['category'], 'community' );
check( 'news without title dropped', nymbus_sc_shape_news( array_merge( $news, array( 'title_en' => ' ', 'title_fr' => '' ) ) ), null );
check( 'news bad date dropped', nymbus_sc_shape_news( array_merge( $news, array( 'date' => '' ) ) ), null );
check( 'news bad id dropped', nymbus_sc_shape_news( array_merge( $news, array( 'id' => 'Bad Id' ) ) ), null );

// --- team ---------------------------------------------------------------------------------------------------
$m = array(
	'id' => 'a-person', 'name' => '<script>x</script>Eve', 'department' => 'Leadership', 'additional_departments' => array( 'Board', 'Board', 'Leadership', 'Nope' ),
	'order' => '5', 'year_joined' => '1850', 'linkedin' => 'https://evil.example/in/x', 'role_en' => 'R', 'role_fr' => '', 'bio_en' => 'B', 'bio_fr' => '',
	'previous_roles_en' => "A\nB", 'previous_roles_fr' => '', 'designations' => 'CFA', 'education' => '', 'photo' => 'data:image/png;base64,AAAA',
);
$t = nymbus_sc_shape_member( $m );
check( 'member name stripped', $t['name'], 'Eve' );
check( 'member departments', $t['additionalDepartments'], array( 'Board' ) );
check( 'member year out of range', $t['yearJoined'], null );
check( 'member foreign linkedin dropped', $t['linkedin'], null );
check( 'member data-uri photo dropped', $t['photo'], null );
check( 'member order', $t['order'], 5 );
check( 'linkedin kept', nymbus_sc_shape_member( array_merge( $m, array( 'linkedin' => 'https://www.linkedin.com/in/eve' ) ) )['linkedin'], 'https://www.linkedin.com/in/eve' );
check( 'lookalike linkedin dropped', nymbus_sc_shape_member( array_merge( $m, array( 'linkedin' => 'https://notlinkedin.com/in/eve' ) ) )['linkedin'], null );
check( 'member bad department dropped', nymbus_sc_shape_member( array_merge( $m, array( 'department' => 'Marketing' ) ) ), null );
check( 'member without name dropped', nymbus_sc_shape_member( array_merge( $m, array( 'name' => '  ' ) ) ), null );

// --- texts --------------------------------------------------------------------------------------------------
$texts = nymbus_sc_shape_texts(
	array(
		'aum_label_en' => '$2B+', 'aum_label_fr' => '2 G$+', 'banner_enabled' => '1', 'banner_en' => 'Maintenance <b>tonight</b>', 'banner_fr' => '',
		'contact_email' => 'info@example.org', 'contact_phone' => '+1 514 555 0100', 'home_headline_en' => '',
	)
);
check( 'aum label', $texts['aumLabel']['fr'], '2 G$+' );
check( 'banner stripped', $texts['banner']['en'], 'Maintenance tonight' );
check( 'empty headline absent', isset( $texts['homeHeadline'] ), false );
check( 'email', $texts['contactEmail'], 'info@example.org' );
check( 'phone', $texts['contactPhone'], '+1 514 555 0100' );
check( 'banner off: absent', isset( nymbus_sc_shape_texts( array( 'banner_enabled' => '', 'banner_en' => 'x' ) )['banner'] ), false );
check( 'bad email dropped', isset( nymbus_sc_shape_texts( array( 'contact_email' => 'not an email' ) )['contactEmail'] ), false );
check( 'markup stripped from an email', nymbus_sc_shape_texts( array( 'contact_email' => 'x@example.org<script>' ) )['contactEmail'], 'x@example.org' );

// --- document -----------------------------------------------------------------------------------------------
$old   = array_merge( $news, array( 'id' => 'old', 'date' => '2025-01-01' ) );
$dup   = $news;
$doc   = nymbus_sc_build_document( array( $old, $news, $dup, array( 'junk' => 1 ) ), array( array_merge( $m, array( 'order' => '20', 'id' => 'p2', 'name' => 'Zed' ) ), array_merge( $m, array( 'order' => '10' ) ) ), array() );
check( 'schema version', $doc['schemaVersion'], 1 );
check( 'news newest first, duplicates and junk dropped', array_map( function ( $n ) { return $n['id']; }, $doc['news'] ), array( 'first', 'old' ) );
check( 'team by order', array_map( function ( $x ) { return $x['id']; }, $doc['team'] ), array( 'a-person', 'p2' ) );
check( 'empty texts encode as an object', json_encode( $doc['texts'] ), '{}' );
check( 'empty document encodes arrays', json_encode( nymbus_sc_build_document( array(), array(), array() ) ), '{"schemaVersion":1,"news":[],"team":[],"texts":{}}' );

echo "$count checks, $failures failure(s)\n";
exit( $failures ? 1 : 0 );
