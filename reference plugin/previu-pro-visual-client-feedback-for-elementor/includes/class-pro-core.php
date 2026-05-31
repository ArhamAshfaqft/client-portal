<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class CCFE_Pro_Core {
    private static $instance = null;

    public static function instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_filter( 'ccfe_is_pro_active', '__return_true' );
        add_filter( 'ccfe_pro_settings', [ $this, 'get_pro_settings' ] );
        add_filter( 'ccfe_annotation_rate_limit', '__return_zero' );
    }

    public function get_pro_settings( $settings ) {
        return [
            'portal_logo'       => get_option( 'ccfe_portal_logo', '' ),
            'remove_branding'   => (bool) get_option( 'ccfe_remove_branding', false ),
            'remove_logo'       => (bool) get_option( 'ccfe_remove_logo', false ),
            'agency_name'       => get_option( 'ccfe_agency_name', '' ),
            'logo_border_radius'=> (int) get_option( 'ccfe_logo_border_radius', 0 ),
            'menu_icon'         => get_option( 'ccfe_menu_icon', '' ),
            'slack_webhook'     => get_option( 'ccfe_slack_webhook', '' ),
            'file_uploads'      => (bool) get_option( 'ccfe_file_uploads', true ),
            'uploads_images'    => (bool) get_option( 'ccfe_uploads_images', true ),
            'uploads_video'     => (bool) get_option( 'ccfe_uploads_video', true ),
            'uploads_audio'     => (bool) get_option( 'ccfe_uploads_audio', true ),
            'uploads_docs'      => (bool) get_option( 'ccfe_uploads_docs', true ),
            'max_upload_size'   => (int) get_option( 'ccfe_max_upload_size', 10 ),
        ];
    }
}
