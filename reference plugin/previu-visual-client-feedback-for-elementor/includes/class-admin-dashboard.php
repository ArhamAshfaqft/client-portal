<?php
/**
 * Previu — Admin dashboard for managing review sessions and annotations.
 */
if ( ! defined( 'ABSPATH' ) ) exit;

class CCFE_Admin_Dashboard {
    private static $instance = null;

    public static function instance() {
        if ( null === self::$instance ) self::$instance = new self();
        return self::$instance;
    }

    private function __construct() {
        add_action( 'admin_menu', [ $this, 'add_menu' ] );
        add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_assets' ] );
    }

    public function add_menu() {
        add_menu_page(
            'Previu',
            'Previu',
            'edit_posts',
            'ccfe_clientmark',
            [ $this, 'render_dashboard' ],
            $this->get_menu_icon(),
            30
        );

        add_submenu_page(
            'ccfe_clientmark',
            'Sessions',
            'Sessions',
            'edit_posts',
            'ccfe_clientmark',
            [ $this, 'render_dashboard' ]
        );

        add_submenu_page(
            'ccfe_clientmark',
            'New Session',
            'New Session',
            'edit_posts',
            'ccfe_clientmark-new',
            [ $this, 'render_dashboard' ]
        );

        add_submenu_page(
            'ccfe_clientmark',
            'Settings',
            'Settings',
            'manage_options',
            'ccfe_clientmark-settings',
            [ $this, 'render_dashboard' ]
        );

        // Reorder submenu and add "Get Pro" after Pro plugin has registered (priority 20)
        add_action( 'admin_menu', [ $this, 'reorder_and_add_pro_link' ], 21 );
    }

    public function reorder_and_add_pro_link() {
        global $submenu;
        if ( ! isset( $submenu['ccfe_clientmark'] ) ) return;

        // Desired order: Sessions, New Session, Media, Settings, Get Pro
        $order = [ 'ccfe_clientmark', 'ccfe_clientmark-new', 'ccfe_clientmark-media', 'ccfe_clientmark-settings' ];
        $items = $submenu['ccfe_clientmark'];
        $sorted = [];
        // Append items in desired order
        foreach ( $order as $slug ) {
            foreach ( $items as $k => $item ) {
                if ( isset( $item[2] ) && $item[2] === $slug ) {
                    $sorted[] = $item;
                    unset( $items[ $k ] );
                    break;
                }
            }
        }
        // Add any remaining items (e.g. third-party additions)
        $sorted = array_merge( $sorted, array_values( $items ) );
        // Add "Get Pro" as the final item
        $sorted[] = [ 'Get Pro', 'edit_posts', 'https://plugin.usepreviu.com' ];
        $submenu['ccfe_clientmark'] = $sorted;
    }

    public function enqueue_assets( $hook ) {
        if ( strpos( $hook, 'ccfe_clientmark' ) === false ) return;

        wp_enqueue_media();

        wp_enqueue_style(
            'ccfe-admin-dashboard',
            CCFE_PLUGIN_URL . 'assets/css/admin-dashboard.css',
            [],
            CCFE_VERSION
        );

        // Google Fonts
        wp_enqueue_style(
            'ccfe-google-fonts',
            'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
            [],
            CCFE_VERSION
        );

        wp_enqueue_script(
            'ccfe-admin-dashboard',
            CCFE_PLUGIN_URL . 'assets/js/admin-dashboard.js',
            [],
            CCFE_VERSION,
            true
        );

        $default_name = get_option( 'ccfe_default_reviewer_name', '' );
        $default_email = get_option( 'ccfe_default_reviewer_email', '' );
        
        // Intelligent fallback: if options are empty, pull from the most recent session
		if ( empty( $default_name ) ) {
			global $wpdb;
			$t = esc_sql( $wpdb->prefix . 'ccfe_projects' );
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$last = $wpdb->get_row( "SELECT client_name, client_email FROM `{$t}` ORDER BY id DESC LIMIT 1" );
			if ( $last ) {
				$default_name  = $last->client_name;
				$default_email = $last->client_email;
			}
		}

        /**
         * Filter: whether the Pro companion plugin is active.
         * The Pro plugin hooks this to return true.
         *
         * @param bool $is_pro Default false.
         */
        $pro_settings = apply_filters( 'ccfe_pro_settings', [] );

        wp_localize_script( 'ccfe-admin-dashboard', 'ccfeAdmin', [
            'restUrl'  => esc_url_raw( rest_url( 'ccfe/v1' ) ),
            'nonce'    => wp_create_nonce( 'wp_rest' ),
            'homeUrl'  => home_url(),
            'adminUrl' => admin_url(),
            // phpcs:ignore WordPress.Security.NonceVerification.Recommended
            'page'     => isset( $_GET['page'] ) ? sanitize_text_field( wp_unslash( $_GET['page'] ) ) : 'ccfe_clientmark',
            // phpcs:ignore WordPress.Security.NonceVerification.Recommended
            'view'     => isset( $_GET['view'] ) ? sanitize_text_field( wp_unslash( $_GET['view'] ) ) : '',
            // phpcs:ignore WordPress.Security.NonceVerification.Recommended
            'projectId'=> isset( $_GET['project_id'] ) ? intval( wp_unslash( $_GET['project_id'] ) ) : 0,
            'defaultName'  => $default_name,
            'defaultEmail' => $default_email,
            'adminEmail'   => get_option( 'ccfe_admin_email', get_option( 'admin_email' ) ),
            'welcomeTitle'   => get_option( 'ccfe_welcome_title', '' ),
            'welcomeMessage' => get_option( 'ccfe_welcome_message', '' ),
            'proSettings' => $pro_settings,
        ]);

        wp_add_inline_style( 'ccfe-admin-dashboard', '#adminmenu li a[href="https://plugin.usepreviu.com"]::after { content:" ↗"; font-size:11px; display:inline; vertical-align:middle; }' );
        wp_add_inline_script( 'ccfe-admin-dashboard', 'document.addEventListener("DOMContentLoaded",function(){var e=document.querySelector(\'#adminmenu a[href="https://plugin.usepreviu.com"]\');if(e)e.setAttribute("target","_blank");});var o=new MutationObserver(function(){var e=document.querySelector(\'#adminmenu a[href="https://plugin.usepreviu.com"]\');if(e&&e.target!=="_blank"){e.setAttribute("target","_blank");}});o.observe(document.body,{childList:true,subtree:true});' );
    }

    public function render_dashboard() {
        echo '<div id="ccfe-admin-root" class="ccfe-admin-wrap"></div>';
    }

    private function get_menu_icon() {
        $custom = get_option( 'ccfe_menu_icon', '' );
        if ( ! empty( $custom ) ) {
            return esc_url( $custom );
        }
        return CCFE_PLUGIN_URL . 'assets/Previu-sidebar-icon.png';
    }
}
