<?php
/**
 * Handles the client-facing review page.
 * When ?ccfe_review=TOKEN is present, injects the annotation toolbar & engine.
 */
if ( ! defined( 'ABSPATH' ) ) exit;

class CCFE_Review_Page {
    private static $instance = null;
    private $project = null;

    public static function instance() {
        if ( null === self::$instance ) self::$instance = new self();
        return self::$instance;
    }

    private function __construct() {
        add_action( 'template_redirect', [ $this, 'maybe_init_review' ] );
    }

    public function maybe_init_review() {
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        if ( empty( $_GET['ccfe_review'] ) ) return;

        // Block in Elementor editor/preview
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        if ( isset( $_GET['elementor-preview'] ) || ( isset( $_GET['action'] ) && 'elementor' === $_GET['action'] ) ) return;

        // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        $token = sanitize_text_field( wp_unslash( $_GET['ccfe_review'] ) );
        $project = CCFE_Database::get_project_by_token( $token );

        if ( ! $project || $project['status'] !== 'active' ) {
            wp_die(
                '<h1>' . esc_html__( 'Review Link Expired', 'previu-visual-client-feedback-for-elementor' ) . '</h1><p>' . esc_html__( 'This review link is no longer active. Please contact the developer for an updated link.', 'previu-visual-client-feedback-for-elementor' ) . '</p>',
                esc_html__( 'Review Link Expired', 'previu-visual-client-feedback-for-elementor' ),
                [ 'response' => 403 ]
            );
        }

        $this->project = $project;

        // Prevent server-side page caching so settings are always fresh
        nocache_headers();

        // Inject our toolbar & annotation engine into the page footer
        add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_assets' ], 9999 );
        add_action( 'wp_footer', [ $this, 'render_toolbar' ], 1 );
        add_action( 'wp_head', [ $this, 'inject_review_meta' ], 1 );
    }

    public function inject_review_meta() {
        echo '<meta name="ccfe-review" content="active">' . "\n";
        // Prevent indexing of review pages
        echo '<meta name="robots" content="noindex, nofollow">' . "\n";
    }

    public function enqueue_assets() {
        wp_enqueue_style(
            'ccfe-review-page',
            CCFE_PLUGIN_URL . 'assets/css/review-page.css',
            [],
            CCFE_VERSION
        );

        wp_enqueue_script(
            'ccfe-element-dna',
            CCFE_PLUGIN_URL . 'assets/js/element-dna.js',
            [],
            CCFE_VERSION,
            true
        );

        wp_enqueue_script(
            'ccfe-annotation-renderer',
            CCFE_PLUGIN_URL . 'assets/js/annotation-renderer.js',
            [ 'ccfe-element-dna' ],
            CCFE_VERSION,
            true
        );

        wp_enqueue_script(
            'ccfe-annotation-engine',
            CCFE_PLUGIN_URL . 'assets/js/annotation-engine.js',
            [ 'ccfe-element-dna', 'ccfe-annotation-renderer' ],
            CCFE_VERSION,
            true
        );

        wp_localize_script( 'ccfe-annotation-engine', 'ccfeReview', apply_filters( 'ccfe_review_localize', [
            'restUrl'        => esc_url_raw( rest_url( 'ccfe/v1' ) ),
            'token'          => $this->project['share_token'],
            'projectId'      => $this->project['id'],
            'projectTitle'   => $this->project['title'],
            'clientName'     => $this->project['client_name'],
            'pagePath'       => $this->get_current_path(),
            'pageUrl'        => $this->get_current_url(),
            'nonce'          => wp_create_nonce( 'wp_rest' ),
            'homeUrl'        => home_url(),
            'pluginUrl'      => CCFE_PLUGIN_URL,
            'welcomeTitle'            => get_option( 'ccfe_welcome_title', '' ),
            'welcomeMessage'          => get_option( 'ccfe_welcome_message', '' ),
            'portal_logo'             => '',
            'portal_brand_name'       => '',
            'logo_border_radius'      => 0,
            'remove_branding'         => false,
            'remove_logo'             => false,
        ] ) );
    }

    public function render_toolbar() {
        ?>
        <div id="ccfe-toolbar-root"></div>
        <?php
    }

    private function get_current_path() {
        $path = wp_parse_url( $this->get_current_url(), PHP_URL_PATH );
        return $path ?: '/';
    }

    private function get_current_url() {
        global $wp;
        return home_url( add_query_arg( [], $wp->request ) );
    }
}
