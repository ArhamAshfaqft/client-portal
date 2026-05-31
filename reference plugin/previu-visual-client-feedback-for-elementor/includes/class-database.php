<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class CCFE_Database {
    private static $instance = null;

    private static function _debug_log( $msg ) {
        if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
            // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
            error_log( $msg );
        }
    }

	public static function instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
			if ( get_option( 'ccfe_db_version' ) !== CCFE_VERSION ) {
				self::activate();
			}
		}
		return self::$instance;
	}

	public static function projects_table() {
		global $wpdb;
		return $wpdb->prefix . 'ccfe_projects';
	}

	public static function annotations_table() {
		global $wpdb;
		return $wpdb->prefix . 'ccfe_annotations';
	}

	public static function activate() {
		if ( ! get_role( 'ccfe_client' ) ) {
			add_role( 'ccfe_client', 'Client (Previu)', [ 'read' => true, 'edit_posts' => false, 'delete_posts' => false ] );
		}

		global $wpdb;
		$charset = $wpdb->get_charset_collate();
		$p       = self::projects_table();
		$a       = self::annotations_table();

		$sql = "
CREATE TABLE {$p} (
	id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
	title varchar(255) NOT NULL DEFAULT '',
	share_token varchar(64) NOT NULL,
	client_name varchar(255) NOT NULL DEFAULT '',
	client_email varchar(255) NOT NULL DEFAULT '',
	status varchar(20) NOT NULL DEFAULT 'active',
	allowed_pages longtext DEFAULT NULL,
	settings longtext DEFAULT NULL,
	created_by bigint(20) unsigned NOT NULL DEFAULT 0,
	created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY  (id),
	UNIQUE KEY share_token (share_token),
	KEY status (status)
) {$charset};

CREATE TABLE {$a} (
	id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
	project_id bigint(20) unsigned NOT NULL DEFAULT 0,
	page_url varchar(500) NOT NULL DEFAULT '',
	page_path varchar(500) NOT NULL DEFAULT '',
	type varchar(20) NOT NULL DEFAULT 'pin',
	element_selector varchar(1000) NOT NULL DEFAULT '',
	elementor_data_id varchar(100) NOT NULL DEFAULT '',
	element_tag varchar(50) NOT NULL DEFAULT '',
	element_text varchar(500) NOT NULL DEFAULT '',
	element_fingerprint varchar(64) NOT NULL DEFAULT '',
	anchor_x_pct decimal(12,6) NOT NULL DEFAULT 0,
	anchor_y_pct decimal(12,6) NOT NULL DEFAULT 0,
	width_pct decimal(12,6) NOT NULL DEFAULT 0,
	height_pct decimal(12,6) NOT NULL DEFAULT 0,
	end_element_selector varchar(1000) NOT NULL DEFAULT '',
	end_elementor_data_id varchar(100) NOT NULL DEFAULT '',
	end_anchor_x_pct decimal(12,6) NOT NULL DEFAULT 0,
	end_anchor_y_pct decimal(12,6) NOT NULL DEFAULT 0,
	draw_data longtext DEFAULT NULL,
	comment_text longtext DEFAULT NULL,
	client_name varchar(255) NOT NULL DEFAULT 'Client',
	status varchar(20) NOT NULL DEFAULT 'pending',
	priority varchar(20) NOT NULL DEFAULT 'medium',
	viewport_width int unsigned NOT NULL DEFAULT 0,
	viewport_height int unsigned NOT NULL DEFAULT 0,
	scroll_y_pct decimal(12,6) NOT NULL DEFAULT 0,
	resolved_by bigint(20) unsigned NOT NULL DEFAULT 0,
	resolved_at datetime DEFAULT NULL,
	meta_data longtext DEFAULT NULL,
	color varchar(20) NOT NULL DEFAULT '',
	context_title varchar(255) NOT NULL DEFAULT '',
	created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY  (id),
	KEY project_id (project_id),
	KEY page_path (page_path(191)),
	KEY status (status)
) {$charset};
";
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		dbDelta( $sql );

		// Ensure new columns exist (dbDelta misses ADD COLUMN on existing tables).
		$a_safe = esc_sql( $a );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		if ( empty( $wpdb->get_col( "SHOW COLUMNS FROM `{$a_safe}` LIKE 'color'" ) ) ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$wpdb->query( "ALTER TABLE `{$a_safe}` ADD COLUMN color varchar(20) NOT NULL DEFAULT '' AFTER meta_data" );
		}
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		if ( empty( $wpdb->get_col( "SHOW COLUMNS FROM `{$a_safe}` LIKE 'context_title'" ) ) ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$wpdb->query( "ALTER TABLE `{$a_safe}` ADD COLUMN context_title varchar(255) NOT NULL DEFAULT '' AFTER color" );
		}

		update_option( 'ccfe_db_version', CCFE_VERSION );
	}

    public static function deactivate() {
        flush_rewrite_rules();
    }

	/* ── PROJECT CRUD ── */

    public static function create_project( $data ) {
        global $wpdb;
        if ( empty( $data['title'] ) ) {
            self::_debug_log( 'CCFE: Project creation failed — title is required.' );
            return null;
        }
        $token  = wp_generate_password( 32, false );
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$result = $wpdb->insert(
			self::projects_table(),
			[
				'title'         => sanitize_text_field( $data['title'] ?? '' ),
				'share_token'   => $token,
				'client_name'   => sanitize_text_field( $data['client_name'] ?? '' ),
				'client_email'  => sanitize_email( $data['client_email'] ?? '' ),
				'status'        => 'active',
				'allowed_pages' => wp_json_encode( $data['allowed_pages'] ?? [] ),
				'settings'      => wp_json_encode( $data['settings'] ?? new \stdClass() ),
				'created_by'    => get_current_user_id(),
				'created_at'    => current_time( 'mysql' ),
				'updated_at'    => current_time( 'mysql' ),
			]
		);
		if ( false === $result ) {
            self::_debug_log( 'CCFE: Failed to create project. Last DB error: ' . $wpdb->last_error );
			return null;
		}
		return self::get_project( $wpdb->insert_id );
	}

	public static function get_project( $id ) {
		global $wpdb;
		$t = esc_sql( self::projects_table() );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$row = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM `{$t}` WHERE id = %d", $id ), ARRAY_A );
		return $row ? self::decode_project( $row ) : null;
	}

	public static function get_project_by_token( $token ) {
		global $wpdb;
		$t = esc_sql( self::projects_table() );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$row = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM `{$t}` WHERE share_token = %s", $token ), ARRAY_A );
		return $row ? self::decode_project( $row ) : null;
	}

	public static function get_projects( $args = [] ) {
		global $wpdb;
		$t      = esc_sql( self::projects_table() );
		$sql    = "SELECT * FROM `{$t}` WHERE 1=1";
		$params = [];
		if ( ! empty( $args['status'] ) )       { $sql .= ' AND status = %s';       $params[] = $args['status']; }
		if ( ! empty( $args['client_email'] ) ) { $sql .= ' AND client_email = %s'; $params[] = $args['client_email']; }
		$sql .= ' ORDER BY created_at DESC';
		if ( $params ) {
			// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
			$sql = $wpdb->prepare( $sql, ...$params );
		}
		// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, PluginCheck.Security.DirectDB.UnescapedDBParameter
		$res = $wpdb->get_results( $sql, ARRAY_A );
		return is_array( $res ) ? array_map( [ __CLASS__, 'decode_project' ], $res ) : [];
	}

	public static function update_project( $id, $data ) {
		global $wpdb;
		$u = [ 'updated_at' => current_time( 'mysql' ) ];
		foreach ( [ 'title', 'client_name', 'client_email', 'status' ] as $k ) {
			if ( isset( $data[ $k ] ) ) $u[ $k ] = sanitize_text_field( $data[ $k ] );
		}
		if ( isset( $data['allowed_pages'] ) ) $u['allowed_pages'] = wp_json_encode( $data['allowed_pages'] );
		if ( isset( $data['settings'] ) )      $u['settings']      = wp_json_encode( $data['settings'] );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$result = $wpdb->update( self::projects_table(), $u, [ 'id' => $id ] );
		if ( false === $result ) {
            self::_debug_log( 'CCFE: Failed to update project ' . intval( $id ) . '. Last DB error: ' . $wpdb->last_error );
		}
		return self::get_project( $id );
	}

	public static function delete_project( $id ) {
		global $wpdb;
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->delete( self::annotations_table(), [ 'project_id' => $id ] );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		return $wpdb->delete( self::projects_table(), [ 'id' => $id ] );
	}

	private static function decode_project( $row ) {
		$row['allowed_pages'] = json_decode( $row['allowed_pages'] ?? '[]', true ) ?: [];
		$row['settings']      = json_decode( $row['settings'] ?? '{}', true ) ?: [];
		return $row;
	}

	/* ── ANNOTATION CRUD ── */

    public static function create_annotation( $d ) {
        global $wpdb;
        if ( empty( $d['project_id'] ) ) {
            self::_debug_log( 'CCFE: Annotation creation failed — project_id is required.' );
            return null;
        }
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$wpdb->insert(
			self::annotations_table(),
			[
				'project_id'            => intval( $d['project_id'] ?? 0 ),
				'page_url'              => esc_url_raw( $d['page_url'] ?? '' ),
				'page_path'             => untrailingslashit( sanitize_text_field( $d['page_path'] ?? '' ) ) ?: '/',
				'type'                  => sanitize_text_field( $d['type'] ?? 'pin' ),
				'element_selector'      => sanitize_text_field( $d['element_selector'] ?? '' ),
				'elementor_data_id'     => sanitize_text_field( $d['elementor_data_id'] ?? '' ),
				'element_tag'           => sanitize_text_field( $d['element_tag'] ?? '' ),
				'element_text'          => sanitize_text_field( substr( $d['element_text'] ?? '', 0, 500 ) ),
				'element_fingerprint'   => sanitize_text_field( $d['element_fingerprint'] ?? '' ),
				'anchor_x_pct'          => floatval( $d['anchor_x_pct'] ?? 0 ),
				'anchor_y_pct'          => floatval( $d['anchor_y_pct'] ?? 0 ),
				'width_pct'             => floatval( $d['width_pct'] ?? 0 ),
				'height_pct'            => floatval( $d['height_pct'] ?? 0 ),
				'end_element_selector'  => sanitize_text_field( $d['end_element_selector'] ?? '' ),
				'end_elementor_data_id' => sanitize_text_field( $d['end_elementor_data_id'] ?? '' ),
				'end_anchor_x_pct'      => floatval( $d['end_anchor_x_pct'] ?? 0 ),
				'end_anchor_y_pct'      => floatval( $d['end_anchor_y_pct'] ?? 0 ),
				'draw_data'             => $d['draw_data'] ?? null,
				'comment_text'          => wp_kses_post( $d['comment_text'] ?? '' ),
				'client_name'           => sanitize_text_field( $d['client_name'] ?? 'Client' ),
				'status'                => 'pending',
				'priority'              => sanitize_text_field( $d['priority'] ?? 'medium' ),
				'meta_data'             => isset( $d['meta_data'] ) ? ( is_array( $d['meta_data'] ) ? wp_json_encode( $d['meta_data'] ) : $d['meta_data'] ) : null,
				'color'                 => sanitize_text_field( $d['color'] ?? '' ),
				'context_title'         => sanitize_text_field( $d['context_title'] ?? '' ),
				'viewport_width'        => intval( $d['viewport_width'] ?? 0 ),
				'viewport_height'       => intval( $d['viewport_height'] ?? 0 ),
				'scroll_y_pct'          => floatval( $d['scroll_y_pct'] ?? 0 ),
				'created_at'            => current_time( 'mysql' ),
				'updated_at'            => current_time( 'mysql' ),
			]
		);
		if ( ! $wpdb->insert_id ) {
            self::_debug_log( 'CCFE: Failed to create annotation. Last DB error: ' . $wpdb->last_error );
			return null;
		}
		return self::get_annotation( $wpdb->insert_id );
	}

	public static function get_annotation( $id ) {
		global $wpdb;
		$t = esc_sql( self::annotations_table() );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$row = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM `{$t}` WHERE id = %d", $id ), ARRAY_A );
		return $row ? self::decode_annotation( $row ) : null;
	}

	public static function get_annotations( $args = [] ) {
		global $wpdb;
		$t      = esc_sql( self::annotations_table() );
		$sql    = "SELECT * FROM `{$t}` WHERE 1=1";
		$params = [];
		if ( ! empty( $args['project_id'] ) ) { $sql .= ' AND project_id = %d'; $params[] = (int) $args['project_id']; }
		if ( ! empty( $args['page_path'] ) ) {
			$path = untrailingslashit( $args['page_path'] );
			if ( $path === '' ) $path = '/';
			$sql .= ' AND page_path = %s';
			$params[] = $path;
		}
		if ( ! empty( $args['status'] ) )     { $sql .= ' AND status = %s';     $params[] = $args['status']; }
		if ( ! empty( $args['type'] ) )       { $sql .= ' AND type = %s';       $params[] = $args['type']; }
		$sql .= ' ORDER BY created_at ASC';
		if ( $params ) {
			// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
			$sql = $wpdb->prepare( $sql, ...$params );
		}
		// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, PluginCheck.Security.DirectDB.UnescapedDBParameter
		$res = $wpdb->get_results( $sql, ARRAY_A );
		return is_array( $res ) ? array_map( [ __CLASS__, 'decode_annotation' ], $res ) : [];
	}

	private static function decode_annotation( $row ) {
		if ( isset( $row['meta_data'] ) ) {
			$row['meta_data'] = json_decode( $row['meta_data'], true ) ?: [];
		}
		return $row;
	}

	public static function update_annotation( $id, $data ) {
		global $wpdb;
		$u      = [ 'updated_at' => current_time( 'mysql' ) ];
		$fields = [ 'status', 'priority', 'comment_text', 'meta_data', 'color', 'context_title', 'anchor_x_pct', 'anchor_y_pct', 'width_pct', 'height_pct', 'end_anchor_x_pct', 'end_anchor_y_pct' ];
		foreach ( $fields as $f ) {
			if ( ! isset( $data[ $f ] ) ) continue;
			if ( false !== strpos( $f, 'pct' ) ) {
				$u[ $f ] = floatval( $data[ $f ] );
			} elseif ( 'comment_text' === $f ) {
				$u[ $f ] = wp_kses_post( $data[ $f ] );
			} elseif ( 'meta_data' === $f ) {
				$u[ $f ] = is_array( $data[ $f ] ) ? wp_json_encode( $data[ $f ] ) : $data[ $f ];
			} else {
				$u[ $f ] = sanitize_text_field( $data[ $f ] );
			}
		}
		if ( isset( $data['status'] ) && 'resolved' === $data['status'] ) {
			$u['resolved_by'] = get_current_user_id();
			$u['resolved_at'] = current_time( 'mysql' );
		}
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$result = $wpdb->update( self::annotations_table(), $u, [ 'id' => $id ] );
		if ( false === $result ) {
            self::_debug_log( 'CCFE: Failed to update annotation ' . intval( $id ) . '. Last DB error: ' . $wpdb->last_error );
		}
		return self::get_annotation( $id );
	}

	public static function delete_annotation( $id ) {
		global $wpdb;
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		return $wpdb->delete( self::annotations_table(), [ 'id' => $id ] );
	}

    public static function get_annotation_stats( $project_id = 0 ) {
		global $wpdb;
		$t = esc_sql( self::annotations_table() );
		if ( $project_id ) {
			// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$rows = $wpdb->get_results( $wpdb->prepare( "SELECT status, COUNT(*) as c FROM `{$t}` WHERE project_id = %d GROUP BY status", $project_id ), ARRAY_A );
		} else {
			// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$rows = $wpdb->get_results( "SELECT status, COUNT(*) as c FROM `{$t}` GROUP BY status", ARRAY_A );
		}
		$s = [ 'total' => 0, 'pending' => 0, 'in_progress' => 0, 'resolved' => 0, 'rejected' => 0 ];
		if ( is_array( $rows ) ) {
			foreach ( $rows as $r ) {
				$s[ $r['status'] ] = (int) $r['c'];
				$s['total']       += (int) $r['c'];
			}
		}
		return $s;
	}
}
