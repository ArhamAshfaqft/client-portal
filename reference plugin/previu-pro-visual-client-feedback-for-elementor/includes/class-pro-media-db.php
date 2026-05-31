<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class CCFE_Pro_Media_DB {
    private static $instance = null;

    public static function instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action( 'admin_init', [ $this, 'check_table_version' ] );
        add_action( 'rest_api_init', [ $this, 'check_table_version' ] );
        add_action( 'ccfe_annotation_created', [ $this, 'on_annotation_created' ], 10, 2 );
        add_action( 'ccfe_annotation_updated', [ $this, 'on_annotation_updated' ], 10, 1 );
        add_action( 'ccfe_annotation_deleted', [ $this, 'on_annotation_deleted' ], 10, 1 );

        // Register admin page
        add_action( 'admin_menu', [ $this, 'register_admin_page' ], 20 );
    }

    private static function table() {
        global $wpdb;
        return $wpdb->prefix . 'ccfe_media';
    }

    public function check_table_version() {
        $current = (int) get_option( 'ccfe_media_db_version', 0 );
        if ( $current < 1 ) {
            $this->create_table();
            update_option( 'ccfe_media_db_version', 1 );
        }
    }

    public function create_table() {
        global $wpdb;
        $charset = $wpdb->get_charset_collate();
        $sql = "CREATE TABLE IF NOT EXISTS " . self::table() . " (
            id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            file_url         VARCHAR(500) NOT NULL,
            file_name        VARCHAR(255) NOT NULL,
            file_type        VARCHAR(20) NOT NULL,
            file_size        INT UNSIGNED DEFAULT 0,
            annotation_id    BIGINT UNSIGNED DEFAULT NULL,
            project_id       BIGINT UNSIGNED DEFAULT NULL,
            wp_attachment_id BIGINT UNSIGNED DEFAULT NULL,
            created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_file_type (file_type),
            INDEX idx_annotation (annotation_id),
            INDEX idx_project (project_id),
            INDEX idx_wp_attachment (wp_attachment_id)
        ) $charset;";
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta( $sql );
    }

    public function insert( $data ) {
        global $wpdb;
        return $wpdb->insert( self::table(), [
            'file_url'         => esc_url_raw( $data['file_url'] ),
            'file_name'        => sanitize_file_name( $data['file_name'] ),
            'file_type'        => sanitize_text_field( $data['file_type'] ),
            'file_size'        => (int) ( $data['file_size'] ?? 0 ),
            'annotation_id'    => ! empty( $data['annotation_id'] ) ? (int) $data['annotation_id'] : null,
            'project_id'       => ! empty( $data['project_id'] ) ? (int) $data['project_id'] : null,
            'wp_attachment_id' => ! empty( $data['wp_attachment_id'] ) ? (int) $data['wp_attachment_id'] : null,
        ] );
    }

    public function upsert( $data ) {
        global $wpdb;
        $where = [
            'file_url'      => esc_url_raw( $data['file_url'] ),
            'annotation_id' => ! empty( $data['annotation_id'] ) ? (int) $data['annotation_id'] : 0,
        ];
        $existing = $wpdb->get_row( $wpdb->prepare(
            "SELECT id FROM " . self::table() . " WHERE file_url = %s AND annotation_id = %d",
            $where['file_url'], $where['annotation_id']
        ) );
        if ( $existing ) {
            return $wpdb->update( self::table(), [
                'file_name'  => sanitize_file_name( $data['file_name'] ),
                'file_type'  => sanitize_text_field( $data['file_type'] ),
                'file_size'  => (int) ( $data['file_size'] ?? 0 ),
                'project_id' => ! empty( $data['project_id'] ) ? (int) $data['project_id'] : null,
            ], [ 'id' => $existing->id ] );
        }
        return $this->insert( $data );
    }

    public function set_orphan( $annotation_id ) {
        global $wpdb;
        return $wpdb->update(
            self::table(),
            [ 'annotation_id' => null ],
            [ 'annotation_id' => (int) $annotation_id ]
        );
    }

    public function get_by_url( $file_url ) {
        global $wpdb;
        return $wpdb->get_row( $wpdb->prepare(
            "SELECT * FROM " . self::table() . " WHERE file_url = %s LIMIT 1",
            esc_url_raw( $file_url )
        ), ARRAY_A );
    }

    public function update_wp_attachment( $file_url, $attachment_id ) {
        global $wpdb;
        return $wpdb->update(
            self::table(),
            [ 'wp_attachment_id' => (int) $attachment_id ],
            [ 'file_url' => esc_url_raw( $file_url ) ]
        );
    }

    public function get_by_filters( $filters = [] ) {
        global $wpdb;
        $where = [];
        $args = [];
        if ( ! empty( $filters['type'] ) ) {
            if ( $filters['type'] === 'document' ) {
                $where[] = '( file_type = %s OR file_type = %s )';
                $args[] = 'document';
                $args[] = 'archive';
            } elseif ( $filters['type'] === 'voice_note' ) {
                $where[] = 'file_type = %s AND meta_data LIKE %s';
                $args[] = 'audio';
                $args[] = '%"is_voice":true%';
            } elseif ( $filters['type'] === 'audio_only' ) {
                $where[] = 'file_type = %s AND ( meta_data NOT LIKE %s OR meta_data IS NULL )';
                $args[] = 'audio';
                $args[] = '%"is_voice":true%';
            } else {
                $where[] = 'file_type = %s';
                $args[] = sanitize_text_field( $filters['type'] );
            }
        }
        if ( ! empty( $filters['wp_status'] ) ) {
            if ( $filters['wp_status'] === 'sent' ) {
                $where[] = 'wp_attachment_id IS NOT NULL';
            } elseif ( $filters['wp_status'] === 'unsent' ) {
                $where[] = '( wp_attachment_id IS NULL OR wp_attachment_id = 0 )';
            } elseif ( $filters['wp_status'] === 'orphan' ) {
                $where[] = 'annotation_id IS NULL';
            }
        }
        $where_sql = $where ? 'WHERE ' . implode( ' AND ', $where ) : '';
        $sql = "SELECT * FROM " . self::table() . " $where_sql";
        if ( $args ) {
            $sql = $wpdb->prepare( $sql, ...$args );
        }
        return $wpdb->get_results( $sql, ARRAY_A );
    }

    public function delete( $id ) {
        global $wpdb;
        return $wpdb->delete( self::table(), [ 'id' => (int) $id ] );
    }

    public function get( $id ) {
        global $wpdb;
        return $wpdb->get_row( $wpdb->prepare(
            "SELECT * FROM " . self::table() . " WHERE id = %d", (int) $id
        ), ARRAY_A );
    }

    public function get_all( $filters = [], $page = 1, $per_page = 50 ) {
        global $wpdb;
        if ( $wpdb->get_var( "SHOW TABLES LIKE '" . self::table() . "'" ) !== self::table() ) {
            return [ 'items' => [], 'total' => 0, 'total_sent' => 0, 'total_unsent' => 0, 'total_orphan' => 0, 'page' => 1, 'per_page' => $per_page, 'pages' => 1 ];
        }
        $where = [];
        $args = [];

        if ( ! empty( $filters['type'] ) ) {
            if ( $filters['type'] === 'document' ) {
                $where[] = '( m.file_type = %s OR m.file_type = %s )';
                $args[] = 'document';
                $args[] = 'archive';
            } elseif ( $filters['type'] === 'voice_note' ) {
                $where[] = 'm.file_type = %s AND m.meta_data LIKE %s';
                $args[] = 'audio';
                $args[] = '%"is_voice":true%';
            } elseif ( $filters['type'] === 'audio_only' ) {
                $where[] = 'm.file_type = %s AND ( m.meta_data NOT LIKE %s OR m.meta_data IS NULL )';
                $args[] = 'audio';
                $args[] = '%"is_voice":true%';
            } else {
                $where[] = 'm.file_type = %s';
                $args[] = sanitize_text_field( $filters['type'] );
            }
        }

        if ( ! empty( $filters['wp_status'] ) ) {
            if ( $filters['wp_status'] === 'sent' ) {
                $where[] = 'm.wp_attachment_id IS NOT NULL';
            } elseif ( $filters['wp_status'] === 'unsent' ) {
                $where[] = 'm.wp_attachment_id IS NULL';
            } elseif ( $filters['wp_status'] === 'orphan' ) {
                $where[] = 'm.annotation_id IS NULL';
            }
        }

        $where_sql = $where ? 'WHERE ' . implode( ' AND ', $where ) : '';
        $offset = ( max( 1, (int) $page ) - 1 ) * (int) $per_page;

        $count_sql = "SELECT COUNT(*) FROM " . self::table() . " m $where_sql";
        $total = $wpdb->get_var( $wpdb->prepare( $count_sql, ...$args ) );

        $items_sql = "SELECT m.*, a.client_name, p.title AS project_title
            FROM " . self::table() . " m
            LEFT JOIN {$wpdb->prefix}ccfe_annotations a ON m.annotation_id = a.id
            LEFT JOIN {$wpdb->prefix}ccfe_projects p ON m.project_id = p.id
            $where_sql
            ORDER BY m.created_at DESC
            LIMIT %d OFFSET %d";
        $items_args = array_merge( $args, [ (int) $per_page, $offset ] );
        $items = $wpdb->get_results( $wpdb->prepare( $items_sql, ...$items_args ), ARRAY_A );

        $total_sent = (int) $wpdb->get_var( "SELECT COUNT(*) FROM " . self::table() . " WHERE wp_attachment_id IS NOT NULL" );
        $total_orphan = (int) $wpdb->get_var( "SELECT COUNT(*) FROM " . self::table() . " WHERE annotation_id IS NULL" );
        $total_unsent = $total - $total_sent - $total_orphan;

        return [
            'items'        => $items,
            'total'        => (int) $total,
            'total_sent'   => $total_sent,
            'total_unsent' => $total_unsent,
            'total_orphan' => $total_orphan,
            'page'         => (int) $page,
            'per_page'     => (int) $per_page,
            'pages'        => max( 1, ceil( $total / $per_page ) ),
        ];
    }

    public function backfill_all() {
        global $wpdb;
        if ( $wpdb->get_var( "SHOW TABLES LIKE '" . self::table() . "'" ) !== self::table() ) {
            return [ 'inserted' => 0, 'skipped' => 0 ];
        }
        $anns = $wpdb->get_results( "SELECT * FROM {$wpdb->prefix}ccfe_annotations", ARRAY_A );
        $inserted = 0;
        $skipped = 0;
        foreach ( $anns as $ann ) {
            $meta = json_decode( $ann['meta_data'] ?? '[]', true ) ?: [];
            $atts = $meta['attachments'] ?? [];
            if ( empty( $atts ) ) continue;
            foreach ( $atts as $att ) {
                // Skip files that no longer exist on disk (explicitly deleted)
                $upload_dir = wp_upload_dir();
                $file_dir = $upload_dir['basedir'] . '/ccfe-media';
                $att_file = basename( wp_parse_url( $att['url'], PHP_URL_PATH ) );
                if ( ! file_exists( $file_dir . '/' . $att_file ) ) {
                    $skipped++;
                    continue;
                }
                $existing = $wpdb->get_var( $wpdb->prepare(
                    "SELECT id FROM " . self::table() . " WHERE file_url = %s AND annotation_id = %d",
                    esc_url_raw( $att['url'] ), (int) $ann['id']
                ) );
                if ( $existing ) { $skipped++; continue; }
                $this->insert([
                    'file_url'      => $att['url'],
                    'file_name'     => $att['name'] ?? basename( $att['url'] ),
                    'file_type'     => $att['type'] ?? 'other',
                    'file_size'     => $att['size'] ?? 0,
                    'annotation_id' => (int) $ann['id'],
                    'project_id'    => (int) ( $ann['project_id'] ?? 0 ),
                ]);
                $inserted++;
            }
        }
        return [ 'inserted' => $inserted, 'skipped' => $skipped ];
    }

    /* ── Hook handlers ─────────────────────────────────────── */

    public function on_annotation_created( $annotation, $project ) {
        global $wpdb;
        $raw = $annotation['meta_data'] ?? [];
        $meta = is_array( $raw ) ? $raw : ( json_decode( $raw, true ) ?: [] );
        $atts = $meta['attachments'] ?? [];
        foreach ( $atts as $att ) {
            $existing = $wpdb->get_var( $wpdb->prepare(
                "SELECT id FROM " . self::table() . " WHERE file_url = %s AND annotation_id = %d",
                esc_url_raw( $att['url'] ), (int) $annotation['id']
            ) );
            if ( $existing ) continue;
            $this->insert([
                'file_url'      => $att['url'],
                'file_name'     => $att['name'] ?? basename( $att['url'] ),
                'file_type'     => $att['type'] ?? 'other',
                'file_size'     => $att['size'] ?? 0,
                'annotation_id' => (int) $annotation['id'],
                'project_id'    => (int) $annotation['project_id'],
            ]);
        }
    }

    public function on_annotation_updated( $annotation ) {
        global $wpdb;
        if ( ! $annotation || ! is_array( $annotation ) ) return;
        $raw = $annotation['meta_data'] ?? [];
        $meta = is_string( $raw ) ? ( json_decode( $raw, true ) ?: [] ) : ( is_array( $raw ) ? $raw : [] );
        $atts = $meta['attachments'] ?? [];
        $current_urls = array_map( function( $a ) {
            return esc_url_raw( $a['url'] );
        }, $atts );

        // Get existing records for this annotation, keyed by file_url
        $existing_rows = $wpdb->get_results( $wpdb->prepare(
            "SELECT id, file_url, wp_attachment_id FROM " . self::table() . " WHERE annotation_id = %d",
            (int) $annotation['id']
        ), ARRAY_A );
        $existing_by_url = [];
        foreach ( $existing_rows as $row ) {
            $existing_by_url[ $row['file_url'] ] = $row;
        }

        // Delete rows whose file_url is no longer in the current attachment set
        if ( ! empty( $current_urls ) ) {
            $placeholders = implode( ',', array_fill( 0, count( $current_urls ), '%s' ) );
            // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $wpdb->query( $wpdb->prepare(
                "DELETE FROM " . self::table() . " WHERE annotation_id = %d AND file_url NOT IN ($placeholders)",
                array_merge( [ (int) $annotation['id'] ], $current_urls )
            ) );
        } else {
            $wpdb->delete( self::table(), [ 'annotation_id' => (int) $annotation['id'] ] );
        }

        // Upsert each current attachment
        foreach ( $atts as $att ) {
            $url = esc_url_raw( $att['url'] );
            if ( isset( $existing_by_url[ $url ] ) ) {
                // Update existing record — preserve wp_attachment_id
                $wpdb->update( self::table(), [
                    'file_name'  => sanitize_file_name( $att['name'] ?? basename( $att['url'] ) ),
                    'file_type'  => sanitize_text_field( $att['type'] ?? 'other' ),
                    'file_size'  => (int) ( $att['size'] ?? 0 ),
                    'project_id' => (int) $annotation['project_id'],
                ], [ 'id' => (int) $existing_by_url[ $url ]['id'] ] );
            } else {
                $this->insert([
                    'file_url'      => $att['url'],
                    'file_name'     => $att['name'] ?? basename( $att['url'] ),
                    'file_type'     => $att['type'] ?? 'other',
                    'file_size'     => (int) ( $att['size'] ?? 0 ),
                    'annotation_id' => (int) $annotation['id'],
                    'project_id'    => (int) $annotation['project_id'],
                ]);
            }
        }
    }

    public function on_annotation_deleted( $annotation_id ) {
        $this->set_orphan( $annotation_id );
    }

    /* ── Admin page ─────────────────────────────────────────── */

    public function register_admin_page() {
        add_submenu_page(
            'ccfe_clientmark',
            'Media Library',
            'Media',
            'manage_options',
            'ccfe_clientmark-media',
            [ $this, 'render_admin_page' ],
            30
        );
    }

    public function render_admin_page() {
        echo '<div id="ccfe-media-admin" class="ccfe-admin-wrap"><div class="ccfe-dash"><div class="ccfe-loading">Loading media library...</div></div></div>';
    }
}
