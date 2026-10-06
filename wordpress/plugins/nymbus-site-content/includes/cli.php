<?php
/**
 * WP-CLI helpers for local development and set-up:
 *
 *   wp nymbus seed            create clearly labelled SAMPLE news / team members / texts (does nothing twice)
 *   wp nymbus clear-samples   delete everything `seed` created (run this before going live)
 *   wp nymbus import <file>   import the website's current team and news (file made by
 *                             wordpress/scripts/import-from-site.mjs); --dry-run shows what would change
 *
 * The samples are fictional. They are flagged with the meta `_nymbus_sample` so they can be removed in one go.
 *
 * @package NymbusSiteContent
 */

defined( 'ABSPATH' ) || exit;

class Nymbus_SC_CLI {

	/** Sample posts that exist already. */
	private function sample_ids() {
		return get_posts(
			array(
				'post_type'      => array( 'nymbus_news', 'nymbus_team' ),
				'post_status'    => 'any',
				'numberposts'    => -1,
				'fields'         => 'ids',
				'meta_key'       => '_nymbus_sample',
				'meta_value'     => '1',
				'no_found_rows'  => true,
			)
		);
	}

	/**
	 * Creates the sample content (idempotent).
	 *
	 * @param array $args       Unused.
	 * @param array $assoc_args Unused.
	 */
	public function seed( $args, $assoc_args ) {
		if ( nymbus_sc_is_production() ) {
			WP_CLI::error( 'Refusing to create sample content on a production site (WP_ENVIRONMENT_TYPE=production).' );
		}
		if ( $this->sample_ids() ) {
			WP_CLI::success( 'Sample content already exists (use `wp nymbus clear-samples` to remove it).' );
			return;
		}
		$news = array(
			array( 'slug' => 'sample-partnership', 'date' => '-10 days', 'cat' => 'partnership', 'en' => '[Sample] A partnership announcement', 'fr' => '[Exemple] Une annonce de partenariat',
				'sum_en' => 'A short summary of the first sample news item.', 'sum_fr' => 'Un court résumé du premier exemple de nouvelle.',
				'body_en' => "First paragraph of the sample article.\n\nSecond paragraph, separated by an empty line.", 'body_fr' => "Premier paragraphe de l'article d'exemple.\n\nDeuxième paragraphe, séparé par une ligne vide.", 'link' => '' ),
			array( 'slug' => 'sample-recognition', 'date' => '-40 days', 'cat' => 'recognition', 'en' => '[Sample] A recognition', 'fr' => '[Exemple] Une reconnaissance',
				'sum_en' => 'Second sample item, with a link to another page.', 'sum_fr' => "Deuxième exemple, avec un lien vers une autre page.",
				'body_en' => '', 'body_fr' => '', 'link' => 'https://example.org/' ),
			array( 'slug' => 'sample-community', 'date' => '-90 days', 'cat' => 'community', 'en' => '[Sample] A community initiative', 'fr' => '[Exemple] Une initiative communautaire',
				'sum_en' => 'Third sample item.', 'sum_fr' => 'Troisième exemple.',
				'body_en' => 'Body of the third sample item.', 'body_fr' => 'Texte du troisième exemple.', 'link' => '' ),
		);
		foreach ( $news as $n ) {
			$id = wp_insert_post(
				array(
					'post_type'   => 'nymbus_news',
					'post_status' => 'publish',
					'post_title'  => $n['en'],
					'post_name'   => $n['slug'],
					'post_date'   => wp_date( 'Y-m-d H:i:s', strtotime( $n['date'] ) ),
					'meta_input'  => array(
						'_nymbus_sample'                      => '1',
						nymbus_sc_meta_key( 'title', 'fr' )   => $n['fr'],
						nymbus_sc_meta_key( 'summary', 'en' ) => $n['sum_en'],
						nymbus_sc_meta_key( 'summary', 'fr' ) => $n['sum_fr'],
						nymbus_sc_meta_key( 'body', 'en' )    => $n['body_en'],
						nymbus_sc_meta_key( 'body', 'fr' )    => $n['body_fr'],
						nymbus_sc_meta_key( 'category' )      => $n['cat'],
						nymbus_sc_meta_key( 'link' )          => $n['link'],
					),
				),
				true
			);
			if ( is_wp_error( $id ) ) {
				WP_CLI::warning( $id->get_error_message() );
			}
		}
		$team = array(
			array( 'slug' => 'sample-person-one', 'name' => '[Sample] Alex Example', 'dept' => 'Leadership', 'order' => 10, 'en' => 'Chief Example Officer', 'fr' => "Chef de l'exemple",
				'bio_en' => 'Fictional biography used to try the editor.', 'bio_fr' => "Biographie fictive pour essayer l'éditeur." ),
			array( 'slug' => 'sample-person-two', 'name' => '[Sample] Sam Sample', 'dept' => 'Quantitative Research', 'order' => 20, 'en' => 'Sample Analyst', 'fr' => 'Analyste (exemple)',
				'bio_en' => 'Second fictional biography.', 'bio_fr' => 'Deuxième biographie fictive.' ),
			array( 'slug' => 'sample-person-three', 'name' => '[Sample] Robin Demo', 'dept' => 'Board', 'order' => 30, 'en' => 'Sample Director', 'fr' => 'Administrateur (exemple)',
				'bio_en' => 'Third fictional biography.', 'bio_fr' => 'Troisième biographie fictive.' ),
		);
		foreach ( $team as $m ) {
			$id = wp_insert_post(
				array(
					'post_type'   => 'nymbus_team',
					'post_status' => 'publish',
					'post_title'  => $m['name'],
					'post_name'   => $m['slug'],
					'meta_input'  => array(
						'_nymbus_sample'                    => '1',
						nymbus_sc_meta_key( 'department' )  => $m['dept'],
						nymbus_sc_meta_key( 'order' )       => (string) $m['order'],
						nymbus_sc_meta_key( 'hidden' )      => '',
						nymbus_sc_meta_key( 'role', 'en' )  => $m['en'],
						nymbus_sc_meta_key( 'role', 'fr' )  => $m['fr'],
						nymbus_sc_meta_key( 'bio', 'en' )   => $m['bio_en'],
						nymbus_sc_meta_key( 'bio', 'fr' )   => $m['bio_fr'],
					),
				),
				true
			);
			if ( is_wp_error( $id ) ) {
				WP_CLI::warning( $id->get_error_message() );
			}
		}
		if ( array() === nymbus_sc_get_texts() ) {
			update_option(
				'nymbus_sc_texts',
				array(
					'aum_label_en'   => '[Sample] $0.0B+',
					'aum_label_fr'   => '[Exemple] 0,0 G$+',
					'banner_enabled' => '',
					'banner_en'      => '[Sample] Announcement banner text.',
					'banner_fr'      => "[Exemple] Texte de la bannière d'annonce.",
				)
			);
		}
		nymbus_sc_invalidate();
		WP_CLI::success( 'Sample news, team members and texts created.' );
	}

	/**
	 * Imports the team and news exported from the website code (wordpress/scripts/import-from-site.mjs).
	 *
	 * Matches existing items by their slug: an item that exists already is skipped (or updated with --update); nothing
	 * is ever deleted. Every value goes through the same sanitiser as the editor screens.
	 *
	 * ## OPTIONS
	 *
	 * <file>
	 * : The JSON file made by import-from-site.mjs: a path, an https URL, or - to read standard input.
	 *
	 * [--dry-run]
	 * : Only list what would be created / updated / skipped. Changes nothing.
	 *
	 * [--update]
	 * : Overwrite the fields of items that exist already (default: leave them as they are).
	 *
	 * [--status=<status>]
	 * : publish (default) or draft.
	 *
	 * [--photos]
	 * : Download each person's photo / news image (https URL in the file) into the media library and set it as the
	 *   picture, when the item has none yet.
	 *
	 * ## EXAMPLES
	 *
	 *     wp nymbus import /tmp/nymbus-import.json --dry-run
	 *     wp nymbus import /tmp/nymbus-import.json --photos
	 *     wp nymbus import - --dry-run < nymbus-import.json
	 *
	 * @param array $args       File path.
	 * @param array $assoc_args Flags.
	 */
	public function import( $args, $assoc_args ) {
		$src = isset( $args[0] ) ? $args[0] : '';
		if ( '-' === $src ) {
			$raw = stream_get_contents( STDIN, 2 * MB_IN_BYTES );
		} elseif ( 0 === strpos( $src, 'https://' ) ) {
			$res = wp_safe_remote_get( $src, array( 'timeout' => 20, 'redirection' => 0, 'limit_response_size' => 2 * MB_IN_BYTES ) );
			if ( is_wp_error( $res ) || 200 !== wp_remote_retrieve_response_code( $res ) ) {
				WP_CLI::error( 'Cannot download the import file.' );
			}
			$raw = wp_remote_retrieve_body( $res );
		} elseif ( '' !== $src && is_readable( $src ) ) {
			$raw = file_get_contents( $src ); // phpcs:ignore WordPress.WP.AlternativeFunctions -- local CLI file.
		} else {
			WP_CLI::error( 'Cannot read the import file (a path, an https URL, or - for standard input).' );
		}
		$data = json_decode( (string) $raw, true );
		if ( ! is_array( $data ) || ! isset( $data['format'] ) || 'nymbus-site-import' !== $data['format'] || 1 !== ( isset( $data['version'] ) ? $data['version'] : 0 ) ) {
			WP_CLI::error( 'Not a nymbus-site-import version 1 file (make it with wordpress/scripts/import-from-site.mjs).' );
		}
		$dry    = ! empty( $assoc_args['dry-run'] );
		$update = ! empty( $assoc_args['update'] );
		$photos = ! empty( $assoc_args['photos'] );
		$status = isset( $assoc_args['status'] ) ? $assoc_args['status'] : 'publish';
		if ( ! in_array( $status, array( 'publish', 'draft' ), true ) ) {
			WP_CLI::error( '--status must be publish or draft.' );
		}
		if ( $photos && ! $dry ) {
			require_once ABSPATH . 'wp-admin/includes/media.php';
			require_once ABSPATH . 'wp-admin/includes/file.php';
			require_once ABSPATH . 'wp-admin/includes/image.php';
		}
		$counts = array( 'create' => 0, 'update' => 0, 'skip' => 0, 'invalid' => 0, 'photo' => 0 );
		foreach ( array( 'nymbus_news' => 'news', 'nymbus_team' => 'team' ) as $type => $key ) {
			$rows = isset( $data[ $key ] ) && is_array( $data[ $key ] ) ? $data[ $key ] : array();
			foreach ( $rows as $i => $row ) {
				$e = nymbus_sc_import_entry( $type, $row );
				if ( null === $e ) {
					++$counts['invalid'];
					WP_CLI::warning( sprintf( '%s[%d]: cannot be imported (missing slug, title / name, date or department)', $key, $i ) );
					continue;
				}
				$found  = get_posts( array( 'post_type' => $type, 'name' => $e['slug'], 'post_status' => 'any', 'numberposts' => 1, 'fields' => 'ids', 'no_found_rows' => true ) );
				$exists = $found ? (int) $found[0] : 0;
				$action = $exists ? ( $update ? 'update' : 'skip' ) : 'create';
				++$counts[ $action ];
				WP_CLI::log( sprintf( '%-6s %s %s (%s)', $action, $key, $e['slug'], $e['title'] ) );
				if ( $dry || 'skip' === $action ) {
					if ( $photos && '' !== $e['photo'] && ( ! $exists || ! has_post_thumbnail( $exists ) ) ) {
						WP_CLI::log( sprintf( '       photo %s%s', $e['photo'], $dry ? ' (would download)' : '' ) );
					}
					if ( $dry ) {
						continue;
					}
				}
				$post_id = $exists;
				if ( 'skip' !== $action ) {
					$post = array(
						'ID'          => $exists,
						'post_type'   => $type,
						'post_status' => $status,
						'post_title'  => $e['title'],
						'post_name'   => $e['slug'],
					);
					if ( '' !== $e['date'] ) {
						$post['post_date'] = $e['date'] . ' 09:00:00';
					}
					$post_id = wp_insert_post( wp_slash( $post ), true );
					if ( is_wp_error( $post_id ) ) {
						WP_CLI::warning( $post_id->get_error_message() );
						continue;
					}
					foreach ( nymbus_sc_fields_for( $type ) as $f ) {
						$langs = ! empty( $f['bi'] ) ? array( 'en', 'fr' ) : array( '' );
						foreach ( $langs as $lang ) {
							if ( ! empty( $f['only_lang'] ) && $f['only_lang'] !== $lang ) {
								continue;
							}
							$mk = nymbus_sc_meta_key( $f['key'], $lang );
							if ( ! array_key_exists( $mk, $e['input'] ) ) {
								continue;
							}
							$value = nymbus_sc_sanitize_field( $f, $e['input'][ $mk ] );
							update_post_meta( $post_id, $mk, wp_slash( is_array( $value ) ? implode( ',', $value ) : $value ) );
						}
					}
					update_post_meta( $post_id, '_nymbus_imported', '1' );
				}
				if ( $photos && '' !== $e['photo'] && ! has_post_thumbnail( $post_id ) ) {
					$att = media_sideload_image( $e['photo'], $post_id, $e['title'], 'id' );
					if ( is_wp_error( $att ) ) {
						WP_CLI::warning( sprintf( 'photo of %s: %s', $e['slug'], $att->get_error_message() ) );
					} else {
						set_post_thumbnail( $post_id, (int) $att );
						++$counts['photo'];
					}
				}
			}
		}
		nymbus_sc_invalidate();
		$summary = sprintf( '%d to create, %d to update, %d skipped (exist already), %d invalid, %d photos', $counts['create'], $counts['update'], $counts['skip'], $counts['invalid'], $counts['photo'] );
		if ( $dry ) {
			WP_CLI::success( 'Dry run, nothing changed: ' . $summary . '.' );
		} else {
			WP_CLI::success( str_replace( 'to create, ', 'created, ', str_replace( 'to update', 'updated', $summary ) ) . '.' );
		}
	}

	/**
	 * Deletes the sample posts created by `seed` (and the sample texts when they are still the sample ones).
	 *
	 * @subcommand clear-samples
	 * @param array $args       Unused.
	 * @param array $assoc_args Unused.
	 */
	public function clear_samples( $args, $assoc_args ) {
		$n = 0;
		foreach ( $this->sample_ids() as $id ) {
			wp_delete_post( $id, true );
			++$n;
		}
		$t = nymbus_sc_get_texts();
		if ( isset( $t['aum_label_en'] ) && 0 === strpos( $t['aum_label_en'], '[Sample]' ) ) {
			delete_option( 'nymbus_sc_texts' );
		}
		nymbus_sc_invalidate();
		WP_CLI::success( sprintf( 'Deleted %d sample posts.', $n ) );
	}
}

WP_CLI::add_command( 'nymbus', 'Nymbus_SC_CLI' );
