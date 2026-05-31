<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class CCFE_Rest_API {
    private static $instance = null;
    const NS = 'ccfe/v1';

    public static function instance() {
        if ( null === self::$instance ) { self::$instance = new self(); }
        return self::$instance;
    }

    private function __construct() {
        add_action( 'rest_api_init', [ $this, 'register_routes' ] );
    }

    public function register_routes() {
        /* ── Projects (auth required) ─────────────────────── */
        register_rest_route( self::NS, '/projects', [
            [ 'methods' => 'GET',  'callback' => [ $this, 'list_projects' ],  'permission_callback' => [ $this, 'admin_check' ] ],
            [ 'methods' => 'POST', 'callback' => [ $this, 'create_project' ], 'permission_callback' => [ $this, 'admin_check' ] ],
        ]);
        register_rest_route( self::NS, '/projects/(?P<id>\d+)', [
            [ 'methods' => 'GET',    'callback' => [ $this, 'get_project' ],    'permission_callback' => [ $this, 'admin_check' ] ],
            [ 'methods' => 'PUT',    'callback' => [ $this, 'update_project' ], 'permission_callback' => [ $this, 'admin_check' ] ],
            [ 'methods' => 'DELETE', 'callback' => [ $this, 'delete_project' ], 'permission_callback' => [ $this, 'admin_check' ] ],
        ]);
        register_rest_route( self::NS, '/projects/(?P<id>\d+)/annotations', [
            [ 'methods' => 'GET', 'callback' => [ $this, 'project_annotations' ], 'permission_callback' => [ $this, 'admin_check' ] ],
        ]);

        /* ── Annotations (auth required) ──────────────────── */
        register_rest_route( self::NS, '/annotations/(?P<id>\d+)', [
            [ 'methods' => 'PUT',    'callback' => [ $this, 'update_annotation' ], 'permission_callback' => [ $this, 'admin_check' ] ],
            [ 'methods' => 'DELETE', 'callback' => [ $this, 'delete_annotation' ], 'permission_callback' => [ $this, 'admin_check' ] ],
        ]);

        /* ── Review (public with token) ───────────────────── */
        register_rest_route( self::NS, '/review/(?P<token>[a-zA-Z0-9]+)', [
            [ 'methods' => 'GET', 'callback' => [ $this, 'validate_token' ], 'permission_callback' => '__return_true' ],
        ]);
        register_rest_route( self::NS, '/review/(?P<token>[a-zA-Z0-9]+)/annotations', [
            [ 'methods' => 'GET',  'callback' => [ $this, 'review_get_annotations' ],  'permission_callback' => '__return_true' ],
            [ 'methods' => 'POST', 'callback' => [ $this, 'review_create_annotation' ], 'permission_callback' => '__return_true' ],
        ]);
        register_rest_route( self::NS, '/review/(?P<token>[a-zA-Z0-9]+)/annotations/(?P<id>\d+)', [
            [ 'methods' => 'PUT',    'callback' => [ $this, 'review_update_annotation' ], 'permission_callback' => '__return_true' ],
            [ 'methods' => 'DELETE', 'callback' => [ $this, 'review_delete_annotation' ], 'permission_callback' => '__return_true' ],
        ]);

        /* ── Stats ────────────────────────────────────────── */
        register_rest_route( self::NS, '/stats', [
            [ 'methods' => 'GET', 'callback' => [ $this, 'get_stats' ], 'permission_callback' => [ $this, 'admin_check' ] ],
        ]);

        /* ── Clients (auth required) ───────────────────────── */
        register_rest_route( self::NS, '/clients', [
            [ 'methods' => 'GET',  'callback' => [ $this, 'list_clients' ],  'permission_callback' => [ $this, 'admin_check' ] ],
            [ 'methods' => 'POST', 'callback' => [ $this, 'create_client' ], 'permission_callback' => [ $this, 'admin_check' ] ],
        ]);
        register_rest_route( self::NS, '/clients/(?P<id>\d+)', [
            [ 'methods' => 'DELETE', 'callback' => [ $this, 'delete_client' ], 'permission_callback' => [ $this, 'admin_check' ] ],
        ]);

        register_rest_route( self::NS, '/pages', [
            [ 'methods' => 'GET', 'callback' => [ $this, 'list_site_pages' ], 'permission_callback' => 'is_user_logged_in' ],
        ]);

        /* ── Path-to-Edit URL resolver ──────────────────────── */
        register_rest_route( self::NS, '/resolve-paths', [
            'methods' => 'GET',
            'callback' => [ $this, 'resolve_paths' ],
            'permission_callback' => [ $this, 'admin_check' ],
            'args' => [
                'paths' => [
                    'required' => true,
                    'type' => 'array',
                    'items' => [ 'type' => 'string' ],
                ],
            ],
        ]);

        /* ── Settings (auth required) ───────────────────────── */
        register_rest_route( self::NS, '/settings', [
            [ 'methods' => 'POST', 'callback' => [ $this, 'update_settings' ], 'permission_callback' => [ $this, 'admin_check' ] ],
        ]);
    }

    public function admin_check() {
        return current_user_can( 'manage_options' );
    }

    /* ── Client Endpoints ──────────────────────────────────── */

    public function list_clients( $req ) {
        $users = get_users( [ 'role' => 'ccfe_client' ] );
        $clients = [];
        foreach ( $users as $u ) {
            $clients[] = [
                'id' => $u->ID,
                'name' => $u->display_name,
                'email' => $u->user_email,
                'username' => $u->user_login,
                'registered' => $u->user_registered
            ];
        }
        return rest_ensure_response( $clients );
    }

    public function create_client( $req ) {
        $data = $req->get_json_params();
        $email = sanitize_email( $data['email'] ?? '' );
        $name = sanitize_text_field( $data['name'] ?? '' );
        $password = $data['password'] ?? wp_generate_password( 12, false );

        if ( empty( $email ) || ! is_email( $email ) ) {
            return new \WP_Error( 'invalid_email', 'A valid email is required.', [ 'status' => 400 ] );
        }

        if ( email_exists( $email ) ) {
            return new \WP_Error( 'email_exists', 'This email is already in use.', [ 'status' => 400 ] );
        }

        // Generate username from email
        $username = sanitize_user( current( explode( '@', $email ) ), true );
        if ( username_exists( $username ) ) {
            $username .= '_' . wp_rand( 1000, 9999 );
        }

        $user_id = wp_create_user( $username, $password, $email );
        if ( is_wp_error( $user_id ) ) {
            return $user_id;
        }

        $user = new WP_User( $user_id );
        $user->set_role( 'ccfe_client' );
        
        if ( ! empty( $name ) ) {
            wp_update_user( [ 'ID' => $user_id, 'display_name' => $name, 'first_name' => $name ] );
        }

        /**
         * Fires after a new client user is created.
         * Pro plugin can hook here to send welcome emails, etc.
         *
         * @param int    $user_id  The new user ID.
         * @param string $password The generated password.
         */
        do_action( 'ccfe_client_created', $user_id, $password );

        return rest_ensure_response( [
            'id'       => $user_id,
            'name'     => $name,
            'email'    => $email,
            'username' => $username,
        ] );
    }

    public function delete_client( $req ) {
        require_once( ABSPATH . 'wp-admin/includes/user.php' );
        $id = (int) $req['id'];
        if ( ! current_user_can( 'delete_users' ) ) {
            return new \WP_Error( 'delete_failed', 'You do not have permission to delete users.', [ 'status' => 403 ] );
        }
        if ( ! wp_delete_user( $id ) ) {
            return new \WP_Error( 'delete_failed', 'Could not delete client.', [ 'status' => 500 ] );
        }
        return rest_ensure_response( [ 'deleted' => true ] );
    }

    /* ── Project Endpoints ─────────────────────────────────── */

    public function list_projects( $req ) {
        $args = [ 'status' => $req->get_param( 'status' ) ];
        
        // If logged in as a restricted client, only show projects assigned to their email
        if ( ! current_user_can( 'edit_posts' ) ) {
            $user = wp_get_current_user();
            $args['client_email'] = $user->user_email;
        }

        $projects = CCFE_Database::get_projects( $args );
        foreach ( $projects as &$p ) {
            $p['stats'] = CCFE_Database::get_annotation_stats( $p['id'] );
            $p['share_url'] = home_url( '?ccfe_review=' . $p['share_token'] );
        }
        return rest_ensure_response( $projects );
    }

    public function list_site_pages() {
        if ( ! is_user_logged_in() ) {
            return new \WP_Error( 'unauthorized', 'Login required.', [ 'status' => 401 ] );
        }
        $pages = get_posts( [
            'post_type' => [ 'page', 'post' ],
            'posts_per_page' => -1,
            'post_status' => 'publish'
        ] );
        
        $res = [];
        foreach ( $pages as $p ) {
            $res[] = [
                'id' => $p->ID,
                'title' => $p->post_title,
                'url' => get_permalink( $p->ID )
            ];
        }
        return rest_ensure_response( $res );
    }

    public function create_project( $req ) {
        $data = $req->get_json_params();

        // If logged in as a client, auto-assign their identity to the project
        if ( ! current_user_can( 'edit_posts' ) ) {
            $user = wp_get_current_user();
            $data['client_name'] = $user->display_name;
            $data['client_email'] = $user->user_email;
        }

        $project = CCFE_Database::create_project( $data );
        if ( ! $project ) return new \WP_Error( 'create_failed', 'Could not create session.', [ 'status' => 500 ] );
        
        // Save defaults globally only for admins
        if ( current_user_can( 'edit_posts' ) ) {
            if ( ! empty( $data['client_name'] ) ) update_option( 'ccfe_default_reviewer_name', sanitize_text_field( $data['client_name'] ) );
            if ( ! empty( $data['client_email'] ) ) update_option( 'ccfe_default_reviewer_email', sanitize_email( $data['client_email'] ) );
        }

        $project['share_url'] = home_url( '?ccfe_review=' . $project['share_token'] );
        $project['stats'] = CCFE_Database::get_annotation_stats( $project['id'] );
        do_action( 'ccfe_project_created', $project );
        return rest_ensure_response( $project );
    }

    public function get_project( $req ) {
        $p = CCFE_Database::get_project( $req['id'] );
        if ( ! $p ) return new \WP_Error( 'not_found', 'Project not found.', [ 'status' => 404 ] );
        $p['share_url'] = home_url( '?ccfe_review=' . $p['share_token'] );
        $p['stats'] = CCFE_Database::get_annotation_stats( $p['id'] );
        return rest_ensure_response( $p );
    }

    public function update_project( $req ) {
        $p = CCFE_Database::update_project( $req['id'], $req->get_json_params() );
        return $p ? rest_ensure_response( $p ) : new \WP_Error( 'update_failed', '', [ 'status' => 500 ] );
    }

    public function delete_project( $req ) {
        $result = CCFE_Database::delete_project( $req['id'] );
        if ( ! $result ) {
            return new \WP_Error( 'delete_failed', 'Could not delete project.', [ 'status' => 500 ] );
        }
        return rest_ensure_response( [ 'deleted' => true ] );
    }

    public function project_annotations( $req ) {
        $args = [ 'project_id' => $req['id'] ];
        if ( $req->get_param( 'page_path' ) ) $args['page_path'] = $req->get_param( 'page_path' );
        if ( $req->get_param( 'status' ) )    $args['status']    = $req->get_param( 'status' );
        return rest_ensure_response( CCFE_Database::get_annotations( $args ) );
    }

    /* ── Annotation Endpoints ──────────────────────────────── */

    public function update_annotation( $req ) {
        $a = CCFE_Database::update_annotation( $req['id'], $req->get_json_params() );
        if ( $a ) {
            do_action( 'ccfe_annotation_updated', $a );
            return rest_ensure_response( $a );
        }
        return new \WP_Error( 'update_failed', '', [ 'status' => 500 ] );
    }

    public function delete_annotation( $req ) {
        $result = CCFE_Database::delete_annotation( $req['id'] );
        if ( ! $result ) {
            return new \WP_Error( 'delete_failed', 'Could not delete annotation.', [ 'status' => 500 ] );
        }
        do_action( 'ccfe_annotation_deleted', $req['id'] );
        return rest_ensure_response( [ 'deleted' => true ] );
    }

    /* ── Review Endpoints (public) ─────────────────────────── */

    private function resolve_token( $token ) {
        $p = CCFE_Database::get_project_by_token( $token );
        if ( ! $p || $p['status'] !== 'active' ) return null;
        return $p;
    }

    public function validate_token( $req ) {
        $p = $this->resolve_token( $req['token'] );
        if ( ! $p ) return new \WP_Error( 'invalid_token', 'Invalid or expired review link.', [ 'status' => 403 ] );
        return rest_ensure_response( [
            'project_id'   => $p['id'],
            'title'        => $p['title'],
            'client_name'  => $p['client_name'],
            'status'       => $p['status'],
        ]);
    }

    public function review_get_annotations( $req ) {
        $p = $this->resolve_token( $req['token'] );
        if ( ! $p ) return new \WP_Error( 'invalid_token', 'Invalid review link.', [ 'status' => 403 ] );
        $args = [ 'project_id' => $p['id'] ];
        if ( $req->get_param( 'page_path' ) ) $args['page_path'] = $req->get_param( 'page_path' );
        return rest_ensure_response( CCFE_Database::get_annotations( $args ) );
    }

    public function review_create_annotation( $req ) {
        $p = $this->resolve_token( $req['token'] );
        if ( ! $p ) return new \WP_Error( 'invalid_token', 'Invalid review link.', [ 'status' => 403 ] );
        $data = $req->get_json_params();
        $data['project_id'] = $p['id'];

        // Sanitize selector fields
        if ( isset( $data['element_selector'] ) ) {
            $data['element_selector'] = sanitize_text_field( $data['element_selector'] );
        }
        if ( isset( $data['end_element_selector'] ) ) {
            $data['end_element_selector'] = sanitize_text_field( $data['end_element_selector'] );
        }

        // Validate draw_data is valid JSON before storing
        if ( isset( $data['draw_data'] ) && ! empty( $data['draw_data'] ) ) {
            $decoded = json_decode( $data['draw_data'] );
            if ( json_last_error() !== JSON_ERROR_NONE ) {
                $data['draw_data'] = null;
            }
        }

        $a = CCFE_Database::create_annotation( $data );
        
        if ( $a ) {
            /**
             * Action: fires after a client annotation is created.
             *
             * @param array $a       The created annotation data.
             * @param array $p       The project data.
             */
            do_action( 'ccfe_annotation_created', $a, $p );
            $this->send_notification_email( $p, $a );
            return rest_ensure_response( $a );
        }
        
        return new \WP_Error( 'create_failed', '', [ 'status' => 500 ] );
    }

    private function send_notification_email( $project, $annotation ) {
        $to = get_option( 'ccfe_admin_email' );
        if ( empty( $to ) ) return;

        $subject = sprintf(
            /* translators: 1: client name 2: project title */
            __( 'New Feedback from %1$s on %2$s', 'previu-visual-client-feedback-for-elementor' ),
            esc_html( $project['client_name'] ),
            esc_html( $project['title'] )
        );
        $client_name = $project['client_name'] ? wp_strip_all_tags( $project['client_name'] ) : __( 'A client', 'previu-visual-client-feedback-for-elementor' );

        $message  = __( "Hello,\n\n", 'previu-visual-client-feedback-for-elementor' );
        $message .= sprintf(
            /* translators: 1: client name 2: project title */
            __( '%1$s just left a new piece of feedback on the "%2$s" review session.', 'previu-visual-client-feedback-for-elementor' ),
            $client_name,
            wp_strip_all_tags( $project['title'] )
        ) . "\n\n";

        if ( ! empty( $annotation['comment_text'] ) ) {
            $message .= sprintf(
                /* translators: %s: annotation comment text */
                __( 'Comment: "%s"', 'previu-visual-client-feedback-for-elementor' ),
                wp_strip_all_tags( $annotation['comment_text'] )
            ) . "\n\n";
        }

        $message .= __( 'Page: ', 'previu-visual-client-feedback-for-elementor' ) . home_url( $annotation['page_path'] ) . "\n\n";
        $message .= __( 'Log into your WordPress dashboard and open Elementor to review the feedback.', 'previu-visual-client-feedback-for-elementor' ) . "\n";

        wp_mail( $to, $subject, $message );
    }

    public function update_settings( $req ) {
        $data = $req->get_json_params();
        if ( isset( $data['admin_email'] ) ) {
            update_option( 'ccfe_admin_email', sanitize_email( $data['admin_email'] ) );
        }
        if ( isset( $data['welcome_title'] ) ) {
            update_option( 'ccfe_welcome_title', sanitize_text_field( $data['welcome_title'] ) );
        }
        if ( isset( $data['welcome_message'] ) ) {
            update_option( 'ccfe_welcome_message', sanitize_text_field( $data['welcome_message'] ) );
        }
        if ( isset( $data['agency_name'] ) ) {
            update_option( 'ccfe_portal_brand_name', sanitize_text_field( $data['agency_name'] ) );
        }

        /**
          * Fires when settings are saved from the admin dashboard.
          * The Pro plugin hooks here to persist white-label, Slack, file-upload, etc.
          *
          * @param array $data The full settings payload from the REST request.
          */
        do_action( 'ccfe_save_pro_settings', $data );

        return rest_ensure_response( [ 'success' => true ] );
    }

    public function review_update_annotation( $req ) {
        $p = $this->resolve_token( $req['token'] );
        if ( ! $p ) return new \WP_Error( 'invalid_token', 'Invalid review link.', [ 'status' => 403 ] );
        $ann = CCFE_Database::get_annotation( $req['id'] );
        if ( ! $ann || (int)$ann['project_id'] !== (int)$p['id'] ) {
            return new \WP_Error( 'not_found', '', [ 'status' => 404 ] );
        }
        // Whitelist: clients may only update comment_text and color
        $raw  = $req->get_json_params();
        $data = [];
        if ( isset( $raw['comment_text'] ) ) $data['comment_text'] = $raw['comment_text'];
        if ( isset( $raw['color'] ) )        $data['color']        = $raw['color'];
        $a = CCFE_Database::update_annotation( $req['id'], $data );
        do_action( 'ccfe_annotation_updated', $a );
        return $a ? rest_ensure_response( $a ) : new \WP_Error( 'update_failed', '', [ 'status' => 500 ] );
    }

    public function review_delete_annotation( $req ) {
        $p = $this->resolve_token( $req['token'] );
        if ( ! $p ) return new \WP_Error( 'invalid_token', 'Invalid review link.', [ 'status' => 403 ] );
        $ann = CCFE_Database::get_annotation( $req['id'] );
        if ( ! $ann || (int)$ann['project_id'] !== (int)$p['id'] ) {
            return new \WP_Error( 'not_found', '', [ 'status' => 404 ] );
        }
        CCFE_Database::delete_annotation( $req['id'] );
        do_action( 'ccfe_annotation_deleted', $req['id'] );
        return rest_ensure_response( [ 'deleted' => true ] );
    }

    /* ── Path resolution ────────────────────────────────────── */

    public function resolve_paths( $req ) {
        $paths = $req->get_param( 'paths' );
        if ( ! is_array( $paths ) ) $paths = [ $paths ];
        $result = [];
        foreach ( $paths as $path ) {
            if ( ! is_string( $path ) || $path === '' ) continue;
            $path      = $path !== '/' ? untrailingslashit( $path ) : '/';
            $full_url  = home_url( $path );
            $post_id   = url_to_postid( $full_url );
            if ( $post_id ) {
                $result[ $path ] = admin_url( 'post.php?post=' . $post_id . '&action=elementor' );
            } else {
                $result[ $path ] = null;
            }
        }
        return rest_ensure_response( $result );
    }

    /* ── Stats ─────────────────────────────────────────────── */

    public function get_stats( $req ) {
        return rest_ensure_response( CCFE_Database::get_annotation_stats() );
    }
}
