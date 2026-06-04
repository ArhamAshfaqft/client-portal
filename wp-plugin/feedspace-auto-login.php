<?php
/**
 * Plugin Name: Feedspace Auto Login
 * Description: Secure one-click login from Feedspace dashboard. No passwords shared.
 * Version:     1.0.0
 * Author:      Feedspace
 * License:     GPL v2 or later
 *
 * Install: Upload to /wp-content/plugins/ and activate, or copy the REST
 * endpoint callback into your existing Feedspace companion plugin.
 */

defined( 'ABSPATH' ) || exit;

add_action( 'rest_api_init', function () {
  register_rest_route( 'feedspace/v1', '/auto-login', [
    'methods'             => 'GET',
    'callback'            => 'feedspace_auto_login',
    'permission_callback' => '__return_true',
  ] );
} );

function feedspace_auto_login( WP_REST_Request $request ) {
  $token = $request->get_param( 'token' );
  if ( ! $token || ! str_contains( $token, '.' ) ) {
    wp_die( 'Invalid token format.', 'Feedspace Login', [ 'response' => 400 ] );
  }

  // 1. Parse token
  [ $payload_b64, $signature ] = explode( '.', $token, 2 );
  $payload = json_decode( base64_decode( $payload_b64 ), true );

  if ( ! $payload || empty( $payload['sub'] ) || empty( $payload['sid'] ) ) {
    wp_die( 'Invalid token payload.', 'Feedspace Login', [ 'response' => 400 ] );
  }

  // 2. Verify expiry
  if ( isset( $payload['exp'] ) && $payload['exp'] < time() ) {
    wp_die( 'Token expired. Please re-login from the Feedspace dashboard.', 'Feedspace Login', [ 'response' => 401 ] );
  }

  // 3. Verify HMAC signature using stored feedspace_api_key option
  $api_key = get_option( 'feedspace_api_key' );
  if ( ! $api_key ) {
    // Fallback: also check the old Connector option key
    $api_key = get_option( 'feedspace_connector_api_key' );
  }
  if ( ! $api_key ) {
    wp_die( 'Feedspace API key not found. Reconnect the Connector plugin.', 'Feedspace Login', [ 'response' => 500 ] );
  }

  $expected_sig = hash_hmac( 'sha256', $payload_b64, $api_key, true );
  $expected_b64 = rtrim( strtr( base64_encode( $expected_sig ), '+/', '-_' ), '=' );

  if ( ! hash_equals( $expected_b64, $signature ) ) {
    wp_die( 'Token signature mismatch.', 'Feedspace Login', [ 'response' => 403 ] );
  }

  // 4. Log the dev in as the admin who connected the plugin
  $admin_user = get_users( [ 'role' => 'administrator', 'number' => 1 ] );
  if ( empty( $admin_user ) ) {
    wp_die( 'No admin user found.', 'Feedspace Login', [ 'response' => 500 ] );
  }

  $admin = $admin_user[0];
  wp_set_current_user( $admin->ID );
  wp_set_auth_cookie( $admin->ID );

  // 5. Log the event (stored locally, can be extended to POST back to Feedspace)
  $dev_name = $payload['name'] ?? 'Unknown';
  update_option( 'feedspace_last_login', [
    'dev_name' => $dev_name,
    'time'     => current_time( 'mysql' ),
  ] );

  // 6. Redirect to WP admin dashboard
  wp_redirect( admin_url() );
  exit;
}
