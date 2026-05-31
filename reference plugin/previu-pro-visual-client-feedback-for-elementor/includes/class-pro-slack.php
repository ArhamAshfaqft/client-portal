<?php
if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Sends Slack notifications when a client leaves feedback.
 */
class CCFE_Pro_Slack {
    private static $instance = null;

    public static function instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action( 'ccfe_annotation_created', [ $this, 'notify' ], 10, 2 );
    }

    /**
     * Post a rich Slack message via the configured webhook.
     *
     * @param array $annotation  The newly created annotation.
     * @param array $project     The project the annotation belongs to.
     */
    public function notify( $annotation, $project ) {
        $webhook = get_option( 'ccfe_slack_webhook', '' );
        if ( empty( $webhook ) ) {
            return;
        }

        $client_name = ! empty( $annotation['client_name'] )
            ? $annotation['client_name']
            : ( ! empty( $project['client_name'] ) ? $project['client_name'] : 'A client' );

        $comment = ! empty( $annotation['comment_text'] )
            ? mb_substr( $annotation['comment_text'], 0, 280 )
            : '(no comment)';

        $type_emoji = [
            'pin'   => '📌',
            'rect'  => '⬜',
            'arrow' => '➡️',
            'draw'  => '✏️',
            'text'  => '💬',
        ];
        $emoji = $type_emoji[ $annotation['type'] ] ?? '📎';

        $page_url = home_url( $annotation['page_path'] ?? '/' );
        $page_label = ( $annotation['page_path'] ?? '/' ) === '/' ? 'Home' : $annotation['page_path'];
        $project_title = $project['title'] ?? 'Untitled';

        $payload = [
            'attachments' => [
                [
                    'color'      => '#6366f1',
                    'title'      => "{$emoji} New feedback on «{$project_title}»",
                    'title_link' => $page_url . '?ccfe_review=' . $project['share_token'],
                    'fields'     => [
                        [
                            'title' => 'Comment',
                            'value' => $comment,
                            'short' => false,
                        ],
                        [
                            'title' => 'Client',
                            'value' => esc_html( $client_name ),
                            'short' => true,
                        ],
                        [
                            'title' => 'Type',
                            'value' => ucfirst( $annotation['type'] ),
                            'short' => true,
                        ],
                        [
                            'title' => 'Page',
                            'value' => '<' . esc_url( $page_url ) . '|' . esc_html( $page_label ) . '>',
                            'short' => false,
                        ],
                    ],
                    'footer'     => 'Previu',
                    'ts'         => strtotime( $annotation['created_at'] ?? 'now' ),
                ],
            ],
        ];

        $response = wp_remote_post( $webhook, [
            'headers' => [ 'Content-Type' => 'application/json' ],
            'body'    => wp_json_encode( $payload ),
            'timeout' => 10,
        ] );

        if ( is_wp_error( $response ) ) {
        }
    }
}
