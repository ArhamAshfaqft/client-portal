/**
 * Previu Pro — Elementor media enhancements.
 * - Inline audio/video players in annotation cards
 * - Maximize (lightbox) for image attachments
 * - "Send to Media Library" button
 * - Media tab grid with drag-to-insert
 */
(function () {
  'use strict';

  if (!window.ccfeElementor) return;

  window.ccfeProActive = true;

  var audioIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15 8a5 5 0 0 1 0 8"/></svg>';

  var cfg = window.ccfeProElementor || {};
  var loadedMedia = [];

  /* ══════════════════════════════════════════════════════════════
     ENHANCED ATTACHMENT RENDERING
     ══════════════════════════════════════════════════════════════ */
  document.addEventListener('ccfe_render_elementor_attachments', function (e) {
    var atts = e.detail.attachments;
    if (!atts || !atts.length) return;

    var voiceNotes = [], mediaAtts = [];
    atts.forEach(function (f) {
      if (f.is_voice) { voiceNotes.push(f); } else { mediaAtts.push(f); }
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
      mediaAtts.forEach(function (f, i) {
        var ext = (f.name || '').split('.').pop().toUpperCase() || f.type.substring(0, 3).toUpperCase();
        var inner = '';
        if (f.type === 'image') {
          inner = '<img src="' + esc(f.url) + '" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;" alt="">';
        } else if (f.type === 'video') {
          inner = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#111;font-size:18px;color:rgba(255,255,255,0.4);">▶</div>';
        } else if (f.type === 'audio') {
          inner = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.03);">' + audioIcon + '</div>';
        } else {
          inner = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.03);font-size:9px;font-weight:700;color:rgba(255,255,255,0.5);">' + esc(ext.substring(0, 4)) + '</div>';
        }
        html += '<div class="ccfe-att-thumb" data-index="' + i + '" data-url="' + esc(f.url) + '" data-type="' + esc(f.type) + '" data-name="' + esc(f.name || '') + '" data-size="' + (f.size || 0) + '" style="flex-shrink:0;width:50px;height:50px;border-radius:6px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);cursor:pointer;position:relative;background:rgba(255,255,255,0.03);">' + inner + '</div>';
      });
      html += '</div>';

      setTimeout(function () {
        document.querySelectorAll('.ccfe-att-strip').forEach(function (strip) {
          var thumbs = strip.querySelectorAll('.ccfe-att-thumb');
          if (!thumbs.length) return;
          var allAtts = [];
          thumbs.forEach(function (t) { allAtts.push({ url: t.dataset.url, type: t.dataset.type, name: t.dataset.name, size: parseInt(t.dataset.size) || 0 }); });
          thumbs.forEach(function (el) {
            if (el._ccfeBound) return;
            el._ccfeBound = true;
            el.onclick = function () { openLightbox(allAtts, parseInt(this.dataset.index)); };
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

  /* ── Lightbox / Maximize ──────────────────────────────────── */
  function openLightbox(atts, startIndex) {
    document.querySelectorAll('.ccfe-ep-lightbox').forEach(function (el) { el.remove(); });
    var current = startIndex, total = atts.length;
    var overlay = document.createElement('div');
    overlay.className = 'ccfe-ep-lightbox';
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
      } else if (ext === 'PDF') {
        content = '<iframe src="' + esc(att.url) + '" style="width:100%;height:100%;border:none;border-radius:4px;"></iframe>';
      } else {
        content = '<div style="display:flex;flex-direction:column;align-items:center;gap:20px;padding:20px;"><div style="width:80px;height:80px;border-radius:12px;background:rgba(255,255,255,0.04);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;color:rgba(255,255,255,0.5);border:1px solid rgba(255,255,255,0.08);">' + esc(ext) + '</div><span style="color:rgba(255,255,255,0.5);font-size:13px;font-weight:600;">' + esc(att.name || '') + '</span></div>';
      }
      var pagination = total > 1 ? '<span style="color:rgba(255,255,255,0.35);font-size:12px;font-variant-numeric:tabular-nums;">' + (current + 1) + ' / ' + total + '</span>' : '';
      overlay.innerHTML =
        '<button class="ccfe-ep-lb-close" style="position:fixed;top:14px;right:14px;width:34px;height:34px;border-radius:50%;border:none;background:rgba(255,255,255,0.08);color:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:10;">&times;</button>' +
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
        (ext === 'PDF' ? '<a href="' + esc(att.url) + '" target="_blank" style="padding:6px 14px;border-radius:6px;border:1px solid rgba(255,255,255,0.15);color:#fff;font-size:12px;font-weight:600;text-decoration:none;cursor:pointer;">Open</a>' : '') +
        '<button class="ccfe-ep-lb-send" data-url="' + esc(att.url) + '" style="padding:6px 14px;border-radius:6px;border:none;background:rgba(99,102,241,0.8);color:#fff;font-size:12px;font-weight:600;cursor:pointer;">Send to WP Media</button>' +
        '<a href="' + esc(att.url) + '" download style="text-decoration:none;padding:6px 14px;border-radius:6px;background:#6366f1;color:#fff;font-size:12px;font-weight:600;cursor:pointer;">Download</a>' +
        '</div>' +
        '</div>';
    }

    renderItem();
    document.body.appendChild(overlay);

    // Event delegation — survives innerHTML replacement
    overlay.addEventListener('click', function(e) {
      var t = e.target;
      if (t.classList.contains('ccfe-ep-lb-close')) { overlay.remove(); }
      else if (t.classList.contains('ccfe-lb-prev') && current > 0) { current--; renderItem(); }
      else if (t.classList.contains('ccfe-lb-next') && current < total - 1) { current++; renderItem(); }
      else if (t.classList.contains('ccfe-ep-lb-send')) {
        var att = atts[current];
        sendToMediaLibrary(att.url, t);
      }
      else if (t === overlay) { overlay.remove(); }
    });

    document.addEventListener('keydown', function lbKey(e) {
      if (!document.body.contains(overlay)) { document.removeEventListener('keydown', lbKey); return; }
      if (e.key === 'Escape') overlay.remove();
      if (e.key === 'ArrowLeft' && current > 0) { current--; renderItem(); e.preventDefault(); }
      if (e.key === 'ArrowRight' && current < total - 1) { current++; renderItem(); e.preventDefault(); }
    });
  }

  /* ── Send to WordPress Media Library ──────────────────────── */
  function sendToMediaLibrary(url, btn) {
    var originalHTML = btn.innerHTML;
    btn.innerHTML = '<span style="display:inline-block;width:12px;height:12px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:ccfe-spin 0.6s linear infinite;"></span>';
    btn.disabled = true;

    var apiUrl = (cfg.restUrl || window.ccfeElementor.restUrl).replace(/\/$/, '') + '/media/send-to-library';
    var sep = apiUrl.indexOf('?') > -1 ? '&' : '?';
    apiUrl += sep + '_t=' + Date.now();

    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': cfg.nonce || window.ccfeElementor.nonce,
      },
      body: JSON.stringify({ url: url }),
      cache: 'no-store',
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.attachment_id) {
          btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>';
          btn.title = 'Added to Media Library (ID: ' + data.attachment_id + ')';
          setTimeout(function () { btn.innerHTML = originalHTML; btn.disabled = false; btn.title = 'Send to Media Library'; }, 2500);
        } else {
          throw new Error(data.message || 'Import failed');
        }
      })
      .catch(function (err) {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
        alert('Failed: ' + (err.message || 'Could not import to Media Library.'));
      });
  }

  /* ══════════════════════════════════════════════════════════════
     MEDIA TAB — grid of all uploaded files
     ══════════════════════════════════════════════════════════════ */
  document.addEventListener('ccfe_media_tab_opened', function () {
    loadAndShowMedia();
  });

  function loadAndShowMedia() {
    var body = document.getElementById('ccfe-ep-body');
    if (!body) return;

    body.innerHTML = '<div style="text-align:center;color:rgba(255,255,255,0.4);padding:40px;">Loading media...</div>';

    var url = (cfg.restUrl || window.ccfeElementor.restUrl).replace(/\/$/, '') + '/media';
    var sep = url.indexOf('?') > -1 ? '&' : '?';
    url += sep + '_t=' + Date.now();

    fetch(url, {
      headers: { 'X-WP-Nonce': cfg.nonce || window.ccfeElementor.nonce },
      cache: 'no-store',
    })
      .then(function (r) { return r.json(); })
      .then(function (files) {
        loadedMedia = Array.isArray(files) ? files : [];
        renderMediaGrid(body);
      })
      .catch(function () {
        body.innerHTML = '<div style="text-align:center;color:rgba(255,255,255,0.4);padding:40px;">Could not load media.</div>';
      });
  }

  function renderMediaGrid(body) {
    if (!loadedMedia.length) {
      body.innerHTML =
        '<div style="text-align:center;color:rgba(255,255,255,0.3);padding:40px;font-size:13px;">' +
          '<div style="margin-bottom:12px;">\uD83D\uDCC1</div>' +
          'No media uploaded yet.<br>' +
          '<span style="font-size:11px;">Files attached by clients will appear here.</span>' +
        '</div>';
      return;
    }

    var html = '<div class="ccfe-ep-media-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:12px;">';
    loadedMedia.forEach(function (f) {
      var isImage = /\.(jpg|jpeg|png|gif|webp|svg)/i.test(f.name);
      if (isImage) {
        html +=
          '<div class="ccfe-ep-media-item" style="aspect-ratio:1;border-radius:6px;overflow:hidden;border:1px solid rgba(255,255,255,0.06);cursor:grab;position:relative;background:rgba(255,255,255,0.02);" ' +
            'data-url="' + esc(f.url) + '" data-name="' + esc(f.name) + '" draggable="true">' +
            '<img src="' + esc(f.url) + '" style="width:100%;height:100%;object-fit:cover;" alt="" loading="lazy">' +
            '<div class="ccfe-ep-media-name" style="position:absolute;bottom:0;left:0;right:0;padding:4px 6px;background:rgba(0,0,0,0.6);font-size:9px;color:rgba(255,255,255,0.7);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(f.name) + '</div>' +
          '</div>';
      } else {
        var icon = /\.(mp4|webm|mov)/i.test(f.name) ? '\uD83C\uDFAC' : /\.(mp3|wav|ogg|webm)/i.test(f.name) ? '\uD83C\uDFA4' : '\uD83D\uDCC4';
        html +=
          '<div class="ccfe-ep-media-item" style="aspect-ratio:1;border-radius:6px;border:1px solid rgba(255,255,255,0.06);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;background:rgba(255,255,255,0.02);position:relative;cursor:grab;" ' +
            'data-url="' + esc(f.url) + '" data-name="' + esc(f.name) + '" draggable="true">' +
            '<span style="font-size:24px;">' + icon + '</span>' +
            '<span style="font-size:9px;color:rgba(255,255,255,0.4);text-align:center;padding:0 4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%;">' + esc(f.name).substring(0, 14) + '</span>' +
          '</div>';
      }
    });
    html += '</div>';
    body.innerHTML = html;

    // Drag-to-insert
    body.querySelectorAll('.ccfe-ep-media-item[draggable]').forEach(function (item) {
      item.addEventListener('dragstart', function (e) {
        e.dataTransfer.setData('text/plain', this.dataset.url);
        e.dataTransfer.setData('text/html', '<img src="' + this.dataset.url + '" style="max-width:100%;">');
        e.dataTransfer.effectAllowed = 'copy';
      });
    });
  }

  /* ── Helpers ──────────────────────────────────────────────── */
  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
  }

})();
