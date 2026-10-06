<?php
/**
 * Field schema of the editor screens (one table drives the form, the saving and the document).
 *
 * type:    text | textarea | url | email | number | select | checkbox | lines | multicheck
 * bi:      true = one field per language (stored as <key>_en / <key>_fr), shown on the English / French tab
 * section: optional heading printed above the field (groups the Site texts screen)
 *
 * @package NymbusSiteContent
 */

defined( 'ABSPATH' ) || exit;

function nymbus_sc_news_fields() {
	return array(
		array( 'key' => 'title', 'bi' => true, 'only_lang' => 'fr', 'type' => 'text', 'max' => 200, 'label' => __( 'Title', 'nymbus-site-content' ),
			'help' => __( 'The English title is the title field at the top of the page.', 'nymbus-site-content' ) ),
		array( 'key' => 'summary', 'bi' => true, 'type' => 'textarea', 'rows' => 3, 'max' => 600, 'label' => __( 'Short summary', 'nymbus-site-content' ),
			'help' => __( 'One or two sentences shown on the cards. Plain text.', 'nymbus-site-content' ) ),
		array( 'key' => 'body', 'bi' => true, 'type' => 'textarea', 'rows' => 10, 'max' => 20000, 'label' => __( 'Full text', 'nymbus-site-content' ),
			'help' => __( 'Plain text. Leave an empty line between paragraphs. Leave empty if the news only links to another page.', 'nymbus-site-content' ) ),
		array( 'key' => 'category', 'type' => 'select', 'label' => __( 'Category', 'nymbus-site-content' ), 'options' => nymbus_sc_news_categories(), 'default' => 'community' ),
		array( 'key' => 'link', 'type' => 'url', 'max' => 500, 'label' => __( 'Link to another page (optional)', 'nymbus-site-content' ),
			'help' => __( 'Must start with https://', 'nymbus-site-content' ) ),
	);
}

function nymbus_sc_team_fields() {
	$depts = array();
	foreach ( nymbus_sc_departments() as $d ) {
		$depts[ $d ] = $d;
	}
	return array(
		array( 'key' => 'department', 'type' => 'select', 'label' => __( 'Main department', 'nymbus-site-content' ), 'options' => $depts, 'default' => 'Operations' ),
		array( 'key' => 'additional_departments', 'type' => 'multicheck', 'label' => __( 'Also shown under', 'nymbus-site-content' ), 'options' => $depts ),
		array( 'key' => 'order', 'type' => 'number', 'label' => __( 'Order on the page', 'nymbus-site-content' ), 'default' => 100,
			'help' => __( 'Smaller numbers come first (10, 20, 30...). Leave gaps so you can insert someone later.', 'nymbus-site-content' ) ),
		array( 'key' => 'hidden', 'type' => 'checkbox', 'label' => __( 'Hide from the website', 'nymbus-site-content' ),
			'help' => __( 'The person stays here but is not shown on the website.', 'nymbus-site-content' ) ),
		array( 'key' => 'linkedin', 'type' => 'url', 'max' => 300, 'label' => __( 'LinkedIn profile (optional)', 'nymbus-site-content' ),
			'help' => __( 'https://www.linkedin.com/in/...', 'nymbus-site-content' ) ),
		array( 'key' => 'year_joined', 'type' => 'number', 'label' => __( 'Year joined (optional)', 'nymbus-site-content' ), 'default' => '' ),
		array( 'key' => 'role', 'bi' => true, 'type' => 'text', 'max' => 160, 'label' => __( 'Role / title', 'nymbus-site-content' ) ),
		array( 'key' => 'bio', 'bi' => true, 'type' => 'textarea', 'rows' => 8, 'max' => 5000, 'label' => __( 'Biography', 'nymbus-site-content' ),
			'help' => __( 'Plain text. Leave an empty line between paragraphs.', 'nymbus-site-content' ) ),
		array( 'key' => 'previous_roles', 'bi' => true, 'type' => 'lines', 'rows' => 4, 'max' => 200, 'label' => __( 'Previous roles (one per line)', 'nymbus-site-content' ) ),
		array( 'key' => 'designations', 'type' => 'lines', 'rows' => 3, 'max' => 200, 'label' => __( 'Designations (one per line, e.g. CFA)', 'nymbus-site-content' ) ),
		array( 'key' => 'education', 'type' => 'lines', 'rows' => 3, 'max' => 200, 'label' => __( 'Education (one per line)', 'nymbus-site-content' ) ),
	);
}

/** Editable site texts (one option, `nymbus_sc_texts`; keys are `<key>_en` / `<key>_fr` for bilingual ones). */
function nymbus_sc_text_fields() {
	return array_merge( array(
		array( 'key' => 'home_headline', 'bi' => true, 'type' => 'text', 'max' => 200, 'label' => __( 'Home page headline', 'nymbus-site-content' ) ),
		array( 'key' => 'home_subheadline', 'bi' => true, 'type' => 'textarea', 'rows' => 2, 'max' => 400, 'label' => __( 'Home page sub-headline', 'nymbus-site-content' ) ),
		array( 'key' => 'aum_label', 'bi' => true, 'type' => 'text', 'max' => 60, 'label' => __( 'Assets under management label', 'nymbus-site-content' ),
			'help' => __( 'Shown on the home page, e.g. "$1.8B+". A value saved in the website admin takes precedence.', 'nymbus-site-content' ) ),
		array( 'key' => 'banner_enabled', 'type' => 'checkbox', 'label' => __( 'Show the announcement banner', 'nymbus-site-content' ) ),
		array( 'key' => 'banner', 'bi' => true, 'type' => 'textarea', 'rows' => 2, 'max' => 400, 'label' => __( 'Announcement banner text', 'nymbus-site-content' ),
			'help' => __( 'A banner saved in the website admin takes precedence.', 'nymbus-site-content' ) ),
		array( 'key' => 'contact_email', 'type' => 'email', 'max' => 120, 'section' => __( 'Contact details', 'nymbus-site-content' ), 'label' => __( 'Contact e-mail', 'nymbus-site-content' ),
			'help' => __( 'Shown in the footer and on the Contact page (the contact form still prepares its e-mail to the built-in address).', 'nymbus-site-content' ) ),
		array( 'key' => 'contact_phone', 'type' => 'text', 'max' => 40, 'label' => __( 'Contact phone', 'nymbus-site-content' ),
			'help' => __( 'Shown in the footer and on the Contact page, e.g. 514-985-1138. Digits, spaces, + ( ) . - only.', 'nymbus-site-content' ) ),
		array( 'key' => 'contact_address', 'bi' => true, 'type' => 'lines', 'rows' => 3, 'max' => 150, 'section' => __( 'Contact details', 'nymbus-site-content' ), 'label' => __( 'Office address', 'nymbus-site-content' ),
			'help' => __( 'Shown in the footer and on the Contact page. Press Enter for a new line.', 'nymbus-site-content' ) ),
	), nymbus_sc_intro_fields() );
}

/**
 * "Page intros": headline, highlighted ending and lead of a few pages, English and French. A field left empty keeps the
 * website's built-in text for that language. Compliance-reviewed texts (disclosures, fund copy, awards, legal) are not here.
 */
function nymbus_sc_intro_fields() {
	$out = array();
	foreach ( nymbus_sc_intro_pages() as $page => $name ) {
		/* translators: %s: page name (Approach, Solutions...) */
		$section = sprintf( __( 'Page intro: %s', 'nymbus-site-content' ), $name );
		$out[]   = array( 'key' => 'intro_' . $page . '_headline', 'bi' => true, 'type' => 'text', 'max' => 200, 'section' => $section,
			/* translators: %s: page name */
			'label' => sprintf( __( '%s: headline', 'nymbus-site-content' ), $name ),
			'help'  => __( 'The big title at the top of the page. Empty: the built-in title.', 'nymbus-site-content' ) );
		$out[]   = array( 'key' => 'intro_' . $page . '_highlight', 'bi' => true, 'type' => 'text', 'max' => 120,
			/* translators: %s: page name */
			'label' => sprintf( __( '%s: highlighted ending (optional)', 'nymbus-site-content' ), $name ),
			'help'  => __( 'A few words shown in colour right after the headline. Used only when the headline is filled.', 'nymbus-site-content' ) );
		if ( in_array( $page, nymbus_sc_intro_lead_locked(), true ) ) {
			continue; // compliance-reviewed lead: stays in code
		}
		$out[]   = array( 'key' => 'intro_' . $page . '_lead', 'bi' => true, 'type' => 'textarea', 'rows' => 2, 'max' => 400,
			/* translators: %s: page name */
			'label' => sprintf( __( '%s: lead', 'nymbus-site-content' ), $name ),
			'help'  => __( 'One or two sentences under the title. Empty: the built-in text.', 'nymbus-site-content' ) );
	}
	return $out;
}

/**
 * Sanitises one submitted value according to its field definition. `$raw` is UNSLASHED request data.
 *
 * @param array $f   Field definition.
 * @param mixed $raw Submitted value.
 * @return string|array Value to store (string, or list of strings for multicheck).
 */
function nymbus_sc_sanitize_field( array $f, $raw ) {
	$max = isset( $f['max'] ) ? (int) $f['max'] : 500;
	switch ( $f['type'] ) {
		case 'checkbox':
			return empty( $raw ) ? '' : '1';
		case 'number':
			return ( '' === $raw || null === $raw || ! is_numeric( $raw ) ) ? '' : (string) max( -100000, min( 100000, (int) $raw ) );
		case 'select':
			return ( is_string( $raw ) && isset( $f['options'][ $raw ] ) ) ? $raw : ( isset( $f['default'] ) ? $f['default'] : '' );
		case 'multicheck':
			$out = array();
			foreach ( (array) $raw as $v ) {
				if ( is_string( $v ) && isset( $f['options'][ $v ] ) && ! in_array( $v, $out, true ) ) {
					$out[] = $v;
				}
			}
			return $out;
		case 'url':
			$u = is_string( $raw ) ? esc_url_raw( trim( $raw ), array( 'https' ) ) : '';
			return strlen( $u ) <= $max ? $u : '';
		case 'email':
			$e = is_string( $raw ) ? sanitize_email( $raw ) : '';
			return is_email( $e ) ? $e : '';
		case 'lines':
			return implode( "\n", nymbus_sc_lines( is_string( $raw ) ? $raw : '', 20, $max ) );
		case 'textarea':
			return nymbus_sc_paragraphs( is_string( $raw ) ? sanitize_textarea_field( $raw ) : '', $max );
		default: // text
			return nymbus_sc_plain( is_string( $raw ) ? sanitize_text_field( $raw ) : '', $max );
	}
}
