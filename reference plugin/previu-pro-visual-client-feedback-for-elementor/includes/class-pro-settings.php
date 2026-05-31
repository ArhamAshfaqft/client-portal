<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class CCFE_Pro_Settings {
    private static $instance = null;

    public static function instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action( 'ccfe_save_pro_settings', [ $this, 'save' ] );
    }

    public function save( $data ) {
        if ( isset( $data['portal_logo'] ) ) {
            update_option( 'ccfe_portal_logo', esc_url_raw( $data['portal_logo'] ) );
        }
        if ( isset( $data['remove_branding'] ) ) {
            update_option( 'ccfe_remove_branding', (bool) $data['remove_branding'] );
        }
        if ( isset( $data['remove_logo'] ) ) {
            update_option( 'ccfe_remove_logo', (bool) $data['remove_logo'] );
        }
        if ( isset( $data['agency_name'] ) ) {
            update_option( 'ccfe_agency_name', sanitize_text_field( $data['agency_name'] ) );
        }
        if ( isset( $data['logo_border_radius'] ) ) {
            update_option( 'ccfe_logo_border_radius', (int) $data['logo_border_radius'] );
        }
        if ( isset( $data['menu_icon'] ) ) {
            update_option( 'ccfe_menu_icon', esc_url_raw( $data['menu_icon'] ) );
        }
        if ( isset( $data['slack_webhook'] ) ) {
            update_option( 'ccfe_slack_webhook', esc_url_raw( $data['slack_webhook'] ) );
        }
        if ( isset( $data['file_uploads'] ) ) {
            update_option( 'ccfe_file_uploads', (bool) $data['file_uploads'] );
        }
        if ( isset( $data['uploads_images'] ) ) {
            update_option( 'ccfe_uploads_images', (bool) $data['uploads_images'] );
        }
        if ( isset( $data['uploads_video'] ) ) {
            update_option( 'ccfe_uploads_video', (bool) $data['uploads_video'] );
        }
        if ( isset( $data['uploads_audio'] ) ) {
            update_option( 'ccfe_uploads_audio', (bool) $data['uploads_audio'] );
        }
        if ( isset( $data['uploads_docs'] ) ) {
            update_option( 'ccfe_uploads_docs', (bool) $data['uploads_docs'] );
        }
        if ( isset( $data['max_upload_size'] ) ) {
            update_option( 'ccfe_max_upload_size', (int) $data['max_upload_size'] );
        }
    }
}
