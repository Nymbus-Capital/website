<?php
/**
 * WP-CLI helpers for local development and set-up:
 *
 *   wp nymbus seed            create clearly labelled SAMPLE news / team members / texts (does nothing twice)
 *   wp nymbus clear-samples   delete everything `seed` created (run this before going live)
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
