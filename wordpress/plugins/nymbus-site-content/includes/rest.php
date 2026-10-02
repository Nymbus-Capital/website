<?php
/**
 * GET /wp-json/nymbus/v1/site-content — the one normalized, read-only document the Next.js site renders from.
 *
 * Access: when NYMBUS_CONTENT_SECRET is set (environment variable or constant) the request must carry the same value in
 * the `X-Nymbus-Content-Secret` header (constant-time comparison). Unset: public outside production, 503 in production
 * (WP_ENVIRONMENT_TYPE). The content is public website content anyway; the secret only stops third parties from
 * hammering the editor backend and from pre-reading content.
 *
 * Never leaks: only PUBLISHED posts (no draft, pending, private, scheduled, trashed), no password-protected posts,
 * no team member flagged "hide", nothing but the whitelisted fields (see includes/normalize.php).
 *
 * Caching: the built document is kept in a transient (rebuilt after any change and at most every 10 minutes) and
 * served with an ETag (304 on a match) and a short Cache-Control.
 *
 * @package NymbusSiteContent
 */

defined( 'ABSPATH' ) || exit;

/** A setting from the constant of that name, else the environment variable, else ''. */
function nymbus_sc_config( $name ) {
	if ( defined( $name ) && is_string( constant( $name ) ) ) {
		return trim( constant( $name ) );
	}
	$v = getenv( $name );
	return is_string( $v ) ? trim( $v ) : '';
}

add_action( 'rest_api_init', 'nymbus_sc_register_routes' );
function nymbus_sc_register_routes() {
	register_rest_route(
		'nymbus/v1',
		'/site-content',
		array(
			'methods'             => 'GET',
			'callback'            => 'nymbus_sc_rest_site_content',
			'permission_callback' => 'nymbus_sc_rest_permission',
		)
	);
}

/** True on a production site (WP_ENVIRONMENT_TYPE, default "production"). */
function nymbus_sc_is_production() {
	return function_exists( 'wp_get_environment_type' ) && 'production' === wp_get_environment_type();
}

/** The shared secret in the header; public only outside production (local / staging / development). */
function nymbus_sc_rest_permission( $request ) {
	$secret = nymbus_sc_config( 'NYMBUS_CONTENT_SECRET' );
	if ( '' === $secret ) {
		if ( nymbus_sc_is_production() ) {
			return new WP_Error( 'nymbus_not_configured', __( 'The content secret is not configured.', 'nymbus-site-content' ), array( 'status' => 503 ) );
		}
		return true;
	}
	$given = $request->get_header( 'x-nymbus-content-secret' );
	if ( is_string( $given ) && '' !== $given && hash_equals( hash( 'sha256', $secret ), hash( 'sha256', $given ) ) ) {
		return true;
	}
	return new WP_Error( 'nymbus_forbidden', __( 'Missing or wrong content secret.', 'nymbus-site-content' ), array( 'status' => 401 ) );
}

/** Raw rows of the published news (strings straight from the posts; shaped by normalize.php). */
function nymbus_sc_collect_news() {
	$posts = get_posts(
		array(
			'post_type'        => 'nymbus_news',
			'post_status'      => 'publish',
			'has_password'     => false,
			'numberposts'      => 200,
			'orderby'          => 'date',
			'order'            => 'DESC',
			'no_found_rows'    => true,
			'suppress_filters' => true,
		)
	);
	$rows = array();
	foreach ( $posts as $p ) {
		$id     = $p->ID;
		$img    = get_the_post_thumbnail_url( $p, 'large' );
		$dt     = get_post_datetime( $p );
		$rows[] = array(
			'id'         => (string) $p->post_name,
			'wp_id'      => (string) $id,
			'date'       => $dt ? $dt->format( 'Y-m-d' ) : '',
			'title_en'   => html_entity_decode( (string) $p->post_title, ENT_QUOTES, 'UTF-8' ),
			'title_fr'   => (string) get_post_meta( $id, nymbus_sc_meta_key( 'title', 'fr' ), true ),
			'summary_en' => (string) get_post_meta( $id, nymbus_sc_meta_key( 'summary', 'en' ), true ),
			'summary_fr' => (string) get_post_meta( $id, nymbus_sc_meta_key( 'summary', 'fr' ), true ),
			'body_en'    => (string) get_post_meta( $id, nymbus_sc_meta_key( 'body', 'en' ), true ),
			'body_fr'    => (string) get_post_meta( $id, nymbus_sc_meta_key( 'body', 'fr' ), true ),
			'category'   => (string) get_post_meta( $id, nymbus_sc_meta_key( 'category' ), true ),
			'link'       => (string) get_post_meta( $id, nymbus_sc_meta_key( 'link' ), true ),
			'image'      => is_string( $img ) ? $img : '',
		);
	}
	return $rows;
}

/** Raw rows of the published, not hidden team members. */
function nymbus_sc_collect_team() {
	$posts = get_posts(
		array(
			'post_type'        => 'nymbus_team',
			'post_status'      => 'publish',
			'has_password'     => false,
			'numberposts'      => 100,
			'no_found_rows'    => true,
			'suppress_filters' => true,
		)
	);
	$rows = array();
	foreach ( $posts as $p ) {
		$id = $p->ID;
		if ( '1' === get_post_meta( $id, nymbus_sc_meta_key( 'hidden' ), true ) ) {
			continue;
		}
		$img    = get_the_post_thumbnail_url( $p, 'medium_large' );
		$extra  = array_filter( explode( ',', (string) get_post_meta( $id, nymbus_sc_meta_key( 'additional_departments' ), true ) ) );
		$rows[] = array(
			'id'                     => (string) $p->post_name,
			'wp_id'                  => (string) $id,
			'name'                   => html_entity_decode( (string) $p->post_title, ENT_QUOTES, 'UTF-8' ),
			'department'             => (string) get_post_meta( $id, nymbus_sc_meta_key( 'department' ), true ),
			'additional_departments' => array_values( $extra ),
			'order'                  => (string) get_post_meta( $id, nymbus_sc_meta_key( 'order' ), true ),
			'year_joined'            => (string) get_post_meta( $id, nymbus_sc_meta_key( 'year_joined' ), true ),
			'linkedin'               => (string) get_post_meta( $id, nymbus_sc_meta_key( 'linkedin' ), true ),
			'role_en'                => (string) get_post_meta( $id, nymbus_sc_meta_key( 'role', 'en' ), true ),
			'role_fr'                => (string) get_post_meta( $id, nymbus_sc_meta_key( 'role', 'fr' ), true ),
			'bio_en'                 => (string) get_post_meta( $id, nymbus_sc_meta_key( 'bio', 'en' ), true ),
			'bio_fr'                 => (string) get_post_meta( $id, nymbus_sc_meta_key( 'bio', 'fr' ), true ),
			'previous_roles_en'      => (string) get_post_meta( $id, nymbus_sc_meta_key( 'previous_roles', 'en' ), true ),
			'previous_roles_fr'      => (string) get_post_meta( $id, nymbus_sc_meta_key( 'previous_roles', 'fr' ), true ),
			'designations'           => (string) get_post_meta( $id, nymbus_sc_meta_key( 'designations' ), true ),
			'education'              => (string) get_post_meta( $id, nymbus_sc_meta_key( 'education' ), true ),
			'photo'                  => is_string( $img ) ? $img : '',
		);
	}
	return $rows;
}

define( 'NYMBUS_SC_TRANSIENT', 'nymbus_sc_doc_v1' );

/** The document (array with `json` and `etag`), from the transient or rebuilt. */
function nymbus_sc_get_document() {
	$cached = get_transient( NYMBUS_SC_TRANSIENT );
	if ( is_array( $cached ) && isset( $cached['json'], $cached['etag'] ) ) {
		return $cached;
	}
	$doc  = nymbus_sc_build_document( nymbus_sc_collect_news(), nymbus_sc_collect_team(), nymbus_sc_get_texts() );
	$json = wp_json_encode( $doc, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES );
	if ( ! is_string( $json ) ) {
		return array( 'json' => '', 'etag' => '' );
	}
	$built = array( 'json' => $json, 'etag' => '"' . md5( $json ) . '"' );
	set_transient( NYMBUS_SC_TRANSIENT, $built, 10 * MINUTE_IN_SECONDS );
	return $built;
}

function nymbus_sc_invalidate() {
	delete_transient( NYMBUS_SC_TRANSIENT );
}

function nymbus_sc_rest_site_content( $request ) {
	$built = nymbus_sc_get_document();
	if ( '' === $built['json'] ) {
		return new WP_Error( 'nymbus_unavailable', __( 'The content could not be built.', 'nymbus-site-content' ), array( 'status' => 500 ) );
	}
	$protected = '' !== nymbus_sc_config( 'NYMBUS_CONTENT_SECRET' );
	$headers   = array(
		'ETag'                   => $built['etag'],
		'Cache-Control'          => $protected ? 'private, max-age=0, must-revalidate' : 'public, max-age=60, stale-while-revalidate=300',
		'Vary'                   => 'X-Nymbus-Content-Secret',
		'X-Content-Type-Options' => 'nosniff',
		'X-Robots-Tag'           => 'noindex, nofollow',
	);
	$match = $request->get_header( 'if-none-match' );
	if ( is_string( $match ) && trim( $match ) === $built['etag'] ) {
		$res = new WP_REST_Response( null, 304 );
		$res->set_headers( $headers );
		return $res;
	}
	$res = new WP_REST_Response( json_decode( $built['json'], false ), 200 );
	$res->set_headers( $headers );
	return $res;
}

/* Any change to our content, its image or the texts rebuilds the document (and tells the website: revalidate.php). */
foreach ( array( 'save_post_nymbus_news', 'save_post_nymbus_team' ) as $hook ) {
	add_action( $hook, 'nymbus_sc_content_changed', 20 );
}
add_action( 'transition_post_status', 'nymbus_sc_on_transition', 10, 3 );
add_action( 'before_delete_post', 'nymbus_sc_on_post_event', 10, 1 ); // trashing / restoring is a status transition
add_action( 'updated_option', 'nymbus_sc_on_option', 10, 1 );
add_action( 'added_option', 'nymbus_sc_on_option', 10, 1 );
add_action( 'edit_attachment', 'nymbus_sc_content_changed' );
add_action( 'delete_attachment', 'nymbus_sc_content_changed' );
foreach ( array( 'added_post_meta', 'updated_post_meta', 'deleted_post_meta' ) as $hook ) {
	add_action( $hook, 'nymbus_sc_on_meta', 10, 4 );
}

function nymbus_sc_is_ours( $post_id ) {
	return in_array( get_post_type( $post_id ), array( 'nymbus_news', 'nymbus_team' ), true );
}
function nymbus_sc_on_transition( $new, $old, $post ) {
	// only a change that touches what is published (to or from "publish") matters
	if ( $post && in_array( $post->post_type, array( 'nymbus_news', 'nymbus_team' ), true ) && $new !== $old && ( 'publish' === $new || 'publish' === $old ) ) {
		nymbus_sc_content_changed();
	}
}
function nymbus_sc_on_post_event( $post_id ) {
	if ( nymbus_sc_is_ours( $post_id ) ) {
		nymbus_sc_content_changed();
	}
}
function nymbus_sc_on_option( $option ) {
	if ( 'nymbus_sc_texts' === $option ) {
		nymbus_sc_content_changed();
	}
}
function nymbus_sc_on_meta( $meta_id, $post_id, $meta_key = '', $value = null ) {
	if ( ( 0 === strpos( (string) $meta_key, 'nymbus_' ) || '_thumbnail_id' === $meta_key ) && nymbus_sc_is_ours( $post_id ) ) {
		nymbus_sc_content_changed();
	}
}

function nymbus_sc_content_changed() {
	nymbus_sc_invalidate();
	nymbus_sc_queue_notify();
}
