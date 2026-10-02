<?php
/**
 * Editor screens: one "Content" box per post type, with the language-neutral details on top and an English / French
 * tab pair for the text fields. Saving is protected by a nonce and the `edit_post` capability; every value goes
 * through nymbus_sc_sanitize_field() (plain text, whitelisted selects, https URLs).
 *
 * @package NymbusSiteContent
 */

defined( 'ABSPATH' ) || exit;

/** Fields of a post type. */
function nymbus_sc_fields_for( $post_type ) {
	return 'nymbus_team' === $post_type ? nymbus_sc_team_fields() : nymbus_sc_news_fields();
}

/**
 * Prints one form control. `$name` is the full input name, `$id` its DOM id; every dynamic part is escaped here.
 *
 * @param array        $f     Field definition.
 * @param string       $name  Input name.
 * @param string       $id    DOM id.
 * @param string|array $value Current value.
 */
function nymbus_sc_field_input( array $f, $name, $id, $value ) {
	$max = isset( $f['max'] ) ? (int) $f['max'] : 0;
	switch ( $f['type'] ) {
		case 'textarea':
		case 'lines':
			printf(
				'<textarea class="large-text" id="%1$s" name="%2$s" rows="%3$d"%4$s>%5$s</textarea>',
				esc_attr( $id ),
				esc_attr( $name ),
				isset( $f['rows'] ) ? (int) $f['rows'] : 4,
				$max ? ' maxlength="' . (int) $max . '"' : '',
				esc_textarea( (string) $value )
			);
			break;
		case 'select':
			printf( '<select id="%1$s" name="%2$s">', esc_attr( $id ), esc_attr( $name ) );
			foreach ( $f['options'] as $val => $label ) {
				printf( '<option value="%1$s"%2$s>%3$s</option>', esc_attr( $val ), selected( (string) $value, (string) $val, false ), esc_html( $label ) );
			}
			echo '</select>';
			break;
		case 'checkbox':
			printf( '<input type="checkbox" id="%1$s" name="%2$s" value="1"%3$s />', esc_attr( $id ), esc_attr( $name ), checked( '1', (string) $value, false ) );
			break;
		case 'multicheck':
			$on = is_array( $value ) ? $value : array_filter( explode( ',', (string) $value ) );
			echo '<span class="nymbus-sc-checks">';
			foreach ( $f['options'] as $val => $label ) {
				printf(
					'<label><input type="checkbox" name="%1$s[]" value="%2$s"%3$s /> %4$s</label> ',
					esc_attr( $name ),
					esc_attr( $val ),
					checked( in_array( $val, $on, true ), true, false ),
					esc_html( $label )
				);
			}
			echo '</span>';
			break;
		case 'number':
			printf( '<input type="number" class="small-text" id="%1$s" name="%2$s" value="%3$s" min="-100000" max="100000" step="1" />', esc_attr( $id ), esc_attr( $name ), esc_attr( (string) $value ) );
			break;
		case 'url':
		case 'email':
			printf(
				'<input type="%1$s" class="large-text" id="%2$s" name="%3$s" value="%4$s"%5$s />',
				'url' === $f['type'] ? 'url' : 'email',
				esc_attr( $id ),
				esc_attr( $name ),
				esc_attr( (string) $value ),
				$max ? ' maxlength="' . (int) $max . '"' : ''
			);
			break;
		default:
			printf(
				'<input type="text" class="large-text" id="%1$s" name="%2$s" value="%3$s"%4$s />',
				esc_attr( $id ),
				esc_attr( $name ),
				esc_attr( (string) $value ),
				$max ? ' maxlength="' . (int) $max . '"' : ''
			);
	}
}

/**
 * Prints the fields in two groups: language-neutral rows, then the English / French tabs.
 *
 * @param array    $fields    Field definitions.
 * @param string   $prefix    Name prefix of the inputs (`nymbus_sc` → `nymbus_sc[<key>]`).
 * @param callable $value_of  function( $field_key, $lang ) returning the stored value.
 * @param callable $meta_key  function( $field_key, $lang ) returning the input key.
 */
function nymbus_sc_render_fields( array $fields, $prefix, $value_of, $meta_key ) {
	$plain = array();
	$bi    = array();
	foreach ( $fields as $f ) {
		if ( ! empty( $f['bi'] ) ) {
			$bi[] = $f;
		} else {
			$plain[] = $f;
		}
	}
	echo '<div class="nymbus-sc">';
	if ( $plain ) {
		echo '<table class="form-table nymbus-sc-table" role="presentation"><tbody>';
		foreach ( $plain as $f ) {
			$key = $meta_key( $f['key'], '' );
			$id  = 'nymbus-' . $key;
			echo '<tr><th scope="row"><label for="' . esc_attr( $id ) . '">' . esc_html( $f['label'] ) . '</label></th><td>';
			nymbus_sc_field_input( $f, $prefix . '[' . $key . ']', $id, $value_of( $f['key'], '' ) );
			if ( ! empty( $f['help'] ) ) {
				echo '<p class="description">' . esc_html( $f['help'] ) . '</p>';
			}
			echo '</td></tr>';
		}
		echo '</tbody></table>';
	}
	if ( $bi ) {
		$langs = array( 'en' => __( 'English', 'nymbus-site-content' ), 'fr' => __( 'Français', 'nymbus-site-content' ) );
		echo '<div class="nymbus-sc-tabs" role="tablist" aria-label="' . esc_attr__( 'Language', 'nymbus-site-content' ) . '">';
		foreach ( $langs as $code => $name ) {
			printf(
				'<button type="button" role="tab" class="button nymbus-sc-tab" data-lang="%1$s" aria-selected="%2$s" id="nymbus-tab-%3$s-%1$s">%4$s</button>',
				esc_attr( $code ),
				'en' === $code ? 'true' : 'false',
				esc_attr( sanitize_key( $prefix ) ),
				esc_html( $name )
			);
		}
		echo '</div>';
		foreach ( $langs as $code => $name ) {
			printf(
				'<div class="nymbus-sc-panel" role="tabpanel" data-lang="%1$s" aria-labelledby="nymbus-tab-%2$s-%1$s"%3$s><table class="form-table nymbus-sc-table" role="presentation"><tbody>',
				esc_attr( $code ),
				esc_attr( sanitize_key( $prefix ) ),
				'' // the script hides the inactive language; without JavaScript both stay visible.
			);
			foreach ( $bi as $f ) {
				if ( ! empty( $f['only_lang'] ) && $f['only_lang'] !== $code ) {
					continue;
				}
				$key = $meta_key( $f['key'], $code );
				$id  = 'nymbus-' . $key;
				echo '<tr><th scope="row"><label for="' . esc_attr( $id ) . '">' . esc_html( $f['label'] ) . ' (' . esc_html( $name ) . ')</label></th><td>';
				nymbus_sc_field_input( $f, $prefix . '[' . $key . ']', $id, $value_of( $f['key'], $code ) );
				if ( ! empty( $f['help'] ) ) {
					echo '<p class="description">' . esc_html( $f['help'] ) . '</p>';
				}
				echo '</td></tr>';
			}
			echo '</tbody></table></div>';
		}
	}
	echo '</div>';
}

add_action( 'add_meta_boxes', 'nymbus_sc_add_boxes' );
function nymbus_sc_add_boxes() {
	foreach ( array( 'nymbus_news', 'nymbus_team' ) as $type ) {
		add_meta_box( 'nymbus_sc_content', __( 'Content', 'nymbus-site-content' ), 'nymbus_sc_render_box', $type, 'normal', 'high' );
	}
}

function nymbus_sc_render_box( $post ) {
	wp_nonce_field( 'nymbus_sc_save_' . $post->ID, 'nymbus_sc_nonce' );
	$fields = nymbus_sc_fields_for( $post->post_type );
	echo '<p class="description">' . esc_html__( 'Changes appear on the website within about a minute after you click Publish or Update. The first image box on the right is the picture shown on the website.', 'nymbus-site-content' ) . '</p>';
	nymbus_sc_render_fields(
		$fields,
		'nymbus_sc',
		function ( $key, $lang ) use ( $post, $fields ) {
			$meta_key = nymbus_sc_meta_key( $key, $lang );
			$stored   = metadata_exists( 'post', $post->ID, $meta_key ) ? get_post_meta( $post->ID, $meta_key, true ) : null;
			if ( null !== $stored ) {
				return $stored;
			}
			foreach ( $fields as $f ) {
				if ( $f['key'] === $key && isset( $f['default'] ) ) {
					return $f['default'];
				}
			}
			return '';
		},
		function ( $key, $lang ) {
			return nymbus_sc_meta_key( $key, $lang );
		}
	);
}

add_action( 'save_post_nymbus_news', 'nymbus_sc_save_post', 10, 2 );
add_action( 'save_post_nymbus_team', 'nymbus_sc_save_post', 10, 2 );
function nymbus_sc_save_post( $post_id, $post ) {
	if ( ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) || wp_is_post_revision( $post_id ) ) {
		return;
	}
	$nonce = isset( $_POST['nymbus_sc_nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['nymbus_sc_nonce'] ) ) : '';
	if ( '' === $nonce || ! wp_verify_nonce( $nonce, 'nymbus_sc_save_' . $post_id ) ) {
		return;
	}
	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}
	// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- every value is sanitised by nymbus_sc_sanitize_field() below.
	$in = isset( $_POST['nymbus_sc'] ) && is_array( $_POST['nymbus_sc'] ) ? wp_unslash( $_POST['nymbus_sc'] ) : array();
	foreach ( nymbus_sc_fields_for( $post->post_type ) as $f ) {
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
			$value = nymbus_sc_sanitize_field( $f, isset( $in[ $key ] ) ? $in[ $key ] : '' );
			if ( is_array( $value ) ) {
				$value = implode( ',', $value );
			}
			update_post_meta( $post_id, $key, wp_slash( $value ) );
		}
	}
}

add_action( 'admin_enqueue_scripts', 'nymbus_sc_admin_assets' );
function nymbus_sc_admin_assets( $hook ) {
	$screen = get_current_screen();
	$ours   = $screen && ( in_array( $screen->post_type, array( 'nymbus_news', 'nymbus_team' ), true ) || false !== strpos( (string) $screen->id, 'nymbus-site-texts' ) );
	if ( ! $ours ) {
		return;
	}
	wp_enqueue_style( 'nymbus-sc-admin', plugins_url( 'assets/admin.css', NYMBUS_SC_FILE ), array(), NYMBUS_SC_VERSION );
	wp_enqueue_script( 'nymbus-sc-admin', plugins_url( 'assets/admin.js', NYMBUS_SC_FILE ), array(), NYMBUS_SC_VERSION, true );
}
