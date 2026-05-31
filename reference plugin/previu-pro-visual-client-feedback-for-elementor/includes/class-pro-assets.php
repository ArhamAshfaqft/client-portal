<?php
if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Enqueues Pro JS/CSS assets on the appropriate pages.
 */
class CCFE_Pro_Assets {
    private static $instance = null;

    public static function instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_review_assets' ], 10000 );
        add_action( 'elementor/editor/before_enqueue_scripts', [ $this, 'enqueue_elementor_assets' ] );
        add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_admin_assets' ] );
    }

    /**
     * Pro JS for the client review page — media uploader, voice recorder, screenshot tool.
     */
    public function enqueue_review_assets() {
        // Only enqueue when the review toolbar is present
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        if ( ! isset( $_GET['ccfe_review'] ) ) {
            return;
        }

        wp_enqueue_style(
            'ccfe-pro-styles',
            CCFE_PRO_URL . 'assets/css/pro-styles.css',
            [],
            CCFE_PRO_VERSION
        );

        wp_enqueue_script(
            'ccfe-pro-extensions',
            CCFE_PRO_URL . 'assets/js/pro-extensions.js',
            [ 'ccfe-annotation-engine' ],
            CCFE_PRO_VERSION,
            true
        );

        wp_enqueue_script(
            'ccfe-pro-screenshot',
            CCFE_PRO_URL . 'assets/js/pro-screenshot.js',
            [ 'ccfe-pro-extensions' ],
            CCFE_PRO_VERSION,
            true
        );

        wp_enqueue_script(
            'ccfe-pro-voice',
            CCFE_PRO_URL . 'assets/js/pro-voice-recorder.js',
            [ 'ccfe-pro-extensions' ],
            CCFE_PRO_VERSION,
            true
        );

        wp_localize_script( 'ccfe-pro-extensions', 'ccfePro', [
            'restUrl'    => esc_url_raw( rest_url( 'ccfe/v1' ) ),
            'nonce'      => wp_create_nonce( 'wp_rest' ),
            'maxFileSize'=> wp_max_upload_size(),
            'allowedTypes'=> [
                'image'    => [ 'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml' ],
                'video'    => [ 'video/mp4', 'video/webm', 'video/ogg' ],
                'audio'    => [ 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm' ],
                'document' => [ 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/csv' ],
                'archive'  => [ 'application/zip', 'application/x-rar-compressed', 'application/gzip' ],
            ],
        ]);
    }

    /**
     * Pro assets for the Elementor editor panel.
     */
    public function enqueue_elementor_assets() {
        wp_enqueue_script(
            'ccfe-pro-elementor-media',
            CCFE_PRO_URL . 'assets/js/pro-elementor-media.js',
            [ 'ccfe-elementor-panel' ],
            CCFE_PRO_VERSION,
            true
        );

        wp_localize_script( 'ccfe-pro-elementor-media', 'ccfeProElementor', [
            'restUrl' => esc_url_raw( rest_url( 'ccfe/v1' ) ),
            'nonce'   => wp_create_nonce( 'wp_rest' ),
        ]);
    }

    /**
     * Pro admin assets — enables the save buttons on locked settings panels.
     */
    public function enqueue_admin_assets( $hook ) {
        // Pro admin: enable locked settings on main dashboard + settings
        if ( false !== strpos( $hook, 'ccfe_clientmark' ) && false === strpos( $hook, 'ccfe_clientmark-media' ) ) {
            wp_enqueue_script(
                'ccfe-pro-admin',
                CCFE_PRO_URL . 'assets/js/pro-admin.js',
                [ 'ccfe-admin-dashboard' ],
                CCFE_PRO_VERSION,
                true
            );
        }

        // Media library admin page
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        if ( isset( $_GET['page'] ) && 'ccfe_clientmark-media' === $_GET['page'] ) {
            wp_enqueue_style(
                'ccfe-pro-media',
                CCFE_PRO_URL . 'assets/css/pro-media.css',
                [],
                CCFE_PRO_VERSION
            );

            wp_enqueue_script(
                'ccfe-pro-media',
                CCFE_PRO_URL . 'assets/js/pro-media.js',
                [ 'ccfe-admin-dashboard' ],
                CCFE_PRO_VERSION,
                true
            );

            wp_localize_script( 'ccfe-pro-media', 'ccfeProMedia', [
                'restUrl' => esc_url_raw( rest_url( 'ccfe/v1' ) ),
                'nonce'   => wp_create_nonce( 'wp_rest' ),
            'adminUrl'=> esc_url_raw( admin_url( 'admin.php?page=ccfe_clientmark' ) ),
            'page'    => isset( $_GET['page'] ) ? sanitize_text_field( wp_unslash( $_GET['page'] ) ) : '',
        ]);
    }
}
}
