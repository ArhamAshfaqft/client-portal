<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class CCFE_Pro_White_Label {
    private static $instance = null;

    public static function instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_filter( 'ccfe_review_localize', [ $this, 'filter_review_data' ] );
        add_filter( 'ccfe_launcher_localize', [ $this, 'filter_launcher_data' ] );
    }

    public function filter_review_data( $data ) {
        $data['proActive']        = true;
        $data['removeBranding']   = (bool) get_option( 'ccfe_remove_branding', false );
        $data['removeLogo']       = (bool) get_option( 'ccfe_remove_logo', false );
        $data['portalLogo']       = get_option( 'ccfe_portal_logo', '' );
        $data['agencyName']       = get_option( 'ccfe_agency_name', '' );
        $data['logoBorderRadius'] = (int) get_option( 'ccfe_logo_border_radius', 0 );
        $data['fileUploads']      = (bool) get_option( 'ccfe_file_uploads', true );
        $data['uploadsImages']    = (bool) get_option( 'ccfe_uploads_images', true );
        $data['uploadsVideo']     = (bool) get_option( 'ccfe_uploads_video', true );
        $data['uploadsAudio']     = (bool) get_option( 'ccfe_uploads_audio', true );
        $data['uploadsDocs']      = (bool) get_option( 'ccfe_uploads_docs', true );
        $data['maxUploadSize']    = (int) get_option( 'ccfe_max_upload_size', 10 );

        return $data;
    }

    public function filter_launcher_data( $data ) {
        $data['proActive']      = true;
        $data['removeBranding'] = (bool) get_option( 'ccfe_remove_branding', false );
        $data['agencyName']     = get_option( 'ccfe_agency_name', '' );

        return $data;
    }
}
