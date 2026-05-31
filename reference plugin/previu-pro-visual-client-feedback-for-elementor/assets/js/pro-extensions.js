/**
 * Previu Pro — Comment Panel Extensions
 * Hooks into the free plugin's custom events to add file uploads
 * and voice recording UI. Exposes a shared API for other pro modules.
 */
(function () {
  'use strict';

  if (!window.ccfeReview || !window.ccfePro) return;

  var cfg = window.ccfePro;
  var reviewCfg = window.ccfeReview;

  var audioIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15 8a5 5 0 0 1 0 8"/></svg>';
  var micSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="1.8"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" style="fill:none!important;stroke:rgba(255,255,255,0.8);"/><path d="M19 10v2a7 7 0 0 1-14 0v-2" style="fill:none!important;stroke:rgba(255,255,255,0.8);"/><line x1="12" y1="19" x2="12" y2="23" style="stroke:rgba(255,255,255,0.8);"/><line x1="8" y1="23" x2="16" y2="23" style="stroke:rgba(255,255,255,0.8);"/></svg>';
  var videoSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2" style="fill:none!important;stroke:currentColor;"/></svg>';
  var docSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" style="fill:none!important;stroke:currentColor;"/><polyline points="14 2 14 8 20 8" style="fill:none!important;stroke:currentColor;"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>';

  // Tell the free plugin's Elementor panel that Pro is active
  window.ccfeProActive = true;

  // Apply white-label branding from page data (instant), then refresh from live API
  function tryApplyWhiteLabel() {
    if (reviewCfg.removeBranding || reviewCfg.proActive) {
      applyWhiteLabel();
    }
    refreshWhiteLabel();
  }

  // Retry until toolbar elements exist (handles any timing edge case)
  var wlRetries = 0;
  function waitAndApply() {
    if (document.querySelector('.ccfe-toolbar-brand')) {
      tryApplyWhiteLabel();
      return;
    }
    wlRetries++;
    if (wlRetries > 50) return; // 5 second timeout
    setTimeout(waitAndApply, 100);
  }
  waitAndApply();

  /* ── Shared state ─────────────────────────────────────────── */
  var pendingUploads = [];

  /* ══════════════════════════════════════════════════════════════
     SHARED API — used by pro-screenshot.js, pro-voice-recorder.js
     ══════════════════════════════════════════════════════════════ */
  window.CCFE_ProExtensions = {

    /**
     * Add an uploaded file to the pending list so it gets attached
     * when the user saves the annotation.
     */
    addUpload: function (data) {
      pendingUploads.push(data);
      var container = document.getElementById('ccfe-cp-extensions');
      if (container) renderUploadPreviews(pendingUploads, container);
    },

    /**
     * Open the comment panel at a given position with media pre-attached.
     * Called by screenshot tool after upload succeeds.
     */
    openCommentWithMedia: function (x, y) {
      // Simulate a "pin" click to trigger the free plugin's comment panel
      // We create a minimal annotation object for the panel
      var tempAnnotation = {
        id: 'temp-' + Date.now(),
        type: 'pin',
        status: 'pending',
        elementor_data_id: '',
        element_selector: '',
        element_tag: 'DIV',
        element_text: '',
        element_fingerprint: '',
        anchor_x_pct: 50,
        anchor_y_pct: 50,
        context_title: 'Screenshot',
        created_at: new Date().toISOString(),
        meta_data: { device: 'desktop' },
        color: '#6366f1',
      };

      // Dispatch to the free plugin's internal openCommentPanel
      // We can't call it directly (it's inside the IIFE), so we
      // dispatch an event that the free plugin handles.
      document.dispatchEvent(new CustomEvent('ccfe_open_comment_panel', {
        detail: { x: x, y: y, annotation: tempAnnotation }
      }));
    },

    /**
     * Get current pending uploads (read-only).
     */
    getPendingUploads: function () {
      return pendingUploads.slice();
    },
  };

  /* ── White-Label ──────────────────────────────────────────── */
  function applyWhiteLabel(settings) {
    var s = settings || reviewCfg;
    var brandImg = document.querySelector('.ccfe-toolbar-brand img');
    var brandSpan = document.querySelector('.ccfe-toolbar-brand span');

    // Logo: always enforce 22x22 box with object-fit to preserve aspect ratio
    if (brandImg && s.portalLogo) {
      brandImg.src = s.portalLogo;
      brandImg.style.cssText = 'display:block;flex-shrink:0;width:22px;height:22px;object-fit:cover;border-radius:0;';
      var radius = parseInt(s.logoBorderRadius) || 0;
      if (radius) {
        brandImg.style.borderRadius = radius + 'px';
      }
    }

    // Hide logo entirely if setting is on
    if (brandImg && s.removeLogo) {
      brandImg.style.display = 'none';
    }

    // Agency name text
    if (brandSpan && s.agencyName) {
      brandSpan.textContent = s.agencyName;
    }

    // Remove branding text
    if (s.removeBranding) {
      if (brandSpan) brandSpan.style.display = 'none';

      var poweredBy = document.querySelector('.ccfe-powered-by');
      if (poweredBy) poweredBy.style.display = 'none';
    }
  }

  /* ── Refresh branding from live API (bypasses cached page data) ── */
  function refreshWhiteLabel() {
    var apiUrl = cfg.restUrl.replace(/\/$/, '') + '/media/config';
    var sep = apiUrl.indexOf('?') > -1 ? '&' : '?';
    apiUrl += sep + '_t=' + Date.now();
    fetch(apiUrl, {
      headers: { 'X-WP-Nonce': cfg.nonce },
      cache: 'no-store',
    })
      .then(function (r) { return r.json(); })
      .then(function (conf) {
        // Map snake_case API keys → camelCase for applyWhiteLabel
          applyWhiteLabel({
            portalLogo: conf.portal_logo,
            agencyName: conf.agency_name,
            removeBranding: conf.remove_branding,
            removeLogo: conf.remove_logo,
            logoBorderRadius: conf.logo_border_radius,
          });
      })
      .catch(function () {});
  }

  /* ── Upload utility ───────────────────────────────────────── */
  function uploadFile(file) {
    return new Promise(function (resolve, reject) {
      var formData = new FormData();
      formData.append('file', file);

      var url = cfg.restUrl.replace(/\/$/, '') + '/media/upload';
      var sep = url.indexOf('?') > -1 ? '&' : '?';
      url += sep + '_t=' + Date.now();

      fetch(url, {
        method: 'POST',
        body: formData,
        headers: { 'X-WP-Nonce': cfg.nonce },
        cache: 'no-store',
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.url) resolve(data);
          else reject(new Error(data.message || 'Upload failed'));
        })
        .catch(reject);
    });
  }

  /* ── File Input Injection ─────────────────────────────────── */
  function injectProUploadUI(panel) {
    var row = panel.querySelector('#ccfe-cp-extensions');
    if (!row) return;

    // Find the media icons row
    var mediaRow = row.previousElementSibling;
    if (!mediaRow) return;
    var icons = mediaRow.querySelectorAll('div');
    if (icons.length < 4) return;

    // Set all icons to neutral disabled state first (override any stale activation)
    function disableIcon(el, msg) {
      el.style.opacity = '0.2';
      el.style.cursor = 'not-allowed';
      el.title = msg || 'File uploads disabled';
      el.onclick = null;
    }
    icons.forEach(function (el) { disableIcon(el, 'Loading...'); });

    // Fetch fresh config from server (bypasses any cached page data)
    var apiUrl = cfg.restUrl.replace(/\/$/, '') + '/media/config';
    var sep = apiUrl.indexOf('?') > -1 ? '&' : '?';
    apiUrl += sep + '_t=' + Date.now();

    fetch(apiUrl, {
      headers: { 'X-WP-Nonce': cfg.nonce },
      cache: 'no-store',
    })
      .then(function (r) { return r.json(); })
      .then(function (conf) {
        // Master toggle — disable all if file_uploads is off
        if (conf.file_uploads === false) {
          icons.forEach(function (el) { disableIcon(el, 'File uploads disabled'); });
          return;
        }

        // Add hidden file input on first activation
        var existingInput = document.getElementById('ccfe-pro-file-input');
        if (!existingInput) {
          var input = document.createElement('input');
          input.type = 'file';
          input.id = 'ccfe-pro-file-input';
          input.multiple = true;
          input.accept = '';
          input.style.display = 'none';
          document.body.appendChild(input);
          input.addEventListener('change', function () {
            handleFiles(this.files);
            this.value = '';
          });
        }

        // Per-type activation
        if (conf.uploads_images !== false) {
          icons[0].style.opacity = '1';
          icons[0].style.cursor = 'pointer';
          icons[0].title = 'Upload image';
          icons[0].onclick = function () { triggerUpload('image/*'); };
        } else {
          disableIcon(icons[0], 'Image uploads disabled');
        }
        if (conf.uploads_video !== false) {
          icons[1].style.opacity = '1';
          icons[1].style.cursor = 'pointer';
          icons[1].title = 'Upload video';
          icons[1].onclick = function () { triggerUpload('video/*'); };
        } else {
          disableIcon(icons[1], 'Video uploads disabled');
        }
        if (conf.uploads_audio !== false) {
          icons[2].style.opacity = '1';
          icons[2].style.cursor = 'pointer';
          icons[2].title = 'Upload audio';
          icons[2].onclick = function () { triggerUpload('audio/*'); };
        } else {
          disableIcon(icons[2], 'Audio uploads disabled');
        }
        if (conf.uploads_docs !== false) {
          icons[3].style.opacity = '1';
          icons[3].style.cursor = 'pointer';
          icons[3].title = 'Attach file';
          icons[3].onclick = function () { triggerUpload('.pdf,.doc,.docx,.txt,.csv,.zip,.rar,.gz'); };
        } else {
          disableIcon(icons[3], 'Document uploads disabled');
        }
      })
      .catch(function () {
        // Fallback: use page-localized data if API call fails
        if (reviewCfg.fileUploads === false) {
          icons.forEach(function (el) { disableIcon(el, 'File uploads disabled'); });
          return;
        }
        if (reviewCfg.uploadsImages !== false) {
          icons[0].style.opacity = '1';
          icons[0].style.cursor = 'pointer';
          icons[0].title = 'Upload image';
          icons[0].onclick = function () { triggerUpload('image/*'); };
        }
        if (reviewCfg.uploadsVideo !== false) {
          icons[1].style.opacity = '1';
          icons[1].style.cursor = 'pointer';
          icons[1].title = 'Upload video';
          icons[1].onclick = function () { triggerUpload('video/*'); };
        }
        if (reviewCfg.uploadsAudio !== false) {
          icons[2].style.opacity = '1';
          icons[2].style.cursor = 'pointer';
          icons[2].title = 'Upload audio';
          icons[2].onclick = function () { triggerUpload('audio/*'); };
        }
        if (reviewCfg.uploadsDocs !== false) {
          icons[3].style.opacity = '1';
          icons[3].style.cursor = 'pointer';
          icons[3].title = 'Attach file';
          icons[3].onclick = function () { triggerUpload('.pdf,.doc,.docx,.txt,.csv,.zip,.rar,.gz'); };
        }
      });

    // Add mic button next to Save for voice recording (dedup)
    if (window.CCFE_VoiceRecorder && window.CCFE_VoiceRecorder.open) {
      var saveRow = panel.querySelector('#ccfe-cp-save');
      if (saveRow && saveRow.parentNode && !panel.querySelector('.ccfe-pro-mic-btn')) {
        var micBtn = document.createElement('button');
        micBtn.type = 'button';
        micBtn.className = 'ccfe-pro-mic-btn';
        micBtn.title = 'Record voice note';
        micBtn.style.cssText = 'flex-shrink:0;background:transparent;border:none;padding:0;cursor:pointer;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.35);transition:color 0.2s;';
        micBtn.innerHTML = micSvg;
        micBtn.onmouseenter = function () { this.style.color = 'rgba(255,255,255,0.7)'; };
        micBtn.onmouseleave = function () { this.style.color = 'rgba(255,255,255,0.35)'; };
        micBtn.onclick = function (e) { e.stopPropagation(); window.CCFE_VoiceRecorder.open(); };
        saveRow.parentNode.insertBefore(micBtn, saveRow);
      }
    }
  }

  function triggerUpload(accept) {
    var input = document.getElementById('ccfe-pro-file-input');
    if (input) {
      input.setAttribute('accept', accept);
      input.click();
    }
  }

  /* ── Handle file selection ────────────────────────────────── */
  function handleFiles(fileList) {
    if (!fileList || !fileList.length) return;

    var files = Array.from(fileList);
    var ext = document.getElementById('ccfe-cp-extensions');

    // Client-side size check (server also validates)
    var maxMB = parseInt(reviewCfg.maxUploadSize) || 10;
    var maxBytes = maxMB * 1024 * 1024;
    var oversized = files.filter(function (f) { return f.size > maxBytes; });
    if (oversized.length) {
      if (ext) {
        ext.innerHTML = '<div style="padding:6px 18px;color:#f87171;font-size:12px;">File too large — max ' + maxMB + 'MB each.</div>';
      }
      return;
    }

    if (ext) {
      ext.innerHTML = '<div style="padding:6px 18px;color:rgba(255,255,255,0.5);font-size:12px;">Uploading ' + files.length + ' file(s)...</div>';
    }

    var results = [];
    var chain = Promise.resolve();
    files.forEach(function (f) {
      chain = chain.then(function () {
        return uploadFile(f).then(function (res) {
          results.push(res);
          ext.innerHTML = '<div style="padding:6px 18px;color:rgba(255,255,255,0.5);font-size:12px;">Uploading ' + results.length + ' / ' + files.length + '...</div>';
          return res;
        });
      });
    });
    chain.then(function () {
      pendingUploads = pendingUploads.concat(results);
      renderUploadPreviews(pendingUploads, ext);
    }).catch(function (err) {
      if (ext) {
        ext.innerHTML = '<div style="padding:6px 18px;color:#f87171;font-size:12px;">Upload failed: ' + err.message + '</div>';
      }
    });
  }

  function renderUploadPreviews(uploads, container) {
    if (!container) return;
    if (!uploads.length) { container.innerHTML = ''; return; }

    var html = '<div style="display:flex;flex-wrap:wrap;gap:6px;padding:6px 18px;">';
    uploads.forEach(function (f, i) {
      if (f.type === 'image') {
        html += '<div style="position:relative;width:48px;height:48px;border-radius:6px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);">' +
          '<img src="' + esc(f.url) + '" style="width:100%;height:100%;object-fit:cover;" alt="">' +
          '<div class="ccfe-pro-remove-file" data-idx="' + i + '" style="position:absolute;top:0;right:0;width:16px;height:16px;background:rgba(0,0,0,0.6);color:#fff;font-size:10px;display:flex;align-items:center;justify-content:center;cursor:pointer;">&times;</div>' +
          '</div>';
      } else {
        var icon = '';
        if (f.is_voice) {
          icon = micSvg;
        } else if (f.type === 'video') {
          icon = videoSvg;
        } else if (f.type === 'audio') {
          icon = audioIcon;
        } else {
          icon = docSvg;
        }
        html += '<div style="position:relative;display:flex;align-items:center;gap:4px;padding:4px 8px;border-radius:6px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);font-size:11px;color:rgba(255,255,255,0.7);">' +
          icon + ' ' + esc(f.name).substring(0, 18) +
          '<div class="ccfe-pro-remove-file" data-idx="' + i + '" style="margin-left:4px;color:rgba(255,255,255,0.4);cursor:pointer;font-size:12px;">&times;</div>' +
          '</div>';
      }
    });
    html += '</div>';

    container.innerHTML = html;

    container.querySelectorAll('.ccfe-pro-remove-file').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var idx = parseInt(this.dataset.idx);
        pendingUploads.splice(idx, 1);
        renderUploadPreviews(pendingUploads, container);
      });
    });
  }

  /* ── Intercept save to attach media ───────────────────────── */
  document.addEventListener('ccfe_before_save', function (e) {
    var annotation = e.detail.annotation;

    if (pendingUploads.length) {
      if (!annotation.meta_data || typeof annotation.meta_data !== 'object') {
        annotation.meta_data = {};
      }

      annotation.meta_data.attachments = (annotation.meta_data.attachments || []).concat(pendingUploads);
      annotation.meta_data.img_count = annotation.meta_data.attachments.filter(function (a) { return a.type === 'image'; }).length;
      annotation.meta_data.vid_count = annotation.meta_data.attachments.filter(function (a) { return a.type === 'video'; }).length;
      annotation.meta_data.aud_count = annotation.meta_data.attachments.filter(function (a) { return a.type === 'audio'; }).length;
      annotation.meta_data.att_count = annotation.meta_data.attachments.filter(function (a) { return a.type === 'document' || a.type === 'archive'; }).length;

      pendingUploads = [];
    }
  });

  /* ── Inject file UI when comment panel opens ────────────── */
  document.addEventListener('ccfe_panel_opened', function (e) {
    setTimeout(function () {
      injectProUploadUI(e.detail.panel);
      // Re-render pending uploads (e.g. screenshot added before panel existed)
      var container = document.getElementById('ccfe-cp-extensions');
      if (container && pendingUploads.length) {
        renderUploadPreviews(pendingUploads, container);
      }
    }, 10);
  });

  /* ── Handle snippet-ready: open comment panel with media ─── */
  document.addEventListener('ccfe_snippet_ready', function (e) {
    var detail = e.detail;
    if (!detail) return;

    // The screenshot is already in pendingUploads via CCFE_ProExtensions.addUpload()
    // Open the comment panel at the click position
    document.dispatchEvent(new CustomEvent('ccfe_open_comment_panel', {
      detail: {
        x: detail.x,
        y: detail.y,
        annotation: {
          id: 'temp-' + Date.now(),
          type: 'pin',
          status: 'pending',
          elementor_data_id: '',
          element_selector: '',
          element_tag: 'DIV',
          element_text: '',
          element_fingerprint: '',
          anchor_x_pct: 50,
          anchor_y_pct: 50,
          context_title: 'Screenshot',
          created_at: new Date().toISOString(),
          meta_data: { device: 'desktop' },
          color: '#6366f1',
        }
      }
    }));
  });

  /* ── Show attachment thumbnails in client panel ──────────── */
  document.addEventListener('ccfe_render_comment_extensions', function (e) {
    var a = e.detail.annotation;
    var meta = a.meta_data;
    if (typeof meta === 'string') {
      try { meta = JSON.parse(meta); } catch (err) { meta = {}; }
    }
    var attachments = (meta && meta.attachments) ? meta.attachments : [];
    if (!attachments.length) return;

    var voiceNotes = [], mediaAtts = [];
    attachments.forEach(function (att) {
      if (att.is_voice) { voiceNotes.push(att); } else { mediaAtts.push(att); }
    });

    var html = '';

    // Voice notes section — always inline audio players
    if (voiceNotes.length) {
      html += '<div style="margin-top:8px;display:flex;flex-direction:column;gap:6px;">';
      voiceNotes.forEach(function (att) {
        html += '<div style="display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:6px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);">' +
          audioIcon.replace('width="18"', 'width="16"').replace('height="18"', 'height="16"') +
          '<audio controls style="flex:1;height:32px;min-width:0;" src="' + esc(att.url) + '" preload="metadata"></audio>' +
        '</div>';
      });
      html += '</div>';
    }

    // Media grid — only non-voice items
    if (mediaAtts.length) {
      html += '<div class="ccfe-att-strip" style="display:flex;gap:5px;overflow-x:auto;overflow-y:hidden;padding:4px 8px 2px;margin-top:' + (voiceNotes.length ? '4px' : '6px') + ';scrollbar-width:thin;scrollbar-color:rgba(255,255,255,0.1) transparent;">';
      mediaAtts.forEach(function (att, i) {
        var ext = (att.name || '').split('.').pop().toUpperCase() || att.type.substring(0, 3).toUpperCase();
        var inner = '';
        if (att.type === 'image') {
          inner = '<img src="' + esc(att.url) + '" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;" alt="">';
        } else if (att.type === 'video') {
          inner = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#111;font-size:12px;color:rgba(255,255,255,0.4);">▶</div>';
        } else if (att.type === 'audio') {
          inner = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.03);">' + audioIcon + '</div>';
        } else {
          inner = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.03);font-size:9px;font-weight:700;color:rgba(255,255,255,0.5);">' + esc(ext.substring(0, 4)) + '</div>';
        }
        html += '<div class="ccfe-att-thumb" data-index="' + i + '" data-url="' + esc(att.url) + '" data-type="' + esc(att.type) + '" data-name="' + esc(att.name || '') + '" data-size="' + (att.size || 0) + '" style="flex-shrink:0;width:50px;height:50px;border-radius:6px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);cursor:pointer;position:relative;background:rgba(255,255,255,0.03);">' + inner + '</div>';
      });
      html += '</div>';

      setTimeout(function () {
        var strips = document.querySelectorAll('.ccfe-att-strip');
        strips.forEach(function (strip) {
          var thumbs = strip.querySelectorAll('.ccfe-att-thumb');
          if (!thumbs.length) return;
          var allAtts = [];
          thumbs.forEach(function (t) { allAtts.push({ url: t.dataset.url, type: t.dataset.type, name: t.dataset.name, size: parseInt(t.dataset.size) || 0 }); });
          thumbs.forEach(function (el) {
            if (el._ccfeBound) return;
            el._ccfeBound = true;
            el.onclick = function () { openClientLightbox(allAtts, parseInt(this.dataset.index)); };
          });
        });
      }, 50);
    }

    e.detail.html = html || '';
  });

  function formatSize(bytes) {
    if (!bytes || bytes === 0) return '';
    var units = ['B', 'KB', 'MB', 'GB'];
    var i = 0, s = bytes;
    while (s >= 1024 && i < 3) { s /= 1024; i++; }
    return s.toFixed(i > 0 ? 1 : 0) + ' ' + units[i];
  }

  function openClientLightbox(atts, startIndex) {
    document.querySelectorAll('.ccfe-cp-lightbox').forEach(function (el) { el.remove(); });
    var current = startIndex, total = atts.length;
    var overlay = document.createElement('div');
    overlay.className = 'ccfe-cp-lightbox';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999999;background:rgba(0,0,0,0.94);display:flex;flex-direction:column;';

    function renderItem() {
      var att = atts[current];
      var ext = (att.name || '').split('.').pop().toUpperCase() || '';
      var content = '';
      if (att.type === 'image') {
        content = '<img src="' + esc(att.url) + '" style="max-width:100%;max-height:100%;object-fit:contain;border-radius:4px;box-shadow:0 20px 60px rgba(0,0,0,0.5);">';
      } else if (att.type === 'video') {
        content = '<video controls style="max-width:100%;max-height:100%;border-radius:4px;" src="' + esc(att.url) + '" preload="metadata"></video>';
      } else if (att.type === 'audio') {
        content = '<div style="display:flex;flex-direction:column;align-items:center;gap:24px;padding:20px;"><div style="width:56px;height:56px;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.3);">' + audioIcon.replace('width="18"', 'width="36"').replace('height="18"', 'height="36"') + '</div><div style="font-size:14px;color:rgba(255,255,255,0.5);font-weight:600;">' + esc(att.name || 'Audio') + '</div><audio controls style="width:420px;max-width:85vw;" src="' + esc(att.url) + '" preload="metadata"></audio></div>';
      } else {
        content = '<div style="display:flex;flex-direction:column;align-items:center;gap:20px;padding:20px;"><div style="width:80px;height:80px;border-radius:12px;background:rgba(255,255,255,0.04);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;color:rgba(255,255,255,0.5);border:1px solid rgba(255,255,255,0.08);">' + esc(ext) + '</div><a href="' + esc(att.url) + '" target="_blank" style="color:#818cf8;font-size:14px;text-decoration:none;font-weight:600;">' + esc(att.name || 'Download') + '</a></div>';
      }
      var pagination = total > 1 ? '<span style="color:rgba(255,255,255,0.35);font-size:12px;font-variant-numeric:tabular-nums;">' + (current + 1) + ' / ' + total + '</span>' : '';
      overlay.innerHTML =
        '<button class="ccfe-cp-lb-close" style="position:fixed;top:14px;right:14px;width:34px;height:34px;border-radius:50%;border:none;background:rgba(255,255,255,0.08);color:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:10;">&times;</button>' +
        (total > 1 ? '<button class="ccfe-lb-prev" style="position:fixed;left:14px;top:50%;transform:translateY(-50%);width:38px;height:38px;border-radius:50%;border:none;background:rgba(255,255,255,0.08);color:#fff;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:10;">‹</button>' : '') +
        (total > 1 ? '<button class="ccfe-lb-next" style="position:fixed;right:14px;top:50%;transform:translateY(-50%);width:38px;height:38px;border-radius:50%;border:none;background:rgba(255,255,255,0.08);color:#fff;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:10;">›</button>' : '') +
        '<div class="ccfe-lb-content" style="flex:1;display:flex;align-items:center;justify-content:center;padding:70px 70px 80px;overflow:hidden;">' + content + '</div>' +
        '<div class="ccfe-lb-footer" style="position:fixed;bottom:0;left:0;right:0;height:52px;background:rgba(0,0,0,0.7);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:space-between;padding:0 20px;z-index:10;border-top:1px solid rgba(255,255,255,0.06);">' +
        '<div style="display:flex;align-items:center;gap:10px;min-width:0;flex:1;">' +
        '<span style="color:rgba(255,255,255,0.85);font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + esc(att.name || 'Untitled') + '</span>' +
        (att.size ? '<span style="color:rgba(255,255,255,0.35);font-size:11px;flex-shrink:0;">' + formatSize(att.size) + '</span>' : '') +
        '<span style="flex-shrink:0;background:rgba(255,255,255,0.08);padding:1px 7px;border-radius:4px;color:rgba(255,255,255,0.5);font-size:10px;font-weight:700;letter-spacing:0.3px;">' + esc(ext.substring(0, 6)) + '</span>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:12px;flex-shrink:0;">' +
        pagination +
        '<a href="' + esc(att.url) + '" download style="text-decoration:none;padding:6px 14px;border-radius:6px;background:#6366f1;color:#fff;font-size:12px;font-weight:600;cursor:pointer;">Download</a>' +
        '</div>' +
        '</div>';
    }

    renderItem();
    document.body.appendChild(overlay);

    // Event delegation — survives innerHTML replacement
    overlay.addEventListener('click', function(e) {
      var t = e.target;
      if (t.classList.contains('ccfe-cp-lb-close')) { overlay.remove(); }
      else if (t.classList.contains('ccfe-lb-prev') && current > 0) { current--; renderItem(); }
      else if (t.classList.contains('ccfe-lb-next') && current < total - 1) { current++; renderItem(); }
      else if (t === overlay) { overlay.remove(); }
    });

    document.addEventListener('keydown', function lbKey(e) {
      if (!document.body.contains(overlay)) { document.removeEventListener('keydown', lbKey); return; }
      if (e.key === 'Escape') overlay.remove();
      if (e.key === 'ArrowLeft' && current > 0) { current--; renderItem(); e.preventDefault(); }
      if (e.key === 'ArrowRight' && current < total - 1) { current++; renderItem(); e.preventDefault(); }
    });
  }

  /* ── Helpers ──────────────────────────────────────────────── */
  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
  }

})();
