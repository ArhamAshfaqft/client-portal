$path = "e:\White label Client Portal\feeddash-connector\feeddash-connector.php"
$lines = [System.IO.File]::ReadAllLines($path)
Write-Host "Original line count: $($lines.Count)"

# Lines 1000-1022 (0-indexed) are broken. Line 1000 is the $wpdb->delete line (ok),
# line 1001 is $cleaned++ (ok), then 1002-1022 are orphaned $data array entries
# that belong in createAnnotation but lost their function wrapper.

$before = $lines[0..999]  # up to and including $wpdb->delete line

$replacement = @"
            `$cleaned++;
        }

        return new WP_REST_Response(array(
            'cleaned' => `$cleaned,
            'message' => "Cleaned up `$cleaned expired media files",
        ), 200);
    }

    public function toggleFeedbackMode(`$request)
    {
        `$enabled = (bool) `$request->get_param('enabled');
        update_option('feeddash_feedback_mode', `$enabled ? 'enabled' : 'disabled');
        return new WP_REST_Response(array(
            'feedback_mode' => `$enabled ? 'enabled' : 'disabled',
        ), 200);
    }

    public function createAnnotation(`$request)
    {
        global `$wpdb;
        `$tableName = `$wpdb->prefix . 'feeddash_annotations';
        `$body = `$request->get_json_params();

        `$annotationId = wp_generate_uuid4();
        `$now = gmdate('Y-m-d H:i:s');

        self::logDebug('create_ann_start', array(
            'body_keys'  => array_keys(`$body),
            'has_media'  => isset(`$body['media']) ? count(`$body['media']) : 0,
            'has_meta'   => isset(`$body['metaData']) ? 'yes' : 'no',
            'content'    => substr(`$body['content'] ?? '', 0, 50),
        ));

        `$incomingMeta = isset(`$body['metaData']) && is_array(`$body['metaData']) ? `$body['metaData'] : array();
        `$rawMedia = isset(`$body['media']) && is_array(`$body['media']) ? `$body['media'] : array();
        if (!empty(`$rawMedia)) {
            `$cleanMedia = array();
            foreach (`$rawMedia as `$m) {
                `$cleanMedia[] = array(
                    'id'       => sanitize_text_field(`$m['id'] ?? ''),
                    'fileUrl'  => esc_url_raw(`$m['fileUrl'] ?? ''),
                    'fileType' => sanitize_text_field(`$m['fileType'] ?? ''),
                    'fileName' => sanitize_text_field(`$m['fileName'] ?? ''),
                );
            }
            `$incomingMeta['attachments'] = `$cleanMedia;
        }
        if (!empty(`$body['projectName'])) {
            `$incomingMeta['projectName'] = sanitize_text_field(`$body['projectName']);
        }

        `$data = array(
            'annotation_id' => `$annotationId,
            'project_id'    => sanitize_text_field(`$body['projectId'] ?? ''),
            'type'          => sanitize_text_field(`$body['type'] ?? 'pin'),
            'content'       => sanitize_textarea_field(`$body['content'] ?? ''),
            'page_url'      => remove_query_arg('feeddash_preview', esc_url_raw(`$body['pageUrl'] ?? '')),
            'meta_data'     => !empty(`$incomingMeta) ? wp_json_encode(`$incomingMeta) : null,
            'selector'              => sanitize_text_field(`$body['selector'] ?? ''),
            'coordinates_x'         => isset(`$body['coordinatesX'])    ? floatval(`$body['coordinatesX'])    : null,
            'coordinates_y'         => isset(`$body['coordinatesY'])    ? floatval(`$body['coordinatesY'])    : null,
            'coordinates_x_end'     => isset(`$body['coordinatesXEnd']) ? floatval(`$body['coordinatesXEnd']) : null,
            'coordinates_y_end'     => isset(`$body['coordinatesYEnd']) ? floatval(`$body['coordinatesYEnd']) : null,
            'width'                 => isset(`$body['width'])  ? floatval(`$body['width'])  : null,
            'height'                => isset(`$body['height']) ? floatval(`$body['height']) : null,
            'draw_data'    => isset(`$body['drawData'])   ? (is_string(`$body['drawData'])   ? `$body['drawData']   : wp_json_encode(`$body['drawData']))   : null,
            'element_dna'  => isset(`$body['elementDna']) ? (is_string(`$body['elementDna']) ? `$body['elementDna'] : wp_json_encode(`$body['elementDna'])) : null,
            'viewport_width'  => intval(`$body['viewportWidth']  ?? 0),
            'viewport_height' => intval(`$body['viewportHeight'] ?? 0),
            'device'       => sanitize_text_field(`$body['device']       ?? 'desktop'),
            'preview_token' => sanitize_text_field(`$body['previewToken'] ?? ''),
            'status'       => 'open',
            'created_by'   => sanitize_text_field(`$body['createdBy'] ?? 'Anonymous'),
            'created_at'   => `$now,
        );
"@

$replacementLines = $replacement -split "`r?`n"

$after = $lines[1022..($lines.Count - 1)]  # from the ); line onward

$newLines = $before + $replacementLines + $after

[System.IO.File]::WriteAllLines($path, $newLines)
Write-Host "Fixed. New line count: $($newLines.Count)"
