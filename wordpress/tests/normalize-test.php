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

check( 'news invalid slug falls back to p<id>', nymbus_sc_shape_news( array_merge( $news, array( 'id' => 'Bad Id', 'wp_id' => '42' ) ) )['id'], 'p42' );
check( 'news empty slug falls back to p<id>', nymbus_sc_shape_news( array_merge( $news, array( 'id' => '', 'wp_id' => 7 ) ) )['id'], 'p7' );
check( 'news valid slug wins over the post id', nymbus_sc_shape_news( array_merge( $news, array( 'id' => 'ok-slug', 'wp_id' => '42' ) ) )['id'], 'ok-slug' );
check( 'news bad slug and bad post id dropped', nymbus_sc_shape_news( array_merge( $news, array( 'id' => 'Bad Id', 'wp_id' => 'x1' ) ) ), null );

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

check( 'member invalid slug falls back to p<id>', nymbus_sc_shape_member( array_merge( $m, array( 'id' => '%e9%c3', 'wp_id' => '9' ) ) )['id'], 'p9' );

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
check( 'address keeps its line breaks', nymbus_sc_shape_texts( array( 'contact_address_en' => "1 Test Street<br>\r\n\r\nMontreal  QC" ) )['contactAddress'], array( 'en' => "1 Test Street\nMontreal QC", 'fr' => '' ) );
check( 'address at most 4 lines', substr_count( nymbus_sc_shape_texts( array( 'contact_address_fr' => "a\nb\nc\nd\ne\nf" ) )['contactAddress']['fr'], "\n" ), 3 );
check( 'banner off: absent', isset( nymbus_sc_shape_texts( array( 'banner_enabled' => '', 'banner_en' => 'x' ) )['banner'] ), false );
check( 'bad email dropped', isset( nymbus_sc_shape_texts( array( 'contact_email' => 'not an email' ) )['contactEmail'] ), false );
check( 'markup stripped from an email', nymbus_sc_shape_texts( array( 'contact_email' => 'x@example.org<script>' ) )['contactEmail'], 'x@example.org' );

// --- page intros --------------------------------------------------------------------------------------------
$pi = nymbus_sc_shape_texts( array(
	'intro_approach_headline_en' => 'How we <b>invest</b>', 'intro_approach_highlight_en' => 'with data', 'intro_approach_lead_fr' => "Une phrase.\n\nDeux.",
	'intro_team_highlight_en'    => 'orphan highlight', 'intro_unknown_headline_en' => 'ignored', 'intro_solutions_lead_en' => '   ',
) );
check( 'intro headline stripped', $pi['pageIntros']['approach']['headline'], array( 'en' => 'How we invest', 'fr' => '' ) );
check( 'intro highlight kept with a headline', $pi['pageIntros']['approach']['highlight']['en'], 'with data' );
check( 'intro lead one line', $pi['pageIntros']['approach']['lead']['fr'], 'Une phrase. Deux.' );
check( 'highlight without headline dropped', isset( $pi['pageIntros']['team'] ), false );
check( 'unknown page ignored', isset( $pi['pageIntros']['unknown'] ), false );
check( 'blank lead absent', isset( $pi['pageIntros']['solutions'] ), false );
check( 'no intros: key absent', isset( nymbus_sc_shape_texts( array() )['pageIntros'] ), false );
check( 'sustainability lead stays in code', isset( nymbus_sc_shape_texts( array( 'intro_sustainability_lead_en' => 'No qualifier' ) )['pageIntros'] ), false );
check( 'sustainability headline editable', nymbus_sc_shape_texts( array( 'intro_sustainability_headline_en' => 'H' ) )['pageIntros']['sustainability']['headline']['en'], 'H' );
check( 'intro pages', array_keys( nymbus_sc_intro_pages() ), array( 'approach', 'solutions', 'sustainability', 'team' ) );
check( 'intro headline capped', mb_strlen( nymbus_sc_shape_texts( array( 'intro_team_headline_fr' => str_repeat( 'x', 500 ) ) )['pageIntros']['team']['headline']['fr'] ), 200 );

// --- import entries (wp nymbus import) ------------------------------------------------------------------------
$imp = nymbus_sc_import_entry( 'nymbus_team', array(
	'slug' => 'jane-doe', 'name' => 'Jane <b>Doe</b>', 'department' => 'Operations', 'additionalDepartments' => array( 'Board', 7 ), 'order' => 30,
	'role' => array( 'en' => 'Role', 'fr' => 'Rôle' ), 'bio' => array( 'en' => 'Bio', 'fr' => '' ), 'previousRoles' => array( 'en' => array( 'A', 'B' ), 'fr' => array() ),
	'designations' => array( 'CFA' ), 'education' => array( 'PhD' ), 'yearJoined' => 2019, 'linkedin' => 'https://www.linkedin.com/in/x', 'photo' => 'https://site.example/team/j.webp',
) );
check( 'import team: name plain', $imp['title'], 'Jane Doe' );
check( 'import team: slug', $imp['slug'], 'jane-doe' );
check( 'import team: order as editor input', $imp['input']['nymbus_order'], '30' );
check( 'import team: lists one per line', $imp['input']['nymbus_previous_roles_en'], "A\nB" );
check( 'import team: extra departments strings only', $imp['input']['nymbus_additional_departments'], array( 'Board' ) );
check( 'import team: photo kept (https)', $imp['photo'], 'https://site.example/team/j.webp' );
check( 'import team: bad department refused', nymbus_sc_import_entry( 'nymbus_team', array( 'slug' => 'x', 'name' => 'X', 'department' => 'Sales' ) ), null );
check( 'import team: http photo dropped', nymbus_sc_import_entry( 'nymbus_team', array( 'slug' => 'x', 'name' => 'X', 'department' => 'Board', 'photo' => 'http://a/b.png' ) )['photo'], '' );
$impn = nymbus_sc_import_entry( 'nymbus_news', array( 'slug' => 'mageska', 'date' => '2025-01-28', 'category' => 'partnership', 'title' => array( 'en' => 'T', 'fr' => 'TF' ), 'summary' => array( 'en' => 'S', 'fr' => 'SF' ), 'body' => array( 'en' => 'B', 'fr' => '' ) ) );
check( 'import news: date', $impn['date'], '2025-01-28' );
check( 'import news: french title as meta', $impn['input']['nymbus_title_fr'], 'TF' );
check( 'import news: no date refused', nymbus_sc_import_entry( 'nymbus_news', array( 'slug' => 'a', 'title' => array( 'en' => 'T' ) ) ), null );
check( 'import: bad slug refused', nymbus_sc_import_entry( 'nymbus_news', array( 'slug' => 'Bad Slug!', 'date' => '2025-01-01', 'title' => array( 'en' => 'T' ) ) ), null );
check( 'import: unknown type', nymbus_sc_import_entry( 'post', array( 'slug' => 'a' ) ), null );
check( 'import: not an array', nymbus_sc_import_entry( 'nymbus_news', 'x' ), null );

// --- document -----------------------------------------------------------------------------------------------
$old   = array_merge( $news, array( 'id' => 'old', 'date' => '2025-01-01' ) );
$dup   = $news;
$doc   = nymbus_sc_build_document( array( $old, $news, $dup, array( 'junk' => 1 ) ), array( array_merge( $m, array( 'order' => '20', 'id' => 'p2', 'name' => 'Zed' ) ), array_merge( $m, array( 'order' => '10' ) ) ), array() );
check( 'schema version', $doc['schemaVersion'], 1 );
check( 'news newest first, duplicates and junk dropped', array_map( function ( $n ) { return $n['id']; }, $doc['news'] ), array( 'first', 'old' ) );
check( 'team by order', array_map( function ( $x ) { return $x['id']; }, $doc['team'] ), array( 'a-person', 'p2' ) );
check( 'empty texts encode as an object', json_encode( $doc['texts'] ), '{}' );
check( 'empty document encodes arrays', json_encode( nymbus_sc_build_document( array(), array(), array() ) ), '{"schemaVersion":1,"news":[],"team":[],"texts":{}}' );

// --- capabilities -------------------------------------------------------------------------------------------
$editor = nymbus_sc_grant_item_caps( array( 'edit_posts' => true, 'edit_others_posts' => true, 'publish_posts' => true ) );
check( 'editor can publish the content', $editor['publish_nymbus_items'] && $editor['edit_nymbus_items'] && $editor['edit_others_nymbus_items'], true );
$author = nymbus_sc_grant_item_caps( array( 'edit_posts' => true, 'publish_posts' => true ) );
check( 'author cannot publish the content', isset( $author['publish_nymbus_items'] ) || isset( $author['edit_nymbus_items'] ), false );
check( 'contributor cannot', nymbus_sc_grant_item_caps( array( 'edit_posts' => true ) ), array( 'edit_posts' => true ) );
check( 'ten capabilities of the custom type', count( nymbus_sc_item_caps() ), 10 );

echo "$count checks, $failures failure(s)\n";
exit( $failures ? 1 : 0 );
