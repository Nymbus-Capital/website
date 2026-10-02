<?php
/**
 * Custom post types `nymbus_news` and `nymbus_team`, their meta, list columns and the REST access rules.
 *
 * - Not public on the WordPress side (no front-end pages, no search, no feeds): WordPress is only an editor backend.
 * - show_in_rest is on (the editor tooling and the REST API see the types) but ANONYMOUS access to /wp/v2/nymbus_*
 *   is refused (see nymbus_sc_rest_gate): the only public read path is the normalized /nymbus/v1/site-content, which
 *   serves published, non-hidden, non-password-protected items only.
 * - Classic editor on these types: the fields are plain boxes with English / French tabs.
 *
 * @package NymbusSiteContent
 */

defined( 'ABSPATH' ) || exit;

add_action( 'init', 'nymbus_sc_register_types' );
function nymbus_sc_register_types() {
	$common = array(
		'public'              => false,
		'publicly_queryable'  => false,
		'exclude_from_search' => true,
		'show_ui'             => true,
		'show_in_nav_menus'   => false,
		'show_in_admin_bar'   => false,
		'show_in_rest'        => true,
		'rest_namespace'      => 'wp/v2',
		'has_archive'         => false,
		'rewrite'             => false,
		'query_var'           => false,
		'capability_type'     => 'post',
		'map_meta_cap'        => true,
		'hierarchical'        => false,
		'delete_with_user'    => false,
	);

	register_post_type(
		'nymbus_news',
		array_merge(
			$common,
			array(
				'labels'       => array(
					'name'               => __( 'News', 'nymbus-site-content' ),
					'singular_name'      => __( 'News item', 'nymbus-site-content' ),
					'add_new'            => __( 'Add news', 'nymbus-site-content' ),
					'add_new_item'       => __( 'Add a news item', 'nymbus-site-content' ),
					'edit_item'          => __( 'Edit news item', 'nymbus-site-content' ),
					'new_item'           => __( 'New news item', 'nymbus-site-content' ),
					'view_item'          => __( 'View news item', 'nymbus-site-content' ),
					'search_items'       => __( 'Search news', 'nymbus-site-content' ),
					'not_found'          => __( 'No news yet.', 'nymbus-site-content' ),
					'not_found_in_trash' => __( 'No news in the trash.', 'nymbus-site-content' ),
					'all_items'          => __( 'News', 'nymbus-site-content' ),
					'featured_image'     => __( 'News image', 'nymbus-site-content' ),
					'set_featured_image' => __( 'Choose the news image', 'nymbus-site-content' ),
					'remove_featured_image' => __( 'Remove the news image', 'nymbus-site-content' ),
					'use_featured_image' => __( 'Use as news image', 'nymbus-site-content' ),
				),
				'show_in_menu' => 'nymbus-site-texts',
				'supports'     => array( 'title', 'thumbnail', 'revisions' ),
			)
		)
	);

	register_post_type(
		'nymbus_team',
		array_merge(
			$common,
			array(
				'labels'       => array(
					'name'               => __( 'Team', 'nymbus-site-content' ),
					'singular_name'      => __( 'Team member', 'nymbus-site-content' ),
					'add_new'            => __( 'Add team member', 'nymbus-site-content' ),
					'add_new_item'       => __( 'Add a team member', 'nymbus-site-content' ),
					'edit_item'          => __( 'Edit team member', 'nymbus-site-content' ),
					'new_item'           => __( 'New team member', 'nymbus-site-content' ),
					'view_item'          => __( 'View team member', 'nymbus-site-content' ),
					'search_items'       => __( 'Search the team', 'nymbus-site-content' ),
					'not_found'          => __( 'No team members yet.', 'nymbus-site-content' ),
					'not_found_in_trash' => __( 'No team members in the trash.', 'nymbus-site-content' ),
					'all_items'          => __( 'Team', 'nymbus-site-content' ),
					'featured_image'     => __( 'Photo', 'nymbus-site-content' ),
					'set_featured_image' => __( 'Choose the photo', 'nymbus-site-content' ),
					'remove_featured_image' => __( 'Remove the photo', 'nymbus-site-content' ),
					'use_featured_image' => __( 'Use as photo', 'nymbus-site-content' ),
					'title_field_placeholder' => __( 'Full name', 'nymbus-site-content' ),
				),
				'show_in_menu' => 'nymbus-site-texts',
				'supports'     => array( 'title', 'thumbnail', 'revisions' ),
			)
		)
	);

	nymbus_sc_register_meta();
}

/** Registers every field as post meta (REST-visible to editors only; sanitised on write). */
function nymbus_sc_register_meta() {
	$sets = array(
		'nymbus_news' => nymbus_sc_news_fields(),
		'nymbus_team' => nymbus_sc_team_fields(),
	);
	foreach ( $sets as $type => $fields ) {
		foreach ( $fields as $f ) {
			$keys = array();
			if ( ! empty( $f['bi'] ) ) {
				foreach ( array( 'en', 'fr' ) as $lang ) {
					if ( empty( $f['only_lang'] ) || $f['only_lang'] === $lang ) {
						$keys[] = nymbus_sc_meta_key( $f['key'], $lang );
					}
				}
			} else {
				$keys[] = nymbus_sc_meta_key( $f['key'] );
			}
			foreach ( $keys as $key ) {
				$multi = 'multicheck' === $f['type'];
				register_post_meta(
					$type,
					$key,
					array(
						'single'            => true,
						'type'              => 'string',
						'show_in_rest'      => ! $multi,
						// update_post_meta() hands the callback an already unslashed value
						'sanitize_callback' => function ( $value ) use ( $f ) {
							if ( 'multicheck' === $f['type'] && is_string( $value ) ) {
								$value = array_filter( explode( ',', $value ) );
							}
							$v = nymbus_sc_sanitize_field( $f, $value );
							return is_array( $v ) ? implode( ',', $v ) : $v;
						},
						'auth_callback'     => function ( $allowed, $meta_key, $post_id ) {
							return current_user_can( 'edit_post', $post_id );
						},
					)
				);
			}
		}
	}
}

/**
 * REST gate: anonymous visitors cannot read the raw post-type routes (drafts are already protected by WordPress;
 * this also keeps "hidden" team members and unpublished fields off the public API) nor list the users.
 */
add_filter( 'rest_pre_dispatch', 'nymbus_sc_rest_gate', 10, 3 );
function nymbus_sc_rest_gate( $result, $server, $request ) {
	$route = $request->get_route();
	if ( preg_match( '#^/wp/v2/(nymbus_news|nymbus_team|users)(/|$)#', $route ) && ! current_user_can( 'edit_posts' ) ) {
		return new WP_Error( 'nymbus_rest_forbidden', __( 'Sign in to use this endpoint.', 'nymbus-site-content' ), array( 'status' => is_user_logged_in() ? 403 : 401 ) );
	}
	return $result;
}

/** Classic editor for our types (the fields are meta boxes; the body lives in them). */
add_filter(
	'use_block_editor_for_post_type',
	function ( $use, $post_type ) {
		return in_array( $post_type, array( 'nymbus_news', 'nymbus_team' ), true ) ? false : $use;
	},
	10,
	2
);

/* ----------------------------------------------------------------------------------------------- list columns */

add_filter( 'manage_nymbus_news_posts_columns', 'nymbus_sc_news_columns' );
function nymbus_sc_news_columns( $cols ) {
	return array(
		'cb'              => isset( $cols['cb'] ) ? $cols['cb'] : '',
		'title'           => __( 'Title (English)', 'nymbus-site-content' ),
		'nymbus_title_fr' => __( 'Title (French)', 'nymbus-site-content' ),
		'nymbus_image'    => __( 'Image', 'nymbus-site-content' ),
		'date'            => __( 'Date', 'nymbus-site-content' ),
	);
}

add_filter( 'manage_nymbus_team_posts_columns', 'nymbus_sc_team_columns' );
function nymbus_sc_team_columns( $cols ) {
	return array(
		'cb'               => isset( $cols['cb'] ) ? $cols['cb'] : '',
		'title'            => __( 'Name', 'nymbus-site-content' ),
		'nymbus_role'      => __( 'Role', 'nymbus-site-content' ),
		'nymbus_dept'      => __( 'Department', 'nymbus-site-content' ),
		'nymbus_order'     => __( 'Order', 'nymbus-site-content' ),
		'nymbus_hidden'    => __( 'On the website', 'nymbus-site-content' ),
	);
}

add_action( 'manage_nymbus_news_posts_custom_column', 'nymbus_sc_news_column_value', 10, 2 );
function nymbus_sc_news_column_value( $col, $post_id ) {
	if ( 'nymbus_title_fr' === $col ) {
		echo esc_html( (string) get_post_meta( $post_id, nymbus_sc_meta_key( 'title', 'fr' ), true ) );
	} elseif ( 'nymbus_image' === $col ) {
		echo has_post_thumbnail( $post_id ) ? esc_html__( 'Yes', 'nymbus-site-content' ) : '—';
	}
}

add_action( 'manage_nymbus_team_posts_custom_column', 'nymbus_sc_team_column_value', 10, 2 );
function nymbus_sc_team_column_value( $col, $post_id ) {
	if ( 'nymbus_role' === $col ) {
		echo esc_html( (string) get_post_meta( $post_id, nymbus_sc_meta_key( 'role', 'en' ), true ) );
	} elseif ( 'nymbus_dept' === $col ) {
		echo esc_html( (string) get_post_meta( $post_id, nymbus_sc_meta_key( 'department' ), true ) );
	} elseif ( 'nymbus_order' === $col ) {
		echo esc_html( (string) get_post_meta( $post_id, nymbus_sc_meta_key( 'order' ), true ) );
	} elseif ( 'nymbus_hidden' === $col ) {
		echo '1' === get_post_meta( $post_id, nymbus_sc_meta_key( 'hidden' ), true ) ? esc_html__( 'Hidden', 'nymbus-site-content' ) : esc_html__( 'Shown', 'nymbus-site-content' );
	}
}

add_filter( 'manage_edit-nymbus_team_sortable_columns', function ( $cols ) {
	$cols['nymbus_order'] = 'nymbus_order';
	return $cols;
} );

/** The team list opens sorted by the Order field; clicking the Order column header sorts by it too. */
add_action( 'pre_get_posts', 'nymbus_sc_team_list_order' );
function nymbus_sc_team_list_order( $query ) {
	if ( ! is_admin() || ! $query->is_main_query() || 'nymbus_team' !== $query->get( 'post_type' ) ) {
		return;
	}
	$orderby = $query->get( 'orderby' );
	if ( '' === $orderby || 'nymbus_order' === $orderby ) {
		$key   = nymbus_sc_meta_key( 'order' );
		$order = ( '' === $orderby || 'asc' === strtolower( (string) $query->get( 'order' ) ) ) ? 'ASC' : 'DESC';
		// members without the field are listed too (a plain meta_key sort would hide them)
		$query->set(
			'meta_query',
			array(
				'relation'            => 'OR',
				'nymbus_order_clause' => array( 'key' => $key, 'type' => 'NUMERIC', 'compare' => 'EXISTS' ),
				array( 'key' => $key, 'compare' => 'NOT EXISTS' ),
			)
		);
		$query->set( 'orderby', array( 'nymbus_order_clause' => $order, 'title' => 'ASC' ) );
	}
}
