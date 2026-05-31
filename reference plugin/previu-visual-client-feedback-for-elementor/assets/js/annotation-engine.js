/**
 * Previu Annotation Engine — Client-facing toolbar & interaction logic.
 * Loads on the review page, provides drawing tools, saves via REST API.
 */
(function () {
  'use strict';

  if (!window.ccfeReview) return;

  var DNA = window.ElementDNA;
  var Renderer = window.AnnotationRenderer;
  var cfg = window.ccfeReview;
  var currentTool = 'select';
  var isDrawing = false;
  var isResizing = false;
  var isMoving = false;
  var currentDevice = 'desktop';
  var currentDeviceFilter = 'all';
  var currentSort = 'newest';

  function syncRendererToDevice() {
    Renderer.setAnnotations(annotations);
    Renderer.setDeviceFilter(currentDeviceFilter || 'all');
  }

  // Called by TOOLBAR buttons — wraps page content in a resizable container
  function setViewportDevice(device) {
    currentDevice = device;

    var widths = { desktop: '', tablet: '768px', mobile: '375px' };
    var w = widths[device] || '';

    var vp = document.getElementById('ccfe-viewport-wrapper');
    if (!vp && w) {
      vp = document.createElement('div');
      vp.id = 'ccfe-viewport-wrapper';
      vp.style.cssText = 'position:relative;margin:0 auto;transition:max-width 0.4s cubic-bezier(0.4,0,0.2,1);overflow-x:hidden;z-index:1;';
      // Move all body children into the wrapper EXCEPT annotation/tool overlays
      var skip = ['ccfe-toolbar-root','ccfe-overlay','ccfe-comment-panel','ccfe-client-panel','ccfe-selection-ghost','ccfe-selection-label','ccfe-pin-tooltip'];
      var children = Array.from(document.body.children);
      children.forEach(function (child) {
        if (skip.indexOf(child.id) === -1 && child !== vp) vp.appendChild(child);
      });
      document.body.insertBefore(vp, document.body.firstChild);
    }

    if (vp) {
      vp.style.maxWidth = w;
      vp.style.boxShadow = w ? '0 0 60px rgba(0,0,0,0.3)' : 'none';
      vp.style.overflowX = w ? 'hidden' : '';
    }
    // SVG overlay stays on body at absolute (0,0) — matches document origin
    var overlay = document.getElementById('ccfe-overlay');
    if (overlay && overlay.parentElement !== document.body) document.body.appendChild(overlay);
    if (overlay) {
      overlay.style.position = 'absolute';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
    }

    // Remove stale body-level constraints
    document.body.style.maxWidth = '';
    document.body.style.margin = '';
    document.body.style.boxShadow = '';

    window.dispatchEvent(new Event('resize'));
  }

  // Called by SIDEBAR filter — only changes filter + overlay, never changes viewport
  function setDeviceFilter(device) {
    currentDeviceFilter = device;
    var target = (device === 'all') ? 'desktop' : device;
    syncRendererToDevice();
    // Change viewport to match
    setViewportDevice(target);
    // Sync toolbar device buttons to match
    var root = document.getElementById('ccfe-toolbar-root');
    if (root) {
      root.querySelectorAll('.ccfe-device').forEach(function(b) {
        var isActive = b.dataset.device === target;
        b.classList.toggle('active', isActive);
        var svg = b.querySelector('svg');
        if (svg) {
          var color = isActive ? '#3b82f6' : 'rgba(255,255,255,0.7)';
          svg.style.stroke = color;
          svg.querySelectorAll('*').forEach(function(el) {
            if (el.style.stroke && el.style.stroke !== 'none') el.style.stroke = color;
          });
        }
      });
    }
    if (cpanelOpen) renderClientPanel();
  }

  function setActiveTool(tool) {
    var root = document.getElementById('ccfe-toolbar-root');
    var selectBtn = root ? root.querySelector('[data-tool="' + tool + '"]') : null;
    if (root) root.querySelectorAll('.ccfe-tool').forEach(function (b) { b.classList.remove('active'); });
    if (selectBtn) selectBtn.classList.add('active');
    currentTool = tool;
    document.body.setAttribute('data-ccfe-tool', currentTool);
    var overlay = document.getElementById('ccfe-overlay');
    if (overlay) overlay.style.pointerEvents = (currentTool === 'select') ? 'auto' : 'none';
  }

  var drawStart = null;
  var resizeData = null;
  var moveData = null;
  var drawPoints = [];
  var clientName = '';
  try {
    clientName = localStorage.getItem('ccfe_client_name');
    if (clientName) {
      clientName = clientName.trim();
    }
  } catch(e) {}
  if (!clientName || clientName.length < 2) {
    clientName = cfg.clientName || 'Client';
  }
  // Track per-token visits so the modal only shows once per session
  var visitedKey = 'ccfe_visited_' + (cfg.token || '');
  var annotations = [];
  var selectedAnnotation = null;
  var currentFilter = 'all';

  function timeAgo(date) {
    if (!date) return 'Some time ago';
    var seconds = Math.floor((new Date() - new Date(date)) / 1000);
    var interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "Just now";
  }
  var cpanelOpen = false;
  var currentProjectFilter = '';
  var projects = [];

  /* ── API Helpers (Nuclear-Proof Sync) ───────────────────── */
  function apiUrl(path) { return cfg.restUrl + '/review/' + cfg.token + path; }

  function api(method, path, body) {
    var opts = {
      method: method,
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (body) opts.body = JSON.stringify(body);
    return fetch(apiUrl(path), opts).then(function (r) { return r.json(); });
  }

  function loadAnnotations() {
    var sep = cfg.restUrl.indexOf('?') > -1 ? '&' : '?';
    var cb = '_t=' + Date.now();
    api('GET', '/annotations' + sep + 'page_path=' + encodeURIComponent(cfg.pagePath) + '&' + cb).then(function (data) {
      if (Array.isArray(data)) {
        // Keep any unsaved temp previews while merging server data
        var temps = annotations.filter(function (a) { return String(a.id).indexOf('temp-') === 0; });
        annotations = data.concat(temps);
        updateCount();
        if (cpanelOpen) renderClientPanel();
        syncRendererToDevice();
      }
    });
    api('GET', '/projects' + sep + cb).then(function(data) {
      if (Array.isArray(data)) {
        projects = data;
      }
    });
  }

  function esc(s) {
    var d = document.createElement('span');
    d.textContent = s || '';
    return d.innerHTML;
  }

  function formatSize(bytes) {
    if (!bytes || bytes === 0) return '';
    var units = ['B', 'KB', 'MB', 'GB'];
    var i = 0, s = bytes;
    while (s >= 1024 && i < 3) { s /= 1024; i++; }
    return s.toFixed(i > 0 ? 1 : 0) + ' ' + units[i];
  }

  var audioIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15 8a5 5 0 0 1 0 8"/></svg>';

  function renderAttachmentFallback(meta) {
    if (!meta || !meta.attachments || !meta.attachments.length) return '';
    var atts = meta.attachments;

    var voiceNotes = [], mediaAtts = [];
    atts.forEach(function(att) {
      if (att.is_voice) { voiceNotes.push(att); } else { mediaAtts.push(att); }
    });

    var html = '';

    // Voice notes section — always inline audio players
    if (voiceNotes.length) {
      html += '<div style="margin-top:8px;display:flex;flex-direction:column;gap:6px;">';
      voiceNotes.forEach(function(att) {
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
      mediaAtts.forEach(function(att, i) {
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

      setTimeout(function() {
        var strips = document.querySelectorAll('.ccfe-att-strip');
        strips.forEach(function(strip) {
          var thumbs = strip.querySelectorAll('.ccfe-att-thumb');
          if (!thumbs.length) return;
          var allAtts = [];
          thumbs.forEach(function(t) { allAtts.push({ url: t.dataset.url, type: t.dataset.type, name: t.dataset.name, size: parseInt(t.dataset.size) || 0 }); });
          thumbs.forEach(function(el) {
            if (el._ccfeBound) return;
            el._ccfeBound = true;
            el.onclick = function() { openEnhancedLightbox(allAtts, parseInt(this.dataset.index)); };
          });
        });
      }, 50);
    }

    return html || '';
  }

  function openEnhancedLightbox(atts, startIndex) {
    document.querySelectorAll('.ccfe-lb-overlay').forEach(function(el) { el.remove(); });
    var current = startIndex, total = atts.length;
    var overlay = document.createElement('div');
    overlay.className = 'ccfe-lb-overlay';
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
        '<button class="ccfe-lb-close" style="position:fixed;top:14px;right:14px;width:34px;height:34px;border-radius:50%;border:none;background:rgba(255,255,255,0.08);color:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:10;">&times;</button>' +
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
      if (t.classList.contains('ccfe-lb-close')) { overlay.remove(); }
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

  function saveAnnotation(data) {
    // Clone so we don't mutate the original annotation (selectedAnnotation)
    var payload = {};
    Object.keys(data).forEach(function(k) { payload[k] = data[k]; });

    payload.page_url = cfg.pageUrl;
    payload.page_path = cfg.pagePath;
    payload.client_name = clientName;
    payload.viewport_width = window.innerWidth;
    payload.viewport_height = window.innerHeight;
    payload.scroll_y_pct = (window.pageYOffset / Math.max(1, document.body.scrollHeight)) * 100;

    // Remove temp preview ID from payload so server creates a real one
    var tempId = data.id;
    delete payload.id;

    return api('POST', '/annotations', payload).then(function (a) {
      if (a && a.id) {
        // Remove the temp preview and replace with real server data
        annotations = annotations.filter(function (an) { return an.id !== tempId; });
        showToast('Annotation saved!');
        // Force full server re-sync to guarantee consistency
        loadAnnotations();
      } else {
        showToast('Save failed — please try again');
      }
      return a;
    }).catch(function (err) {
      console.error('Previu: Save failed', err);
      showToast('Network error — annotation not saved');
    });
  }

  function updateAnnotation(data) {
    return api('PUT', '/annotations/' + data.id, data).then(function (a) {
      // Force full server re-sync after update
      loadAnnotations();
      return a;
    }).catch(function (err) {
      console.error('Previu: Update failed', err);
    });
  }

  function deleteAnnotation(id) {
    return api('DELETE', '/annotations/' + id).then(function () {
      // Immediately remove locally for snappy UX
      annotations = annotations.filter(function (a) { return a.id != id; });
      Renderer.setAnnotations(annotations);
      updateCount();
      closeCommentPanel();
      if (cpanelOpen) renderClientPanel();
      // Then force full server re-sync to confirm
      loadAnnotations();
    }).catch(function (err) {
      console.error('Previu: Delete failed', err);
      showToast('Delete failed — please try again');
    });
  }

  /* ── Toolbar HTML ────────────────────────────────────────── */
  function buildToolbar() {
    var root = document.getElementById('ccfe-toolbar-root');
    if (!root) {
      console.error('[CCFE] buildToolbar: #ccfe-toolbar-root not found!');
      return;
    }

    // Inject a high-priority style tag that overrides ANY theme SVG rules
    var existingStyle = document.getElementById('ccfe-svg-fix');
    if (!existingStyle) {
      var styleTag = document.createElement('style');
      styleTag.id = 'ccfe-svg-fix';
      styleTag.textContent =
        '#ccfe-toolbar svg { overflow: visible !important; }' +
        '#ccfe-toolbar svg, #ccfe-toolbar svg path, #ccfe-toolbar svg rect,' +
        '#ccfe-toolbar svg circle, #ccfe-toolbar svg line, #ccfe-toolbar svg polyline,' +
        '#ccfe-toolbar svg polygon, #ccfe-toolbar svg ellipse {' +
        '  fill: none !important;' +
        '  vector-effect: non-scaling-stroke !important;' +
        '}' +
        '#ccfe-toolbar svg circle.ccfe-dot { fill: rgba(255,255,255,0.65) !important; stroke: none !important; }' +
        '#ccfe-toolbar #ccfe-cp-sort-btn svg line { stroke: currentColor !important; }' +
        '#ccfe-toolbar .ccfe-cp-img-wrap svg polyline, #ccfe-toolbar .ccfe-cp-img-wrap svg line, ' +
        '#ccfe-toolbar .ccfe-fb-maximize svg polyline, #ccfe-toolbar .ccfe-fb-maximize svg line, ' +
        '#ccfe-toolbar .ccfe-cp-img-maximize svg polyline, #ccfe-toolbar .ccfe-cp-img-maximize svg line { stroke: currentColor !important; }' +
        '#ccfe-toolbar .ccfe-tool.active {' +
        '  background: #ffffff !important;' +
        '  color: #000000 !important;' +
        '  box-shadow: 0 4px 15px rgba(255,255,255,0.3) !important;' +
        '}' +
        '#ccfe-toolbar .ccfe-tool.active svg path,' +
        '#ccfe-toolbar .ccfe-tool.active svg rect,' +
        '#ccfe-toolbar .ccfe-tool.active svg circle,' +
        '#ccfe-toolbar .ccfe-tool.active svg line,' +
        '#ccfe-toolbar .ccfe-tool.active svg polyline {' +
        '  fill: none !important;' +
        '  stroke: #000000 !important;' +
        '}' +
        '.ccfe-session-menu { animation: ccfeFadeIn 0.1s ease; }' +
        '@keyframes ccfeFadeIn { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }';
      document.head.appendChild(styleTag);
    }

    var brandLogo = cfg.portal_logo || cfg.pluginUrl + 'assets/Previu-icon.png';
    var brandText = cfg.portal_brand_name || (cfg.portal_logo ? '' : 'Previu');
    var logoRadius = cfg.logo_border_radius || (cfg.portal_logo ? 60 : 0);
    var hideBrand = cfg.remove_branding || false;
    var hideLogo = cfg.remove_logo || false;
    root.innerHTML = '<div id="ccfe-toolbar" class="ccfe-toolbar">' +
      (hideBrand ? '' :
        '<div class="ccfe-toolbar-brand">' +
          (hideLogo ? '' : '<img src="' + brandLogo + '" width="22" height="22" style="display:block;flex-shrink:0;border-radius:' + logoRadius + 'px;object-fit:cover;" alt="" />') +
          (brandText ? '<span>' + brandText + '</span>' : '') +
        '</div>'
      ) +
      '<div class="ccfe-toolbar-tools">' +
        '<button data-tool="select" class="ccfe-tool active" title="Select &amp; Move"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" style="fill:none;stroke:currentColor;stroke-width:1.8;display:block;"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" style="fill:none;stroke:currentColor;"/></svg></button>' +
        '<div class="ccfe-divider"></div>' +
        '<button data-tool="pin" class="ccfe-tool" title="Pin Comment"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" style="fill:none;stroke:currentColor;stroke-width:1.8;display:block;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" style="fill:none;stroke:currentColor;"/><circle cx="12" cy="10" r="3" style="fill:none;stroke:currentColor;"/></svg></button>' +
        '<button data-tool="rect" class="ccfe-tool" title="Draw Rectangle"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" style="fill:none;stroke:currentColor;stroke-width:1.8;display:block;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" style="fill:none;stroke:currentColor;"/></svg></button>' +
        '<button data-tool="arrow" class="ccfe-tool" title="Draw Arrow"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" style="fill:none;stroke:currentColor;stroke-width:1.8;display:block;"><line x1="5" y1="12" x2="19" y2="12" style="stroke:currentColor;"/><polyline points="12 5 19 12 12 19" style="fill:none;stroke:currentColor;"/></svg></button>' +
        '<button class="ccfe-tool" data-tool="draw" title="Freehand"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" style="fill:none;stroke:currentColor;stroke-width:1.8;display:block;"><path d="M12 19l7-7 3 3-7 7-3-3z" style="fill:none;stroke:currentColor;"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" style="fill:none;stroke:currentColor;"/></svg></button>' +
        '<div class="ccfe-divider"></div>' +
        '<button data-device="desktop" class="ccfe-device active" title="Desktop View"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" style="fill:none !important;stroke:#3b82f6;stroke-width:1.8;display:block;overflow:visible;"><rect x="2" y="3" width="20" height="14" rx="2" style="fill:none !important;stroke:#3b82f6;"/><line x1="8" y1="21" x2="16" y2="21" style="fill:none !important;stroke:#3b82f6;"/><line x1="12" y1="17" x2="12" y2="21" style="fill:none !important;stroke:#3b82f6;"/></svg></button>' +
        '<button data-device="tablet" class="ccfe-device" title="Tablet View"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" style="fill:none !important;stroke:rgba(255,255,255,0.7);stroke-width:1.8;display:block;overflow:visible;"><rect x="3" y="2" width="18" height="20" rx="2" style="fill:none !important;stroke:rgba(255,255,255,0.7);"/><circle cx="12" cy="18.5" r="1.2" style="fill:rgba(255,255,255,0.7) !important;stroke:none !important;"/></svg></button>' +
        '<button data-device="mobile" class="ccfe-device" title="Mobile View"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" style="fill:none !important;stroke:rgba(255,255,255,0.7);stroke-width:1.8;display:block;overflow:visible;"><rect x="6" y="2" width="12" height="20" rx="2" style="fill:none !important;stroke:rgba(255,255,255,0.7);"/><circle cx="12" cy="18.5" r="1.2" style="fill:rgba(255,255,255,0.7) !important;stroke:none !important;"/></svg></button>' +
        '<div class="ccfe-divider"></div>' +
        '<button class="ccfe-tool-action" id="ccfe-engine-refresh" title="Refresh Sync"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" style="fill:none !important;stroke:rgba(255,255,255,0.7);stroke-width:1.8;display:block;overflow:visible;stroke-linecap:round;stroke-linejoin:round;"><path d="M23 4v6h-6" style="fill:none !important;stroke:rgba(255,255,255,0.7);"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" style="fill:none !important;stroke:rgba(255,255,255,0.7);"/></svg></button>' +
        '<button class="ccfe-tool-action" id="ccfe-toggle-cpanel" title="Feedback List" style="background:transparent;border:none;color:#fff;cursor:pointer;display:flex;align-items:center;gap:8px;font-family:inherit;font-weight:600;font-size:13px;padding:0 8px;">' +
          '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" style="fill:none !important;stroke:#fff;stroke-width:1.8;display:block;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" style="fill:none !important;stroke:#fff;"/></svg>' +
          '<span class="ccfe-badge" id="ccfe-count">0</span>' +
        '</button>' +
        '<div class="ccfe-divider"></div>' +
        '<button class="ccfe-tool-action ccfe-pro-screenshot" id="ccfe-screenshot-btn" title="Screenshot &amp; Annotate (Pro)" style="opacity:0.35;cursor:pointer;position:relative;">' +
          '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" style="fill:none !important;stroke:rgba(255,255,255,0.9);stroke-width:1.8;display:block;overflow:visible;stroke-linecap:round;stroke-linejoin:round;">' +
            '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" style="fill:none !important;stroke:rgba(255,255,255,0.9);"/>' +
            '<circle cx="12" cy="13" r="4" style="fill:none !important;stroke:rgba(255,255,255,0.9);"/>' +
          '</svg>' +
        '</button>' +
        '<div class="ccfe-divider"></div>' +
        '<button class="ccfe-btn-submit" id="ccfe-submit-all">Finish</button>' +
      '</div>' +
    '</div>' +
    '<div id="ccfe-client-panel" class="ccfe-client-panel">' +
      '<div class="ccfe-client-panel-header">' +
        '<span class="ccfe-client-panel-title">Feedback List</span>' +
        '<div class="ccfe-cp-header-actions" style="display:flex;flex-direction:row;align-items:center;gap:6px;">' +
          '<button class="ccfe-cp-refresh" id="ccfe-force-sync" title="Refresh" style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:rgba(255,255,255,0.5);cursor:pointer;padding:0;box-shadow:none;">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>' +
          '</button>' +
          '<button class="ccfe-client-panel-close" id="ccfe-close-cpanel" style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:rgba(255,255,255,0.5);cursor:pointer;font-size:18px;padding:0;box-shadow:none;">&times;</button>' +
        '</div>' +
      '</div>' +
      '<div class="ccfe-cp-filters" style="display:flex; border-bottom:1px solid rgba(255,255,255,0.05); padding:10px 15px; gap:8px;">' +
        '<button class="ccfe-cp-filter active" data-filter="all" style="flex:1; padding:6px; border:none; border-radius:4px; background:rgba(255,255,255,0.1); color:#fff; cursor:pointer; font-size:12px; font-weight:600; transition:all 0.2s;">All</button>' +
        '<button class="ccfe-cp-filter" data-filter="pending" style="flex:1; padding:6px; border:none; border-radius:4px; background:transparent; color:rgba(255,255,255,0.6); cursor:pointer; font-size:12px; font-weight:600; transition:all 0.2s;">Pending</button>' +
        '<button class="ccfe-cp-filter" data-filter="resolved" style="flex:1; padding:6px; border:none; border-radius:4px; background:transparent; color:rgba(255,255,255,0.6); cursor:pointer; font-size:12px; font-weight:600; transition:all 0.2s;">Completed</button>' +
      '</div>' +
      '<div id="ccfe-device-filter" style="display:flex; gap:6px; padding:10px 15px; border-bottom:1px solid rgba(255,255,255,0.05);">' +
        '<button class="ccfe-df-btn" data-device="all" style="flex:1;display:flex;align-items:center;justify-content:center;gap:5px;padding:6px 4px;border:none;border-radius:6px;background:rgba(255,255,255,0.1);color:#fff;cursor:pointer;font-size:11px;font-weight:600;transition:all 0.2s;">All <span class="ccfe-df-count" style="background:rgba(255,255,255,0.15);border-radius:10px;padding:1px 5px;font-size:10px;">0</span></button>' +
        '<button class="ccfe-df-btn" data-device="desktop" style="flex:1;display:flex;align-items:center;justify-content:center;gap:5px;padding:6px 4px;border:none;border-radius:6px;background:transparent;color:rgba(255,255,255,0.4);cursor:pointer;font-size:11px;font-weight:600;transition:all 0.2s;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg><span class="ccfe-df-count" style="background:rgba(255,255,255,0.08);border-radius:10px;padding:1px 5px;font-size:10px;">0</span></button>' +
        '<button class="ccfe-df-btn" data-device="tablet" style="flex:1;display:flex;align-items:center;justify-content:center;gap:5px;padding:6px 4px;border:none;border-radius:6px;background:transparent;color:rgba(255,255,255,0.4);cursor:pointer;font-size:11px;font-weight:600;transition:all 0.2s;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="2" width="18" height="20" rx="2"/><circle cx="12" cy="18.5" r="1.2" fill="currentColor" stroke="none"/></svg><span class="ccfe-df-count" style="background:rgba(255,255,255,0.08);border-radius:10px;padding:1px 5px;font-size:10px;">0</span></button>' +
        '<button class="ccfe-df-btn" data-device="mobile" style="flex:1;display:flex;align-items:center;justify-content:center;gap:5px;padding:6px 4px;border:none;border-radius:6px;background:transparent;color:rgba(255,255,255,0.4);cursor:pointer;font-size:11px;font-weight:600;transition:all 0.2s;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="2" width="12" height="20" rx="2"/><circle cx="12" cy="18.5" r="1.2" fill="currentColor" stroke="none"/></svg><span class="ccfe-df-count" style="background:rgba(255,255,255,0.08);border-radius:10px;padding:1px 5px;font-size:10px;">0</span></button>' +
        '<button id="ccfe-cp-sort-btn" title="Newest first" style="flex:0 0 28px;display:flex;align-items:center;justify-content:center;border:none;border-radius:4px;background:transparent;color:rgba(255,255,255,0.3);cursor:pointer;font-size:10px;font-weight:700;transition:all 0.2s;">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:block;"><line x1="8" y1="6" x2="21" y2="6" fill="none" stroke="currentColor"/><line x1="8" y1="12" x2="21" y2="12" fill="none" stroke="currentColor"/><line x1="8" y1="18" x2="21" y2="18" fill="none" stroke="currentColor"/><line x1="3" y1="6" x2="3.01" y2="6" fill="none" stroke="currentColor"/><line x1="3" y1="12" x2="3.01" y2="12" fill="none" stroke="currentColor"/><line x1="3" y1="18" x2="3.01" y2="18" fill="none" stroke="currentColor"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="ccfe-client-panel-body" id="ccfe-cpanel-body"></div>' +
    '</div>' +
    '<div id="ccfe-comment-panel" class="ccfe-comment-panel ccfe-hidden"></div>' +
    '<div id="ccfe-toast" class="ccfe-toast ccfe-hidden"></div>' +
    '<div id="ccfe-name-modal" class="ccfe-modal-overlay ccfe-hidden">' +
      '<div class="ccfe-modal">' +
        '<h3>' + esc(cfg.welcomeTitle || 'Hi there! 👋') + '</h3>' +
        '<p>' + esc(cfg.welcomeMessage || "What should we call you? Your name will appear next to your comments.") + '</p>' +
        '<input type="text" id="ccfe-name-input" placeholder="Your name (e.g. John)" value="' + clientName + '" required minlength="2" autocomplete="name" style="margin-bottom:16px;">' +
        '<button id="ccfe-name-ok" class="ccfe-btn-primary" disabled>Start Reviewing</button>' +
      '</div>' +
    '</div>';

    // Toolbar tool selection using delegation (more robust)
    root.addEventListener('mousedown', function (e) {
      var btn = e.target.closest('.ccfe-tool');
      if (!btn || !btn.dataset.tool) return;
      
      e.preventDefault();
      e.stopPropagation();

      var newTool = btn.dataset.tool;
      // Toggle logic: If clicking the same tool, go back to 'select'
      if (currentTool === newTool) {
          newTool = 'select';
      }
      setActiveTool(newTool);

      // Close side panel when a drawing tool is selected
      if (newTool !== 'select' && cpanelOpen) toggleClientPanel();
    }, true);

    root.querySelector('#ccfe-toggle-cpanel').addEventListener('mousedown', function (e) {
      e.stopPropagation();
      toggleClientPanel();
    }, true);

    root.querySelector('#ccfe-engine-refresh').addEventListener('mousedown', function (e) {
      e.stopPropagation();
      var btn = this;
      btn.classList.add('ccfe-rotating');
      loadAnnotations();
      setTimeout(function() { btn.classList.remove('ccfe-rotating'); }, 1000);
    }, true);

    // ── Toolbar device buttons — viewport + filter by device ──
    root.addEventListener('click', function(e) {
      var btn = e.target.closest('.ccfe-device');
      if (!btn) return;
      var device = btn.dataset.device;
      currentDevice = device;
      currentDeviceFilter = device;

      // Update toolbar active state + SVG colors
      root.querySelectorAll('.ccfe-device').forEach(function(b) {
        var isActive = b.dataset.device === device;
        b.classList.toggle('active', isActive);
        var svg = b.querySelector('svg');
        if (!svg) return;
        var color = isActive ? '#3b82f6' : 'rgba(255,255,255,0.7)';
        svg.style.stroke = color;
        svg.querySelectorAll('*').forEach(function(el) {
          if (el.style.stroke && el.style.stroke !== 'none') el.style.stroke = color;
        });
      });

      // Sync sidebar device filter buttons to match
      var df = document.getElementById('ccfe-device-filter');
      if (df) {
        df.querySelectorAll('.ccfe-df-btn').forEach(function(b) {
          var isActive = b.dataset.device === device;
          b.style.background = isActive ? 'rgba(255,255,255,0.1)' : 'transparent';
          b.style.color = isActive ? '#fff' : 'rgba(255,255,255,0.4)';
          b.classList.toggle('active', isActive);
        });
      }

      // Filter annotations in renderer + sidebar
      syncRendererToDevice();
      if (cpanelOpen) renderClientPanel();

      setViewportDevice(device);
    });

    document.getElementById('ccfe-close-cpanel').addEventListener('click', function(e) { e.preventDefault(); e.stopPropagation(); toggleClientPanel(); });
    
    root.querySelectorAll('.ccfe-cp-filter').forEach(function(btn) {
      btn.addEventListener('click', function() {
        root.querySelectorAll('.ccfe-cp-filter').forEach(function(b) {
          b.style.background = 'transparent';
          b.style.color = 'rgba(255,255,255,0.6)';
          b.classList.remove('active');
        });
        this.style.background = 'rgba(255,255,255,0.1)';
        this.style.color = '#fff';
        this.classList.add('active');
        currentFilter = this.dataset.filter;
        Renderer.setFilter(currentFilter);
        if (cpanelOpen) renderClientPanel();
      });
    });

    // ── Sidebar device filter tabs — filter only, NO viewport change ──
    root.querySelectorAll('.ccfe-df-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var device = this.dataset.device;
        root.querySelectorAll('.ccfe-df-btn').forEach(function(b) {
          var isActive = b.dataset.device === device;
          b.style.background = isActive ? 'rgba(255,255,255,0.1)' : 'transparent';
          b.style.color = isActive ? '#fff' : 'rgba(255,255,255,0.4)';
        });
        setDeviceFilter(device);
      });
    });

    // ── Sort toggle ──
    var cpSortBtn = document.getElementById('ccfe-cp-sort-btn');
    if (cpSortBtn) {
      cpSortBtn.addEventListener('click', function() {
        currentSort = currentSort === 'newest' ? 'oldest' : 'newest';
        this.style.color = 'rgba(255,255,255,0.7)';
        if (cpanelOpen) renderClientPanel();
      });
    }

    // Restore persisted filter
    try {
      var saved = localStorage.getItem('ccfe_project_filter');
      if (saved) { currentProjectFilter = saved; }
    } catch(e) {}

    // Name modal — show on first visit to this token, pre-fill any stored name
    var hasVisited = false;
    try { hasVisited = !!localStorage.getItem(visitedKey); } catch(e) {}
    if (!hasVisited) {
      document.getElementById('ccfe-name-modal').classList.remove('ccfe-hidden');
    }
    
    var nameInput = document.getElementById('ccfe-name-input');
    var nameOkBtn = document.getElementById('ccfe-name-ok');
    
    // Enable button only when name has 2+ chars
    nameInput.addEventListener('input', function() {
      nameOkBtn.disabled = this.value.trim().length < 2;
    });
    // If pre-filled from localStorage, enable immediately
    if (nameInput.value.trim().length >= 2) {
      nameOkBtn.disabled = false;
    }
    nameInput.focus();
    
    nameOkBtn.addEventListener('click', function() {
      var val = document.getElementById('ccfe-name-input').value.trim();
      if (val.length < 2) return;
      clientName = val;
      try { localStorage.setItem('ccfe_client_name', clientName); } catch(e) {}
      try { localStorage.setItem(visitedKey, '1'); } catch(e) {}
      document.getElementById('ccfe-name-modal').classList.add('ccfe-hidden');
    });
    
    // Allow Enter key to submit
    nameInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && this.value.trim().length >= 2) {
        nameOkBtn.click();
      }
    });

    document.getElementById('ccfe-submit-all').addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      showToast('Feedback saved! The developer has been notified.');
    });

    document.getElementById('ccfe-screenshot-btn').addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      // Dispatch event so the Pro plugin can show its screenshot tool modal.
      // In the free version this is a no-op teaser.
      document.dispatchEvent(new CustomEvent('ccfe_screenshot_requested'));
    });

  }

  function toggleClientPanel() {
    cpanelOpen = !cpanelOpen;
    var panel = document.getElementById('ccfe-client-panel');
    panel.classList.toggle('ccfe-cp-open', cpanelOpen);
    if (cpanelOpen) renderClientPanel();
  }

  function renderClientPanel() {
    var body = document.getElementById('ccfe-cpanel-body');

    // Apply session filter for counts and display
    var sessionAnns = currentProjectFilter
      ? annotations.filter(function(a) { return String(a.project_id) === currentProjectFilter; })
      : annotations;

    // Count per device for the filter tabs
    var deviceCounts = { all: 0, desktop: 0, tablet: 0, mobile: 0 };
    sessionAnns.forEach(function(a) {
      deviceCounts.all++;
      var meta = a.meta_data;
      if (typeof meta === 'string') { try { meta = JSON.parse(meta); } catch(e) { meta = {}; } }
      var d = (meta && meta.device) ? meta.device : 'desktop';
      if (deviceCounts[d] !== undefined) deviceCounts[d]++;
    });

    // Render device filter tabs above the body
    var deviceFilterEl = document.getElementById('ccfe-device-filter');
    if (deviceFilterEl) {
      deviceFilterEl.querySelectorAll('.ccfe-df-btn').forEach(function(btn) {
        var isActive = btn.dataset.device === (currentDeviceFilter || 'all');
        btn.style.background = isActive ? 'rgba(255,255,255,0.1)' : 'transparent';
        btn.style.color = isActive ? '#fff' : 'rgba(255,255,255,0.4)';
        btn.querySelector('.ccfe-df-count').textContent = deviceCounts[btn.dataset.device] || 0;
      });
      var cpSortBtn = deviceFilterEl.querySelector('#ccfe-cp-sort-btn');
      if (cpSortBtn) {
        cpSortBtn.innerHTML = currentSort === 'newest'
          ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:block;"><line x1="8" y1="6" x2="21" y2="6" fill="none" stroke="currentColor"/><line x1="8" y1="12" x2="21" y2="12" fill="none" stroke="currentColor"/><line x1="8" y1="18" x2="21" y2="18" fill="none" stroke="currentColor"/><line x1="3" y1="6" x2="3.01" y2="6" fill="none" stroke="currentColor"/><line x1="3" y1="12" x2="3.01" y2="12" fill="none" stroke="currentColor"/><line x1="3" y1="18" x2="3.01" y2="18" fill="none" stroke="currentColor"/></svg><span style="margin-left:2px;font-size:8px;letter-spacing:0.3px;">NEW</span>'
          : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:block;"><line x1="8" y1="6" x2="21" y2="6" fill="none" stroke="currentColor"/><line x1="8" y1="12" x2="21" y2="12" fill="none" stroke="currentColor"/><line x1="8" y1="18" x2="21" y2="18" fill="none" stroke="currentColor"/><line x1="3" y1="6" x2="3.01" y2="6" fill="none" stroke="currentColor"/><line x1="3" y1="12" x2="3.01" y2="12" fill="none" stroke="currentColor"/><line x1="3" y1="18" x2="3.01" y2="18" fill="none" stroke="currentColor"/></svg><span style="margin-left:2px;font-size:8px;letter-spacing:0.3px;">OLD</span>';
        cpSortBtn.title = currentSort === 'newest' ? 'Newest first' : 'Oldest first';
        cpSortBtn.style.color = 'rgba(255,255,255,0.6)';
      }
    }

    var filteredAnns = sessionAnns.filter(function(a) {
      // Status filter
      if (currentFilter !== 'all' && a.status !== currentFilter) return false;
      // Device filter — meta_data is already an object from server
      if (currentDeviceFilter && currentDeviceFilter !== 'all') {
        var meta = a.meta_data;
        if (typeof meta === 'string') { try { meta = JSON.parse(meta); } catch(e) { meta = {}; } }
        var d = (meta && meta.device) ? meta.device : 'desktop';
        if (d !== currentDeviceFilter) return false;
      }
      return true;
    });

    if (!filteredAnns.length) {
      var msg = currentFilter === 'all' ? 'No annotations yet.' : 'No ' + currentFilter + ' annotations.';
      body.innerHTML = '<div style="text-align:center;color:rgba(255,255,255,0.4);padding:40px;">' + msg + '</div>';
      return;
    }

    // Sort by created_at
    filteredAnns.sort(function(a, b) {
      var ta = new Date(a.created_at).getTime();
      var tb = new Date(b.created_at).getTime();
      return currentSort === 'newest' ? tb - ta : ta - tb;
    });

    var icons = {
      pin: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:middle"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
      rect: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:middle"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>',
      arrow: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:middle"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
      draw: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:middle"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg>'
    };
    
    var html = filteredAnns.map(function(a, i) {
      var originalIndex = annotations.indexOf(a);
      var isResolved = a.status === 'resolved';
      var opacity = isResolved ? '0.6' : '1';
      var badge = isResolved ? '<span style="margin-left:auto;font-size:10px;font-weight:800;color:var(--ccfe-success);border:1px solid rgba(16,185,129,0.3);background:rgba(16,185,129,0.1);padding:2px 6px;border-radius:4px;">RESOLVED</span>' : '<span style="margin-left:auto;font-size:10px;font-weight:800;color:var(--ccfe-danger);border:1px solid rgba(248,113,113,0.3);background:rgba(248,113,113,0.1);padding:2px 6px;border-radius:4px;">PENDING</span>';
      
      var meta = a.meta_data;
      if (typeof meta === 'string') { try { meta = JSON.parse(meta); } catch(e) { meta = {}; } }
      var device = (meta && meta.device) ? meta.device : 'desktop';
      var deviceColors = {
        desktop: 'background:rgba(99,102,241,0.1); color:#818cf8; border:1px solid rgba(99,102,241,0.2);',
        tablet: 'background:rgba(139,92,246,0.1); color:#a78bfa; border:1px solid rgba(139,92,246,0.2);',
        mobile: 'background:rgba(236,72,153,0.1); color:#f472b6; border:1px solid rgba(236,72,153,0.2);'
      };
      var devicePill = '<span style="font-size:9px; font-weight:800; padding:2px 6px; border-radius:100px; margin-left:6px; text-transform:uppercase; ' + (deviceColors[device] || deviceColors.desktop) + '">' + device + '</span>';
      
      var extEvent = new CustomEvent('ccfe_render_comment_extensions', { detail: { annotation: a, html: '' } });
      document.dispatchEvent(extEvent);
      var extHTML = extEvent.detail.html;

      var itemColor = a.color || '#6366f1';
      var reviewerName = a.client_name || a.user_name || (a.meta_data && a.meta_data.user_name) || 'Client';
      var timeDisplay = timeAgo(a.created_at);
      
      // Counts (Pro features, mostly 0 for now)
      var imgCount = (a.meta_data && a.meta_data.img_count) || 0;
      var vidCount = (a.meta_data && a.meta_data.vid_count) || 0;
      var audCount = (a.meta_data && a.meta_data.aud_count) || 0;
      var attCount = (a.meta_data && a.meta_data.att_count) || 0;

      var comment = a.comment_text || (audCount > 0 ? 'Voice note' : 'No comment');
      var needsReadMore = comment.length > 160;
      var commentDisplay = needsReadMore ? 
        '<div class="ccfe-comment-excerpt collapsed"><p class="ccfe-panel-comment">' + esc(comment) + '</p></div><button class="ccfe-read-more">Read More</button>' :
        '<p class="ccfe-panel-comment">' + esc(comment) + '</p>';

      var deviceLabels = { desktop: '🖥 Desktop', tablet: '⬜ Tablet', mobile: '📱 Mobile' };
      var deviceColors2 = {
        desktop: 'background:rgba(99,102,241,0.12);color:#818cf8;',
        tablet:  'background:rgba(139,92,246,0.12);color:#a78bfa;',
        mobile:  'background:rgba(236,72,153,0.12);color:#f472b6;'
      };
      var devicePillHtml = '<span style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:100px;text-transform:uppercase;letter-spacing:0.5px;' + (deviceColors2[device] || deviceColors2.desktop) + '">' + device + '</span>';

      return '<div class="ccfe-panel-item" data-idx="' + originalIndex + '" style="opacity:' + opacity + '; transition: all 0.2s; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin-bottom: 16px; cursor: pointer; position: relative;">' +
        // HEADER ROW — number badge + device pill + dots menu
        '<div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">' +
          '<div style="display:flex; align-items:center; gap:8px;">' +
            '<div style="width:24px; height:24px; border-radius:50%; background:' + itemColor + '; color:#fff; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800; flex-shrink:0;">' + (originalIndex + 1) + '</div>' +
            devicePillHtml +
          '</div>' +
          '<div class="ccfe-dots-trigger" style="padding:4px; opacity:0.4; cursor:pointer;">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>' +
          '</div>' +
        '</div>' +

      // REVIEWER INFO + ELEMENT CONTEXT
      '<div style="margin-bottom:14px;">' +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">' +
          '<div style="font-size:14px; font-weight:700; color:#fff;">' + reviewerName + '</div>' +
          (function() {
            // Tool type tag for shapes
            var toolLabels = { rect: 'Rectangle', arrow: 'Arrow', draw: 'Freehand' };
            if (toolLabels[a.type]) {
              return '<span style="display:inline-flex;align-items:center;gap:4px;margin-left:6px;vertical-align:middle;font-size:11px;font-weight:600;color:rgba(255,255,255,0.5);">' + (icons[a.type] || '') + ' ' + toolLabels[a.type] + '</span>';
            }
            // Element tag chip — only for pin/text type
            if (a.type !== 'pin' && a.type !== 'text') return '';
            var tag = (a.element_tag || '').toUpperCase();
            // Skip generic wrappers — only show meaningful tags
            var skipTags = ['DIV', 'SECTION', 'ARTICLE', 'MAIN', 'ASIDE', 'FIGURE', 'HEADER', 'FOOTER', ''];
            if (skipTags.indexOf(tag) > -1) return '';
            var text = a.context_title || a.element_text || '';
            // Convert to title case, trim
            text = text.replace(/\s+/g, ' ').trim();
            text = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
            var preview = text.length > 22 ? text.substring(0, 22) + '…' : text;
            var tagColors = {
              'H1':'#f59e0b','H2':'#f59e0b','H3':'#f59e0b','H4':'#f59e0b','H5':'#f59e0b','H6':'#f59e0b',
              'P':'#60a5fa','SPAN':'#60a5fa','LABEL':'#60a5fa',
              'A':'#34d399',
              'BUTTON':'#a78bfa','INPUT':'#a78bfa','TEXTAREA':'#a78bfa','SELECT':'#a78bfa',
              'IMG':'#f472b6','VIDEO':'#f472b6','SVG':'#f472b6',
              'LI':'rgba(255,255,255,0.5)','UL':'rgba(255,255,255,0.5)','OL':'rgba(255,255,255,0.5)'
            };
            var tagColor = tagColors[tag] || 'rgba(255,255,255,0.4)';
            return '<span style="display:inline-flex;align-items:center;gap:5px;margin-left:6px;vertical-align:middle;">' +
              '<span style="font-size:9px;font-weight:800;padding:1px 5px;border-radius:3px;background:' + tagColor + '22;color:' + tagColor + ';font-family:monospace;letter-spacing:0.3px;flex-shrink:0;">' + tag + '</span>' +
              (preview ? '<span style="font-size:11px;color:rgba(255,255,255,0.35);font-weight:400;max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + esc(preview) + '</span>' : '') +
            '</span>';
          })() +
        '</div>' +
        '<div style="font-size:11px; opacity:0.3; font-weight:500;">' + timeDisplay + '</div>' +
      '</div>' +

        // COMMENT
        '<div style="font-size:14px; color:rgba(255,255,255,0.8); line-height:1.6; margin-bottom:16px; word-wrap: break-word;">' + commentDisplay + '</div>' +

        // ATTACHMENTS — render via event (Pro) with fallback thumbnails
        (extHTML ? extHTML : renderAttachmentFallback(meta)) +

        // REVEAL BUTTON — only for pin (has a target element)
        (a.type === 'pin' && a.element_selector ? 
          '<button class="ccfe-reveal-btn" data-idx="' + originalIndex + '" style="display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:500;color:rgba(255,255,255,0.25);background:transparent;border:none;padding:0;cursor:pointer;transition:color 0.2s;margin-bottom:10px;" title="Highlight element on page">' +
            '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;"><circle cx="11" cy="11" r="8" style="fill:none!important;stroke:currentColor;"/><line x1="21" y1="21" x2="16.65" y2="16.65" style="fill:none!important;stroke:currentColor;"/></svg>' +
            'Reveal on page' +
          '</button>' : '') +

      '</div>';
    }).join('');
    
    body.innerHTML = html;
    // 3-Dots Menu Logic
    body.querySelectorAll('.ccfe-dots-trigger').forEach(function (trigger) {
      trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        var idx = parseInt(this.closest('.ccfe-panel-item').getAttribute('data-idx'));
        var a = annotations[idx];
        
        // Remove existing menus
        document.querySelectorAll('.ccfe-context-menu').forEach(m => m.remove());
        
        var menu = document.createElement('div');
        menu.className = 'ccfe-context-menu';
        menu.style.cssText = 'position:absolute; top:40px; right:20px; background:#1e1e1e; border:1px solid rgba(255,255,255,0.1); border-radius:8px; box-shadow:0 10px 30px rgba(0,0,0,0.5); z-index:1000; width:140px; overflow:hidden; padding:4px;';
        
        var actions = [
          { label: 'Locate / Track', icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>', action: 'locate' },
          { label: 'Hide Feedback', icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>', pro: true },
          { label: 'Delete', icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>', action: 'delete', danger: true }
        ];
        
        actions.forEach(function(opt) {
          var row = document.createElement('div');
          row.style.cssText = 'padding:10px 12px; display:flex; align-items:center; gap:10px; font-size:12px; font-weight:600; cursor:pointer; border-radius:6px; color:' + (opt.danger ? '#ff7675' : '#fff') + '; opacity:' + (opt.pro ? '0.2' : '1') + ';';
          row.innerHTML = opt.icon + '<span>' + opt.label + '</span>';
          
          if (!opt.pro) {
            row.addEventListener('mouseover', () => row.style.background = 'rgba(255,255,255,0.05)');
            row.addEventListener('mouseout', () => row.style.background = 'transparent');
            row.addEventListener('click', function(ev) {
              ev.stopPropagation();
              if (opt.action === 'locate') trigger.closest('.ccfe-panel-item').click();
              if (opt.action === 'delete') {
                if (confirm('Delete this annotation?')) deleteAnnotation(a.id);
              }
              menu.remove();
            });
          } else {
             row.title = "Available in Pro Version";
             row.style.cursor = 'not-allowed';
          }
          menu.appendChild(row);
        });
        
        this.closest('.ccfe-panel-item').appendChild(menu);
        
        // Close on outside click
        setTimeout(() => {
          var close = (ev) => { if (!menu.contains(ev.target)) { menu.remove(); document.removeEventListener('click', close); } };
          document.addEventListener('click', close);
        }, 10);
      });
    });

    // Reveal button — flash dashed border around the target element
    body.querySelectorAll('.ccfe-reveal-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var idx = parseInt(this.dataset.idx);
        var a = annotations[idx];
        if (!a) return;

        // Auto-Resize Viewport to match original device
        var device = (a.meta_data && a.meta_data.device) ? a.meta_data.device : 'desktop';
        var widths = { desktop: '', tablet: '768px', mobile: '375px' };
        document.body.style.maxWidth = widths[device];
        document.body.style.margin = device === 'desktop' ? '' : '0 auto';
        document.body.style.boxShadow = device === 'desktop' ? '' : '0 0 60px rgba(0,0,0,0.3)';

        document.dispatchEvent(new CustomEvent('ccfe_on_locate', { detail: { annotation: a, device: device } }));

        setTimeout(function() {
          var el = DNA.find({
            elementorId: a.elementor_data_id,
            selector: a.element_selector,
            tag: a.element_tag,
            text: a.element_text,
            fingerprint: a.element_fingerprint
          });
          if (!el) { showToast('Element not found on page'); return; }

          // Try to find the specific semantic element within the widget
          var semanticTags = ['H1','H2','H3','H4','H5','H6','P','A','BUTTON','INPUT','TEXTAREA','IMG','SPAN','LABEL'];
          var revealEl = el;
          if (a.element_tag && semanticTags.indexOf(a.element_tag.toUpperCase()) > -1) {
            var inner = el.querySelector(a.element_tag.toLowerCase());
            if (inner) revealEl = inner;
          }

          // Scroll to it
          window.dispatchEvent(new Event('resize'));
          revealEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

          // Flash dashed highlight on the specific element
          var prev = { outline: revealEl.style.outline, outlineOffset: revealEl.style.outlineOffset, transition: revealEl.style.transition };
          revealEl.style.transition = 'outline 0.15s';
          revealEl.style.outline = '2px dashed #6366f1';
          revealEl.style.outlineOffset = '4px';

          var count = 0;
          var pulse = setInterval(function() {
            count++;
            revealEl.style.outline = count % 2 === 0 ? '2px dashed #6366f1' : '2px dashed transparent';
            if (count >= 6) {
              clearInterval(pulse);
              revealEl.style.outline = prev.outline;
              revealEl.style.outlineOffset = prev.outlineOffset;
              revealEl.style.transition = prev.transition;
            }
          }, 300);
        }, 150);
      });
    });

    body.querySelectorAll('.ccfe-panel-item').forEach(function (item) {
      item.addEventListener('click', function (e) {
        if (e.target.closest('.ccfe-panel-delete')) return;
        if (e.target.closest('.ccfe-reveal-btn')) return;
        var idx = parseInt(this.getAttribute('data-idx'));
        var a = annotations[idx];
        if (!a) return;
        
        // Auto-Resize Viewport to match original device
        var device = (a.meta_data && a.meta_data.device) ? a.meta_data.device : 'desktop';
        var widths = { desktop: '', tablet: '768px', mobile: '375px' };
        
        document.body.style.maxWidth = widths[device];
        document.body.style.margin = device === 'desktop' ? '' : '0 auto';
        document.body.style.boxShadow = device === 'desktop' ? '' : '0 0 60px rgba(0,0,0,0.3)';
        
        // Dispatch event for Pro Plugin to sync Elementor Editor
        document.dispatchEvent(new CustomEvent('ccfe_on_locate', { detail: { annotation: a, device: device } }));
        
        // Wait for potential resize animation before scrolling
        setTimeout(function() {
            Renderer.scrollTo(a);
            window.dispatchEvent(new Event('resize'));
            // Start the pulse AFTER layout settles
            setTimeout(function() {
                Renderer.setSelected(a.id);
            }, 300);
        }, 150);
      });
    });
    body.querySelectorAll('.ccfe-panel-delete').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var idx = parseInt(this.getAttribute('data-idx'));
        var a = annotations[idx];
        if (a && confirm('Delete this annotation?')) deleteAnnotation(a.id);
      });
    });

    body.querySelectorAll('.ccfe-read-more').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var wrap = this.previousElementSibling;
        if (wrap.classList.contains('collapsed')) {
          wrap.classList.remove('collapsed');
          this.textContent = 'Show Less';
        } else {
          wrap.classList.add('collapsed');
          this.textContent = 'Read More';
        }
      });
    });
  }

  function updateCount() {
    var count = document.getElementById('ccfe-count');
    if (count) count.textContent = annotations.filter(function (a) { return a.status !== 'resolved'; }).length;
  }

  /* ── Drawing & Interactions ────────────────────────────────── */
  function onCanvasMouseDown(e) {
    
    if (e.target.closest('.ccfe-handle')) {
      var handle = e.target.closest('.ccfe-handle');
      var action = handle.getAttribute('data-action');
      var annId = handle.parentElement.getAttribute('data-ccfe-id');
      var ann = annotations.find(function(a) { return a.id == annId; });
      if (ann) {
        isResizing = true;
        resizeData = { action: action, annotation: ann };
        e.stopPropagation();
        return;
      }
    }

    if (currentTool === 'select') return;
    if (e.target.closest('#ccfe-toolbar-root')) return;
    if (e.target.closest('.ccfe-comment-panel')) return;
    if (e.target.closest('.ccfe-client-panel')) return;
    // Pro modal overlays — must not be intercepted by pin tool
    if (e.target.closest('.ccfe-ss-selection-overlay')) return;
    if (e.target.closest('.ccfe-voice-modal-overlay')) return;
    if (e.target.closest('.ccfe-modal-overlay')) return;

    // USE THE SAME ELEMENT for DNA + coordinates that the renderer will find later.
    // closestTargetable walks up to the nearest [data-id] Elementor widget,
    // which is exactly what DNA.find() will relocate on re-render.
    var targetEl = DNA.closestTargetable(e.target);

    var dna = DNA.getDNA(targetEl);
    if (!dna) return;

    // Prevent default navigation if we are placing an annotation
    if (e.target.closest('a')) e.preventDefault();

    var rect = DNA.getDocRect(targetEl);
    var ax = ((e.pageX - rect.left) / rect.width) * 100;
    var ay = ((e.pageY - rect.top) / rect.height) * 100;

    // CONTEXT: Show the actual clicked element if it's a meaningful tag
    var semanticTags = ['H1','H2','H3','H4','H5','H6','P','A','BUTTON','INPUT','TEXTAREA','SELECT','LABEL','SPAN','IMG','VIDEO','LI','STRONG','EM'];
    var semanticEl = semanticTags.indexOf((e.target.tagName || '').toUpperCase()) > -1 ? e.target : null;
    var contextTag = semanticEl ? semanticEl.tagName.toUpperCase() : (dna.tag || 'DIV').toUpperCase();
    var contextText = ((semanticEl || targetEl).innerText || (semanticEl || targetEl).textContent || '').trim();
    contextText = contextText.replace(/\s+/g, ' ').substring(0, 40);

    if (currentTool === 'pin') {
      clearSelectionHover();
      openCommentPanel(e.clientX, e.clientY, {
        type: 'pin',
        elementor_data_id: dna.elementorId,
        element_selector: dna.selector,
        element_tag: contextTag,
        element_text: dna.text,
        element_fingerprint: dna.fingerprint,
        anchor_x_pct: ax,
        anchor_y_pct: ay,
        context_title: contextText,
        created_at: new Date().toISOString(),
        meta_data: { device: currentDevice }
      });
    } else if (currentTool === 'rect' || currentTool === 'arrow' || currentTool === 'draw') {
      isDrawing = true;
      drawStart = { x: e.pageX, y: e.pageY, ax: ax, ay: ay, dna: dna, el: targetEl, context_title: contextText };
      drawPoints = [[ax, ay]];
      
      // Prevent text selection while drawing
      document.body.style.userSelect = 'none';
    }
  }

  function onMouseMove(e) {
    if (isMoving && moveData) {
      var a = moveData.annotation;
      var el = DNA.find({ elementorId: a.elementor_data_id, selector: a.element_selector, tag: a.element_tag, text: a.element_text, fingerprint: a.element_fingerprint });
      if (el) {
        var rect = DNA.getDocRect(el);
        var dx = ((e.pageX - moveData.startX) / rect.width) * 100;
        var dy = ((e.pageY - moveData.startY) / rect.height) * 100;
        
        a.anchor_x_pct = moveData.origX + dx;
        a.anchor_y_pct = moveData.origY + dy;
        if (!isNaN(moveData.origEndX)) {
          a.end_anchor_x_pct = moveData.origEndX + dx;
          a.end_anchor_y_pct = moveData.origEndY + dy;
        }
        Renderer.renderAll();
      }
      return;
    }
    if (isResizing && resizeData) {
      var a = resizeData.annotation;
      var el = DNA.find({ elementorId: a.elementor_data_id, selector: a.element_selector, tag: a.element_tag, text: a.element_text, fingerprint: a.element_fingerprint });
      if (el) {
        var rect = DNA.getDocRect(el);
        var ax = ((e.pageX - rect.left) / rect.width) * 100;
        var ay = ((e.pageY - rect.top) / rect.height) * 100;
        
        if (resizeData.action === 'resize-se') {
          a.width_pct = ax - parseFloat(a.anchor_x_pct);
          a.height_pct = ay - parseFloat(a.anchor_y_pct);
        } else if (resizeData.action === 'move-start') {
          a.anchor_x_pct = ax;
          a.anchor_y_pct = ay;
        } else if (resizeData.action === 'move-end') {
          a.end_anchor_x_pct = ax;
          a.end_anchor_y_pct = ay;
        }
        Renderer.renderAll();
      }
      return;
    }

    // Selection Hover Mode (Pin Tool)
    if (currentTool === 'pin' && !isDrawing) {
        // Don't show selection ghost over any modal or toolbar
        if (e.target.closest('#ccfe-toolbar-root') ||
            e.target.closest('.ccfe-client-panel') ||
            e.target.closest('.ccfe-comment-panel') ||
            e.target.closest('.ccfe-ss-selection-overlay') ||
            e.target.closest('.ccfe-voice-modal-overlay') ||
            e.target.closest('.ccfe-modal-overlay')) {
            clearSelectionHover();
            return;
        }

        var hoverTarget = DNA.closestTargetable(e.target);
        if (hoverTarget && hoverTarget !== document.body) {
            // Pass the direct element under cursor as the display target
            // so the ghost highlights the specific element (H2, button, etc.)
            // while hoverTarget (the Elementor widget) is used for anchoring
            var directEl = e.target;
            // Walk up slightly to find a meaningful element (skip text nodes, tiny spans)
            while (directEl && directEl !== hoverTarget) {
              var r = directEl.getBoundingClientRect();
              if (r.width > 10 && r.height > 10) break;
              directEl = directEl.parentElement;
            }
            renderSelectionHover(hoverTarget, directEl !== hoverTarget ? directEl : null);
        } else {
            clearSelectionHover();
        }
    } else {
        clearSelectionHover();
    }

    if (!isDrawing || !drawStart) return;

    var rect = DNA.getDocRect(drawStart.el);
    var ax = ((e.pageX - rect.left) / rect.width) * 100;
    var ay = ((e.pageY - rect.top) / rect.height) * 100;

    if (currentTool === 'rect') {
      Renderer.renderAll();
      var ctx = document.getElementById('ccfe-overlay');
      var r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      
      // Calculate coordinates relative to the page
      var rx = Math.min(drawStart.x, e.pageX);
      var ry = Math.min(drawStart.y, e.pageY);
      var rw = Math.abs(e.pageX - drawStart.x);
      var rh = Math.abs(e.pageY - drawStart.y);

      r.setAttribute('x', rx);
      r.setAttribute('y', ry);
      r.setAttribute('width', rw);
      r.setAttribute('height', rh);
      r.setAttribute('fill', 'rgba(99, 102, 241, 0.15)');
      r.setAttribute('stroke', '#6366f1');
      r.setAttribute('stroke-width', '2');
      r.setAttribute('stroke-dasharray', '5,5');
      ctx.appendChild(r);
    } else if (currentTool === 'arrow') {
      Renderer.renderAll();
      var ctx2 = document.getElementById('ccfe-overlay');
      var l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      l.setAttribute('x1', drawStart.x);
      l.setAttribute('y1', drawStart.y);
      l.setAttribute('x2', e.pageX);
      l.setAttribute('y2', e.pageY);
      l.setAttribute('stroke', '#6366f1');
      l.setAttribute('stroke-width', '3');
      ctx2.appendChild(l);
    } else if (currentTool === 'draw') {
      drawPoints.push([ax, ay]);
      Renderer.renderAll();
      var ctx3 = document.getElementById('ccfe-overlay');
      var d = 'M';
      drawPoints.forEach(function (p, i) {
        var px = rect.left + (p[0] / 100) * rect.width;
        var py = rect.top + (p[1] / 100) * rect.height;
        d += (i === 0 ? '' : ' L') + px + ' ' + py;
      });
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', '#6366f1');
      path.setAttribute('stroke-width', '3');
      ctx3.appendChild(path);
    }
  }

  function onMouseUp(e) {
    if (isMoving) {
      updateAnnotation(moveData.annotation);
      isMoving = false;
      moveData = null;
      return;
    }
    if (isResizing) {
      updateAnnotation(resizeData.annotation);
      isResizing = false;
      resizeData = null;
      return;
    }
    if (!isDrawing || !drawStart) return;
    isDrawing = false;
    document.body.style.userSelect = '';

    // Instant Preview: Add to renderer before saving
    var tempId = 'temp-' + Date.now();
    var previewData = {
      id: tempId,
      type: currentTool,
      status: 'pending',
      elementor_data_id: drawStart.dna.elementorId,
      element_selector: drawStart.dna.selector,
      element_tag: drawStart.dna.tag,
      element_text: drawStart.dna.text,
      element_fingerprint: drawStart.dna.fingerprint,
      anchor_x_pct: drawStart.ax,
      anchor_y_pct: drawStart.ay,
      context_title: drawStart.context_title,
      created_at: new Date().toISOString(),
      meta_data: { device: currentDevice }
    };
    
    var rect = DNA.getDocRect(drawStart.el);
    var ax = ((e.pageX - rect.left) / rect.width) * 100;
    var ay = ((e.pageY - rect.top) / rect.height) * 100;

    if (currentTool === 'rect') {
      previewData.width_pct = ax - drawStart.ax;
      previewData.height_pct = ay - drawStart.ay;
    } else if (currentTool === 'arrow') {
      var realTarget = document.elementFromPoint(e.clientX, e.clientY);
      var endTarget = DNA.closestTargetable(realTarget || e.target);
      var endDNA = DNA.getDNA(endTarget);
      var endRect = DNA.getDocRect(endTarget);
      previewData.end_elementor_data_id = endDNA ? endDNA.elementorId : '';
      previewData.end_element_selector = endDNA ? endDNA.selector : '';
      previewData.end_anchor_x_pct = ((e.pageX - endRect.left) / endRect.width) * 100;
      previewData.end_anchor_y_pct = ((e.pageY - endRect.top) / endRect.height) * 100;
    } else if (currentTool === 'draw') {
      previewData.draw_data = JSON.stringify({ points: drawPoints });
    }
    
    Renderer.addAnnotation(previewData);
    renderClientPanel();
    openCommentPanel(e.clientX, e.clientY, previewData);
    
    drawStart = null;
  }

  /* ── Comment Panel Logic ───────────────────────────────────── */
  function openCommentPanel(x, y, data) {
    // Auto-deselect pin/rect/arrow/draw tool after placing an annotation
    if (currentTool !== 'select') setActiveTool('select');
    selectedAnnotation = data;
    var panel = document.getElementById('ccfe-comment-panel');
    panel.innerHTML =
      '<div class="ccfe-cp-header" style="display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.06);">' +
        '<span style="color:#fff;font-weight:700;font-size:14px;font-family:var(--ccfe-font);">Add Comment</span>' +
        '<button class="ccfe-cp-close" style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:8px;border:none;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.5);font-size:18px;cursor:pointer;padding:0;line-height:1;">&times;</button>' +
      '</div>' +
      '<textarea id="ccfe-cp-text" placeholder="Type your feedback here..." style="display:block;width:100%;padding:14px 18px;border:none;background:transparent;color:#fff;font-size:14px;font-family:var(--ccfe-font);resize:none;min-height:90px;outline:none;line-height:1.6;box-sizing:border-box;"></textarea>' +
      // Color picker row
      '<div class="ccfe-cp-colors" style="display:flex;align-items:center;gap:8px;padding:10px 18px;border-top:1px solid rgba(255,255,255,0.05);border-bottom:1px solid rgba(255,255,255,0.05);">' +
        '<div class="ccfe-color-dot active" data-color="#6366f1" style="width:20px;height:20px;border-radius:50%;background:#6366f1;cursor:pointer;border:2px solid #fff;flex-shrink:0;"></div>' +
        '<div class="ccfe-color-dot" data-color="#f87171" style="width:20px;height:20px;border-radius:50%;background:#f87171;cursor:pointer;border:2px solid transparent;flex-shrink:0;"></div>' +
        '<div class="ccfe-color-dot" data-color="#fbbf24" style="width:20px;height:20px;border-radius:50%;background:#fbbf24;cursor:pointer;border:2px solid transparent;flex-shrink:0;"></div>' +
        '<div class="ccfe-color-dot" data-color="#10b981" style="width:20px;height:20px;border-radius:50%;background:#10b981;cursor:pointer;border:2px solid transparent;flex-shrink:0;"></div>' +
        '<div class="ccfe-color-dot" data-color="#38bdf8" style="width:20px;height:20px;border-radius:50%;background:#38bdf8;cursor:pointer;border:2px solid transparent;flex-shrink:0;"></div>' +
        '<div style="width:20px;height:20px;border-radius:50%;background:linear-gradient(45deg,#f06,#4a90e2);cursor:pointer;position:relative;overflow:hidden;border:2px solid transparent;flex-shrink:0;" class="ccfe-custom-color-wrap">' +
          '<input type="color" id="ccfe-cp-color-picker" style="position:absolute;top:-5px;left:-5px;width:30px;height:30px;border:none;cursor:pointer;background:none;">' +
        '</div>' +
      '</div>' +
      // Pro media icons — faded only, no locks
      '<div style="display:flex;align-items:center;gap:20px;padding:10px 18px;border-bottom:1px solid rgba(255,255,255,0.05);">' +
        '<div style="opacity:0.2;cursor:not-allowed;" title="Image upload (Pro)">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" style="fill:none!important;stroke:rgba(255,255,255,0.8);"/><circle cx="8.5" cy="8.5" r="1.5" style="fill:none!important;stroke:rgba(255,255,255,0.8);"/><polyline points="21 15 16 10 5 21" style="fill:none!important;stroke:rgba(255,255,255,0.8);"/></svg>' +
        '</div>' +
        '<div style="opacity:0.2;cursor:not-allowed;" title="Video upload (Pro)">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="1.8"><path d="M23 7l-7 5 7 5V7z" style="fill:none!important;stroke:rgba(255,255,255,0.8);"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2" style="fill:none!important;stroke:rgba(255,255,255,0.8);"/></svg>' +
        '</div>' +
        '<div style="opacity:0.2;cursor:not-allowed;" title="Upload audio (Pro)">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="1.8"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" style="fill:none!important;stroke:rgba(255,255,255,0.8);"/><path d="M15 8a5 5 0 0 1 0 8" style="fill:none!important;stroke:rgba(255,255,255,0.8);"/></svg>' +
        '</div>' +
        '<div style="opacity:0.2;cursor:not-allowed;" title="File attachment (Pro)">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="1.8"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" style="fill:none!important;stroke:rgba(255,255,255,0.8);"/></svg>' +
        '</div>' +
      '</div>' +
      '<div id="ccfe-cp-extensions"></div>' +
      // Save / Cancel actions
      '<div style="display:flex;gap:8px;padding:14px 18px;">' +
        '<button id="ccfe-cp-save" style="flex:1;padding:11px 16px;border-radius:10px;border:none;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;font-size:14px;font-weight:600;font-family:var(--ccfe-font);cursor:pointer;transition:all 0.2s;box-shadow:0 4px 12px rgba(99,102,241,0.35);">Save</button>' +
        '<button id="ccfe-cp-cancel" style="padding:11px 16px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:rgba(255,255,255,0.5);font-size:14px;font-weight:500;font-family:var(--ccfe-font);cursor:pointer;transition:all 0.2s;">Cancel</button>' +
      '</div>';
    
    panel.classList.remove('ccfe-hidden');
    
    // Smart positioning — keep panel fully inside the viewport on all 4 sides
    var pw = 340;
    var ph = 320; // approximate panel height
    var margin = 16;
    var vw = window.innerWidth;
    var vh = window.innerHeight;

    // Horizontal: try right of click, flip left if it overflows
    var px = x + 20;
    if (px + pw > vw - margin) px = x - pw - 20;
    // Clamp so it never goes off the left edge either
    px = Math.max(margin, px);

    // Vertical: try below click, flip above if it overflows
    var py = y;
    if (py + ph > vh - margin) py = vh - ph - margin;
    // Never go above the top
    py = Math.max(margin, py);

    panel.style.left = px + 'px';
    panel.style.top = py + 'px';
    // Ensure it never exceeds viewport height
    panel.style.maxHeight = (vh - py - margin) + 'px';

    document.dispatchEvent(new CustomEvent('ccfe_panel_opened', { detail: { panel: panel, annotation: selectedAnnotation } }));

    panel.querySelector('.ccfe-cp-close').onclick = closeCommentPanel;
    panel.querySelector('#ccfe-cp-cancel').onclick = closeCommentPanel;
    
    var toolColors = { pin: '#6366f1', rect: '#f87171', arrow: '#fbbf24', draw: '#10b981' };
    var activeColor = selectedAnnotation.color || toolColors[selectedAnnotation.type] || '#6366f1';
    
    // Set initial active state on dots
    panel.querySelectorAll('.ccfe-color-dot').forEach(function(dot) {
        if (dot.dataset.color === activeColor) dot.style.borderColor = '#fff';
        dot.onclick = function() {
            panel.querySelectorAll('.ccfe-color-dot').forEach(function(d) { d.style.borderColor = 'transparent'; });
            this.style.borderColor = '#fff';
            activeColor = this.dataset.color;
            selectedAnnotation.color = activeColor;
            Renderer.renderAll();
        };
    });

    var colorPicker = panel.querySelector('#ccfe-cp-color-picker');
    colorPicker.oninput = function() {
        panel.querySelectorAll('.ccfe-color-dot').forEach(function(d) { d.style.borderColor = 'transparent'; });
        this.parentElement.style.borderColor = '#fff';
        activeColor = this.value;
        selectedAnnotation.color = activeColor;
        Renderer.renderAll();
    };

    panel.querySelector('#ccfe-cp-save').onclick = function () {
      selectedAnnotation.color = activeColor;

      // Pro Plugin Intercept Hook — fires first so pro can attach pending uploads
      var event = new CustomEvent('ccfe_before_save', { detail: { annotation: selectedAnnotation }, cancelable: true });
      if (!document.dispatchEvent(event)) return; // Extension called preventDefault to handle async uploads

      var text = document.getElementById('ccfe-cp-text').value.trim();
      var hasMedia = selectedAnnotation.meta_data && selectedAnnotation.meta_data.attachments && selectedAnnotation.meta_data.attachments.length;
      if (!text && !hasMedia) return alert('Please enter a comment');
      if (text) selectedAnnotation.comment_text = text;

      saveAnnotation(selectedAnnotation).then(closeCommentPanel);
    };
    document.getElementById('ccfe-cp-text').focus();
  }

  function closeCommentPanel() {
    document.getElementById('ccfe-comment-panel').classList.add('ccfe-hidden');
    selectedAnnotation = null;
    Renderer.renderAll();
  }

  function showToast(msg) {
    var t = document.getElementById('ccfe-toast');
    t.textContent = msg;
    t.classList.remove('ccfe-hidden');
    setTimeout(function () { t.classList.add('ccfe-hidden'); }, 3000);
  }

  /* ── Link Interception ─────────────────────────────────────── */
  function interceptLinks() {
    document.addEventListener('click', function (e) {
      // If we are currently annotating, we already preventDefault in onCanvasClick
      if (currentTool !== 'select') return;

      var a = e.target.closest('a');
      if (!a) return;

      var href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

      try {
        var url = new URL(a.href);
        // Only intercept internal links
        if (url.hostname === window.location.hostname) {
          e.preventDefault();
          url.searchParams.set('ccfe_review', cfg.token);
          window.location.href = url.toString();
        }
      } catch (err) {}
    });
  }

  /* ── Initialization ────────────────────────────────────────── */
  function init() {
    Renderer.init();
    buildToolbar();
    loadAnnotations();
    interceptLinks();

    document.addEventListener('mousedown', onCanvasMouseDown, true);
    document.addEventListener('mousemove', onMouseMove, true);
    document.addEventListener('mouseup', onMouseUp, true);

    // Allow Pro plugin (or any external code) to open the comment panel
    document.addEventListener('ccfe_open_comment_panel', function(e) {
      var d = e.detail;
      if (!d) return;
      selectedAnnotation = d.annotation;
      openCommentPanel(d.x, d.y, d.annotation);
    });
    document.addEventListener('ccfe_trigger_save', function(e) {
      if (e.detail && e.detail.annotation) {
          saveAnnotation(e.detail.annotation).then(closeCommentPanel);
      }
    });

    // Catch dragging from renderer
    document.addEventListener('ccfe-drag-start', function(e) {
      if (currentTool !== 'select') return;
      var ann = e.detail.annotation;
      var ev = e.detail.event;
      isMoving = true;
      moveData = { 
        annotation: ann, 
        startX: ev.pageX, 
        startY: ev.pageY,
        origX: parseFloat(ann.anchor_x_pct),
        origY: parseFloat(ann.anchor_y_pct),
        origEndX: parseFloat(ann.end_anchor_x_pct),
        origEndY: parseFloat(ann.end_anchor_y_pct)
      };
      ev.stopPropagation();
    }, true);

    Renderer.setClickCallback(function (a) {
      if (currentTool === 'select') {
        Renderer.setSelected(a.id);
        Renderer.scrollTo(a);
        if (!cpanelOpen) toggleClientPanel();
      }
    });

    setInterval(loadAnnotations, 5000);
  }

  /* ── Selection Hover ────────────────────────────────────────── */
  function hexToRgba(hex, alpha) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    var r = parseInt(hex.substring(0,2), 16);
    var g = parseInt(hex.substring(2,4), 16);
    var b = parseInt(hex.substring(4,6), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  function renderSelectionHover(el, directEl) {
    if (!el) return;

    // Show the ghost on the most specific visible element (directEl if semantic, else el)
    var displayEl = directEl || el;
    var rect = displayEl.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      rect = el.getBoundingClientRect();
      displayEl = el;
    }

    var overlay = document.getElementById('ccfe-selection-ghost');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'ccfe-selection-ghost';
      overlay.style.cssText = 'position:fixed;pointer-events:none;z-index:999999;transition:all 0.1s cubic-bezier(0.4,0,0.2,1);border-radius:3px;';
      document.body.appendChild(overlay);
    }

    // Tag label
    var label = document.getElementById('ccfe-selection-label');
    if (!label) {
      label = document.createElement('div');
      label.id = 'ccfe-selection-label';
      label.style.cssText = 'position:fixed;pointer-events:none;z-index:9999999;font-size:10px;font-weight:700;font-family:monospace;padding:2px 6px;border-radius:3px;letter-spacing:0.3px;transition:all 0.1s;white-space:nowrap;';
      document.body.appendChild(label);
    }

    var tag = displayEl.tagName.toUpperCase();
    var tagColors = {
      'H1':'#f59e0b','H2':'#f59e0b','H3':'#f59e0b','H4':'#f59e0b','H5':'#f59e0b','H6':'#f59e0b',
      'P':'#60a5fa','SPAN':'#60a5fa',
      'A':'#34d399',
      'BUTTON':'#a78bfa','INPUT':'#a78bfa',
      'IMG':'#f472b6',
      'DIV':'#6366f1','SECTION':'#6366f1'
    };
    var color = tagColors[tag] || '#6366f1';

    overlay.style.display = 'block';
    overlay.style.left = rect.left + 'px';
    overlay.style.top = rect.top + 'px';
    overlay.style.width = rect.width + 'px';
    overlay.style.height = rect.height + 'px';
    overlay.style.border = '2px solid ' + color;
    overlay.style.background = hexToRgba(color, 0.06);
    overlay.style.boxShadow = '0 0 0 1px ' + hexToRgba(color, 0.2);

    // Position label at top-left of the element
    label.style.display = 'block';
    label.style.left = rect.left + 'px';
    label.style.top = Math.max(0, rect.top - 22) + 'px';
    label.style.background = color;
    label.style.color = '#fff';
    label.textContent = tag;
  }

  function clearSelectionHover() {
    var overlay = document.getElementById('ccfe-selection-ghost');
    if (overlay) overlay.style.display = 'none';
    var label = document.getElementById('ccfe-selection-label');
    if (label) label.style.display = 'none';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      init();
    });
  } else {
    init();
  }
})();
