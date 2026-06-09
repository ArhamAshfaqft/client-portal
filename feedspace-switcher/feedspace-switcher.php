<?php
/**
 * Plugin Name: FeedDash Switcher
 * Description: One-click deactivate + delete FeedDash Connector for quick re-upload
 * Version: 1.0
 * Author: FeedDash
 */

defined('ABSPATH') or die;

add_filter('plugin_action_links_feedspace-connector/feedspace-connector.php', function ($links) {
    $url = wp_nonce_url(
        admin_url('admin-post.php?action=feeddash_replace'),
        'feeddash_replace'
    );
    $links['feeddash_replace'] = '<a href="' . esc_url($url) . '" style="color:#d63638;font-weight:600;" onclick="return confirm(\'Deactivate & delete FeedDash Connector?\')">Replace</a>';
    return $links;
});

add_action('admin_post_feeddash_replace', function () {
    if (!current_user_can('activate_plugins')) {
        wp_die('Unauthorized');
    }
    check_admin_referer('feeddash_replace');

    $plugin = 'feedspace-connector/feedspace-connector.php';

    if (is_plugin_active($plugin)) {
        deactivate_plugins($plugin);
    }

    delete_plugins(array($plugin));

    wp_redirect(admin_url('plugin-install.php?tab=upload'));
    exit;
});
