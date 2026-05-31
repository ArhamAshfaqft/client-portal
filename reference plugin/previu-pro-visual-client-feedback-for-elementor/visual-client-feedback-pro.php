<?php
/**
 * Plugin Name:       Previu Pro – Visual Client Feedback for Elementor
 * Plugin URI:        https://plugin.usepreviu.com
 * Description:       Unlocks white-label, file uploads, voice recording, screenshot tool, Slack notifications, and media library for Previu.
 * Version:           1.0.0
 * Requires at least: 5.8
 * Tested up to:      7.0
 * Requires PHP:      7.4
 * Author:            arhamashfaq
 * Author URI:        https://plugin.usepreviu.com
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       previu-pro-visual-client-feedback-for-elementor
 * Domain Path:       /languages
 *
 * Requires Plugins:  previu-visual-client-feedback-for-elementor
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/* ─── Constants ──────────────────────────────────────────────── */
define( 'CCFE_PRO_VERSION', '1.0.1' );
define( 'CCFE_PRO_FILE',    __FILE__ );
define( 'CCFE_PRO_DIR',     plugin_dir_path( __FILE__ ) );
define( 'CCFE_PRO_URL',     plugin_dir_url( __FILE__ ) );
define( 'CCFE_PRO_BASE',    plugin_basename( __FILE__ ) );

/* ─── Free-plugin guard ──────────────────────────────────────── */
add_action( 'admin_init', function () {
    if ( ! class_exists( 'CCFE_Database' ) ) {
        deactivate_plugins( CCFE_PRO_BASE );
        add_action( 'admin_notices', function () {
            echo '<div class="notice notice-error"><p><strong>Previu Pro</strong> requires the free <em>Previu – Visual Client Feedback for Elementor</em> plugin to be installed and active.</p></div>';
        } );
    }
} );

/* ─── Includes ───────────────────────────────────────────────── */
require_once CCFE_PRO_DIR . 'includes/class-pro-core.php';
require_once CCFE_PRO_DIR . 'includes/class-pro-settings.php';
require_once CCFE_PRO_DIR . 'includes/class-pro-uploads.php';
require_once CCFE_PRO_DIR . 'includes/class-pro-slack.php';
require_once CCFE_PRO_DIR . 'includes/class-pro-white-label.php';
require_once CCFE_PRO_DIR . 'includes/class-pro-assets.php';
require_once CCFE_PRO_DIR . 'includes/class-pro-media-db.php';

/* ─── Boot ───────────────────────────────────────────────────── */
add_action( 'plugins_loaded', 'ccfe_pro_boot', 20 );

function ccfe_pro_boot() {
    if ( ! class_exists( 'CCFE_Database' ) ) {
        return;
    }

    CCFE_Pro_Core::instance();
    CCFE_Pro_Settings::instance();
    CCFE_Pro_Uploads::instance();
    CCFE_Pro_Slack::instance();
    CCFE_Pro_White_Label::instance();
    CCFE_Pro_Assets::instance();
    CCFE_Pro_Media_DB::instance();
}
