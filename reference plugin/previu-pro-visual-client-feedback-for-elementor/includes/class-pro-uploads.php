<?php
if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Handles file uploads for annotations — images, video, audio, documents, archives.
 * Registers REST endpoints for uploading and listing media.
 */
class CCFE_Pro_Uploads {
    private static $instance = null;
    private static $upload_dir = '';

    public static function instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        $upload_dir         = wp_upload_dir();
        self::$upload_dir   = $upload_dir['basedir'] . '/ccfe-media';

        add_action( 'rest_api_init', [ $this, 'register_routes' ] );
    }

    public function register_routes() {
        register_rest_route( 'ccfe/v1', '/media/config', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'get_config' ],
            'permission_callback' => '__return_true',
        ]);

        register_rest_route( 'ccfe/v1', '/media/upload', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'handle_upload' ],
            'permission_callback' => [ $this, 'can_upload' ],
        ]);

        register_rest_route( 'ccfe/v1', '/media', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'list_media' ],
            'permission_callback' => [ $this, 'admin_check' ],
        ]);

        register_rest_route( 'ccfe/v1', '/media/(?P<name>[^/]+)', [
            'methods'             => 'DELETE',
            'callback'            => [ $this, 'delete_media' ],
            'permission_callback' => [ $this, 'admin_check' ],
        ]);

        register_rest_route( 'ccfe/v1', '/media/send-to-library', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'send_to_library' ],
            'permission_callback' => [ $this, 'admin_check' ],
        ]);

        register_rest_route( 'ccfe/v1', '/media/admin', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'admin_list_media' ],
            'permission_callback' => [ $this, 'admin_check' ],
        ]);

        register_rest_route( 'ccfe/v1', '/media/admin/delete/(?P<id>\d+)', [
            'methods'             => 'DELETE',
            'callback'            => [ $this, 'admin_delete_media' ],
            'permission_callback' => [ $this, 'admin_check' ],
        ]);

        register_rest_route( 'ccfe/v1', '/media/admin/backfill', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'admin_backfill' ],
            'permission_callback' => [ $this, 'admin_check' ],
        ]);

        register_rest_route( 'ccfe/v1', '/media/admin/bulk-delete', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'admin_bulk_delete_media' ],
            'permission_callback' => [ $this, 'admin_check' ],
        ]);
    }

    public function can_upload() {
        return (bool) get_option( 'ccfe_file_uploads', true );
    }

    public function get_config() {
        return rest_ensure_response([
            'file_uploads'      => (bool) get_option( 'ccfe_file_uploads', true ),
            'uploads_images'    => (bool) get_option( 'ccfe_uploads_images', true ),
            'uploads_video'     => (bool) get_option( 'ccfe_uploads_video', true ),
            'uploads_audio'     => (bool) get_option( 'ccfe_uploads_audio', true ),
            'uploads_docs'      => (bool) get_option( 'ccfe_uploads_docs', true ),
            'max_upload_size'   => (int) get_option( 'ccfe_max_upload_size', 10 ),
            'portal_logo'       => get_option( 'ccfe_portal_logo', '' ),
            'remove_branding'   => (bool) get_option( 'ccfe_remove_branding', false ),
            'remove_logo'       => (bool) get_option( 'ccfe_remove_logo', false ),
            'agency_name'       => get_option( 'ccfe_agency_name', '' ),
            'logo_border_radius'=> (int) get_option( 'ccfe_logo_border_radius', 0 ),
            'slack_webhook'     => get_option( 'ccfe_slack_webhook', '' ),
        ]);
    }

    public function admin_check() {
        return current_user_can( 'manage_options' );
    }

    /**
     * Validate a file type against the allowed categories from settings.
     */
    private function is_type_allowed( $mime ) {
        $category = $this->categorize( $mime );

        $map = [
            'image'    => 'ccfe_uploads_images',
            'video'    => 'ccfe_uploads_video',
            'audio'    => 'ccfe_uploads_audio',
            'document' => 'ccfe_uploads_docs',
            'archive'  => 'ccfe_uploads_docs',
        ];

        $key = $map[ $category ] ?? null;
        if ( ! $key ) return false;

        return (bool) get_option( $key, true );
    }

    private function get_max_size_bytes() {
        $mb = (int) get_option( 'ccfe_max_upload_size', 10 );
        if ( $mb < 1 ) $mb = 1;
        return $mb * 1024 * 1024;
    }

    public function handle_upload( $req ) {
        // phpcs:ignore WordPress.Security.NonceVerification.Missing
        if ( empty( $_FILES['file'] ) ) {
            return new \WP_Error( 'no_file', 'No file provided.', [ 'status' => 400 ] );
        }

        // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized, WordPress.Security.NonceVerification.Missing
        $file = $_FILES['file'];

        if ( UPLOAD_ERR_OK !== $file['error'] ) {
            return new \WP_Error( 'upload_error', 'Upload error code: ' . $file['error'], [ 'status' => 400 ] );
        }

        // Enforce max size
        $max_size = $this->get_max_size_bytes();
        if ( $file['size'] > $max_size ) {
            return new \WP_Error( 'file_too_large', 'File exceeds the maximum upload size of ' . round( $max_size / 1024 / 1024 ) . 'MB.', [ 'status' => 400 ] );
        }

        // Determine MIME and check category permission
        $ext = strtolower( pathinfo( $file['name'], PATHINFO_EXTENSION ) );
        $wp_type = wp_check_filetype( $file['name'] )['type'] ?: '';
        $browser_type = $file['type'] ?? '';
        // webm is ambiguous (video/webm or audio/webm) — trust browser
        if ( $ext === 'webm' && $browser_type && strpos( $browser_type, 'audio/' ) === 0 ) {
            $tmp_mime = $browser_type;
        } else {
            $tmp_mime = $wp_type ?: $browser_type ?: 'application/octet-stream';
        }
        if ( ! $this->is_type_allowed( $tmp_mime ) ) {
            return new \WP_Error( 'type_not_allowed', 'This file type is not permitted.', [ 'status' => 403 ] );
        }

        // Ensure upload directory exists
        if ( ! is_dir( self::$upload_dir ) ) {
            wp_mkdir_p( self::$upload_dir );
            // Protect directory
            if ( ! file_exists( self::$upload_dir . '/index.php' ) ) {
                file_put_contents( self::$upload_dir . '/index.php', '<?php // silence' );
            }
        }

        // Read the uploaded file
        $file_content = file_get_contents( $file['tmp_name'] );
        if ( false === $file_content ) {
            return new \WP_Error( 'read_failed', 'Could not read uploaded file.', [ 'status' => 500 ] );
        }

        // Generate a safe filename with timestamp prefix to avoid collisions
        $ext       = strtolower( pathinfo( $file['name'], PATHINFO_EXTENSION ) );
        $safe_name = 'ccfe-' . time() . '-' . wp_rand( 1000, 9999 ) . '.' . sanitize_file_name( $ext );
        $file_path = self::$upload_dir . '/' . $safe_name;

        // Write the file
        $written = file_put_contents( $file_path, $file_content );
        if ( false === $written ) {
            return new \WP_Error( 'write_failed', 'Could not save file. Check directory permissions.', [ 'status' => 500 ] );
        }

        // Determine MIME type — trust browser for ambiguous formats like webm
        $mime = wp_check_filetype( $safe_name )['type'] ?: '';
        if ( $ext === 'webm' && $browser_type && strpos( $browser_type, 'audio/' ) === 0 ) {
            $mime = $browser_type;
        } elseif ( ! $mime ) {
            $mime = $browser_type ?: 'application/octet-stream';
        }

        // Build URL
        $upload_dir = wp_upload_dir();
        $file_url   = $upload_dir['baseurl'] . '/ccfe-media/' . $safe_name;

        // Categorize and return
        $category = $this->categorize( $mime );
        $original = sanitize_file_name( $file['name'] );

        return rest_ensure_response( [
            'url'  => $file_url,
            'name' => $original,
            'type' => $category,
            'mime' => $mime,
            'size' => $written,
        ]);
    }

    /**
     * Categorize a MIME type.
     */
    private function categorize( $mime ) {
        if ( 0 === strpos( $mime, 'image/' ) ) return 'image';
        if ( 0 === strpos( $mime, 'video/' ) ) return 'video';
        if ( 0 === strpos( $mime, 'audio/' ) ) return 'audio';
        $doc = [ 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument', 'application/vnd.ms-', 'text/' ];
        foreach ( $doc as $d ) { if ( 0 === strpos( $mime, $d ) ) return 'document'; }
        if ( in_array( $mime, [ 'application/zip', 'application/x-zip', 'application/x-rar', 'application/gzip', 'application/x-7z' ], true ) ) return 'archive';
        return 'other';
    }

    /**
     * List uploaded media files.
     */
    public function list_media( $req ) {
        $files = [];
        if ( is_dir( self::$upload_dir ) ) {
            $items = scandir( self::$upload_dir );
            $base_url = wp_upload_dir()['baseurl'] . '/ccfe-media/';
            foreach ( $items as $item ) {
                if ( '.' === $item || '..' === $item || 'index.php' === $item ) continue;
                $path = self::$upload_dir . '/' . $item;
                $files[] = [
                    'name' => $item,
                    'url'  => $base_url . $item,
                    'size' => filesize( $path ),
                    'date' => gmdate( 'Y-m-d H:i:s', filemtime( $path ) ),
                ];
            }
        }
        return rest_ensure_response( $files );
    }

    /**
     * Import a ccfé-media file into the WordPress media library.
     * Accepts: { url: "https://..." }
     */
    public function send_to_library( $req ) {
        $data = $req->get_json_params();
        $url  = esc_url_raw( $data['url'] ?? '' );

        if ( empty( $url ) ) {
            return new \WP_Error( 'missing_url', 'File URL is required.', [ 'status' => 400 ] );
        }

        // Derive the filename from the URL
        $disk_name = basename( wp_parse_url( $url, PHP_URL_PATH ) );
        $filepath  = self::$upload_dir . '/' . $disk_name;

        if ( ! file_exists( $filepath ) ) {
            return new \WP_Error( 'not_found', 'Source file not found on disk.', [ 'status' => 404 ] );
        }

        // Look up the original filename from the media table
        $original_name = $disk_name;
        if ( class_exists( 'CCFE_Pro_Media_DB' ) ) {
            $record = CCFE_Pro_Media_DB::instance()->get_by_url( $url );
            if ( $record && ! empty( $record['file_name'] ) ) {
                $original_name = $record['file_name'];
            }
        }

        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/media.php';
        require_once ABSPATH . 'wp-admin/includes/image.php';

        // Copy to a temp location that wp_handle_sideload expects
        $tmp = wp_tempnam( $original_name );
        copy( $filepath, $tmp );

        $file_array = [
            'name'     => $original_name,
            'tmp_name' => $tmp,
            'error'    => UPLOAD_ERR_OK,
            'size'     => filesize( $filepath ),
        ];

        // Sideload into the WordPress media library
        $attachment_id = media_handle_sideload( $file_array, 0 );

        wp_delete_file( $tmp );

        if ( is_wp_error( $attachment_id ) ) {
            return new \WP_Error( 'import_failed', $attachment_id->get_error_message(), [ 'status' => 500 ] );
        }

        $library_url = wp_get_attachment_url( $attachment_id );

        // Track in media table if Pro media DB is active
        if ( class_exists( 'CCFE_Pro_Media_DB' ) ) {
            CCFE_Pro_Media_DB::instance()->update_wp_attachment( $url, $attachment_id );
        }

        return rest_ensure_response( [
            'attachment_id' => $attachment_id,
            'library_url'   => $library_url,
            'filename'      => $original_name,
        ]);
    }

    /**
     * Delete a media file by name.
     */
    public function delete_media( $req ) {
        $name = sanitize_file_name( $req['name'] );
        $path = self::$upload_dir . '/' . $name;
        if ( ! file_exists( $path ) ) {
            return new \WP_Error( 'not_found', 'File not found.', [ 'status' => 404 ] );
        }
        wp_delete_file( $path );
        return rest_ensure_response( [ 'deleted' => true ] );
    }

    /**
     * Admin: list media from the ccfe_media table with filters + pagination.
     */
    public function admin_list_media( $req ) {
        if ( ! class_exists( 'CCFE_Pro_Media_DB' ) ) {
            return new \WP_Error( 'no_table', 'Media table not available.', [ 'status' => 500 ] );
        }
        $db = CCFE_Pro_Media_DB::instance();
        $filters = [];
        if ( $req->get_param( 'type' ) ) $filters['type'] = $req->get_param( 'type' );
        if ( $req->get_param( 'wp_status' ) ) $filters['wp_status'] = $req->get_param( 'wp_status' );
        $page = (int) $req->get_param( 'page' ) ?: 1;
        $per_page = min( 100, (int) $req->get_param( 'per_page' ) ?: 50 );
        return rest_ensure_response( $db->get_all( $filters, $page, $per_page ) );
    }

    /**
     * Admin: delete a media file by its DB record ID.
     */
    public function admin_delete_media( $req ) {
        if ( ! class_exists( 'CCFE_Pro_Media_DB' ) ) {
            return new \WP_Error( 'no_table', 'Media table not available.', [ 'status' => 500 ] );
        }
        $db = CCFE_Pro_Media_DB::instance();
        $record = $db->get( $req['id'] );
        if ( ! $record ) {
            return new \WP_Error( 'not_found', 'Media record not found.', [ 'status' => 404 ] );
        }

        // Delete from disk
        $upload_dir = wp_upload_dir();
        $file_dir = $upload_dir['basedir'] . '/ccfe-media';
        $file_name = basename( wp_parse_url( $record['file_url'], PHP_URL_PATH ) );
        $file_path = $file_dir . '/' . $file_name;
        if ( file_exists( $file_path ) ) {
            wp_delete_file( $file_path );
        }

        // Delete from WP Media Library if it was sent there
        if ( ! empty( $record['wp_attachment_id'] ) ) {
            wp_delete_attachment( (int) $record['wp_attachment_id'], true );
        }

        // Delete the DB record
        $db->delete( $req['id'] );
        return rest_ensure_response( [ 'deleted' => true ] );
    }

    /**
     * Admin: backfill the media table from existing annotations.
     */
    public function admin_backfill( $req ) {
        if ( ! class_exists( 'CCFE_Pro_Media_DB' ) ) {
            return new \WP_Error( 'no_table', 'Media table not available.', [ 'status' => 500 ] );
        }
        $result = CCFE_Pro_Media_DB::instance()->backfill_all();
        return rest_ensure_response( $result );
    }

    public function admin_bulk_delete_media( $req ) {
        if ( ! class_exists( 'CCFE_Pro_Media_DB' ) ) {
            return new \WP_Error( 'no_table', 'Media table not available.', [ 'status' => 500 ] );
        }
        $db = CCFE_Pro_Media_DB::instance();
        $filters = [];
        if ( $req->get_param( 'type' ) ) $filters['type'] = $req->get_param( 'type' );
        if ( $req->get_param( 'wp_status' ) ) $filters['wp_status'] = $req->get_param( 'wp_status' );

        $records = $db->get_by_filters( $filters );
        $count = 0;
        $upload_dir = wp_upload_dir();
        $file_dir = $upload_dir['basedir'] . '/ccfe-media';

        foreach ( $records as $record ) {
            $file_name = basename( wp_parse_url( $record['file_url'], PHP_URL_PATH ) );
            $file_path = $file_dir . '/' . $file_name;
            if ( file_exists( $file_path ) ) {
                wp_delete_file( $file_path );
            }
            if ( ! empty( $record['wp_attachment_id'] ) ) {
                wp_delete_attachment( (int) $record['wp_attachment_id'], true );
            }
            $db->delete( $record['id'] );
            $count++;
        }

        return rest_ensure_response( [ 'deleted' => $count ] );
    }
}
