<?php
/**
 * Plugin Name:       Previu – Visual Client Feedback for Elementor
 * Plugin URI:        https://plugin.usepreviu.com
 * Description:       Generate shareable review links for clients. They annotate your Elementor site with arrows, comments, shapes & text changes. See all feedback in the dashboard and inside the Elementor editor.
 * Version:           2.2.1
 * Requires at least: 5.8
 * Tested up to: 7.0
 * Requires PHP:      7.4
 * Author:            arhamashfaq
 * Author URI:
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       previu-visual-client-feedback-for-elementor
 * Domain Path:       /languages
 *
 * Elementor tested up to: 3.25
 * Requires Plugins: elementor
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/* ─── Constants ──────────────────────────────────────────────── */
define( 'CCFE_VERSION', '2.2.1' );
define( 'CCFE_PLUGIN_FILE',  __FILE__ );
define( 'CCFE_PLUGIN_DIR',   plugin_dir_path( __FILE__ ) );
define( 'CCFE_PLUGIN_URL',   plugin_dir_url( __FILE__ ) );
define( 'CCFE_PLUGIN_BASE',  plugin_basename( __FILE__ ) );

/* ─── Includes ───────────────────────────────────────────────── */
require_once CCFE_PLUGIN_DIR . 'includes/class-database.php';
require_once CCFE_PLUGIN_DIR . 'includes/class-rest-api.php';
require_once CCFE_PLUGIN_DIR . 'includes/class-review-page.php';
require_once CCFE_PLUGIN_DIR . 'includes/class-admin-dashboard.php';
require_once CCFE_PLUGIN_DIR . 'includes/class-elementor-integration.php';

/* ─── Activation / Deactivation ──────────────────────────────── */
register_activation_hook( __FILE__, array( 'CCFE_Database', 'activate' ) );
register_deactivation_hook( __FILE__, array( 'CCFE_Database', 'deactivate' ) );
register_uninstall_hook( __FILE__, 'ccfe_uninstall' );

/* ─── Boot ───────────────────────────────────────────────────── */
add_action( 'plugins_loaded', 'ccfe_boot' );

function ccfe_boot() {
    // Initialize core modules — Database handles its own version check on instantiation
    CCFE_Database::instance();

    CCFE_Rest_API::instance();
    CCFE_Review_Page::instance();
    CCFE_Admin_Dashboard::instance();

    // Elementor integration — only if Elementor is active
    if ( did_action( 'elementor/loaded' ) ) {
        CCFE_Elementor_Integration::instance();
    }
}

/* ─── Plugin Action Links ────────────────────────────────────── */
add_filter( 'plugin_action_links_' . CCFE_PLUGIN_BASE, function ( $links ) {
    $dashboard = '<a href="' . admin_url( 'admin.php?page=ccfe_clientmark' ) . '">Previu</a>';
    array_unshift( $links, $dashboard );
    return $links;
} );

/* ─── Uninstall ──────────────────────────────────────────────── */
function ccfe_uninstall() {
    global $wpdb;

    // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange
    $wpdb->query( "DROP TABLE IF EXISTS `{$wpdb->prefix}ccfe_annotations`" );
    // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange
    $wpdb->query( "DROP TABLE IF EXISTS `{$wpdb->prefix}ccfe_projects`" );
    // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
    $wpdb->query( $wpdb->prepare( "DELETE FROM `{$wpdb->options}` WHERE option_name LIKE %s", 'ccfe_%' ) );

    remove_role( 'ccfe_client' );
}
