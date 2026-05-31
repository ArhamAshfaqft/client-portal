/**
 * Previu Pro — Snippet Selection Screenshot Tool
 * Click-drag to select a region, auto-captures & attaches to comment.
 */
(function () {
  'use strict';

  if (!window.ccfeReview) return;

  var cfg = window.ccfePro || {};
  var isSelecting = false;
  var selStart = null;
  var selOverlay = null;
  var selBox = null;
  var dimOverlay = null;

  /* ── Listen for the screenshot button click ───────────────── */
  document.addEventListener('ccfe_screenshot_requested', function () {
    var rv = window.ccfeReview || {};
    if (rv.fileUploads === false || rv.uploadsImages === false) {
      var toast = document.getElementById('ccfe-toast');
      if (toast) {
        toast.textContent = 'Screenshots are disabled in settings.';
        toast.classList.remove('ccfe-hidden');
        setTimeout(function () { toast.classList.add('ccfe-hidden'); }, 3000);
      }
      return;
    }
    enterSelectionMode();
  });

  /* ── Also activate the toolbar button ─────────────────────── */
  function activateButton() {
    var btn = document.getElementById('ccfe-screenshot-btn');
    if (!btn) return;

    // Set neutral disabled state while we verify
    btn.style.opacity = '0.3';
    btn.style.cursor = 'default';
    btn.style.pointerEvents = 'none';
    btn.title = 'Checking...';

    // Fetch fresh config so we're not fooled by cached page data
    var apiUrl = cfg.restUrl.replace(/\/$/, '') + '/media/config';
    var sep = apiUrl.indexOf('?') > -1 ? '&' : '?';
    apiUrl += sep + '_t=' + Date.now();

    fetch(apiUrl, {
      headers: { 'X-WP-Nonce': cfg.nonce || '' },
      cache: 'no-store',
    })
      .then(function (r) { return r.json(); })
      .then(function (conf) {
        var enabled = conf.file_uploads !== false && conf.uploads_images !== false;
        btn.style.opacity = enabled ? '1' : '0.3';
        btn.style.cursor = enabled ? 'pointer' : 'default';
        btn.style.pointerEvents = enabled ? 'auto' : 'none';
        btn.title = enabled ? 'Screenshot Snippet' : 'Screenshots disabled';
        if (enabled) btn.classList.remove('ccfe-pro-screenshot');
      })
      .catch(function () {
        // Fallback to page-localized data
        var rv = window.ccfeReview || {};
        var enabled = rv.fileUploads !== false && rv.uploadsImages !== false;
        btn.style.opacity = enabled ? '1' : '0.3';
        btn.style.cursor = enabled ? 'pointer' : 'default';
        btn.style.pointerEvents = enabled ? 'auto' : 'none';
        btn.title = enabled ? 'Screenshot Snippet' : 'Screenshots disabled';
        if (enabled) btn.classList.remove('ccfe-pro-screenshot');
      });
  }

  /* ── Enter selection mode ─────────────────────────────────── */
  function enterSelectionMode() {
    if (dimOverlay) return;

    // Dim the page
    dimOverlay = document.createElement('div');
    dimOverlay.className = 'ccfe-ss-selection-overlay';
    dimOverlay.style.cssText =
      'position:fixed;inset:0;z-index:9999997;' +
      'background:rgba(0,0,0,0.35);cursor:crosshair;';

    // Selection box
    selBox = document.createElement('div');
    selBox.style.cssText =
      'position:fixed;z-index:9999998;' +
      'border:2px dashed #6366f1;' +
      'background:rgba(99,102,241,0.08);' +
      'display:none;pointer-events:none;';

    // Cancel hint
    var hint = document.createElement('div');
    hint.style.cssText =
      'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:9999999;' +
      'padding:10px 20px;border-radius:8px;background:rgba(0,0,0,0.75);color:rgba(255,255,255,0.6);' +
      'font-size:13px;font-family:system-ui,sans-serif;pointer-events:none;';
    hint.textContent = 'Click and drag to select area · Press Esc to cancel';
    dimOverlay.appendChild(hint);

    document.body.appendChild(dimOverlay);
    document.body.appendChild(selBox);

    // Prevent text selection
    document.body.style.userSelect = 'none';

    // Events
    dimOverlay.addEventListener('mousedown', onSelectionStart);
    dimOverlay.addEventListener('mousemove', onSelectionMove);
    dimOverlay.addEventListener('mouseup', onSelectionEnd);
    document.addEventListener('keydown', onKeyDown);
  }

  function exitSelectionMode() {
    if (dimOverlay) { dimOverlay.remove(); dimOverlay = null; }
    if (selBox) { selBox.remove(); selBox = null; }
    document.body.style.userSelect = '';
    isSelecting = false;
    selStart = null;
    document.removeEventListener('keydown', onKeyDown);
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') exitSelectionMode();
  }

  function onSelectionStart(e) {
    isSelecting = true;
    selStart = { x: e.clientX, y: e.clientY };
    selBox.style.display = 'block';
    updateSelectionBox(e);
  }

  function onSelectionMove(e) {
    if (!isSelecting) return;
    updateSelectionBox(e);
  }

  function updateSelectionBox(e) {
    var x1 = selStart.x;
    var y1 = selStart.y;
    var x2 = e.clientX;
    var y2 = e.clientY;

    selBox.style.left   = Math.min(x1, x2) + 'px';
    selBox.style.top    = Math.min(y1, y2) + 'px';
    selBox.style.width  = Math.abs(x2 - x1) + 'px';
    selBox.style.height = Math.abs(y2 - y1) + 'px';
  }

  function onSelectionEnd(e) {
    if (!isSelecting) return;
    isSelecting = false;

    var x1 = selStart.x;
    var y1 = selStart.y;
    var x2 = e.clientX;
    var y2 = e.clientY;

    var w = Math.abs(x2 - x1);
    var h = Math.abs(y2 - y1);

    // Minimum selection size
    if (w < 10 || h < 10) {
      exitSelectionMode();
      return;
    }

    var rect = {
      x: Math.min(x1, x2),
      y: Math.min(y1, y2),
      width: w,
      height: h,
      devicePixelRatio: window.devicePixelRatio || 1,
    };

    exitSelectionMode();
    captureRegion(rect, { clientX: e.clientX, clientY: e.clientY });
  }

  /* ── Capture the selected region ──────────────────────────── */
  function captureRegion(rect, clickPos) {
    // Show brief "capturing" toast
    var toast = document.getElementById('ccfe-toast');
    if (toast) {
      toast.textContent = 'Capturing snippet...';
      toast.classList.remove('ccfe-hidden');
    }

    // Use html2canvas to capture the full page, then crop
    if (typeof html2canvas === 'undefined') {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
      script.onload = function () { doCapture(rect, clickPos); };
      script.onerror = function () { captureFailed('Failed to load screenshot library.'); };
      document.head.appendChild(script);
    } else {
      doCapture(rect, clickPos);
    }
  }

  function doCapture(rect, clickPos) {
    var scale = rect.devicePixelRatio;

    html2canvas(document.body, {
      useCORS: true,
      allowTaint: true,
      logging: false,
      scale: scale,
      x: rect.x * scale,
      y: rect.y * scale,
      width: rect.width * scale,
      height: rect.height * scale,
    }).then(function (canvas) {
      // Convert to blob and upload
      canvas.toBlob(function (blob) {
        if (!blob) { captureFailed('Could not generate image.'); return; }
        uploadSnippet(blob, clickPos);
      }, 'image/png');
    }).catch(function () {
      captureFailed('Screenshot capture failed.');
    });
  }

  function captureFailed(msg) {
    var toast = document.getElementById('ccfe-toast');
    if (toast) {
      toast.textContent = msg;
      setTimeout(function () { toast.classList.add('ccfe-hidden'); }, 3000);
    }
  }

  /* ── Upload snippet & open comment panel ─────────────────── */
  function uploadSnippet(blob, clickPos) {
    var formData = new FormData();
    formData.append('file', blob, 'snippet-' + Date.now() + '.png');

    var url = (cfg.restUrl || window.ccfeReview.restUrl).replace(/\/$/, '') + '/media/upload';
    var sep = url.indexOf('?') > -1 ? '&' : '?';
    url += sep + '_t=' + Date.now();

    fetch(url, {
      method: 'POST',
      body: formData,
      headers: { 'X-WP-Nonce': cfg.nonce || '' },
      cache: 'no-store',
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data.url) { captureFailed('Upload failed.'); return; }

        var toast = document.getElementById('ccfe-toast');
        if (toast) toast.classList.add('ccfe-hidden');

        // Attach to pending uploads via the shared API
        if (window.CCFE_ProExtensions && window.CCFE_ProExtensions.addUpload) {
          window.CCFE_ProExtensions.addUpload(data);
        }

        // Trigger opening the comment panel with the snippet pre-attached
        document.dispatchEvent(new CustomEvent('ccfe_snippet_ready', {
          detail: { x: clickPos.clientX, y: clickPos.clientY, upload: data }
        }));
      })
      .catch(function () {
        captureFailed('Upload failed. Please try again.');
      });
  }

  // Activate the button on load
  var checkInterval = setInterval(function () {
    var btn = document.getElementById('ccfe-screenshot-btn');
    if (btn) {
      activateButton();
      clearInterval(checkInterval);
    }
  }, 200);
  setTimeout(function () { clearInterval(checkInterval); }, 5000);

})();
