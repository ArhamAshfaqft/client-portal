<?php
/**
 * Plugin Name: Feedspace Connector
 * Plugin URI: https://feedspace.io
 * Description: Connects your WordPress site to Feedspace for client feedback management. Enables media storage and API integration.
 * Version: 1.2.1
 * Author: Feedspace
 * Text Domain: feedspace
 */

if (!defined('ABSPATH')) exit;

define('FEEDSPACE_VERSION', '1.2.1');
define('FEEDSPACE_PLUGIN_FILE', __FILE__);
define('FEEDSPACE_WIDGET_JS_GZIP','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');

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
        add_filter('rest_allowed_cors_headers', function($headers) { $headers[] = 'X-Feedspace-Key'; return $headers; });
        add_action('rest_api_init', array($this, 'registerRoutes'));
        add_action('template_redirect', array($this, 'maybeInitPreview'));
        add_filter('upload_mimes', array($this, 'allowAdditionalMimeTypes'));
        add_action('admin_menu', array($this, 'addAdminMenu'));
        add_action('admin_init', array($this, 'registerSettings'));
        add_action('admin_enqueue_scripts', array($this, 'adminEnqueueScripts'));
        // add_filter('wp_handle_upload_prefilter', array($this, 'handleUploadPrefilter'));  // Previu pattern — not using wp_handle_upload
        add_action('plugins_loaded', array($this, 'ensureTables'));
        add_filter('cron_schedules', array($this, 'addCronInterval'));
        add_action('feedspace_process_queue', array(__CLASS__, 'processSyncQueue'));
        add_action('admin_bar_menu', array($this, 'addAdminBarNode'), 999);
        add_action('elementor/preview/enqueue_scripts', array($this, 'loadInElementorPreview'));

        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
    }

    public function addCronInterval($schedules)
    {
        $schedules['feedspace_every_minute'] = array(
            'interval' => 60,
            'display' => 'Every minute',
        );
        return $schedules;
    }

    public function ensureTables()
    {
        $this->createFeedbackTable();
        if (!get_option('feedspace_api_key')) {
            add_option('feedspace_api_key', wp_generate_password(32, false));
        }
    }

    public function maybeInitPreview()
    {
        $token = isset($_GET['feedspace_preview']) ? sanitize_text_field($_GET['feedspace_preview']) : '';
        
        // Fallback to cookie if query param is not set
        if (empty($token) && isset($_COOKIE['feedspace_preview'])) {
            $token = sanitize_text_field($_COOKIE['feedspace_preview']);
        }
        
        if (empty($token)) return;

        nocache_headers();

        $config = $this->verifyPreviewToken($token);
        if (!$config) {
            // Clear invalid cookie
            $cookie_path = defined('COOKIEPATH') ? COOKIEPATH : '/';
            $cookie_domain = defined('COOKIE_DOMAIN') ? COOKIE_DOMAIN : '';
            if (isset($_COOKIE['feedspace_preview']) && !headers_sent()) {
                setcookie('feedspace_preview', '', time() - 3600, $cookie_path, $cookie_domain);
            }
            if (isset($_GET['feedspace_preview'])) {
                wp_die('Invalid or expired preview link.', 'Feedspace Preview', array('response' => 403));
            }
            return;
        }

        // Set/refresh cookie valid for 1 hour
        if (!headers_sent()) {
            $cookie_path = defined('COOKIEPATH') ? COOKIEPATH : '/';
            $cookie_domain = defined('COOKIE_DOMAIN') ? COOKIE_DOMAIN : '';
            setcookie('feedspace_preview', $token, time() + 3600, $cookie_path, $cookie_domain);
        }

        $this->enqueueWidgetAssets($config, $token);
    }

    public function loadInElementorPreview()
    {
        if (!defined('ELEMENTOR_VERSION')) return;
        $postId = isset($_GET['elementor-preview']) ? (int) $_GET['elementor-preview'] : 0;
        if (!$postId) return;

        $permalink = get_permalink($postId);
        if (!$permalink) return;

        $apiUrl = get_option('feedspace_api_url', '');
        if (empty($apiUrl)) return;

        $config = $this->getWidgetConfigForEditor($postId);
        if (!$config) return;

        $this->enqueueWidgetAssets($config, '', $permalink);
    }

    private function getWidgetConfigForEditor($postId)
    {
        global $wpdb;
        $tableName = $wpdb->prefix . 'feedspace_annotations';
        $projectId = $wpdb->get_var("SELECT project_id FROM $tableName WHERE project_id != '' LIMIT 1");
        if (!$projectId) {
            $projectId = 'elementor-' . $postId;
        }
        $siteName = get_bloginfo('name');
        self::logDebug('getWidgetConfigForEditor', array('projectId' => $projectId, 'siteToken_exists' => !empty(get_option('feedspace_site_token', '')) ? 'yes' : 'no'));
        // Try to fetch the real project name from Vercel
        $apiUrl = get_option('feedspace_api_url', '');
        $siteToken = get_option('feedspace_site_token', '');
        $wpApiKey = get_option('feedspace_api_key', '');
        if (!empty($apiUrl) && !empty($siteToken) && !empty($wpApiKey) && !empty($projectId) && strpos($projectId, 'elementor-') !== 0) {
            $lookupUrl = rtrim($apiUrl, '/') . '/api/projects/lookup?projectId=' . urlencode($projectId);
            self::logDebug('lookup_project_call', array('url' => $lookupUrl, 'siteToken' => $siteToken));
            $response = wp_remote_get($lookupUrl, array(
                'headers' => array(
                    'Content-Type' => 'application/json',
                    'X-Site-Token' => $siteToken,
                    'X-WP-API-Key' => $wpApiKey,
                ),
                'timeout' => 5,
            ));
            if (!is_wp_error($response)) {
                $code = wp_remote_retrieve_response_code($response);
                $body = json_decode(wp_remote_retrieve_body($response), true);
                self::logDebug('lookup_project_response', array('code' => $code, 'body' => $body));
                if ($body && !empty($body['name'])) {
                    $siteName = $body['name'];
                }
            } else {
                self::logDebug('lookup_project_error', array('error' => $response->get_error_message()));
            }
        } else {
            self::logDebug('lookup_project_skipped', array('apiUrl' => !empty($apiUrl) ? 'set' : 'empty', 'siteToken' => !empty($siteToken) ? 'set' : 'empty', 'wpApiKey' => !empty($wpApiKey) ? 'set' : 'empty', 'projectId' => $projectId));
        }
        return array(
            'valid' => true,
            'projectId' => $projectId,
            'primaryColor' => '#6366f1',
            'siteName' => $siteName,
        );
    }

    private function verifyPreviewToken($token)
    {
        $transientKey = 'feedspace_preview_' . md5($token);
        $cached = get_transient($transientKey);
        if (false !== $cached) {
            return $cached;
        }

        // 1. Check local WP database first
        global $wpdb;
        $tableName = $wpdb->prefix . 'feedspace_annotations';
        $row = $wpdb->get_row($wpdb->prepare("SELECT project_id FROM $tableName WHERE preview_token = %s LIMIT 1", $token));
        if ($row) {
            $result = array(
                'valid' => true,
                'projectId' => $row->project_id,
                'primaryColor' => '#6366f1',
                'siteName' => get_bloginfo('name'),
            );
            set_transient($transientKey, $result, HOUR_IN_SECONDS);
            return $result;
        }

        // 2. Fallback: check Vercel/Supabase for legacy preview tokens
        $apiUrl = get_option('feedspace_api_url', '');
        if (!empty($apiUrl)) {
            $verifyUrl = rtrim($apiUrl, '/') . '/api/widget/verify-token';
            $response = wp_remote_post($verifyUrl, array(
                'headers' => array('Content-Type' => 'application/json'),
                'body' => json_encode(array('token' => $token)),
                'timeout' => 10,
            ));
            if (!is_wp_error($response)) {
                $body = json_decode(wp_remote_retrieve_body($response), true);
                if ($body && !empty($body['valid'])) {
                    set_transient($transientKey, $body, HOUR_IN_SECONDS);
                    return $body;
                }
            }
        }

        return false;
    }

    private function enqueueWidgetAssets($config, $token, $overridePageUrl = null)
    {
        $widgetPath = plugin_dir_path(__FILE__) . 'widget/feedspace-widget.js';
        $rootPath = plugin_dir_path(__FILE__) . 'feedspace-widget.js';

        $widgetJS = '';

        if (file_exists($widgetPath)) {
            $widgetJS = file_get_contents($widgetPath);
        } elseif (defined('FEEDSPACE_WIDGET_JS_GZIP')) {
            $widgetJS = gzdecode(base64_decode(FEEDSPACE_WIDGET_JS_GZIP));
        }

        if (empty($widgetJS)) {
            add_action('wp_footer', function () {
                echo '<script>console.error("[Feedspace] Widget JS unavailable")</script>';
            });
            return;
        }

        $apiBaseUrl = get_option('feedspace_api_url', '');
        $wpApiUrl = get_bloginfo('url');
        $wpApiKey = get_option('feedspace_api_key');
        $pageUrl = $overridePageUrl ?: remove_query_arg('feedspace_preview', home_url(add_query_arg(null, null)));
        $isDebug = get_option('feedspace_debug_enabled') === '1';

        $siteLabel = !empty($config['siteName']) ? $config['siteName'] : get_bloginfo('name');
        $configJSON = json_encode(array(
            'apiUrl' => $apiBaseUrl,
            'token' => $token,
            'projectId' => $config['projectId'],
            'primaryColor' => $config['primaryColor'],
            'wpApiUrl' => $wpApiUrl,
            'wpApiKey' => $wpApiKey,
            'pageUrl' => $pageUrl,
            'devMode' => $token === '' ? true : false,
            'siteName' => $siteLabel,
        ));

        $debugInit = $isDebug ? 'window.__feedspaceDebug=window.__feedspaceDebug||[];' : '';

        add_action('wp_footer', function () use ($widgetJS, $configJSON, $debugInit, $isDebug) {
            echo '<script>' . $widgetJS . '</script>';
            echo '<script>' . $debugInit . '(function(){if(window.FeedspaceWidget)window.FeedspaceWidget.init(' . $configJSON . ');else console.error("[Feedspace] Widget not loaded")})();</script>';
        }, 20);

        if ($isDebug) {
            add_action('wp_footer', array($this, 'renderDebugPanel'), 30);
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

    public function addAdminBarNode($wp_admin_bar)
    {
        if (get_option('feedspace_dev_mode') !== '1') return;

        $wp_admin_bar->add_node(array(
            'id' => 'feedspace-annotations',
            'title' => '<span style="display:flex;align-items:center;gap:4px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> Feedspace</span>',
            'href' => admin_url('admin.php?page=feedspace-annotations'),
            'meta' => array('title' => 'View all annotations'),
        ));
    }

    public function activate()
    {
        $this->createFeedbackTable();
        add_option('feedspace_version', FEEDSPACE_VERSION);
        add_option('feedspace_api_key', wp_generate_password(32, false));
        add_option('feedspace_api_url', '');
        if (!wp_next_scheduled('feedspace_process_queue')) {
            wp_schedule_event(time(), 'feedspace_every_minute', 'feedspace_process_queue');
        }
    }

    public function deactivate()
    {
        delete_option('feedspace_version');
        wp_clear_scheduled_hook('feedspace_process_queue');
    }

    public static function enqueueSync($annotationId, $payload, $action = 'mirror')
    {
        global $wpdb;
        $table = $wpdb->prefix . 'feedspace_sync_queue';
        $wpdb->insert($table, array(
            'annotation_id' => $annotationId,
            'action' => $action,
            'payload' => is_string($payload) ? $payload : json_encode($payload),
            'status' => 'pending',
            'attempts' => 0,
            'max_attempts' => 5,
        ));
        return $wpdb->insert_id;
    }

    public static function processSyncQueue()
    {
        global $wpdb;
        $table = $wpdb->prefix . 'feedspace_sync_queue';
        $vercelUrl = get_option('feedspace_api_url', '');
        if (empty($vercelUrl)) return 0;

        $items = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table WHERE status = 'pending' OR (status = 'retrying' AND next_retry_at <= %s) ORDER BY created_at ASC LIMIT 10",
            current_time('mysql')
        ));

        $processed = 0;
        foreach ($items as $item) {
            $payload = json_decode($item->payload, true);
            $payload['id'] = $item->annotation_id;

            $siteToken = get_option('feedspace_site_token', '');
            $wpApiKey = get_option('feedspace_api_key', '');
            $headers = array('Content-Type' => 'application/json');
            if ($siteToken && $wpApiKey) {
                $headers['X-Site-Token'] = $siteToken;
                $headers['X-WP-API-Key'] = $wpApiKey;
            }
            if ($item->action === 'delete') {
                $result = wp_remote_request(
                    trailingslashit($vercelUrl) . 'api/widget/annotations/' . $item->annotation_id . '?token=' . urlencode($siteToken),
                    array(
                        'method' => 'DELETE',
                        'headers' => $headers,
                        'timeout' => 15,
                    )
                );
            } else {
                $result = wp_remote_post(trailingslashit($vercelUrl) . 'api/widget/annotations', array(
                    'headers' => $headers,
                    'body' => json_encode($payload),
                    'timeout' => 15,
                ));
            }

            if (is_wp_error($result)) {
                self::handleSyncFailure($item->id, $result->get_error_message(), $item->attempts, $item->max_attempts);
                continue;
            }

            $code = (int) wp_remote_retrieve_response_code($result);
            $body = wp_remote_retrieve_body($result);
            $bodyParsed = json_decode($body, true);
            self::logDebug('queue_response', array(
                'annotation_id' => $item->annotation_id,
                'code' => $code,
                '_mediaCount' => $bodyParsed['_mediaCount'] ?? $bodyParsed['_media_count'] ?? '?',
                '_hasMedia' => $bodyParsed['_hasMedia'] ?? '?',
                'response_media_count' => isset($bodyParsed['media']) ? count($bodyParsed['media']) : '?',
                'body_truncated' => mb_substr($body, 0, 300),
            ));
            // Store mirror debug info for visibility in settings
            if (isset($bodyParsed['_debug'])) {
                update_option('feedspace_last_mirror_debug', wp_json_encode($bodyParsed['_debug']));
            }
            if ($code >= 200 && $code < 300) {
                $wpdb->update($table, array('status' => 'done', 'updated_at' => current_time('mysql')), array('id' => $item->id));
                self::logDebug('queue_done', array('annotation_id' => $item->annotation_id, 'code' => $code));
                $processed++;
            } else {
                self::handleSyncFailure($item->id, "HTTP $code: $body", $item->attempts, $item->max_attempts);
            }
        }

        return $processed;
    }

    private static function handleSyncFailure($queueId, $error, $attempts, $maxAttempts)
    {
        global $wpdb;
        $table = $wpdb->prefix . 'feedspace_sync_queue';
        $newAttempts = (int) $attempts + 1;

        if ($newAttempts >= (int) $maxAttempts) {
            $wpdb->update($table, array(
                'status' => 'failed',
                'attempts' => $newAttempts,
                'last_error' => $error,
                'updated_at' => current_time('mysql'),
            ), array('id' => $queueId));
            self::logDebug('queue_failed', array('queue_id' => $queueId, 'error' => $error, 'attempts' => $newAttempts));
        } else {
            $backoff = min(3600, pow(2, $newAttempts) * 60);
            $nextRetry = date('Y-m-d H:i:s', strtotime("+{$backoff} seconds"));
            $wpdb->update($table, array(
                'status' => 'retrying',
                'attempts' => $newAttempts,
                'last_error' => $error,
                'next_retry_at' => $nextRetry,
                'updated_at' => current_time('mysql'),
            ), array('id' => $queueId));
            self::logDebug('queue_retry', array('queue_id' => $queueId, 'error' => $error, 'attempts' => $newAttempts, 'backoff' => $backoff));
        }
    }

    public static function getSyncQueueStats()
    {
        global $wpdb;
        $table = $wpdb->prefix . 'feedspace_sync_queue';
        $stats = $wpdb->get_results("SELECT status, COUNT(*) as count FROM $table GROUP BY status", OBJECT_K);
        return array(
            'pending' => isset($stats['pending']) ? (int) $stats['pending']->count : 0,
            'retrying' => isset($stats['retrying']) ? (int) $stats['retrying']->count : 0,
            'failed' => isset($stats['failed']) ? (int) $stats['failed']->count : 0,
            'done' => isset($stats['done']) ? (int) $stats['done']->count : 0,
        );
    }

    public static function logDebug($event, $details = array())
    {
        if (get_option('feedspace_debug_log_enabled') !== '1') return;
        $log = get_option('feedspace_debug_log', array());
        $log[] = array_merge(array(
            'time' => current_time('mysql'),
            'event' => $event,
        ), $details);
        $log = array_slice($log, -30);
        update_option('feedspace_debug_log', $log, false);
    }

    private function createFeedbackTable()
    {
        global $wpdb;
        $charsetCollate = $wpdb->get_charset_collate();

        $feedbackTable = $wpdb->prefix . 'feedspace_feedback';
        $exists = $wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $feedbackTable));
        if ($exists !== $feedbackTable) {
            // phpcs:disable WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.DirectQuery
            $wpdb->query("CREATE TABLE $feedbackTable (
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
            ) $charsetCollate");
            // phpcs:enable
            // phpcs:ignore WordPress.PHP.DevelopmentFunctions
            error_log('[Feedspace] Created table ' . $feedbackTable . ': ' . ($wpdb->last_error ?: 'ok'));
        }

        $annotationsTable = $wpdb->prefix . 'feedspace_annotations';
        $exists = $wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $annotationsTable));
        if ($exists !== $annotationsTable) {
            // phpcs:disable WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.DirectQuery
            $wpdb->query("CREATE TABLE $annotationsTable (
                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                annotation_id VARCHAR(36) NOT NULL,
                project_id VARCHAR(36) NOT NULL,
                type VARCHAR(20) NOT NULL DEFAULT 'pin',
                content TEXT NOT NULL,
                page_url VARCHAR(2048) NOT NULL,
                selector TEXT,
                coordinates_x REAL,
                coordinates_y REAL,
                coordinates_x_end REAL,
                coordinates_y_end REAL,
                width REAL,
                height REAL,
                draw_data TEXT,
                element_dna TEXT,
                meta_data LONGTEXT,
                preview_token VARCHAR(36) DEFAULT '',
                viewport_width INT DEFAULT 0,
                viewport_height INT DEFAULT 0,
                device VARCHAR(20) DEFAULT 'desktop',
                status VARCHAR(20) DEFAULT 'open',
                created_by VARCHAR(100) DEFAULT 'Anonymous',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY idx_annotation_id (annotation_id),
                INDEX idx_project_id (project_id),
                INDEX idx_page_url (page_url(191))
            ) $charsetCollate");
            // phpcs:enable
            // phpcs:ignore WordPress.PHP.DevelopmentFunctions
            error_log('[Feedspace] Created annotations table: ' . ($wpdb->last_error ?: 'ok'));
        }

        // Migration: add meta_data column if missing
        $mdCol = $wpdb->get_row("SHOW COLUMNS FROM $annotationsTable LIKE 'meta_data'");
        if (!$mdCol) {
            $wpdb->query("ALTER TABLE $annotationsTable ADD COLUMN meta_data LONGTEXT AFTER element_dna");
            if (!$wpdb->last_error) {
                error_log('[Feedspace] Added meta_data column to annotations table');
            }
        }

        // Migration: add preview_token column if missing
        $ptCol = $wpdb->get_row("SHOW COLUMNS FROM $annotationsTable LIKE 'preview_token'");
        if (!$ptCol) {
            $wpdb->query("ALTER TABLE $annotationsTable ADD COLUMN preview_token VARCHAR(36) DEFAULT '' AFTER meta_data");
            if (!$wpdb->last_error) {
                error_log('[Feedspace] Added preview_token column to annotations table');
            }
        }

        // Migration: add parent_id column if missing
        $piCol = $wpdb->get_row("SHOW COLUMNS FROM $annotationsTable LIKE 'parent_id'");
        if (!$piCol) {
            $wpdb->query("ALTER TABLE $annotationsTable ADD COLUMN parent_id VARCHAR(36) DEFAULT NULL AFTER annotation_id");
            if (!$wpdb->last_error) {
                error_log('[Feedspace] Added parent_id column to annotations table');
            }
        }

        $queueTable = $wpdb->prefix . 'feedspace_sync_queue';
        $exists = $wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $queueTable));
        if ($exists !== $queueTable) {
            $wpdb->query("CREATE TABLE $queueTable (
                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                annotation_id VARCHAR(36) NOT NULL,
                action VARCHAR(20) NOT NULL DEFAULT 'mirror',
                payload LONGTEXT NOT NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'pending',
                attempts INT DEFAULT 0,
                max_attempts INT DEFAULT 5,
                last_error TEXT,
                next_retry_at DATETIME DEFAULT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_status (status),
                INDEX idx_next_retry (next_retry_at),
                INDEX idx_annotation (annotation_id)
            ) $charsetCollate");
        }
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

        register_rest_route('feedspace/v1', '/media/save-to-library', array(
            'methods' => 'POST',
            'callback' => array($this, 'saveMediaToLibrary'),
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

        // Webhook: Vercel pushes status/reply changes back to WP
        register_rest_route('feedspace/v1', '/webhook', array(
            'methods' => 'POST',
            'callback' => array($this, 'handleWebhook'),
            'permission_callback' => array($this, 'checkApiAuth'),
        ));

        // Auto-login: one-click WP Admin access from Feedspace dashboard
        register_rest_route('feedspace/v1', '/auto-login', array(
            'methods' => 'GET',
            'callback' => array($this, 'handleAutoLogin'),
            'permission_callback' => '__return_true',
        ));
    }

    public function handleWebhook($request)
    {
        global $wpdb;
        $tableName = $wpdb->prefix . 'feedspace_annotations';
        $body = $request->get_json_params();
        $action = $body['action'] ?? '';
        $data = $body['data'] ?? array();

        self::logDebug('webhook_received', array('action' => $action, 'id' => $data['id'] ?? ''));

        if ($action === 'update_status' && !empty($data['id']) && !empty($data['status'])) {
            $wpdb->update($tableName, array('status' => $data['status']), array('annotation_id' => $data['id']));
            return new WP_REST_Response(array('ok' => true, 'updated' => 'status'), 200);
        }

        if ($action === 'update_content' && !empty($data['id']) && isset($data['content'])) {
            $wpdb->update($tableName, array('content' => $data['content']), array('annotation_id' => $data['id']));
            return new WP_REST_Response(array('ok' => true, 'updated' => 'content'), 200);
        }

        if ($action === 'delete' && !empty($data['id'])) {
            $wpdb->delete($tableName, array('annotation_id' => $data['id']));
            return new WP_REST_Response(array('ok' => true, 'updated' => 'deleted'), 200);
        }

        if ($action === 'reply_added' && !empty($data['parentMirrorId'])) {
            $replyExists = $wpdb->get_var($wpdb->prepare(
                "SELECT COUNT(*) FROM $tableName WHERE annotation_id = %s", $data['replyId'] ?? ''
            ));
            if (!empty($data['replyId']) && !$replyExists) {
                // Create the reply row so it appears in the widget's replies list
                $parentRow = $wpdb->get_row($wpdb->prepare(
                    "SELECT project_id, page_url, preview_token FROM $tableName WHERE annotation_id = %s", $data['parentMirrorId']
                ));
                $wpdb->insert($tableName, array(
                    'annotation_id' => $data['replyId'],
                    'parent_id'     => $data['parentId'] ?? $data['parentMirrorId'],
                    'project_id'    => $parentRow->project_id ?? '',
                    'type'          => 'comment',
                    'content'       => sanitize_textarea_field($data['content'] ?? ''),
                    'page_url'      => $parentRow->page_url ?? '',
                    'device'        => $data['device'] ?? 'desktop',
                    'preview_token' => $parentRow->preview_token ?? '',
                    'status'        => 'open',
                    'created_by'    => sanitize_text_field($data['createdBy'] ?? 'Team'),
                    'created_at'    => $data['createdAt'] ?? current_time('mysql'),
                ));
                self::logDebug('webhook_reply_inserted', array('annotation_id' => $data['replyId'], 'parent_id' => $data['parentMirrorId']));
            } elseif (!empty($data['replyId'])) {
                $wpdb->update($tableName, array('parent_id' => $data['parentId'] ?? $data['parentMirrorId']), array('annotation_id' => $data['replyId']));
            }
            return new WP_REST_Response(array('ok' => true, 'updated' => 'reply'), 200);
        }

        self::logDebug('webhook_unknown', array('action' => $action, 'body' => json_encode($body)));
        return new WP_REST_Response(array('error' => 'Unknown action'), 400);
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

    public function handleAutoLogin(WP_REST_Request $request)
    {
        $token = $request->get_param('token');
        if (!$token || !str_contains($token, '.')) {
            wp_die('Invalid token format.', 'Feedspace Login', array('response' => 400));
        }

        list($payloadB64, $signature) = explode('.', $token, 2);
        $payload = json_decode(base64_decode($payloadB64), true);

        if (!$payload || empty($payload['sub']) || empty($payload['sid'])) {
            wp_die('Invalid token payload.', 'Feedspace Login', array('response' => 400));
        }

        if (isset($payload['exp']) && $payload['exp'] < time()) {
            wp_die('Token expired. Please re-login from the Feedspace dashboard.', 'Feedspace Login', array('response' => 401));
        }

        $apiKey = get_option('feedspace_api_key');
        if (!$apiKey) {
            $apiKey = get_option('feedspace_connector_api_key');
        }
        if (!$apiKey) {
            wp_die('Feedspace API key not found. Reconnect the Connector plugin.', 'Feedspace Login', array('response' => 500));
        }

        $expectedSig = hash_hmac('sha256', $payloadB64, $apiKey, true);
        $expectedB64 = rtrim(strtr(base64_encode($expectedSig), '+/', '-_'), '=');

        if (!hash_equals($expectedB64, $signature)) {
            wp_die('Token signature mismatch.', 'Feedspace Login', array('response' => 403));
        }

        $adminUser = get_users(array('role' => 'administrator', 'number' => 1));
        if (empty($adminUser)) {
            wp_die('No admin user found.', 'Feedspace Login', array('response' => 500));
        }

        $admin = $adminUser[0];
        wp_set_current_user($admin->ID);
        wp_set_auth_cookie($admin->ID);

        $devName = $payload['name'] ?? 'Unknown';
        update_option('feedspace_last_login', array(
            'dev_name' => $devName,
            'time'     => current_time('mysql'),
        ));

        wp_redirect(admin_url());
        exit;
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
        self::logDebug('media_upload_start', array(
            'has_files' => !empty($request->get_file_params()) ? 'yes' : 'no',
            'api_key_match' => $request->get_header('X-Feedspace-Key') === get_option('feedspace_api_key') ? 'yes' : 'no',
        ));

        $files = $request->get_file_params();

        if (empty($files) || !isset($files['file'])) {
            self::logDebug('media_upload_no_file', array());
            return new WP_Error('no_file', 'No file provided', array('status' => 400));
        }

        $file = $files['file'];
        $projectId = $request->get_param('project_id') ?: '';

        $uploadedFile = $this->handleUpload($file, $projectId);

        if (is_wp_error($uploadedFile)) {
            self::logDebug('media_upload_failed', array('error' => $uploadedFile->get_error_message()));
            return $uploadedFile;
        }

        self::logDebug('media_upload_ok', array('url' => $uploadedFile['url'] ?? 'none'));
        return new WP_REST_Response($uploadedFile, 200);
    }

    public function saveMediaToLibrary($request)
    {
        global $wpdb;
        $body = $request->get_json_params();
        $url = $body['url'] ?? ($body['file_url'] ?? '');
        $annotationId = $body['annotation_id'] ?? '';

        self::logDebug('save_to_library_start', array(
            'url' => $url ?: '(all from annotation)',
            'annotation_id' => $annotationId,
        ));

        require_once ABSPATH . 'wp-admin/includes/image.php';

        $uploadDir = wp_upload_dir();
        $feedspaceDir = $uploadDir['basedir'] . '/feedspace-media/';

        $filesToSave = array();

        if (!empty($url)) {
            $filesToSave[] = array('url' => $url);
        } elseif (!empty($annotationId)) {
            $tableName = $wpdb->prefix . 'feedspace_annotations';
            $existing = $wpdb->get_var($wpdb->prepare(
                "SELECT meta_data FROM $tableName WHERE annotation_id = %s", $annotationId
            ));
            if ($existing) {
                $meta = json_decode($existing, true) ?: array();
                $atts = $meta['attachments'] ?? array();
                $savedUrls = array();
                foreach (($meta['saved_to_library'] ?? array()) as $s) {
                    $savedUrls[] = $s['file_url'];
                }
                foreach ($atts as $att) {
                    if (!in_array($att['fileUrl'] ?? '', $savedUrls)) {
                        $filesToSave[] = array('url' => $att['fileUrl']);
                    }
                }
            }
        }

        if (empty($filesToSave)) {
            return new WP_Error('nothing_to_save', 'No new media files to save', array('status' => 200));
        }

        $result = array();
        $lastError = '';

        foreach ($filesToSave as $fileInfo) {
            $fileUrl = $fileInfo['url'];
            $diskName = basename(parse_url($fileUrl, PHP_URL_PATH));
            if (!$diskName) continue;

            // Find the source file on disk
            $sourcePath = $feedspaceDir . $diskName;
            if (!file_exists($sourcePath)) {
                $parsedUrl = parse_url($fileUrl);
                if (!empty($parsedUrl['path'])) {
                    $altPath = ABSPATH . ltrim($parsedUrl['path'], '/');
                    if (file_exists($altPath)) {
                        $sourcePath = $altPath;
                    }
                }
            }
            if (!file_exists($sourcePath)) {
                self::logDebug('save_to_library_skip', array('file' => $fileUrl, 'reason' => 'not found'));
                $lastError = 'Source file not found: ' . $diskName;
                continue;
            }

            // Determine MIME type from the actual file
            $wpFiletype = wp_check_filetype($diskName);
            $mimeType = $wpFiletype['type'] ?: mime_content_type($sourcePath) ?: 'application/octet-stream';

            // Copy to standard uploads directory
            $subdir = date('Y/m');
            $destDir = $uploadDir['basedir'] . '/' . $subdir;
            if (!file_exists($destDir)) wp_mkdir_p($destDir);

            $uniqueName = wp_unique_filename($destDir, sanitize_file_name($diskName));
            $destPath = $destDir . '/' . $uniqueName;

            if (!copy($sourcePath, $destPath)) {
                $lastError = 'Failed to copy: ' . $diskName;
                continue;
            }

            // Insert as attachment
            $attachment = array(
                'guid'           => $uploadDir['baseurl'] . '/' . $subdir . '/' . $uniqueName,
                'post_mime_type' => $mimeType,
                'post_title'     => sanitize_file_name(pathinfo($diskName, PATHINFO_FILENAME)),
                'post_content'   => '',
                'post_status'    => 'inherit',
            );

            $attachId = wp_insert_attachment($attachment, $destPath);
            if (is_wp_error($attachId) || !$attachId) {
                $lastError = 'wp_insert_attachment failed';
                @unlink($destPath);
                continue;
            }

            $attachData = wp_generate_attachment_metadata($attachId, $destPath);
            wp_update_attachment_metadata($attachId, $attachData);

            $libraryUrl = wp_get_attachment_url($attachId);
            $result = array(
                'attachment_id' => $attachId,
                'library_url'   => $libraryUrl,
                'file_url'      => $fileUrl,
                'edit_url'      => admin_url('upload.php?item=' . $attachId),
            );

            if (!empty($annotationId)) {
                $tableName = $wpdb->prefix . 'feedspace_annotations';
                $existingMeta = $wpdb->get_var($wpdb->prepare(
                    "SELECT meta_data FROM $tableName WHERE annotation_id = %s", $annotationId
                ));
                if ($existingMeta) {
                    $metaData = json_decode($existingMeta, true) ?: array();
                    $saved = $metaData['saved_to_library'] ?? array();
                    $saved[] = array('attachment_id' => $attachId, 'file_url' => $fileUrl, 'wp_url' => $libraryUrl);
                    $metaData['saved_to_library'] = $saved;
                    $wpdb->update($tableName, array('meta_data' => json_encode($metaData)), array('annotation_id' => $annotationId));
                }
            }

            break;
        }

        self::logDebug('save_to_library_done', $result ?: array('error' => $lastError));

        if (empty($result)) {
            return new WP_Error('save_failed', $lastError ?: 'Could not save file', array('status' => 500));
        }

        return new WP_REST_Response($result, 200);
    }

    private function handleUpload($file, $projectId = '')
    {
        // Enforce custom max upload size
        $customMax = absint(get_option('feedspace_max_upload_size', 0));
        if ($customMax > 0 && $file['size'] > $customMax * 1024 * 1024) {
            return new WP_Error('upload_too_large', sprintf('File size exceeds %d MB limit.', $customMax), array('status' => 413));
        }

        // Previu pattern: direct file read/write — avoids wp_handle_upload/wp_insert_attachment crashes
        $uploadDir = wp_upload_dir();
        $mediaDir = $uploadDir['basedir'] . '/feedspace-media/';
        if (!file_exists($mediaDir)) {
            wp_mkdir_p($mediaDir);
        }

        $ext = '.' . pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = 'feedspace_' . uniqid() . '_' . sanitize_file_name(basename($file['name']));
        $dest = $mediaDir . $filename;

        $content = file_get_contents($file['tmp_name']);
        if (false === $content) {
            return new WP_Error('upload_failed', 'Failed to read uploaded file', array('status' => 500));
        }
        if (false === file_put_contents($dest, $content)) {
            return new WP_Error('upload_failed', 'Failed to write file to storage', array('status' => 500));
        }

        $url = $uploadDir['baseurl'] . '/feedspace-media/' . rawurlencode($filename);

        global $wpdb;
        $tableName = $wpdb->prefix . 'feedspace_feedback';
        $feedspaceId = wp_generate_uuid4();

        $wpdb->insert($tableName, array(
            'feedspace_id' => $feedspaceId,
            'file_url' => $url,
            'file_type' => $file['type'],
            'file_name' => $file['name'],
            'file_size' => $file['size'],
            'project_id' => $projectId,
            'expires_at' => date('Y-m-d H:i:s', strtotime('+30 days')),
        ));

        return array(
            'id' => 0,
            'feedspace_id' => $feedspaceId,
            'url' => $url,
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
        $now = gmdate('Y-m-d H:i:s');

        self::logDebug('create_ann_start', array(
            'body_keys'  => array_keys($body),
            'has_media'  => isset($body['media']) ? count($body['media']) : 0,
            'has_meta'   => isset($body['metaData']) ? 'yes' : 'no',
            'content'    => substr($body['content'] ?? '', 0, 50),
        ));

        $incomingMeta = isset($body['metaData']) && is_array($body['metaData']) ? $body['metaData'] : array();
        $rawMedia = isset($body['media']) && is_array($body['media']) ? $body['media'] : array();
        if (!empty($rawMedia)) {
            $cleanMedia = array();
            foreach ($rawMedia as $m) {
                $cleanMedia[] = array(
                    'id'       => sanitize_text_field($m['id'] ?? ''),
                    'fileUrl'  => esc_url_raw($m['fileUrl'] ?? ''),
                    'fileType' => sanitize_text_field($m['fileType'] ?? ''),
                    'fileName' => sanitize_text_field($m['fileName'] ?? ''),
                );
            }
            $incomingMeta['attachments'] = $cleanMedia;
        }
        if (!empty($body['projectName'])) {
            $incomingMeta['projectName'] = sanitize_text_field($body['projectName']);
        }

        $data = array(
            'annotation_id' => $annotationId,
            'project_id'    => sanitize_text_field($body['projectId'] ?? ''),
            'type'          => sanitize_text_field($body['type'] ?? 'pin'),
            'content'       => sanitize_textarea_field($body['content'] ?? ''),
            'page_url'      => remove_query_arg('feedspace_preview', esc_url_raw($body['pageUrl'] ?? '')),
            'meta_data'     => !empty($incomingMeta) ? wp_json_encode($incomingMeta) : null,
            'selector'              => sanitize_text_field($body['selector'] ?? ''),
            'coordinates_x'         => isset($body['coordinatesX'])    ? floatval($body['coordinatesX'])    : null,
            'coordinates_y'         => isset($body['coordinatesY'])    ? floatval($body['coordinatesY'])    : null,
            'coordinates_x_end'     => isset($body['coordinatesXEnd']) ? floatval($body['coordinatesXEnd']) : null,
            'coordinates_y_end'     => isset($body['coordinatesYEnd']) ? floatval($body['coordinatesYEnd']) : null,
            'width'                 => isset($body['width'])  ? floatval($body['width'])  : null,
            'height'                => isset($body['height']) ? floatval($body['height']) : null,
            'draw_data'    => isset($body['drawData'])   ? (is_string($body['drawData'])   ? $body['drawData']   : wp_json_encode($body['drawData']))   : null,
            'element_dna'  => isset($body['elementDna']) ? (is_string($body['elementDna']) ? $body['elementDna'] : wp_json_encode($body['elementDna'])) : null,
            'viewport_width'  => intval($body['viewportWidth']  ?? 0),
            'viewport_height' => intval($body['viewportHeight'] ?? 0),
            'device'       => sanitize_text_field($body['device']       ?? 'desktop'),
            'preview_token' => sanitize_text_field($body['previewToken'] ?? ''),
            'status'       => 'open',
            'created_by'   => sanitize_text_field($body['createdBy'] ?? 'Anonymous'),
            'created_at'   => $now,
        );

        $wpdb->insert($tableName, $data);

        self::logDebug('create_ann_inserted', array(
            'annotation_id' => $annotationId,
            'meta_data_saved' => $data['meta_data'] ?? 'NULL',
            'created_at' => $now,
            'db_error' => $wpdb->last_error ?: 'none',
        ));

        if ($wpdb->last_error) {
            return new WP_REST_Response(array(
                'error' => 'Database error: ' . $wpdb->last_error,
            ), 500);
        }

        // Mirror to Vercel/Supabase via sync queue (retryable)
        $mirrorOk = true;
        $vercelUrl = get_option('feedspace_api_url', '');
        if ($vercelUrl) {
            $mirrorBody = $body;
            $mirrorBody['id'] = $annotationId;
            $mirrorBody['createdAt'] = $now;

            self::enqueueSync($annotationId, $mirrorBody, 'mirror');
            self::logDebug('mirror_enqueued', array('annotation_id' => $annotationId, 'projectId' => $mirrorBody['projectId'] ?? ''));
            update_option('feedspace_last_mirror_id', $annotationId);
            update_option('feedspace_last_mirror_code', 0);
            update_option('feedspace_last_mirror_body', 'Enqueued for sync');
            update_option('feedspace_last_mirror_time', current_time('mysql'));
            update_option('feedspace_last_mirror_success', false);

            // Try immediate process — if it fails, queue retries later
            self::processSyncQueue();
        } else {
            self::logDebug('mirror_skipped', array('annotation_id' => $annotationId, 'reason' => 'Vercel URL not configured'));
            update_option('feedspace_last_mirror_id', $annotationId);
            update_option('feedspace_last_mirror_code', -1);
            update_option('feedspace_last_mirror_body', 'Vercel URL not configured');
            update_option('feedspace_last_mirror_time', current_time('mysql'));
            update_option('feedspace_last_mirror_success', false);
        }

        $attachments = isset($incomingMeta['attachments']) && is_array($incomingMeta['attachments']) ? $incomingMeta['attachments'] : array();

        self::logDebug('create_ann_response', array(
            'annotation_id' => $annotationId,
            'media_count' => count($attachments),
            'media_first' => !empty($attachments) ? $attachments[0]['fileUrl'] : 'none',
            'created_at' => $now,
        ));

        return new WP_REST_Response(array(
            'id' => $annotationId,
            'type' => $data['type'],
            'status' => $data['status'],
            'content' => $data['content'],
            'projectId' => $data['project_id'],
            'projectName' => $incomingMeta['projectName'] ?? '',
            'previewToken' => $data['preview_token'],
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
            'media' => $attachments,
            'metaData' => $incomingMeta,
            '_mirrored' => $mirrorOk,
        ), 201);
    }

    public function getAnnotations($request)
    {
        global $wpdb;
        $tableName = $wpdb->prefix . 'feedspace_annotations';
        $rawPageUrl = $request->get_param('pageUrl') ?? '';
        $pageUrl = esc_url_raw($rawPageUrl);
        if ($pageUrl) {
            $pageUrl = remove_query_arg('feedspace_preview', $pageUrl);
        }
        $projectId = sanitize_text_field($request->get_param('projectId') ?? '');

        $parentFilter = ' AND parent_id IS NULL';
        if ($pageUrl && $projectId) {
            $results = $wpdb->get_results($wpdb->prepare(
                "SELECT * FROM $tableName WHERE page_url = %s AND project_id = %s$parentFilter ORDER BY created_at ASC",
                $pageUrl,
                $projectId
            ));
        } elseif ($pageUrl) {
            $results = $wpdb->get_results($wpdb->prepare(
                "SELECT * FROM $tableName WHERE page_url = %s$parentFilter ORDER BY created_at ASC",
                $pageUrl
            ));
        } elseif ($projectId) {
            $results = $wpdb->get_results($wpdb->prepare(
                "SELECT * FROM $tableName WHERE project_id = %s$parentFilter ORDER BY created_at ASC",
                $projectId
            ));
        } else {
            $results = array();
        }

        // phpcs:ignore WordPress.PHP.DevelopmentFunctions
        error_log('[Feedspace] getAnnotations: found ' . count($results) . ' results');

        // Backfill project names from Vercel for annotations that lack projectName in meta_data
        $projectNameMap = array();
        $lookupProjectIds = array();
        foreach ($results as $row) {
            $pid = $row->project_id;
            if (empty($pid)) continue;
            $annMeta = $row->meta_data ? json_decode($row->meta_data, true) : null;
            if (!isset($annMeta['projectName']) || empty($annMeta['projectName'])) {
                $lookupProjectIds[$pid] = $pid;
            }
        }
        if (!empty($lookupProjectIds)) {
            $cachedMap = get_transient('feedspace_project_names');
            if (!is_array($cachedMap)) $cachedMap = array();
            $needFetch = array();
            foreach ($lookupProjectIds as $pid) {
                if (!isset($cachedMap[$pid])) $needFetch[] = $pid;
            }
            if (!empty($needFetch)) {
                $apiUrl = get_option('feedspace_api_url', '');
                $siteToken = get_option('feedspace_site_token', '');
                $wpApiKey = get_option('feedspace_api_key', '');
                foreach ($needFetch as $fetchPid) {
                    if (!empty($apiUrl) && !empty($siteToken) && !empty($wpApiKey)) {
                        $lookupUrl = rtrim($apiUrl, '/') . '/api/projects/lookup?projectId=' . urlencode($fetchPid);
                        $resp = wp_remote_get($lookupUrl, array(
                            'headers' => array(
                                'Content-Type' => 'application/json',
                                'X-Site-Token' => $siteToken,
                                'X-WP-API-Key' => $wpApiKey,
                            ),
                            'timeout' => 5,
                        ));
                        if (!is_wp_error($resp)) {
                            $body = json_decode(wp_remote_retrieve_body($resp), true);
                            if ($body && !empty($body['name'])) {
                                $cachedMap[$fetchPid] = $body['name'];
                            }
                        }
                    }
                }
                set_transient('feedspace_project_names', $cachedMap, DAY_IN_SECONDS);
            }
            $projectNameMap = $cachedMap;
        }

        // Fetch replies for all annotations in one query
        $annotationIds = array();
        foreach ($results as $row) {
            $annotationIds[] = $row->annotation_id;
        }
        $repliesByParent = array();
        if (!empty($annotationIds)) {
            $placeholders = implode(',', array_fill(0, count($annotationIds), '%s'));
            $replyRows = $wpdb->get_results($wpdb->prepare(
                "SELECT parent_id, content, created_by, created_at FROM $tableName WHERE parent_id IN ($placeholders) ORDER BY created_at ASC",
                $annotationIds
            ));
            if ($replyRows) {
                foreach ($replyRows as $rr) {
                    $pid = $rr->parent_id;
                    if (!isset($repliesByParent[$pid])) $repliesByParent[$pid] = array();
                    $repliesByParent[$pid][] = array(
                        'content' => $rr->content,
                        'createdBy' => $rr->created_by ?: 'Anonymous',
                        'createdAt' => $rr->created_at,
                    );
                }
            }
        }

        $annotations = array();
        foreach ($results as $row) {
            $annMeta = $row->meta_data ? json_decode($row->meta_data, true) : null;
            if (is_null($annMeta)) $annMeta = array();
            $annAtts = $annMeta['attachments'] ?? array();
            // Use cached project name if annotation doesn't have one
            if (empty($annMeta['projectName']) && !empty($row->project_id) && isset($projectNameMap[$row->project_id])) {
                $annMeta['projectName'] = $projectNameMap[$row->project_id];
            }
            self::logDebug('get_ann_item', array(
                'id' => $row->annotation_id,
                'created_at_raw' => $row->created_at,
                'meta_data_exists' => $row->meta_data ? 'yes' : 'no',
                'attachments_count' => count($annAtts),
                'projectName' => $annMeta['projectName'] ?? '',
            ));
            $annotations[] = array(
                'id' => $row->annotation_id,
                'parentId' => $row->parent_id ? (string)$row->parent_id : null,
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
                'projectId' => $row->project_id,
                'projectName' => isset($annMeta['projectName']) ? $annMeta['projectName'] : '',
                'previewToken' => $row->preview_token,
                'createdBy' => $row->created_by,
                'createdAt' => $row->created_at,
                'replies' => $repliesByParent[$row->annotation_id] ?? array(),
                'metaData' => $annMeta ?: new stdClass(),
                'media' => $annAtts,
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

        // Mirror status/content change to Vercel
        $vercelUrl = get_option('feedspace_api_url', '');
        if ($vercelUrl && !empty($data)) {
            $row = $wpdb->get_row($wpdb->prepare("SELECT preview_token FROM $tableName WHERE annotation_id = %s", $id));
            $mirrorPayload = $data;
            if ($row && !empty($row->preview_token)) {
                $mirrorPayload['previewToken'] = $row->preview_token;
            }
            $mirrorResp = wp_remote_request(trailingslashit($vercelUrl) . 'api/widget/annotations/' . $id, array(
                'method' => 'PATCH',
                'headers' => array('Content-Type' => 'application/json'),
                'body' => json_encode($mirrorPayload),
                'timeout' => 10,
                'blocking' => true,
            ));
            if (is_wp_error($mirrorResp)) {
                self::logDebug('update_mirror_error', array('id' => $id, 'error' => $mirrorResp->get_error_message()));
                update_option('feedspace_last_mirror_status_update', 'Error: ' . $mirrorResp->get_error_message());
            } else {
                $mirrorCode = wp_remote_retrieve_response_code($mirrorResp);
                $mirrorBody = wp_remote_retrieve_body($mirrorResp);
                self::logDebug('update_mirror_result', array('id' => $id, 'status' => $mirrorCode, 'body' => mb_substr($mirrorBody, 0, 200)));
                update_option('feedspace_last_mirror_status_update', $mirrorCode . ': ' . mb_substr($mirrorBody, 0, 200));
            }
        }

        return new WP_REST_Response(array('id' => $id, 'updated' => true), 200);
    }

    public function deleteAnnotation($request)
    {
        global $wpdb;
        $tableName = $wpdb->prefix . 'feedspace_annotations';
        $id = $request->get_param('id');

        $wpdb->delete($tableName, array('annotation_id' => $id));

        // Mirror delete to Vercel/Supabase
        $vercelUrl = get_option('feedspace_api_url', '');
        if ($vercelUrl) {
            self::enqueueSync($id, array('id' => $id, 'action' => 'delete'), 'delete');
            self::processSyncQueue();
        }

        return new WP_REST_Response(array('deleted' => true), 200);
    }

    public function allowAdditionalMimeTypes($mimes)
    {
        $mimes['webm'] = 'audio/webm'; // MediaRecorder audio only
        $mimes['weba'] = 'audio/webm';
        $mimes['webp'] = 'image/webp';
        $mimes['png']  = 'image/png';
        $mimes['jpg']  = 'image/jpeg';
        $mimes['jpeg'] = 'image/jpeg';
        $mimes['gif']  = 'image/gif';
        $mimes['mp4']  = 'video/mp4';
        $mimes['mp3']  = 'audio/mpeg';
        $mimes['pdf']  = 'application/pdf';
        $mimes['doc']  = 'application/msword';
        $mimes['docx'] = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        $mimes['xls']  = 'application/vnd.ms-excel';
        $mimes['xlsx'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        $mimes['zip']  = 'application/zip';
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
        register_setting('feedspace_settings', 'feedspace_api_url', array(
            'sanitize_callback' => 'esc_url_raw',
        ));
        register_setting('feedspace_settings', 'feedspace_dashboard_url', array(
            'sanitize_callback' => 'esc_url_raw',
        ));
        register_setting('feedspace_settings', 'feedspace_agency_token', array(
            'sanitize_callback' => 'sanitize_text_field',
        ));
        register_setting('feedspace_settings', 'feedspace_site_token', array(
            'sanitize_callback' => 'sanitize_text_field',
        ));
        register_setting('feedspace_settings', 'feedspace_debug_enabled');
        register_setting('feedspace_settings', 'feedspace_max_upload_size', array(
            'sanitize_callback' => 'absint',
        ));
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
        add_submenu_page(
            'feedspace',
            'Annotations',
            'Annotations',
            'manage_options',
            'feedspace-annotations',
            array($this, 'renderAnnotationsPage')
        );
    }

    public function adminEnqueueScripts($hook)
    {
        if ($hook !== 'toplevel_page_feedspace' && $hook !== 'feedspace_page_feedspace-annotations') return;

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
        $apiUrl = get_option('feedspace_api_url', '');
        ?>
        <div class="wrap">
            <h1>Feedspace Connector</h1>

            <div class="feedspace-status-card">
                <h2>Connection Status</h2>
                <p><strong>Plugin Version:</strong> <?php echo esc_html(FEEDSPACE_VERSION); ?></p>
                <p><strong>WordPress Version:</strong> <?php echo esc_html(get_bloginfo('version')); ?></p>
                <p><strong>Site URL:</strong> <?php echo esc_html($siteUrl); ?></p>
                <p><strong>REST API URL:</strong> <code><?php echo esc_url($restUrl); ?></code></p>
                <p><strong>Upload Max Size:</strong> <?php
                    $customLimit = absint(get_option('feedspace_max_upload_size', 0));
                    if ($customLimit > 0) {
                        echo esc_html($customLimit . ' MB');
                    } else {
                        echo esc_html(size_format(wp_max_upload_size()));
                    }
                ?></p>
            </div>

            <div class="feedspace-settings-card">
                <h2>Settings</h2>
                <form method="post" action="options.php">
                    <?php settings_fields('feedspace_settings'); ?>
                    <table class="form-table">
                        <tr>
                            <th>Dashboard URL</th>
                            <td>
                                <input type="url" name="feedspace_dashboard_url"
                                    value="<?php echo esc_attr(get_option('feedspace_dashboard_url', '')); ?>"
                                class="regular-text" placeholder="https://your-app.vercel.app" required />
                                <p class="description">Your Feedspace dashboard URL. Used for all API calls and mirror sync.</p>
                            </td>
                        </tr>
                        <tr>
                            <th>Agency Token</th>
                            <td>
                                <input type="text" name="feedspace_agency_token"
                                    value="<?php echo esc_attr(get_option('feedspace_agency_token', '')); ?>"
                                class="regular-text" placeholder="Paste agency token from dashboard Settings" />
                                <p class="description">Found in your Feedspace dashboard → Settings → Auto-Connect section. <button type="button" class="button button-small" onclick="autoConnect()">Auto-Connect</button> <span id="feedspace-connect-result" style="color:#6b7280;font-size:12px;"></span></p>
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
                            <th>Debug Overlay</th>
                            <td>
                                <label>
                                    <input type="checkbox" name="feedspace_debug_enabled" value="1"
                                        <?php checked(get_option('feedspace_debug_enabled'), '1'); ?> />
                                    Show debug overlay on preview pages
                                </label>
                                <p class="description">Adds a floating debug panel to help diagnose widget issues.</p>
                            </td>
                        </tr>
                        <tr>
                            <th>Max Upload Size</th>
                            <td>
                                <input type="number" name="feedspace_max_upload_size"
                                    value="<?php echo esc_attr(get_option('feedspace_max_upload_size', '0')); ?>"
                                class="small-text" min="0" step="1" placeholder="0" />
                                <span style="font-size:13px;color:#6b7280;">MB (0 = use server default of <?php echo esc_html(size_format(wp_max_upload_size())); ?>)</span>
                                <p class="description">Set a custom limit for feedback media uploads. Cannot exceed the server maximum.</p>
                            </td>
                        </tr>
                    </table>
                    <?php submit_button('Save Settings'); ?>
                </form>
            </div>

            <div class="feedspace-status-card" style="margin-top:16px;">
                <h2 style="display:flex;align-items:center;gap:12px;">
                    Debug
                    <label style="font-size:12px;font-weight:400;color:#6b7280;display:flex;align-items:center;gap:4px;cursor:pointer;">
                        <input type="checkbox" id="feedspace-debug-toggle" onchange="toggleDebugLog()"
                            <?php checked(get_option('feedspace_debug_log_enabled'), '1'); ?> />
                        Enable
                    </label>
                </h2>
                <?php if (get_option('feedspace_debug_log_enabled') === '1'): ?>
                    <div style="max-height:400px;overflow-y:auto;font-size:11px;background:#f9fafb;padding:8px;border-radius:4px;font-family:monospace;white-space:pre-wrap;">
                        <?php
                        $debugLog = get_option('feedspace_debug_log', array());
                        if (empty($debugLog)):
                            echo '<span style="color:#9ca3af;">No debug entries yet. Submit a pin or run a test to populate.</span>';
                        else:
                            foreach (array_reverse($debugLog) as $entry):
                                $time = esc_html($entry['time'] ?? '');
                                $event = esc_html($entry['event'] ?? '');
                                $line = '[' . $time . '] ' . strtoupper($event);
                                $extra = $entry;
                                unset($extra['time'], $extra['event']);
                                $parts = array();
                                foreach ($extra as $k => $v):
                                    if (is_array($v)) $v = json_encode($v);
                                    $parts[] = $k . '=' . esc_html($v);
                                endforeach;
                                if (!empty($parts)) $line .= '  ' . implode('  ', $parts);
                                echo '<div style="margin-bottom:3px;padding:2px 0;">' . $line . '</div>';
                            endforeach;
                        endif;
                        ?>
                    </div>
                    <form method="post" style="margin-top:8px;">
                        <input type="hidden" name="feedspace_clear_debug" value="1" />
                        <?php submit_button('Clear Debug Log', 'delete', '', false, array('onclick' => "return confirm('Clear all debug entries?');")); ?>
                    </form>

                    <hr style="margin:16px 0;">
                    <h3 style="font-size:14px;margin:0 0 8px;">Mirroring Status (Vercel Sync)</h3>
                    <p><strong>Vercel API URL:</strong> <code><?php echo $apiUrl ? esc_url($apiUrl) : '<span style="color:#dc2626;">NOT SET</span>'; ?></code></p>
                    <p><strong>Annotation Count (local):</strong> <span id="feedspace-local-count">...</span></p>
                    <p>
                        <strong>Last Mirror Attempt:</strong>
                        <span id="feedspace-last-mirror" style="color:#9ca3af;">
                            <?php
                            $lastId = get_option('feedspace_last_mirror_id', '');
                            $lastTime = get_option('feedspace_last_mirror_time', '');
                            $lastSuccess = get_option('feedspace_last_mirror_success', null);
                            $lastCode = get_option('feedspace_last_mirror_code', null);
                            $lastBody = get_option('feedspace_last_mirror_body', '');
                            if ($lastTime) {
                                $color = $lastSuccess ? '#059669' : '#dc2626';
                                $status = $lastSuccess ? 'SUCCESS' : 'FAILED';
                                $codeStr = ($lastCode && $lastCode > 0) ? "HTTP $lastCode" : ($lastCode === -1 ? 'URL not configured' : 'Connection error');
                                echo '<span style="color:' . esc_attr($color) . ';">' . esc_html($status) . ' – ' . esc_html($codeStr) . '</span>';
                                echo ' <span style="font-size:11px;color:#6b7280;">' . esc_html($lastTime) . '</span>';
                                if ($lastBody) {
                                    echo '<br><span style="font-size:11px;color:#6b7280;">Response: ' . esc_html(substr($lastBody, 0, 200)) . '</span>';
                                }
                                $lastDebug = get_option('feedspace_last_mirror_debug', '');
                                if ($lastDebug) {
                                    echo '<br><span style="font-size:11px;color:#6366f1;">Debug: ' . esc_html($lastDebug) . '</span>';
                                }
                            } else {
                                echo 'No mirror attempts yet. Submit a pin on a preview page to trigger one.';
                            }
                            ?>
                        </span>
                    </p>
                    <p><strong>Last Mirror Test:</strong> <span id="feedspace-mirror-result" style="color:#9ca3af;">Not tested yet</span></p>
                    <p>
                        <button type="button" class="button button-primary" id="feedspace-test-mirror" onclick="testMirroring()">Test Vercel Mirroring</button>
                        <button type="button" class="button button-secondary" id="feedspace-repush" onclick="repushAnnotations()" style="margin-left:6px;">Re-push All Local Annotations</button>
                        <span id="feedspace-test-spinner" style="display:none;margin-left:8px;"><span class="spinner is-active" style="float:none;margin:0;vertical-align:middle;"></span> Working...</span>
                    </p>
                    <p id="feedspace-repush-result" style="margin-top:10px;font-size:12px;color:#6b7280;display:none;"></p>
                    <p id="feedspace-queue-stats" style="margin-top:6px;font-size:12px;">
                        <?php
                        $qStats = FeedspaceConnector::getSyncQueueStats();
                        $totalPending = $qStats['pending'] + $qStats['retrying'];
                        if ($qStats['failed'] > 0) {
                            echo '<span style="color:#dc2626;">⚠ ' . esc_html($qStats['failed']) . ' syncs failed — <a href="#" onclick="repushAnnotations();return false;">re-push now</a></span>';
                        } elseif ($totalPending > 0) {
                            echo '<span style="color:#d97706;">⏳ ' . esc_html($totalPending) . ' syncs pending (retrying every ' . esc_html($totalPending > 5 ? '5' : '1') . ' min)</span>';
                        } else {
                            echo '<span style="color:#059669;">✓ All synced</span> <span style="color:#6b7280;">(' . esc_html($qStats['done']) . ' total)</span>';
                        }
                        ?>
                    </p>
                <?php else: ?>
                    <p style="color:#94a3b8;">Debug is disabled. Check "Enable" above to show debug log and mirroring status.</p>
                <?php endif; ?>
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
            function copyToClipboard(text) {
                if (navigator.clipboard) {
                    return navigator.clipboard.writeText(text);
                }
                var ta = document.createElement('textarea');
                ta.value = text;
                ta.style.position = 'fixed';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                return Promise.resolve();
            }

            function toggleDebugLog() {
                var enabled = document.getElementById('feedspace-debug-toggle').checked ? '1' : '0';
                fetch(ajaxurl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: 'action=feedspace_toggle_debug_log&enabled=' + enabled
                }).then(function() { location.reload(); });
            }

            function copyApiKey() {
                var key = document.getElementById('feedspace-api-key');
                copyToClipboard(key.textContent).then(function() {
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

            function testMirroring() {
                var btn = document.getElementById('feedspace-test-mirror');
                var repushBtn = document.getElementById('feedspace-repush');
                var spinner = document.getElementById('feedspace-test-spinner');
                var result = document.getElementById('feedspace-mirror-result');
                var count = document.getElementById('feedspace-local-count');

                btn.disabled = true;
                if (repushBtn) repushBtn.disabled = true;
                spinner.style.display = 'inline';
                result.style.color = '#9ca3af';
                result.textContent = 'Testing...';
                count.textContent = '...';

                fetch(ajaxurl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: 'action=feedspace_test_mirroring'
                }).then(function(r) { return r.json(); }).then(function(d) {
                    btn.disabled = false;
                    if (repushBtn) repushBtn.disabled = false;
                    spinner.style.display = 'none';

                    if (d.success) {
                        count.textContent = d.data.local_count;
                        if (d.data.mirror_ok) {
                            result.style.color = '#059669';
                            result.textContent = 'PASSED – Vercel responded ' + d.data.mirror_code + ': ' + d.data.mirror_body;
                        } else if (d.data.mirror_code > 0) {
                            result.style.color = '#dc2626';
                            result.textContent = 'FAILED – Vercel returned HTTP ' + d.data.mirror_code + ': ' + d.data.mirror_body;
                        } else if (d.data.mirror_error) {
                            result.style.color = '#d97706';
                            result.textContent = 'ERROR – ' + d.data.mirror_error;
                        } else {
                            result.style.color = '#dc2626';
                            result.textContent = 'NOT CONFIGURED – Feedspace API URL is empty. Save it in the Settings section below.';
                        }
                    } else {
                        result.style.color = '#dc2626';
                        result.textContent = 'ERROR – ' + (d.data && d.data.error ? d.data.error : 'Unknown error');
                    }
                }).catch(function(e) {
                    btn.disabled = false;
                    if (repushBtn) repushBtn.disabled = false;
                    spinner.style.display = 'none';
                    result.style.color = '#dc2626';
                    result.textContent = 'ERROR – Request failed: ' + e.message;
                });
            }

            function repushAnnotations() {
                if (!confirm('This will resend ALL local annotations to Vercel. Existing feedback_items in Supabase will not be duplicated (matching by annotation_id). Continue?')) return;

                var btn = document.getElementById('feedspace-repush');
                var testBtn = document.getElementById('feedspace-test-mirror');
                var spinner = document.getElementById('feedspace-test-spinner');
                var result = document.getElementById('feedspace-repush-result');
                var count = document.getElementById('feedspace-local-count');

                btn.disabled = true;
                if (testBtn) testBtn.disabled = true;
                spinner.style.display = 'inline';
                result.style.display = 'block';
                result.style.color = '#6b7280';
                result.textContent = 'Re-pushing...';

                fetch(ajaxurl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: 'action=feedspace_repush_annotations'
                }).then(function(r) { return r.json(); }).then(function(d) {
                    btn.disabled = false;
                    if (testBtn) testBtn.disabled = false;
                    spinner.style.display = 'none';
                    count.textContent = d.data ? d.data.local_count : '?';

                    if (d.success) {
                        var html = d.data.message + ' Processed: ' + d.data.pushed + ' pushed, ' + d.data.skipped + ' skipped, ' + d.data.errors + ' errors. Reload the page to see updated status.';
                        if (d.data.details && d.data.details.length > 0) {
                            html += '<br><br><strong>Per-annotation:</strong><br>';
                            d.data.details.forEach(function(item) {
                                var color = item.status === 'pushed' ? '#059669' : '#dc2626';
                                var info = item.status === 'pushed' ? 'HTTP ' + item.code : (item.code ? 'HTTP ' + item.code + ' ' : '') + (item.detail || '');
                                html += '<span style="color:' + color + ';">[' + item.status.toUpperCase() + '] ' + item.id + ' &mdash; ' + info + '</span><br>';
                            });
                        }
                        result.style.color = '#059669';
                        result.innerHTML = html;
                    } else {
                        result.style.color = '#dc2626';
                        result.textContent = 'ERROR: ' + (d.data && d.data.error ? d.data.error : 'Unknown');
                    }
                }).catch(function(e) {
                    btn.disabled = false;
                    if (testBtn) testBtn.disabled = false;
                    spinner.style.display = 'none';
                    result.style.color = '#dc2626';
                    result.textContent = 'ERROR: ' + e.message;
                });
            }

            function autoConnect() {
                var btn = document.querySelector('[onclick="autoConnect()"]');
                var result = document.getElementById('feedspace-connect-result');
                if (btn) btn.disabled = true;
                result.textContent = 'Connecting...';
                fetch(ajaxurl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: 'action=feedspace_connect_site'
                }).then(function(r) { return r.json(); }).then(function(d) {
                    if (btn) btn.disabled = false;
                    if (d.success) {
                        result.style.color = '#059669';
                        result.textContent = 'Connected! Site ID: ' + d.data.site_id;
                    } else {
                        result.style.color = '#dc2626';
                        result.textContent = 'Failed: ' + (d.data && d.data.error ? d.data.error : 'Unknown error');
                    }
                }).catch(function(e) {
                    if (btn) btn.disabled = false;
                    result.style.color = '#dc2626';
                    result.textContent = 'Error: ' + e.message;
                });
            }
        </script>
        <?php
    }

    public function renderAnnotationsPage()
    {
        global $wpdb;
        $tableName = $wpdb->prefix . 'feedspace_annotations';
        $statusFilter = isset($_GET['status']) ? sanitize_text_field($_GET['status']) : '';
        $urlFilter = isset($_GET['page_url']) ? esc_url_raw($_GET['page_url']) : '';

        $where = array('1=1');
        $params = array();
        $statusLabels = array('open' => 'Pending', 'in_progress' => 'Pending', 'resolved' => 'Resolved', 'closed' => 'Closed');
        if (!empty($statusFilter)) {
            if ($statusFilter === 'pending') {
                $where[] = '(status = %s OR status = %s)';
                $params[] = 'open';
                $params[] = 'in_progress';
            } else {
                $where[] = 'status = %s';
                $params[] = $statusFilter;
            }
        }
        if (!empty($urlFilter)) {
            $where[] = 'page_url = %s';
            $params[] = $urlFilter;
        }

        $whereSql = implode(' AND ', $where);
        $sql = "SELECT * FROM $tableName WHERE $whereSql ORDER BY created_at DESC";
        $results = !empty($params) ? $wpdb->get_results($wpdb->prepare($sql, $params)) : $wpdb->get_results($sql);

        $pageUrls = $wpdb->get_col("SELECT DISTINCT page_url FROM $tableName ORDER BY page_url ASC");
        ?>
        <div class="wrap">
            <h1>Feedspace Annotations</h1>
            <form method="get" style="margin:16px 0;display:flex;gap:8px;align-items:center;">
                <input type="hidden" name="page" value="feedspace-annotations" />
                <select name="status">
                    <option value="">All statuses</option>
                    <option value="pending" <?php selected($statusFilter, 'pending'); ?>>Pending</option>
                    <option value="resolved" <?php selected($statusFilter, 'resolved'); ?>>Resolved</option>
                </select>
                <select name="page_url" style="min-width:200px;">
                    <option value="">All pages</option>
                    <?php foreach ($pageUrls as $pu): ?>
                        <option value="<?php echo esc_attr($pu); ?>" <?php selected($urlFilter, $pu); ?>><?php echo esc_html($pu); ?></option>
                    <?php endforeach; ?>
                </select>
                <button type="submit" class="button">Filter</button>
                <a href="<?php echo admin_url('admin.php?page=feedspace-annotations'); ?>" class="button">Reset</a>
            </form>

            <table class="wp-list-table widefat fixed striped">
                <thead>
                    <tr>
                        <th style="width:40px;">#</th>
                        <th>Page / URL</th>
                        <th>Content</th>
                        <th style="width:60px;">Media</th>
                        <th style="width:90px;">Status</th>
                        <th style="width:60px;">Device</th>
                        <th style="width:100px;">Created by</th>
                        <th style="width:130px;">Date</th>
                        <th style="width:70px;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                <?php if (empty($results)): ?>
                    <tr><td colspan="9" style="text-align:center;padding:30px;color:#94a3b8;">No annotations found.</td></tr>
                <?php else: $idx = 0; foreach ($results as $row): $idx++;
                    $meta = $row->meta_data ? json_decode($row->meta_data, true) : array();
                    $atts = $meta['attachments'] ?? array();
                    $mediaCount = count($atts);
                    $previewUrl = add_query_arg('feedspace_dev', '1', $row->page_url);
                ?>
                    <tr>
                        <td><?php echo $idx; ?></td>
                        <td>
                            <a href="<?php echo esc_url($row->page_url); ?>" target="_blank" title="View page"><?php echo esc_html(parse_url($row->page_url, PHP_URL_PATH) ?: $row->page_url); ?></a>
                            <div style="font-size:11px;color:#94a3b8;word-break:break-all;"><?php echo esc_html($row->page_url); ?></div>
                        </td>
                        <td><?php echo esc_html(mb_substr($row->content, 0, 100)); ?></td>
                        <td style="text-align:center;">
                            <?php if ($mediaCount > 0): ?>
                                <span title="<?php echo esc_attr($mediaCount . ' file(s)'); ?>"><?php echo $mediaCount; ?></span>
                            <?php else: ?>
                                —
                            <?php endif; ?>
                        </td>
                        <td><span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;background:<?php echo in_array($row->status, array('open', 'in_progress')) ? '#fef3c7' : ($row->status === 'resolved' ? '#d1fae5' : '#e2e8f0'); ?>;color:<?php echo in_array($row->status, array('open', 'in_progress')) ? '#92400e' : ($row->status === 'resolved' ? '#065f46' : '#475569'); ?>;"><?php echo esc_html($statusLabels[$row->status] ?? $row->status); ?></span></td>
                        <td><?php echo esc_html($row->device); ?></td>
                        <td><?php echo esc_html($row->created_by); ?></td>
                        <td><?php echo esc_html($row->created_at); ?></td>
                        <td style="white-space:nowrap;">
                            <a href="<?php echo esc_url($previewUrl); ?>" target="_blank" class="button button-small" title="View on page">View</a>
                            <?php if ($mediaCount > 0): ?>
                                <button class="button button-small feedspace-save-library" data-annotation-id="<?php echo esc_attr($row->annotation_id); ?>" title="Save all media to Media Library">Save</button>
                            <?php endif; ?>
                        </td>
                    </tr>
                <?php endforeach; endif; ?>
                </tbody>
            </table>
        </div>
        <style>
            .wp-list-table th { font-weight:600; }
            .wp-list-table td { vertical-align:middle; }
            .button-small { padding:0 6px !important; min-height:28px; line-height:28px; font-size:12px; }
            .fs-library-done { opacity:0.6; pointer-events:none; }
        </style>
        <script>
        (function(){
            document.querySelectorAll('.feedspace-save-library').forEach(function(btn){
                btn.addEventListener('click', function(){
                    var self = this;
                    var annotationId = this.dataset.annotationId;
                    if (!annotationId || this.classList.contains('fs-library-done')) return;
                    this.textContent = '...';
                    fetch('<?php echo esc_url(rest_url('feedspace/v1/media/save-to-library')); ?>', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-Feedspace-Key': '<?php echo esc_js(get_option('feedspace_api_key')); ?>' },
                        body: JSON.stringify({ annotation_id: annotationId, file_url: '' })
                    })
                    .then(function(r){ return r.json(); })
                    .then(function(data){
                        if (data.saved_count > 0) {
                            self.textContent = 'Done';
                            self.classList.add('fs-library-done');
                            self.title = 'Saved ' + data.saved_count + ' file(s) to Media Library';
                        } else {
                            self.textContent = 'Err';
                            alert('Failed: ' + (data.message || JSON.stringify(data)));
                        }
                    })
                    .catch(function(err){
                        self.textContent = '❌';
                        alert('Error: ' + err.message);
                    });
                });
            });
        })();
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

add_action('wp_ajax_feedspace_toggle_debug_log', function () {
    if (!current_user_can('manage_options')) {
        wp_die('Unauthorized');
    }
    $enabled = sanitize_text_field($_POST['enabled'] ?? '0');
    update_option('feedspace_debug_log_enabled', $enabled === '1' ? '1' : '0');
    wp_send_json_success();
});

add_action('wp_ajax_feedspace_connect_site', function () {
    if (!current_user_can('manage_options')) {
        wp_die('Unauthorized');
    }
    $dashboardUrl = untrailingslashit(get_option('feedspace_dashboard_url', ''));
    $agencyToken = get_option('feedspace_agency_token', '');
    $apiKey = get_option('feedspace_api_key', '');
    $siteName = get_bloginfo('name');
    $siteUrl = get_bloginfo('url');

    if (!$dashboardUrl || !$agencyToken || !$apiKey) {
        wp_send_json_error(array('error' => 'Dashboard URL, Agency Token, and API Key are required.'));
        return;
    }

    $requestUrl = $dashboardUrl . '/api/widget/annotations';
    $requestBody = json_encode(array(
        'agencyToken' => $agencyToken,
        'siteName' => $siteName,
        'siteUrl' => $siteUrl,
        'apiKey' => $apiKey,
    ));

    FeedspaceConnector::logDebug('auto_register_request', array(
        'url' => $requestUrl,
        'body' => $requestBody,
    ));

    $response = wp_remote_post($requestUrl, array(
        'headers' => array('Content-Type' => 'application/json'),
        'body' => $requestBody,
        'timeout' => 15,
    ));

    if (is_wp_error($response)) {
        FeedspaceConnector::logDebug('auto_register_error', array('error' => $response->get_error_message()));
        wp_send_json_error(array('error' => $response->get_error_message()));
        return;
    }

    $code = wp_remote_retrieve_response_code($response);
    $respBody = wp_remote_retrieve_body($response);

    FeedspaceConnector::logDebug('auto_register_response', array(
        'code' => $code,
        'body' => $respBody,
    ));

    $body = json_decode($respBody, true);

    if ($code >= 200 && $code < 300 && !empty($body['connected'])) {
        update_option('feedspace_site_token', $body['siteId']);
        update_option('feedspace_site_connected', true);
        update_option('feedspace_api_url', $dashboardUrl);
        FeedspaceConnector::logDebug('auto_register_success', array('site_id' => $body['siteId']));
        wp_send_json_success(array('site_id' => $body['siteId']));
    } else {
        wp_send_json_error(array('error' => $body['error'] ?? ($body['message'] ?? "HTTP $code")));
    }
});

add_action('wp_ajax_feedspace_test_mirroring', function () {
    if (!current_user_can('manage_options')) {
        wp_die('Unauthorized');
    }

    global $wpdb;
    $annotationsTable = $wpdb->prefix . 'feedspace_annotations';
    $localCount = (int) $wpdb->get_var("SELECT COUNT(*) FROM $annotationsTable");

    $vercelUrl = get_option('feedspace_api_url', '');

    if (empty($vercelUrl)) {
        wp_send_json_success(array(
            'local_count' => $localCount,
            'mirror_ok' => false,
            'mirror_code' => 0,
            'mirror_body' => '',
            'mirror_error' => 'Feedspace API URL is not configured. Go to Settings section and enter your Vercel app URL (e.g. https://client-portal-silk-three.vercel.app).',
        ));
    }

    $testUrl = trailingslashit($vercelUrl) . 'api/widget/annotations';
    $testPayload = array(
        '_test' => true,
        'type' => 'pin',
        'content' => 'Test ping from Feedspace Connector',
        'pageUrl' => get_bloginfo('url'),
        'selector' => null,
        'elementDna' => null,
        'coordinatesX' => 0,
        'coordinatesY' => 0,
        'coordinatesXEnd' => null,
        'coordinatesYEnd' => null,
        'width' => null,
        'height' => null,
        'drawData' => null,
        'viewportWidth' => 1440,
        'viewportHeight' => 900,
        'device' => 'desktop',
        'createdBy' => 'Test',
        'metaData' => array(),
    );

    FeedspaceConnector::logDebug('test_start', array('url' => $testUrl));

    $result = wp_remote_post($testUrl, array(
        'headers' => array('Content-Type' => 'application/json'),
        'body' => json_encode($testPayload),
        'timeout' => 15,
    ));

    if (is_wp_error($result)) {
        $errMsg = $result->get_error_message();
        FeedspaceConnector::logDebug('test_http_error', array('error' => $errMsg));
        wp_send_json_success(array(
            'local_count' => $localCount,
            'mirror_ok' => false,
            'mirror_code' => 0,
            'mirror_body' => '',
            'mirror_error' => $errMsg,
        ));
    }

    $code = (int) wp_remote_retrieve_response_code($result);
    $body = wp_remote_retrieve_body($result);
    $ok = ($code >= 200 && $code < 300);

    FeedspaceConnector::logDebug('test_result', array('code' => $code, 'body' => $body, 'success' => $ok));

    wp_send_json_success(array(
        'local_count' => $localCount,
        'mirror_ok' => $ok,
        'mirror_code' => $code,
        'mirror_body' => $body,
        'mirror_error' => '',
    ));
});

add_action('wp_ajax_feedspace_repush_annotations', function () {
    if (!current_user_can('manage_options')) {
        wp_die('Unauthorized');
    }

    global $wpdb;
    $annotationsTable = $wpdb->prefix . 'feedspace_annotations';
    $vercelUrl = get_option('feedspace_api_url', '');

    if (empty($vercelUrl)) {
        wp_send_json_error(array('error' => 'Feedspace API URL is not configured.'));
    }

    $annotations = $wpdb->get_results("SELECT * FROM $annotationsTable ORDER BY created_at ASC");
    $total = count($annotations);
    $pushed = 0;
    $errors = 0;
    $perItem = array();

    foreach ($annotations as $row) {
        $elementDna = $row->element_dna ? json_decode($row->element_dna, true) : null;
        $drawData = $row->draw_data ? json_decode($row->draw_data, true) : null;
        $annMeta = $row->meta_data ? json_decode($row->meta_data, true) : null;
        $annAtts = $annMeta['attachments'] ?? array();

        $payload = array(
            'id' => $row->annotation_id,
            'projectId' => $row->project_id,
            'type' => $row->type,
            'content' => $row->content,
            'pageUrl' => $row->page_url,
            'selector' => $row->selector,
            'elementDna' => $elementDna,
            'coordinatesX' => floatval($row->coordinates_x ?? 50),
            'coordinatesY' => floatval($row->coordinates_y ?? 50),
            'coordinatesXEnd' => $row->coordinates_x_end ? floatval($row->coordinates_x_end) : null,
            'coordinatesYEnd' => $row->coordinates_y_end ? floatval($row->coordinates_y_end) : null,
            'width' => $row->width ? floatval($row->width) : null,
            'height' => $row->height ? floatval($row->height) : null,
            'drawData' => $drawData,
            'viewportWidth' => intval($row->viewport_width),
            'viewportHeight' => intval($row->viewport_height),
            'device' => $row->device ?: 'desktop',
            'createdBy' => $row->created_by ?: 'Anonymous',
            'metaData' => $annMeta ?: new stdClass(),
            'media' => $annAtts,
        );

        $postUrl = trailingslashit($vercelUrl) . 'api/widget/annotations';
        FeedspaceConnector::logDebug('repush_start', array('annotation_id' => $row->annotation_id, 'url' => $postUrl, 'projectId' => $row->project_id));

        $result = wp_remote_post($postUrl, array(
            'headers' => array('Content-Type' => 'application/json'),
            'body' => json_encode($payload),
            'timeout' => 15,
        ));

        if (is_wp_error($result)) {
            $errMsg = $result->get_error_message();
            FeedspaceConnector::logDebug('repush_error', array('annotation_id' => $row->annotation_id, 'error' => $errMsg));
            $errors++;
            $perItem[] = array('id' => $row->annotation_id, 'status' => 'error', 'detail' => $errMsg);
            continue;
        }

        $code = (int) wp_remote_retrieve_response_code($result);
        $respBody = wp_remote_retrieve_body($result);

        if ($code >= 200 && $code < 300) {
            $pushed++;
            $perItem[] = array('id' => $row->annotation_id, 'status' => 'pushed', 'code' => $code);
            FeedspaceConnector::logDebug('repush_ok', array('annotation_id' => $row->annotation_id, 'code' => $code, 'body' => $respBody));
        } else {
            $errors++;
            $perItem[] = array('id' => $row->annotation_id, 'status' => 'error', 'code' => $code, 'detail' => $respBody);
            FeedspaceConnector::logDebug('repush_fail', array('annotation_id' => $row->annotation_id, 'code' => $code, 'body' => $respBody));
        }
    }

    wp_send_json_success(array(
        'local_count' => $total,
        'pushed' => $pushed,
        'skipped' => 0,
        'errors' => $errors,
        'details' => $perItem,
        'message' => "Re-pushed $pushed of $total local annotations to Vercel ($errors errors).",
    ));
});

add_action('admin_init', function () {
    if (isset($_POST['feedspace_clear_debug'])) {
        delete_option('feedspace_debug_log');
        wp_redirect(admin_url('admin.php?page=feedspace'));
        exit;
    }
});

