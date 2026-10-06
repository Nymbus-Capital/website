<?php
/**
 * Pure normalisation of the document served to the Next.js site (no WordPress calls: unit-tested with plain PHP,
 * see wordpress/tests/normalize-test.php). Everything that leaves the plugin is PLAIN TEXT (tags stripped, entities
 * decoded once, control characters removed, lengths capped), URLs are https only without credentials, and unknown
 * values (department, category) are replaced by whitelisted ones or the item is dropped. The Next.js site validates
 * the document again; this is defence in depth, not the only barrier.
 *
 * @package NymbusSiteContent
 */

if ( ! defined( 'ABSPATH' ) && ! defined( 'NYMBUS_SC_TESTING' ) ) {
	exit;
}

if ( ! defined( 'NYMBUS_SC_SCHEMA' ) ) {
	define( 'NYMBUS_SC_SCHEMA', 1 );
}

/** Post meta key of a field (and language). */
function nymbus_sc_meta_key( $field_key, $lang = '' ) {
	return 'nymbus_' . $field_key . ( '' !== $lang ? '_' . $lang : '' );
}

/** Departments of the team page (same list as src/lib/cms/types.ts). */
function nymbus_sc_departments() {
	return array( 'Leadership', 'Quantitative Research', 'Investment Team', 'Operations', 'Board' );
}

/** News categories (same list as src/lib/cms/types.ts). */
function nymbus_sc_news_categories() {
	return array(
		'partnership' => 'Partnership',
		'esg'         => 'ESG',
		'recognition' => 'Recognition',
		'community'   => 'Community',
	);
}

/**
 * Pages whose introduction (headline, highlighted ending, lead) editors may change (same list as src/lib/cms/types.ts
 * INTRO_PAGES). Disclosures, fund copy, awards and legal texts are compliance-reviewed and are NOT editable here.
 */
function nymbus_sc_intro_pages() {
	return array(
		'approach'       => 'Approach',
		'solutions'      => 'Solutions',
		'sustainability' => 'Sustainability',
		'team'           => 'Team',
	);
}

/**
 * Intro pages whose LEAD stays in code: the Sustainability lead carries the scope qualifier of the ESG criteria (they
 * apply to the fund's bonds, not to its futures overlay), which is compliance-reviewed. Same list in src/lib/cms/types.ts.
 */
function nymbus_sc_intro_lead_locked() {
	return array( 'sustainability' );
}

/** Removes tags (script / style bodies and comments included), repeatedly so a rebuilt tag cannot survive. */
function nymbus_sc_strip_tags( $s ) {
	for ( $i = 0; $i < 6; $i++ ) {
		$before = $s;
		$s      = preg_replace( '#<(script|style)\b.*?</\1\s*>#is', '', $s );
		$s      = preg_replace( '#<!--.*?-->#s', '', $s );
		$s      = strip_tags( $s );
		if ( null === $s ) {
			return '';
		}
		if ( $s === $before ) {
			break;
		}
	}
	return $s;
}

/** Removes control and bidi-override characters (keeps \n and \t). Returns '' on invalid UTF-8. */
function nymbus_sc_clean_chars( $s ) {
	$out = preg_replace( '/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F\x{80}-\x{9F}\x{200B}-\x{200F}\x{202A}-\x{202E}\x{2066}-\x{2069}\x{FEFF}]/u', '', $s );
	return null === $out ? '' : $out;
}

function nymbus_sc_cut( $s, $max ) {
	return mb_strlen( $s, 'UTF-8' ) > $max ? rtrim( mb_substr( $s, 0, $max, 'UTF-8' ) ) : $s;
}

/** One line of plain text, capped. */
function nymbus_sc_plain( $v, $max ) {
	if ( ! is_string( $v ) ) {
		return '';
	}
	$s = html_entity_decode( $v, ENT_QUOTES | ENT_HTML5, 'UTF-8' );
	$s = nymbus_sc_strip_tags( $s );
	$s = nymbus_sc_clean_chars( $s );
	$s = preg_replace( '/\s+/u', ' ', $s );
	return nymbus_sc_cut( trim( (string) $s ), $max );
}

/** Plain text keeping paragraph breaks (blank line between paragraphs), capped. */
function nymbus_sc_paragraphs( $v, $max ) {
	if ( ! is_string( $v ) ) {
		return '';
	}
	$s = html_entity_decode( $v, ENT_QUOTES | ENT_HTML5, 'UTF-8' );
	$s = nymbus_sc_strip_tags( $s );
	$s = nymbus_sc_clean_chars( str_replace( array( "\r\n", "\r" ), "\n", $s ) );
	$paras = array();
	foreach ( preg_split( '/\n{2,}/', $s ) as $p ) {
		$p = trim( (string) preg_replace( '/[ \t]*\n[ \t]*/', ' ', $p ) );
		$p = trim( (string) preg_replace( '/[ \t]+/', ' ', $p ) );
		if ( '' !== $p ) {
			$paras[] = $p;
		}
	}
	return nymbus_sc_cut( implode( "\n\n", $paras ), $max );
}

/** Plain-text lines (a string with one entry per line, or an array), bounded. */
function nymbus_sc_lines( $v, $max_lines, $max_len ) {
	$src = is_array( $v ) ? $v : ( is_string( $v ) ? preg_split( '/\r?\n/', $v ) : array() );
	$out = array();
	foreach ( $src as $x ) {
		$t = nymbus_sc_plain( $x, $max_len );
		if ( '' !== $t ) {
			$out[] = $t;
		}
		if ( count( $out ) >= $max_lines ) {
			break;
		}
	}
	return $out;
}

/** https URL without credentials, or ''. */
function nymbus_sc_https_url( $v ) {
	if ( ! is_string( $v ) ) {
		return '';
	}
	$v = trim( $v );
	if ( '' === $v || strlen( $v ) > 2048 || preg_match( '/[\x00-\x20\x7F]/', $v ) ) {
		return '';
	}
	$p = parse_url( $v );
	if ( ! is_array( $p ) || ! isset( $p['scheme'], $p['host'] ) || 'https' !== strtolower( $p['scheme'] ) || isset( $p['user'] ) || isset( $p['pass'] ) ) {
		return '';
	}
	return $v;
}

/** The slug, else "p<post id>" when the row carries its post id (`wp_id`), else ''. */
function nymbus_sc_row_id( array $r ) {
	$fallback = isset( $r['wp_id'] ) && preg_match( '/^[1-9]\d{0,17}$/', (string) $r['wp_id'] ) ? 'p' . $r['wp_id'] : '';
	return nymbus_sc_slug( isset( $r['id'] ) ? $r['id'] : '', $fallback );
}

/** Primitive capabilities of the custom capability type (nymbus_item / nymbus_items) of both post types. */
function nymbus_sc_item_caps() {
	$caps = array();
	foreach ( array( 'edit_%s', 'edit_others_%s', 'publish_%s', 'read_private_%s', 'delete_%s', 'delete_private_%s', 'delete_published_%s', 'delete_others_%s', 'edit_private_%s', 'edit_published_%s' ) as $f ) {
		$caps[] = sprintf( $f, 'nymbus_items' );
	}
	return $caps;
}

/**
 * `user_has_cap` filter body: whoever can edit and publish other people's posts (Editor, Administrator) can manage the
 * Nymbus content; Author, Contributor and Subscriber cannot publish it, even though they can write ordinary posts.
 */
function nymbus_sc_grant_item_caps( $allcaps ) {
	if ( is_array( $allcaps ) && ! empty( $allcaps['edit_others_posts'] ) && ! empty( $allcaps['publish_posts'] ) ) {
		foreach ( nymbus_sc_item_caps() as $cap ) {
			$allcaps[ $cap ] = true;
		}
	}
	return $allcaps;
}

function nymbus_sc_slug( $v, $fallback ) {
	$v = is_string( $v ) ? strtolower( $v ) : '';
	return preg_match( '/^[a-z0-9][a-z0-9-]{0,99}$/', $v ) ? $v : $fallback;
}

/** YYYY-MM-DD or ''. */
function nymbus_sc_date( $v ) {
	if ( ! is_string( $v ) || ! preg_match( '/^(\d{4})-(\d{2})-(\d{2})$/', $v, $m ) || ! checkdate( (int) $m[2], (int) $m[3], (int) $m[1] ) ) {
		return '';
	}
	return $v;
}

function nymbus_sc_bi( $en, $fr, $max, $multiline = false ) {
	$f = $multiline ? 'nymbus_sc_paragraphs' : 'nymbus_sc_plain';
	return array(
		'en' => $f( $en, $max ),
		'fr' => $f( $fr, $max ),
	);
}

/** One news row (raw strings from the posts) → document entry, or null when it cannot be shown. */
function nymbus_sc_shape_news( array $r ) {
	$id    = nymbus_sc_row_id( $r );
	$date  = nymbus_sc_date( isset( $r['date'] ) ? $r['date'] : '' );
	$title = nymbus_sc_bi( isset( $r['title_en'] ) ? $r['title_en'] : '', isset( $r['title_fr'] ) ? $r['title_fr'] : '', 200 );
	if ( '' === $id || '' === $date || ( '' === $title['en'] && '' === $title['fr'] ) ) {
		return null;
	}
	$cats = nymbus_sc_news_categories();
	$cat  = isset( $r['category'] ) && is_string( $r['category'] ) && isset( $cats[ $r['category'] ] ) ? $r['category'] : 'community';
	return array(
		'id'       => $id,
		'date'     => $date,
		'category' => $cat,
		'title'    => $title,
		'summary'  => nymbus_sc_bi( isset( $r['summary_en'] ) ? $r['summary_en'] : '', isset( $r['summary_fr'] ) ? $r['summary_fr'] : '', 600 ),
		'body'     => nymbus_sc_bi( isset( $r['body_en'] ) ? $r['body_en'] : '', isset( $r['body_fr'] ) ? $r['body_fr'] : '', 20000, true ),
		'image'    => '' !== ( $u = nymbus_sc_https_url( isset( $r['image'] ) ? $r['image'] : '' ) ) ? $u : null,
		'link'     => '' !== ( $l = nymbus_sc_https_url( isset( $r['link'] ) ? $r['link'] : '' ) ) ? $l : null,
	);
}

/** One team row → document entry, or null (hidden members never reach this function; bad rows are dropped). */
function nymbus_sc_shape_member( array $r ) {
	$id   = nymbus_sc_row_id( $r );
	$name = nymbus_sc_plain( isset( $r['name'] ) ? $r['name'] : '', 120 );
	$dept = isset( $r['department'] ) ? $r['department'] : '';
	if ( '' === $id || '' === $name || ! in_array( $dept, nymbus_sc_departments(), true ) ) {
		return null;
	}
	$extra = array();
	if ( isset( $r['additional_departments'] ) && is_array( $r['additional_departments'] ) ) {
		foreach ( $r['additional_departments'] as $d ) {
			if ( in_array( $d, nymbus_sc_departments(), true ) && $d !== $dept && ! in_array( $d, $extra, true ) ) {
				$extra[] = $d;
			}
		}
	}
	$year  = isset( $r['year_joined'] ) ? (int) $r['year_joined'] : 0;
	$order = isset( $r['order'] ) ? (int) $r['order'] : 0;
	$li    = nymbus_sc_https_url( isset( $r['linkedin'] ) ? $r['linkedin'] : '' );
	$host  = '' === $li ? '' : strtolower( (string) parse_url( $li, PHP_URL_HOST ) );
	if ( 'linkedin.com' !== $host && '.linkedin.com' !== substr( $host, -13 ) ) {
		$li = '';
	}
	return array(
		'id'                    => $id,
		'name'                  => $name,
		'role'                  => nymbus_sc_bi( isset( $r['role_en'] ) ? $r['role_en'] : '', isset( $r['role_fr'] ) ? $r['role_fr'] : '', 160 ),
		'bio'                   => nymbus_sc_bi( isset( $r['bio_en'] ) ? $r['bio_en'] : '', isset( $r['bio_fr'] ) ? $r['bio_fr'] : '', 5000, true ),
		'department'            => $dept,
		'additionalDepartments' => $extra,
		'designations'          => nymbus_sc_lines( isset( $r['designations'] ) ? $r['designations'] : '', 20, 200 ),
		'education'             => nymbus_sc_lines( isset( $r['education'] ) ? $r['education'] : '', 20, 200 ),
		'previousRoles'         => array(
			'en' => nymbus_sc_lines( isset( $r['previous_roles_en'] ) ? $r['previous_roles_en'] : '', 20, 200 ),
			'fr' => nymbus_sc_lines( isset( $r['previous_roles_fr'] ) ? $r['previous_roles_fr'] : '', 20, 200 ),
		),
		'yearJoined'            => ( $year >= 1900 && $year <= 2100 ) ? $year : null,
		'photo'                 => '' !== ( $u = nymbus_sc_https_url( isset( $r['photo'] ) ? $r['photo'] : '' ) ) ? $u : null,
		'linkedin'              => '' !== $li ? $li : null,
		'order'                 => max( -100000, min( 100000, $order ) ),
	);
}

/** Editable texts (raw option array, snake_case keys) → document `texts` (only filled values are present). */
function nymbus_sc_shape_texts( array $t ) {
	$out = array();
	$bi  = function ( $key, $max ) use ( $t ) {
		$v = nymbus_sc_bi( isset( $t[ $key . '_en' ] ) ? $t[ $key . '_en' ] : '', isset( $t[ $key . '_fr' ] ) ? $t[ $key . '_fr' ] : '', $max );
		return ( '' !== $v['en'] || '' !== $v['fr'] ) ? $v : null;
	};
	if ( null !== ( $v = $bi( 'home_headline', 200 ) ) ) {
		$out['homeHeadline'] = $v;
	}
	if ( null !== ( $v = $bi( 'home_subheadline', 400 ) ) ) {
		$out['homeSubheadline'] = $v;
	}
	if ( null !== ( $v = $bi( 'aum_label', 60 ) ) ) {
		$out['aumLabel'] = $v;
	}
	if ( ! empty( $t['banner_enabled'] ) && null !== ( $v = $bi( 'banner', 400 ) ) ) {
		$out['banner'] = $v;
	}
	// the address keeps its line breaks (one line per row, at most 4)
	$addr = function ( $lang ) use ( $t ) {
		return nymbus_sc_cut( implode( "\n", nymbus_sc_lines( isset( $t[ 'contact_address_' . $lang ] ) ? $t[ 'contact_address_' . $lang ] : '', 4, 300 ) ), 300 );
	};
	$address = array( 'en' => $addr( 'en' ), 'fr' => $addr( 'fr' ) );
	if ( '' !== $address['en'] || '' !== $address['fr'] ) {
		$out['contactAddress'] = $address;
	}
	$intros = array();
	foreach ( array_keys( nymbus_sc_intro_pages() ) as $page ) {
		$intro = array();
		if ( null !== ( $v = $bi( 'intro_' . $page . '_headline', 200 ) ) ) {
			$intro['headline'] = $v;
			// the highlighted ending only means something after a headline
			if ( null !== ( $h = $bi( 'intro_' . $page . '_highlight', 120 ) ) ) {
				$intro['highlight'] = $h;
			}
		}
		if ( ! in_array( $page, nymbus_sc_intro_lead_locked(), true ) && null !== ( $v = $bi( 'intro_' . $page . '_lead', 400 ) ) ) {
			$intro['lead'] = $v;
		}
		if ( $intro ) {
			$intros[ $page ] = $intro;
		}
	}
	if ( $intros ) {
		$out['pageIntros'] = $intros;
	}
	$email = nymbus_sc_plain( isset( $t['contact_email'] ) ? $t['contact_email'] : '', 120 );
	// strict, same pattern as src/lib/cms/validate.ts (no quotes, no IP literals, no exotic characters in a mailto:)
	if ( '' !== $email && 1 === preg_match( '/^[A-Za-z0-9._+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/', $email ) ) {
		$out['contactEmail'] = $email;
	}
	$phone = nymbus_sc_plain( isset( $t['contact_phone'] ) ? $t['contact_phone'] : '', 40 );
	if ( '' !== $phone && preg_match( '/^[+0-9][0-9 ().\-]{3,30}$/', $phone ) ) {
		$out['contactPhone'] = $phone;
	}
	return $out;
}

/**
 * The whole document. `$news_rows` / `$team_rows` contain PUBLISHED, non-hidden items only (the caller filters);
 * rows that cannot be shown are dropped here.
 */
function nymbus_sc_build_document( array $news_rows, array $team_rows, array $texts ) {
	$news = array();
	$seen = array();
	foreach ( array_slice( $news_rows, 0, 200 ) as $r ) {
		$n = nymbus_sc_shape_news( $r );
		if ( null !== $n && ! isset( $seen[ $n['id'] ] ) ) {
			$seen[ $n['id'] ] = true;
			$news[]           = $n;
		}
	}
	usort(
		$news,
		function ( $a, $b ) {
			return strcmp( $b['date'], $a['date'] );
		}
	);
	$team = array();
	$seen = array();
	foreach ( array_slice( $team_rows, 0, 100 ) as $r ) {
		$m = nymbus_sc_shape_member( $r );
		if ( null !== $m && ! isset( $seen[ $m['id'] ] ) ) {
			$seen[ $m['id'] ] = true;
			$team[]           = $m;
		}
	}
	usort(
		$team,
		function ( $a, $b ) {
			return $a['order'] === $b['order'] ? strcmp( $a['name'], $b['name'] ) : $a['order'] - $b['order'];
		}
	);
	return array(
		'schemaVersion' => NYMBUS_SC_SCHEMA,
		'news'          => $news,
		'team'          => $team,
		'texts'         => (object) nymbus_sc_shape_texts( $texts ),
	);
}

/**
 * One entry of an import file (wordpress/scripts/import-from-site.mjs) → the post fields and the RAW editor input
 * (meta key => value) that the import command then passes through the editor's own sanitiser, exactly like a save.
 * Only fields PRESENT in the entry are in `input` (an update never clears a field the file does not carry); `hidden`
 * is never part of it. Returns null for an entry that cannot be imported. Pure (unit-tested).
 *
 * @param string $type nymbus_news | nymbus_team.
 * @param mixed  $row  Decoded JSON object.
 * @return array|null array( 'slug', 'title', 'date' (news: Y-m-d, team: ''), 'photo' (https URL or ''), 'input' )
 */
function nymbus_sc_import_entry( $type, $row ) {
	if ( ! is_array( $row ) ) {
		return null;
	}
	$slug = nymbus_sc_slug( isset( $row['slug'] ) ? $row['slug'] : '', '' );
	$s    = function ( $v ) {
		return is_string( $v ) ? $v : '';
	};
	$in   = array();
	// a scalar field, when the entry has it
	$one  = function ( $json, $field, $fn = null ) use ( $row, &$in, $s ) {
		if ( array_key_exists( $json, $row ) ) {
			$in[ nymbus_sc_meta_key( $field ) ] = $fn ? $fn( $row[ $json ] ) : $s( $row[ $json ] );
		}
	};
	// a bilingual field, per language present
	$two  = function ( $json, $field, $lines = false ) use ( $row, &$in, $s ) {
		if ( ! isset( $row[ $json ] ) || ! is_array( $row[ $json ] ) ) {
			return;
		}
		foreach ( array( 'en', 'fr' ) as $l ) {
			if ( array_key_exists( $l, $row[ $json ] ) ) {
				$v = $row[ $json ][ $l ];
				$in[ nymbus_sc_meta_key( $field, $l ) ] = $lines ? ( is_array( $v ) ? implode( "\n", array_filter( $v, 'is_string' ) ) : '' ) : $s( $v );
			}
		}
	};
	$lst  = function ( $v ) {
		return is_array( $v ) ? implode( "\n", array_filter( $v, 'is_string' ) ) : '';
	};
	$int  = function ( $v ) {
		return is_int( $v ) ? (string) $v : '';
	};
	if ( 'nymbus_news' === $type ) {
		$title = nymbus_sc_plain( isset( $row['title'] ) && is_array( $row['title'] ) && isset( $row['title']['en'] ) ? $s( $row['title']['en'] ) : '', 200 );
		$date  = nymbus_sc_date( $s( isset( $row['date'] ) ? $row['date'] : '' ) );
		if ( '' === $slug || '' === $title || '' === $date ) {
			return null;
		}
		if ( isset( $row['title'] ) && is_array( $row['title'] ) && array_key_exists( 'fr', $row['title'] ) ) {
			$in[ nymbus_sc_meta_key( 'title', 'fr' ) ] = $s( $row['title']['fr'] );
		}
		$two( 'summary', 'summary' );
		$two( 'body', 'body' );
		$one( 'category', 'category' );
		$one( 'link', 'link' );
		return array( 'slug' => $slug, 'title' => $title, 'date' => $date, 'photo' => nymbus_sc_https_url( isset( $row['image'] ) ? $row['image'] : '' ), 'input' => $in );
	}
	if ( 'nymbus_team' === $type ) {
		$name = nymbus_sc_plain( $s( isset( $row['name'] ) ? $row['name'] : '' ), 120 );
		$dept = $s( isset( $row['department'] ) ? $row['department'] : '' );
		if ( '' === $slug || '' === $name || ! in_array( $dept, nymbus_sc_departments(), true ) ) {
			return null;
		}
		$in[ nymbus_sc_meta_key( 'department' ) ] = $dept;
		$one( 'additionalDepartments', 'additional_departments', function ( $v ) {
			return is_array( $v ) ? array_values( array_filter( $v, 'is_string' ) ) : array();
		} );
		$one( 'order', 'order', $int );
		$one( 'linkedin', 'linkedin' );
		$one( 'yearJoined', 'year_joined', $int );
		$two( 'role', 'role' );
		$two( 'bio', 'bio' );
		$two( 'previousRoles', 'previous_roles', true );
		$one( 'designations', 'designations', $lst );
		$one( 'education', 'education', $lst );
		return array( 'slug' => $slug, 'title' => $name, 'date' => '', 'photo' => nymbus_sc_https_url( isset( $row['photo'] ) ? $row['photo'] : '' ), 'input' => $in );
	}
	return null;
}
