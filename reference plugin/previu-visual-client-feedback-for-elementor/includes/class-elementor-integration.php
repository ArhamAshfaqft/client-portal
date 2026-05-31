<?php
/**
 * Elementor editor integration — adds eye icon, side panel, and annotation overlays.
 */
if ( ! defined( 'ABSPATH' ) ) exit;

class CCFE_Elementor_Integration {
    private static $instance = null;

    public static function instance() {
        if ( null === self::$instance ) self::$instance = new self();
        return self::$instance;
    }

    private function __construct() {
        add_action( 'elementor/editor/before_enqueue_scripts', [ $this, 'enqueue_editor_assets' ] );
        add_action( 'elementor/preview/enqueue_styles', [ $this, 'enqueue_preview_assets' ] );
        add_action( 'elementor/editor/footer', [ $this, 'render_panel_root' ] );
    }

    public function enqueue_editor_assets() {
        wp_enqueue_style(
            'ccfe-elementor-panel',
            CCFE_PLUGIN_URL . 'assets/css/elementor-panel.css',
            [],
            CCFE_VERSION
        );

        wp_enqueue_script(
            'ccfe-elementor-panel',
            CCFE_PLUGIN_URL . 'assets/js/elementor-panel.js',
            [ 'elementor-editor' ],
            CCFE_VERSION . '.' . filemtime( CCFE_PLUGIN_DIR . 'assets/js/elementor-panel.js' ),
            true
        );

        // Determine post ID for the current page being edited
        $post_id = 0;
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        if ( isset( $_GET['post'] ) ) {
            // phpcs:ignore WordPress.Security.NonceVerification.Recommended
            $post_id = intval( wp_unslash( $_GET['post'] ) );
        }

        // Find projects that include this page
        $page_url  = get_permalink( $post_id );
        $page_path = wp_parse_url( $page_url, PHP_URL_PATH ) ?: '/';

        wp_localize_script( 'ccfe-elementor-panel', 'ccfeElementor', [
            'restUrl'   => esc_url_raw( rest_url( 'ccfe/v1' ) ),
            'nonce'     => wp_create_nonce( 'wp_rest' ),
            'postId'    => $post_id,
            'pageUrl'   => $page_url,
            'pagePath'  => $page_path,
            'pluginUrl' => CCFE_PLUGIN_URL,
        ]);
    }

    public function enqueue_preview_assets() {
        wp_enqueue_style(
            'ccfe-elementor-preview',
            CCFE_PLUGIN_URL . 'assets/css/elementor-panel.css',
            [],
            CCFE_VERSION
        );
    }

    public function render_panel_root() {
        echo '<div id="ccfe-elementor-panel-root"></div>';
    }
}
