<?php
/**
 * Plugin Name: Feedspace Connector
 * Plugin URI: https://feedspace.io
 * Description: Connects your WordPress site to Feedspace for client feedback management. Enables media storage and API integration.
 * Version: 1.0.11
 * Author: Feedspace
 * Text Domain: feedspace
 */

if (!defined('ABSPATH')) exit;

define('FEEDSPACE_VERSION', '1.0.12');
define('FEEDSPACE_PLUGIN_FILE', __FILE__);

class FeedspaceConnector
{
    private static $instance = null;

    public static function getInstance()
    {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct()
    {
        add_action('rest_api_init', array($this, 'registerRoutes'));
        add_action('template_redirect', array($this, 'maybeInitPreview'));
        add_filter('upload_mimes', array($this, 'allowAdditionalMimeTypes'));
        add_action('admin_menu', array($this, 'addAdminMenu'));
        add_action('admin_init', array($this, 'registerSettings'));
        add_action('admin_enqueue_scripts', array($this, 'adminEnqueueScripts'));
        add_filter('wp_handle_upload_prefilter', array($this, 'handleUploadPrefilter'));

        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
    }

    public function maybeInitPreview()
    {
        $token = isset($_GET['feedspace_preview']) ? sanitize_text_field($_GET['feedspace_preview']) : '';
        if (empty($token)) return;

        nocache_headers();

        $config = $this->verifyPreviewToken($token);
        if (!$config) {
            wp_die('Invalid or expired preview link.', 'Feedspace Preview', array('response' => 403));
            return;
        }

        $this->enqueueWidgetAssets($config);
    }

    private function verifyPreviewToken($token)
    {
        $apiUrl = get_option('feedspace_api_url', '');
        if (empty($apiUrl)) return false;
        $verifyUrl = rtrim($apiUrl, '/') . '/api/widget/verify-token';

        $response = wp_remote_post($verifyUrl, array(
            'headers' => array('Content-Type' => 'application/json'),
            'body' => json_encode(array('token' => $token)),
            'timeout' => 15,
        ));

        if (is_wp_error($response)) return false;

        $body = json_decode(wp_remote_retrieve_body($response), true);
        if (!$body || empty($body['valid'])) return false;

        return $body;
    }

    private function enqueueWidgetAssets($config)
    {
        $widgetUrl = plugin_dir_url(__FILE__) . 'widget/feedspace-widget.js';
        $apiBaseUrl = get_option('feedspace_api_url', '');
        $wpApiUrl = get_bloginfo('url');
        $wpApiKey = get_option('feedspace_api_key');
        $pageUrl = home_url(add_query_arg(null, null));
        $isDebug = get_option('feedspace_debug_enabled') === '1';

        $inlineConfig = array(
            'apiUrl' => $apiBaseUrl,
            'token' => sanitize_text_field($_GET['feedspace_preview']),
            'projectId' => $config['projectId'],
            'primaryColor' => $config['primaryColor'],
            'wpApiUrl' => $wpApiUrl,
            'wpApiKey' => $wpApiKey,
            'pageUrl' => $pageUrl,
        );

        wp_enqueue_script(
            'feedspace-widget',
            $widgetUrl,
            array(),
            FEEDSPACE_VERSION,
            true
        );

        $debugPrefix = $isDebug ? 'window.__feedspaceDebug = window.__feedspaceDebug || []; function fd(m,d){ window.__feedspaceDebug.push({msg:m,data:d,time:Date.now()}); console.log("[Feedspace]", m, d||""); } fd("Plugin: widget enqueued");' : '';

        wp_add_inline_script('feedspace-widget', '
            ' . $debugPrefix . '
            document.addEventListener("DOMContentLoaded", function() {
                ' . ($isDebug ? 'fd("DOMContentLoaded fired");' : '') . '
                if (window.FeedspaceWidget) {
                    ' . ($isDebug ? 'fd("FeedspaceWidget found, calling init()");' : '') . '
                    window.FeedspaceWidget.init(' . json_encode($inlineConfig) . ');
                } else {
                    ' . ($isDebug ? 'fd("FeedspaceWidget NOT found — script failed to execute");' : '') . '
                }
            });
        ');

        if ($isDebug) {
            add_action('wp_footer', array($this, 'renderDebugPanel'));
        }

        wp_enqueue_style(
            'feedspace-google-fonts',
            'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',
            array(),
            null
        );
    }

    public function renderDebugPanel()
    {
        ?>
        <style>
            #feedspace-debug { position:fixed; top:0; left:0; right:0; z-index:999999; font:12px/1.4 monospace; background:rgba(0,0,0,0.85); color:#e5e7eb; padding:8px 12px; max-height:40vh; overflow-y:auto; }
            #feedspace-debug .fd-title { font-weight:700; font-size:13px; color:#f59e0b; cursor:pointer; user-select:none; }
            #feedspace-debug .fd-entry { padding:2px 0; border-bottom:1px solid rgba(255,255,255,0.05); }
            #feedspace-debug .fd-time { color:#6b7280; margin-right:8px; }
            #feedspace-debug .fd-ok { color:#34d399; }
            #feedspace-debug .fd-fail { color:#f87171; }
            #feedspace-debug .fd-body { display:none; margin-top:4px; }
            #feedspace-debug.fd-open .fd-body { display:block; }
            #feedspace-debug .fd-check { display:inline-flex; align-items:center; gap:6px; margin:6px 12px 6px 0; padding:4px 8px; border-radius:4px; background:rgba(255,255,255,0.05); }
        </style>
        <div id="feedspace-debug">
            <div class="fd-title" onclick="this.parentElement.classList.toggle('fd-open')">🐛 Feedspace Debug ▼</div>
            <div class="fd-body" id="feedspace-debug-body"></div>
        </div>
        <script>
        (function(){
            var panel = document.getElementById('feedspace-debug-body');
            var checks = document.createElement('div');
            checks.style.marginBottom = '6px';

            function addCheck(label, getter) {
                var el = document.createElement('span');
                el.className = 'fd-check';
                el.id = 'fd-check-' + label.replace(/\\s+/g, '-').toLowerCase();
                el.innerHTML = '<span class="fd-fail">⏳</span> ' + label;
                checks.appendChild(el);
                return el;
            }

            var cScript = addCheck('Widget script loaded', function(){ return !!window.FeedspaceWidget; });
            var cInit = addCheck('Widget initialized', function(){ return !!document.querySelector('.feedspace-name-modal, #feedspace-widget-root'); });
            var cModal = addCheck('Name modal visible', function(){ return !!document.querySelector('.feedspace-name-modal'); });
            var cToolbar = addCheck('Toolbar visible', function(){ return !!document.querySelector('#feedspace-widget-root'); });

            panel.appendChild(checks);

            var logDiv = document.createElement('div');
            logDiv.id = 'fd-log';
            panel.appendChild(logDiv);

            window.__feedspaceDebug = window.__feedspaceDebug || [];

            function updateCheck(el, ok, msg) {
                el.innerHTML = (ok ? '<span class="fd-ok">✅</span>' : '<span class="fd-fail">❌</span>') + ' ' + msg;
            }

            function refresh() {
                updateCheck(cScript, !!window.FeedspaceWidget, 'Widget script loaded: ' + (window.FeedspaceWidget ? 'yes' : 'NO'));
                var hasUI = !!document.querySelector('.feedspace-name-modal, #feedspace-widget-root');
                updateCheck(cInit, hasUI, 'Widget UI ' + (hasUI ? 'found' : 'not found'));
                var hasModal = !!document.querySelector('.feedspace-name-modal');
                updateCheck(cModal, hasModal, 'Name modal ' + (hasModal ? 'visible' : 'not found'));
                var hasToolbar = !!document.querySelector('#feedspace-widget-root');
                updateCheck(cToolbar, hasToolbar, 'Toolbar ' + (hasToolbar ? 'visible' : 'not found'));
            }

            function renderLogs() {
                logDiv.innerHTML = window.__feedspaceDebug.map(function(e){
                    var t = new Date(e.time);
                    var ts = t.getHours().toString().padStart(2,'0') + ':' + t.getMinutes().toString().padStart(2,'0') + ':' + t.getSeconds().toString().padStart(2,'0');
                    return '<div class="fd-entry"><span class="fd-time">[' + ts + ']</span>' + e.msg + (e.data ? ' ' + JSON.stringify(e.data) : '') + '</div>';
                }).join('');
                logDiv.scrollTop = logDiv.scrollHeight;
            }

            var origPush = window.__feedspaceDebug.push.bind(window.__feedspaceDebug);
            window.__feedspaceDebug.push = function() {
                origPush.apply(window.__feedspaceDebug, arguments);
                renderLogs();
                refresh();
            };

            refresh();
            renderLogs();

            setInterval(refresh, 2000);

            // check localStorage
            setTimeout(function(){
                var name = localStorage.getItem('feedspace_client_name');
                window.__feedspaceDebug.push({msg:'localStorage feedspace_client_name: ' + (name ? '"' + name + '"' : 'null'), data:null, time:Date.now()});
            }, 500);
        })();
        </script>
        <?php
    }

    public function activate()
    {
        $this->createFeedbackTable();
        add_option('feedspace_version', FEEDSPACE_VERSION);
        add_option('feedspace_api_key', wp_generate_password(32, false));
        add_option('feedspace_api_url', '');
    }

    public function deactivate()
    {
        delete_option('feedspace_version');
    }

    private function createFeedbackTable()
    {
        global $wpdb;
        $charsetCollate = $wpdb->get_charset_collate();
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';

        $feedbackTable = $wpdb->prefix . 'feedspace_feedback';
        $sql1 = "CREATE TABLE IF NOT EXISTS $feedbackTable (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            feedspace_id VARCHAR(36) NOT NULL,
            file_url TEXT NOT NULL,
            file_type VARCHAR(100) DEFAULT '',
            file_name VARCHAR(255) DEFAULT '',
            file_size INT DEFAULT 0,
            project_id VARCHAR(36) DEFAULT '',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            expires_at DATETIME DEFAULT NULL,
            INDEX idx_feedspace_id (feedspace_id),
            INDEX idx_project_id (project_id),
            INDEX idx_expires_at (expires_at)
        ) $charsetCollate;";
        dbDelta($sql1);

        $annotationsTable = $wpdb->prefix . 'feedspace_annotations';
        $sql2 = "CREATE TABLE IF NOT EXISTS $annotationsTable (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            annotation_id VARCHAR(36) NOT NULL,
            project_id VARCHAR(36) NOT NULL,
            type VARCHAR(20) NOT NULL DEFAULT 'pin',
            content TEXT NOT NULL,
            page_url TEXT NOT NULL,
            selector TEXT,
            coordinates_x REAL,
            coordinates_y REAL,
            coordinates_x_end REAL,
            coordinates_y_end REAL,
            width REAL,
            height REAL,
            draw_data TEXT,
            element_dna TEXT,
            viewport_width INT DEFAULT 0,
            viewport_height INT DEFAULT 0,
            device VARCHAR(20) DEFAULT 'desktop',
            status VARCHAR(20) DEFAULT 'open',
            created_by VARCHAR(100) DEFAULT 'Anonymous',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_annotation_id (annotation_id),
            INDEX idx_project_id (project_id),
            INDEX idx_page_url (page_url)
        ) $charsetCollate;";
        dbDelta($sql2);
    }

    public function registerRoutes()
    {
        register_rest_route('feedspace/v1', '/status', array(
            'methods' => 'GET',
            'callback' => array($this, 'getStatus'),
            'permission_callback' => '__return_true',
        ));

        register_rest_route('feedspace/v1', '/media', array(
            'methods' => 'POST',
            'callback' => array($this, 'uploadMedia'),
            'permission_callback' => array($this, 'checkApiAuth'),
        ));

        register_rest_route('feedspace/v1', '/media/(?P<id>\d+)', array(
            'methods' => 'DELETE',
            'callback' => array($this, 'deleteMedia'),
            'permission_callback' => array($this, 'checkApiAuth'),
        ));

        register_rest_route('feedspace/v1', '/cleanup', array(
            'methods' => 'POST',
            'callback' => array($this, 'cleanupOldMedia'),
            'permission_callback' => array($this, 'checkApiAuth'),
        ));

        register_rest_route('feedspace/v1', '/toggle-feedback', array(
            'methods' => 'POST',
            'callback' => array($this, 'toggleFeedbackMode'),
            'permission_callback' => array($this, 'checkApiAuth'),
        ));

        register_rest_route('feedspace/v1', '/annotations', array(
            'methods' => 'POST',
            'callback' => array($this, 'createAnnotation'),
            'permission_callback' => array($this, 'checkApiAuth'),
        ));

        register_rest_route('feedspace/v1', '/annotations', array(
            'methods' => 'GET',
            'callback' => array($this, 'getAnnotations'),
            'permission_callback' => array($this, 'checkApiAuth'),
        ));

        register_rest_route('feedspace/v1', '/annotations/(?P<id>[a-f0-9-]+)', array(
            'methods' => 'PATCH',
            'callback' => array($this, 'updateAnnotation'),
            'permission_callback' => array($this, 'checkApiAuth'),
        ));

        register_rest_route('feedspace/v1', '/annotations/(?P<id>[a-f0-9-]+)', array(
            'methods' => 'DELETE',
            'callback' => array($this, 'deleteAnnotation'),
            'permission_callback' => array($this, 'checkApiAuth'),
        ));

        register_rest_route('feedspace/v1', '/annotations/counts', array(
            'methods' => 'GET',
            'callback' => array($this, 'getAnnotationCounts'),
            'permission_callback' => array($this, 'checkApiAuth'),
        ));
    }

    public function checkApiAuth($request)
    {
        $apiKey = $request->get_header('X-Feedspace-Key');
        $storedKey = get_option('feedspace_api_key');

        if (!$apiKey || !$storedKey) {
            return false;
        }

        return hash_equals($storedKey, $apiKey);
    }

    public function getStatus()
    {
        return new WP_REST_Response(array(
            'connected' => true,
            'version' => FEEDSPACE_VERSION,
            'wp_version' => get_bloginfo('version'),
            'site_name' => get_bloginfo('name'),
            'upload_max_size' => wp_max_upload_size(),
        ), 200);
    }

    public function uploadMedia($request)
    {
        $files = $request->get_file_params();

        if (empty($files) || !isset($files['file'])) {
            return new WP_Error('no_file', 'No file provided', array('status' => 400));
        }

        $file = $files['file'];
        $projectId = $request->get_param('project_id') ?: '';

        $uploadedFile = $this->handleUpload($file, $projectId);

        if (is_wp_error($uploadedFile)) {
            return $uploadedFile;
        }

        return new WP_REST_Response($uploadedFile, 200);
    }

    private function handleUpload($file, $projectId = '')
    {
        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/image.php';
        require_once ABSPATH . 'wp-admin/includes/media.php';

        $override = array(
            'test_form' => false,
            'unique_filename_callback' => function ($dir, $name, $ext) use ($projectId) {
                $prefix = 'feedspace_';
                if ($projectId) {
                    $prefix .= $projectId . '_';
                }
                return $prefix . uniqid() . $ext;
            },
        );

        $uploaded = wp_handle_upload($file, $override);

        if (isset($uploaded['error'])) {
            return new WP_Error('upload_failed', $uploaded['error'], array('status' => 500));
        }

        $attachmentId = wp_insert_attachment(array(
            'post_title' => sanitize_file_name($file['name']),
            'post_content' => '',
            'post_mime_type' => $file['type'],
            'guid' => $uploaded['url'],
        ), $uploaded['file']);

        if (!is_wp_error($attachmentId)) {
            $attachData = wp_generate_attachment_metadata($attachmentId, $uploaded['file']);
            wp_update_attachment_metadata($attachmentId, $attachData);
            wp_set_object_terms($attachmentId, 'feedspace-feedback', 'media_category', false);
        }

        global $wpdb;
        $tableName = $wpdb->prefix . 'feedspace_feedback';
        $feedspaceId = wp_generate_uuid4();

        $wpdb->insert($tableName, array(
            'feedspace_id' => $feedspaceId,
            'file_url' => $uploaded['url'],
            'file_type' => $file['type'],
            'file_name' => $file['name'],
            'file_size' => $file['size'],
            'project_id' => $projectId,
            'expires_at' => date('Y-m-d H:i:s', strtotime('+30 days')),
        ));

        return array(
            'id' => $attachmentId,
            'feedspace_id' => $feedspaceId,
            'url' => $uploaded['url'],
            'file_name' => $file['name'],
            'file_size' => $file['size'],
            'file_type' => $file['type'],
        );
    }

    public function deleteMedia($request)
    {
        $mediaId = (int) $request->get_param('id');

        if (!wp_delete_attachment($mediaId, true)) {
            return new WP_Error('delete_failed', 'Failed to delete media', array('status' => 500));
        }

        global $wpdb;
        $tableName = $wpdb->prefix . 'feedspace_feedback';
        $wpdb->delete($tableName, array('id' => $mediaId));

        return new WP_REST_Response(array('deleted' => true), 200);
    }

    public function cleanupOldMedia()
    {
        global $wpdb;
        $tableName = $wpdb->prefix . 'feedspace_feedback';
        $cutoff = date('Y-m-d H:i:s', strtotime('-30 days'));

        $oldMedia = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT id, file_url FROM $tableName WHERE expires_at IS NOT NULL AND expires_at < %s",
                $cutoff
            )
        );

        $cleaned = 0;
        foreach ($oldMedia as $media) {
            $attachmentId = attachment_url_to_postid($media->file_url);
            if ($attachmentId) {
                wp_delete_attachment($attachmentId, true);
            }
            $wpdb->delete($tableName, array('id' => $media->id));
            $cleaned++;
        }

        return new WP_REST_Response(array(
            'cleaned' => $cleaned,
            'message' => "Cleaned up $cleaned expired media files",
        ), 200);
    }

    public function toggleFeedbackMode($request)
    {
        $enabled = (bool) $request->get_param('enabled');
        update_option('feedspace_feedback_mode', $enabled ? 'enabled' : 'disabled');
        return new WP_REST_Response(array(
            'feedback_mode' => $enabled ? 'enabled' : 'disabled',
        ), 200);
    }

    public function createAnnotation($request)
    {
        global $wpdb;
        $tableName = $wpdb->prefix . 'feedspace_annotations';
        $body = $request->get_json_params();

        $annotationId = wp_generate_uuid4();
        $now = current_time('mysql');

        $data = array(
            'annotation_id' => $annotationId,
            'project_id' => sanitize_text_field($body['projectId'] ?? ''),
            'type' => sanitize_text_field($body['type'] ?? 'pin'),
            'content' => sanitize_textarea_field($body['content'] ?? ''),
            'page_url' => esc_url_raw($body['pageUrl'] ?? ''),
            'selector' => sanitize_text_field($body['selector'] ?? ''),
            'coordinates_x' => isset($body['coordinatesX']) ? floatval($body['coordinatesX']) : null,
            'coordinates_y' => isset($body['coordinatesY']) ? floatval($body['coordinatesY']) : null,
            'coordinates_x_end' => isset($body['coordinatesXEnd']) ? floatval($body['coordinatesXEnd']) : null,
            'coordinates_y_end' => isset($body['coordinatesYEnd']) ? floatval($body['coordinatesYEnd']) : null,
            'width' => isset($body['width']) ? floatval($body['width']) : null,
            'height' => isset($body['height']) ? floatval($body['height']) : null,
            'draw_data' => isset($body['drawData']) ? wp_json_encode($body['drawData']) : null,
            'element_dna' => isset($body['elementDna']) ? wp_json_encode($body['elementDna']) : null,
            'viewport_width' => intval($body['viewportWidth'] ?? 0),
            'viewport_height' => intval($body['viewportHeight'] ?? 0),
            'device' => sanitize_text_field($body['device'] ?? 'desktop'),
            'status' => 'open',
            'created_by' => sanitize_text_field($body['createdBy'] ?? 'Anonymous'),
            'created_at' => $now,
        );

        $wpdb->insert($tableName, $data);

        return new WP_REST_Response(array(
            'id' => $annotationId,
            'type' => $data['type'],
            'status' => $data['status'],
            'content' => $data['content'],
            'pageUrl' => $data['page_url'],
            'elementDna' => $body['elementDna'] ?? null,
            'anchorXPct' => $data['coordinates_x'] ?? 50,
            'anchorYPct' => $data['coordinates_y'] ?? 50,
            'widthPct' => $data['width'],
            'heightPct' => $data['height'],
            'endAnchorXPct' => $data['coordinates_x_end'],
            'endAnchorYPct' => $data['coordinates_y_end'],
            'endElementDna' => null,
            'drawData' => $body['drawData'] ?? null,
            'viewportWidth' => $data['viewport_width'],
            'viewportHeight' => $data['viewport_height'],
            'device' => $data['device'],
            'createdBy' => $data['created_by'],
            'createdAt' => $now,
            'replies' => array(),
            'media' => array(),
        ), 201);
    }

    public function getAnnotations($request)
    {
        global $wpdb;
        $tableName = $wpdb->prefix . 'feedspace_annotations';
        $pageUrl = esc_url_raw($request->get_param('pageUrl') ?? '');
        $projectId = sanitize_text_field($request->get_param('projectId') ?? '');

        if (!$pageUrl || !$projectId) {
            return new WP_REST_Response(array(), 200);
        }

        $results = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $tableName WHERE page_url = %s AND project_id = %s ORDER BY created_at ASC",
            $pageUrl,
            $projectId
        ));

        $annotations = array();
        foreach ($results as $row) {
            $annotations[] = array(
                'id' => $row->annotation_id,
                'type' => $row->type,
                'status' => $row->status,
                'content' => $row->content,
                'pageUrl' => $row->page_url,
                'elementDna' => $row->element_dna ? json_decode($row->element_dna, true) : null,
                'anchorXPct' => floatval($row->coordinates_x ?? 50),
                'anchorYPct' => floatval($row->coordinates_y ?? 50),
                'widthPct' => $row->width ? floatval($row->width) : null,
                'heightPct' => $row->height ? floatval($row->height) : null,
                'endAnchorXPct' => $row->coordinates_x_end ? floatval($row->coordinates_x_end) : null,
                'endAnchorYPct' => $row->coordinates_y_end ? floatval($row->coordinates_y_end) : null,
                'endElementDna' => null,
                'drawData' => $row->draw_data ? json_decode($row->draw_data, true) : null,
                'viewportWidth' => intval($row->viewport_width),
                'viewportHeight' => intval($row->viewport_height),
                'device' => $row->device,
                'createdBy' => $row->created_by,
                'createdAt' => $row->created_at,
                'replies' => array(),
                'media' => array(),
            );
        }

        return new WP_REST_Response($annotations, 200);
    }

    public function updateAnnotation($request)
    {
        global $wpdb;
        $tableName = $wpdb->prefix . 'feedspace_annotations';
        $id = $request->get_param('id');
        $body = $request->get_json_params();

        $exists = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM $tableName WHERE annotation_id = %s", $id
        ));

        if (!$exists) {
            return new WP_REST_Response(array('error' => 'Annotation not found'), 404);
        }

        $data = array();
        if (isset($body['content'])) $data['content'] = sanitize_textarea_field($body['content']);
        if (isset($body['status'])) $data['status'] = sanitize_text_field($body['status']);

        if (!empty($data)) {
            $wpdb->update($tableName, $data, array('annotation_id' => $id));
        }

        return new WP_REST_Response(array('id' => $id, 'updated' => true), 200);
    }

    public function deleteAnnotation($request)
    {
        global $wpdb;
        $tableName = $wpdb->prefix . 'feedspace_annotations';
        $id = $request->get_param('id');

        $wpdb->delete($tableName, array('annotation_id' => $id));

        return new WP_REST_Response(array('deleted' => true), 200);
    }

    public function getAnnotationCounts($request)
    {
        global $wpdb;
        $tableName = $wpdb->prefix . 'feedspace_annotations';
        $projectId = sanitize_text_field($request->get_param('projectId') ?? '');

        if (!$projectId) {
            return new WP_REST_Response(array('total' => 0, 'open' => 0, 'resolved' => 0, 'in_progress' => 0), 200);
        }

        $open = (int) $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM $tableName WHERE project_id = %s AND status IN ('open', 'in_progress')",
            $projectId
        ));

        $resolved = (int) $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM $tableName WHERE project_id = %s AND status = 'resolved'",
            $projectId
        ));

        $total = (int) $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM $tableName WHERE project_id = %s",
            $projectId
        ));

        $inProgress = (int) $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM $tableName WHERE project_id = %s AND status = 'in_progress'",
            $projectId
        ));

        return new WP_REST_Response(array(
            'total' => $total,
            'open' => $open,
            'resolved' => $resolved,
            'in_progress' => $inProgress,
        ), 200);
    }

    public function allowAdditionalMimeTypes($mimes)
    {
        $mimes['webm'] = 'video/webm';
        $mimes['weba'] = 'audio/webm';
        $mimes['webp'] = 'image/webp';
        return $mimes;
    }

    public function handleUploadPrefilter($file)
    {
        $maxSize = 50 * 1024 * 1024;
        if ($file['size'] > $maxSize) {
            $file['error'] = 'File size exceeds 50MB limit for feedback uploads.';
        }
        return $file;
    }

    public function registerSettings()
    {
        register_setting('feedspace_settings', 'feedspace_feedback_mode');
        register_setting('feedspace_settings', 'feedspace_api_url');
        register_setting('feedspace_settings', 'feedspace_debug_enabled');
    }

    public function addAdminMenu()
    {
        add_menu_page(
            'Feedspace',
            'Feedspace',
            'manage_options',
            'feedspace',
            array($this, 'renderAdminPage'),
            'dashicons-feedback',
            30
        );
    }

    public function adminEnqueueScripts($hook)
    {
        if ($hook !== 'toplevel_page_feedspace') return;

        wp_enqueue_style(
            'feedspace-admin',
            plugin_dir_url(__FILE__) . 'assets/admin.css',
            array(),
            FEEDSPACE_VERSION
        );
    }

    public function renderAdminPage()
    {
        $apiKey = get_option('feedspace_api_key');
        $feedbackMode = get_option('feedspace_feedback_mode', 'disabled');
        $siteUrl = get_bloginfo('url');
        $restUrl = rest_url('feedspace/v1/');
        ?>
        <div class="wrap">
            <h1>Feedspace Connector</h1>

            <div class="feedspace-status-card">
                <h2>Connection Status</h2>
                <p><strong>Plugin Version:</strong> <?php echo esc_html(FEEDSPACE_VERSION); ?></p>
                <p><strong>WordPress Version:</strong> <?php echo esc_html(get_bloginfo('version')); ?></p>
                <p><strong>Site URL:</strong> <?php echo esc_html($siteUrl); ?></p>
                <p><strong>REST API URL:</strong> <code><?php echo esc_url($restUrl); ?></code></p>
                <p><strong>Upload Max Size:</strong> <?php echo esc_html(size_format(wp_max_upload_size())); ?></p>
            </div>

            <div class="feedspace-config-card">
                <h2>API Configuration</h2>
                <p>Use these credentials to connect from Feedspace dashboard:</p>
                <table class="form-table">
                    <tr>
                        <th>REST API URL</th>
                        <td><code><?php echo esc_url($restUrl); ?></code></td>
                    </tr>
                    <tr>
                        <th>API Key</th>
                        <td>
                            <code id="feedspace-api-key"><?php echo esc_html($apiKey); ?></code>
                            <button type="button" class="button button-small" onclick="copyApiKey()">Copy</button>
                            <button type="button" class="button button-small" onclick="regenerateKey()">Regenerate</button>
                        </td>
                    </tr>
                </table>
            </div>

            <div class="feedspace-settings-card">
                <h2>Settings</h2>
                <form method="post" action="options.php">
                    <?php settings_fields('feedspace_settings'); ?>
                    <table class="form-table">
                        <tr>
                            <th>Feedspace API URL</th>
                            <td>
                                <input type="url" name="feedspace_api_url"
                                    value="<?php echo esc_attr(get_option('feedspace_api_url', '')); ?>"
                                class="regular-text" />
                                <p class="description">Your Feedspace app URL (e.g. https://your-app.vercel.app). Required for preview links to work.</p>
                            </td>
                        </tr>
                        <tr>
                            <th>Feedback Mode</th>
                            <td>
                                <label>
                                    <input type="checkbox" name="feedspace_feedback_mode" value="enabled"
                                        <?php checked($feedbackMode, 'enabled'); ?> />
                                    Enable feedback collection
                                </label>
                            </td>
                        </tr>
                        <tr>
                            <th>Debug Mode</th>
                            <td>
                                <label>
                                    <input type="checkbox" name="feedspace_debug_enabled" value="1"
                                        <?php checked(get_option('feedspace_debug_enabled'), '1'); ?> />
                                    Show debug overlay on preview pages
                                </label>
                                <p class="description">Adds a floating debug panel to help diagnose widget issues.</p>
                            </td>
                        </tr>
                    </table>
                    <?php submit_button('Save Settings'); ?>
                </form>
            </div>

            <div class="feedspace-cleanup-card">
                <h2>Storage Cleanup</h2>
                <p>Automatically remove feedback media older than 30 days.</p>
                <button type="button" class="button" onclick="runCleanup()">Run Cleanup Now</button>
                <p id="cleanup-result" style="margin-top: 10px;"></p>
            </div>
        </div>

        <style>
            .feedspace-status-card,
            .feedspace-config-card,
            .feedspace-settings-card,
            .feedspace-cleanup-card {
                background: #fff;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                max-width: 800px;
            }
            .feedspace-status-card h2,
            .feedspace-config-card h2,
            .feedspace-settings-card h2,
            .feedspace-cleanup-card h2 {
                margin-top: 0;
                font-size: 1.25em;
                color: #0f172a;
            }
            code {
                background: #f1f5f9;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 13px;
            }
        </style>

        <script>
            function copyApiKey() {
                var key = document.getElementById('feedspace-api-key');
                navigator.clipboard.writeText(key.textContent).then(function() {
                    alert('API key copied to clipboard');
                });
            }

            function regenerateKey() {
                if (!confirm('Regenerate API key? Existing integrations will stop working.')) return;
                fetch(ajaxurl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: 'action=feedspace_regenerate_key'
                }).then(function(r) { return r.json(); }).then(function(d) {
                    if (d.success) {
                        document.getElementById('feedspace-api-key').textContent = d.data.key;
                    }
                });
            }

            function runCleanup() {
                var btn = event.target;
                btn.disabled = true;
                btn.textContent = 'Running...';

                fetch('<?php echo esc_url(rest_url('feedspace/v1/cleanup')); ?>', {
                    method: 'POST',
                    headers: {
                        'X-Feedspace-Key': document.getElementById('feedspace-api-key').textContent,
                        'Content-Type': 'application/json'
                    }
                }).then(function(r) { return r.json(); }).then(function(d) {
                    document.getElementById('cleanup-result').textContent = d.message || 'Cleanup completed';
                    btn.disabled = false;
                    btn.textContent = 'Run Cleanup Now';
                }).catch(function() {
                    document.getElementById('cleanup-result').textContent = 'Cleanup failed';
                    btn.disabled = false;
                    btn.textContent = 'Run Cleanup Now';
                });
            }
        </script>
        <?php
    }
}

FeedspaceConnector::getInstance();

add_action('wp_ajax_feedspace_regenerate_key', function () {
    if (!current_user_can('manage_options')) {
        wp_die('Unauthorized');
    }
    $newKey = wp_generate_password(32, false);
    update_option('feedspace_api_key', $newKey);
    wp_send_json_success(array('key' => $newKey));
});
