/**
 * Previu Elementor Panel — Professional dev-side feedback panel.
 */
(function () {
  'use strict';
  if (!window.ccfeElementor) return;
  var cfg = window.ccfeElementor;
  var panelOpen = false;
  var overlayVisible = false;
  var annotations = [];
  var currentFilter = 'all';
  var currentDeviceFilter = 'all';
  var currentSort = 'newest';
  var currentProjectFilter = '';
  var projects = [];
  var hiddenAnnotations = new Set();

  try {
    var stored = localStorage.getItem('ccfe_hidden_annotations');
    if (stored) JSON.parse(stored).forEach(function(id) { hiddenAnnotations.add(String(id)); });
  } catch(e) {}

  function saveHiddenState() {
    try { localStorage.setItem('ccfe_hidden_annotations', JSON.stringify(Array.from(hiddenAnnotations))); } catch(e) {}
  }

  function api(method, path, body) {
    var opts = { method: method, cache: 'no-store', headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': cfg.nonce } };
    if (body) opts.body = JSON.stringify(body);
    var baseRestUrl = cfg.restUrl;
    try { var u = new URL(baseRestUrl); u.host = window.location.host; u.protocol = window.location.protocol; baseRestUrl = u.toString(); } catch(e) {}
    return fetch(baseRestUrl + path, opts).then(function(r) { return r.json(); });
  }

  function loadAnnotations() {
    var sep = cfg.restUrl.indexOf('?') > -1 ? '&' : '?';
    var ts = '_t=' + Date.now();
    api('GET', '/projects' + sep + ts).then(function(data) {
      if (!Array.isArray(data) || !data.length) return;
      projects = data;
      Promise.all(data.map(function(p) {
        return api('GET', '/projects/' + p.id + '/annotations' + sep + 'page_path=' + encodeURIComponent(cfg.pagePath) + '&_t=' + Date.now());
      })).then(function(results) {
        annotations = [];
        results.forEach(function(anns) { if (Array.isArray(anns)) annotations = annotations.concat(anns); });
        window.ccfeElementor.annotations = annotations;
        updateBadge();
        renderPanelContent();
        if (overlayVisible) syncOverlay();
      });
    });
  }

  /* ── Top Bar Button ── */
  function addTopBarButton() {
    function createBtn() {
      var btn = document.createElement('button');
      btn.id = 'ccfe-eye-btn';
      btn.className = 'ccfe-eye-btn';
      btn.title = 'Client Feedback';
      btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg><span class="ccfe-eye-badge" id="ccfe-eye-badge">0</span>';
      btn.addEventListener('click', togglePanel);
      return btn;
    }

    var checkInterval = setInterval(function() {
      if (document.getElementById('ccfe-eye-btn')) { clearInterval(checkInterval); return; }

      // Strategy 1: New Elementor v3 MUI toolbar — insert alongside action buttons
      var addElBtn = document.querySelector('[aria-label="Add Element"]');
      if (addElBtn) {
        var container = addElBtn.closest('.MuiStack-root, [class*="MuiStack"]');
        if (!container) container = addElBtn.parentElement;
        if (container) {
          clearInterval(checkInterval);
          var wrapper = document.createElement('span');
          wrapper.appendChild(createBtn());
          container.appendChild(wrapper);
          return;
        }
      }

      // Strategy 2: Old Elementor toolbar layout
      var toolbar = document.querySelector('#elementor-editor-wrapper-v2 header') ||
                    document.querySelector('.elementor-editor-header') ||
                    document.querySelector('#elementor-panel-header') ||
                    document.querySelector('#elementor-panel .elementor-panel-header') ||
                    document.querySelector('#elementor-panel-inner > .elementor-panel-header');
      if (!toolbar) return;
      clearInterval(checkInterval);
      var btn = createBtn();
      var menuBtn = toolbar.querySelector('.elementor-panel-header-menu-button');
      if (menuBtn) { menuBtn.after(btn); } else { toolbar.appendChild(btn); }
    }, 500);
  }

  function updateBadge() {
    var badge = document.getElementById('ccfe-eye-badge');
    if (badge) {
      var pending = annotations.filter(function(a) { return a.status === 'pending'; }).length;
      badge.textContent = pending;
      badge.style.display = pending > 0 ? 'flex' : 'none';
    }
  }

  /* ── Panel ── */
  function togglePanel() {
    panelOpen = !panelOpen;
    // Always remove and rebuild to pick up latest code
    var existing = document.getElementById('ccfe-elementor-panel');
    if (existing) existing.remove();
    if (!panelOpen) return;
    var panel = buildPanel();
    document.body.appendChild(panel);
    panel.classList.add('ccfe-ep-open');
    loadAnnotations();
    renderPanelContent();
  }

  function buildPanel() {
    var panel = document.createElement('div');
    panel.id = 'ccfe-elementor-panel';
    panel.className = 'ccfe-ep';
    panel.innerHTML =
      '<div class="ccfe-ep-header">' +
        '<span class="ccfe-ep-title">Client Feedback</span>' +
        '<div class="ccfe-ep-header-actions">' +
          '<button class="ccfe-ep-session-btn" id="ccfe-ep-session-btn" title="Filter by session" style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:rgba(255,255,255,0.5);cursor:pointer;padding:0;box-shadow:none;">' +
            '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:block;"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>' +
          '</button>' +
          '<button class="ccfe-ep-refresh" id="ccfe-force-sync" title="Sync"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg></button>' +
          '<button class="ccfe-ep-toggle-overlay" id="ccfe-toggle-overlay" title="Toggle overlay on preview"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>' +
          '<button class="ccfe-ep-close" id="ccfe-close-panel">&times;</button>' +
        '</div>' +
      '</div>' +
      // Status filter tabs
      '<div class="ccfe-ep-filters" style="display:flex;gap:6px;padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.05);">' +
        '<button class="ccfe-filter-btn active" data-filter="all" style="flex:1;padding:5px;border:none;border-radius:4px;background:rgba(255,255,255,0.1);color:#fff;cursor:pointer;font-size:11px;font-weight:600;transition:all 0.2s;">All</button>' +
        '<button class="ccfe-filter-btn" data-filter="pending" style="flex:1;padding:5px;border:none;border-radius:4px;background:transparent;color:rgba(255,255,255,0.5);cursor:pointer;font-size:11px;font-weight:600;transition:all 0.2s;">Pending</button>' +
        '<button class="ccfe-filter-btn" data-filter="resolved" style="flex:1;padding:5px;border:none;border-radius:4px;background:transparent;color:rgba(255,255,255,0.5);cursor:pointer;font-size:11px;font-weight:600;transition:all 0.2s;">Resolved</button>' +
      '</div>' +
      // Device filter tabs
      '<div id="ccfe-ep-device-filter" style="display:flex;gap:5px;padding:8px 14px;border-bottom:1px solid rgba(255,255,255,0.05);">' +
        '<button class="ccfe-ep-df-btn" data-device="all" style="flex:1;display:flex;align-items:center;justify-content:center;gap:4px;padding:5px 3px;border:none;border-radius:4px;background:rgba(255,255,255,0.1);color:#fff;cursor:pointer;font-size:10px;font-weight:700;transition:all 0.2s;">All<span class="ccfe-ep-df-count" style="background:rgba(255,255,255,0.15);border-radius:8px;padding:0 4px;font-size:9px;">0</span></button>' +
        '<button class="ccfe-ep-df-btn" data-device="desktop" style="flex:1;display:flex;align-items:center;justify-content:center;gap:4px;padding:5px 3px;border:none;border-radius:4px;background:transparent;color:rgba(255,255,255,0.4);cursor:pointer;font-size:10px;font-weight:700;transition:all 0.2s;"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg><span class="ccfe-ep-df-count" style="background:rgba(255,255,255,0.08);border-radius:8px;padding:0 4px;font-size:9px;">0</span></button>' +
        '<button class="ccfe-ep-df-btn" data-device="tablet" style="flex:1;display:flex;align-items:center;justify-content:center;gap:4px;padding:5px 3px;border:none;border-radius:4px;background:transparent;color:rgba(255,255,255,0.4);cursor:pointer;font-size:10px;font-weight:700;transition:all 0.2s;"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="2" width="18" height="20" rx="2"/><circle cx="12" cy="18.5" r="1" fill="currentColor" stroke="none"/></svg><span class="ccfe-ep-df-count" style="background:rgba(255,255,255,0.08);border-radius:8px;padding:0 4px;font-size:9px;">0</span></button>' +
        '<button class="ccfe-ep-df-btn" data-device="mobile" style="flex:1;display:flex;align-items:center;justify-content:center;gap:4px;padding:5px 3px;border:none;border-radius:4px;background:transparent;color:rgba(255,255,255,0.4);cursor:pointer;font-size:10px;font-weight:700;transition:all 0.2s;"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="2" width="12" height="20" rx="2"/><circle cx="12" cy="18.5" r="1" fill="currentColor" stroke="none"/></svg><span class="ccfe-ep-df-count" style="background:rgba(255,255,255,0.08);border-radius:8px;padding:0 4px;font-size:9px;">0</span></button>' +
        '<button id="ccfe-sort-btn" title="Sort" style="flex:0 0 28px;display:flex;align-items:center;justify-content:center;border:none;border-radius:4px;background:transparent;color:rgba(255,255,255,0.3);cursor:pointer;font-size:10px;font-weight:700;transition:all 0.2s;">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="ccfe-ep-body" id="ccfe-ep-body"></div>';

    panel.querySelector('#ccfe-close-panel').addEventListener('click', togglePanel);
    panel.querySelector('#ccfe-force-sync').addEventListener('click', function() {
      this.classList.add('ccfe-rotating');
      loadAnnotations();
      var self = this;
      setTimeout(function() { self.classList.remove('ccfe-rotating'); }, 1000);
    });
    panel.querySelector('#ccfe-toggle-overlay').addEventListener('click', function() {
      overlayVisible = !overlayVisible;
      this.classList.toggle('active', overlayVisible);
      syncOverlay();
    });

    panel.querySelectorAll('.ccfe-filter-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        panel.querySelectorAll('.ccfe-filter-btn').forEach(function(b) {
          b.style.background = 'transparent'; b.style.color = 'rgba(255,255,255,0.5)'; b.classList.remove('active');
        });
        this.style.background = 'rgba(255,255,255,0.1)'; this.style.color = '#fff'; this.classList.add('active');
        currentFilter = this.dataset.filter;
        renderPanelContent();
        if (currentFilter === 'media') document.dispatchEvent(new CustomEvent('ccfe_media_tab_opened'));
        if (overlayVisible) syncOverlay();
      });
    });

    panel.querySelectorAll('.ccfe-ep-df-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var device = this.dataset.device;
        panel.querySelectorAll('.ccfe-ep-df-btn').forEach(function(b) {
          b.style.background = 'transparent'; b.style.color = 'rgba(255,255,255,0.4)';
        });
        this.style.background = 'rgba(255,255,255,0.1)'; this.style.color = '#fff';
        currentDeviceFilter = device;
        renderPanelContent();
        if (overlayVisible) syncOverlay();
        // Sync Elementor's responsive preview ("All" → desktop)
        if (window.$e) {
          if (device === 'all') {
            window.__ccfeAllFilter = true;
            window.$e.run('panel/change-device-mode', { device: 'desktop' });
          } else {
            window.$e.run('panel/change-device-mode', { device: device });
          }
        }
      });
    });
    // Listen to Elementor's native device changes
    window.addEventListener('elementor/device-mode/change', function(e) {
      var device = e.detail.activeMode;
      if (window.__ccfeAllFilter) { window.__ccfeAllFilter = false; return; }
      if (device === currentDeviceFilter) return;
      currentDeviceFilter = device;
      var dfEl = document.getElementById('ccfe-ep-device-filter');
      if (dfEl) {
        dfEl.querySelectorAll('.ccfe-ep-df-btn').forEach(function(b) {
          var isActive = b.dataset.device === device;
          b.style.background = isActive ? 'rgba(255,255,255,0.1)' : 'transparent';
          b.style.color = isActive ? '#fff' : 'rgba(255,255,255,0.4)';
        });
      }
      if (panelOpen) renderPanelContent();
      if (overlayVisible) syncOverlay();
    });

    var sortBtn = panel.querySelector('#ccfe-sort-btn');
    if (sortBtn) {
      sortBtn.addEventListener('click', function() {
        currentSort = currentSort === 'newest' ? 'oldest' : 'newest';
        this.style.color = 'rgba(255,255,255,0.7)';
        renderPanelContent();
      });
    }

    // ── Session filter button ──
    var epSessionBtn = panel.querySelector('#ccfe-ep-session-btn');
    if (epSessionBtn) {
      epSessionBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        showSessionFilterMenu(this);
      });
    }
    // Restore persisted filter
    try { var saved = localStorage.getItem('ccfe_ep_project_filter'); if (saved) currentProjectFilter = saved; } catch(e) {}

    return panel;
  }

  function renderPanelContent() {
    var body = document.getElementById('ccfe-ep-body');
    if (!body) return;

    var isPro = !!(window.ccfeProActive);

    // Apply session filter for counts and display
    var sessionAnns = currentProjectFilter
      ? annotations.filter(function(a) { return String(a.project_id) === currentProjectFilter; })
      : annotations;

    // Update device filter counts
    var deviceCounts = { all: 0, desktop: 0, tablet: 0, mobile: 0 };
    sessionAnns.forEach(function(a) {
      deviceCounts.all++;
      var meta = a.meta_data;
      if (typeof meta === 'string') { try { meta = JSON.parse(meta); } catch(e) { meta = {}; } }
      var d = (meta && meta.device) ? meta.device : 'desktop';
      if (deviceCounts[d] !== undefined) deviceCounts[d]++;
    });
    var dfEl = document.getElementById('ccfe-ep-device-filter');
    if (dfEl) {
      dfEl.querySelectorAll('.ccfe-ep-df-btn').forEach(function(btn) {
        var isActive = btn.dataset.device === currentDeviceFilter;
        btn.style.background = isActive ? 'rgba(255,255,255,0.1)' : 'transparent';
        btn.style.color = isActive ? '#fff' : 'rgba(255,255,255,0.4)';
        btn.querySelector('.ccfe-ep-df-count').textContent = deviceCounts[btn.dataset.device] || 0;
      });
      var sortBtn = dfEl.querySelector('#ccfe-sort-btn');
      if (sortBtn) {
        sortBtn.innerHTML = currentSort === 'newest'
          ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg><span style="margin-left:2px;font-size:8px;letter-spacing:0.3px;">NEW</span>'
          : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg><span style="margin-left:2px;font-size:8px;letter-spacing:0.3px;">OLD</span>';
        sortBtn.title = currentSort === 'newest' ? 'Newest first' : 'Oldest first';
        sortBtn.style.color = 'rgba(255,255,255,0.6)';
      }
    }

    if (currentFilter === 'media' && !isPro) {
      setTimeout(function() { if (window.ccfeProActive) renderPanelContent(); }, 1500);
      body.innerHTML =
        '<div class="ccfe-ep-locked-media">' +
          '<div class="ccfe-ep-locked-icon">' +
            '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>' +
            '<div class="ccfe-ep-lock-badge"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1a5 5 0 0 0-5 5v4H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5zm-3 5a3 3 0 0 1 6 0v4H9V6z"/></svg></div>' +
          '</div>' +
          '<h3>Client Media Assets</h3>' +
          '<p>Upgrade to Pro to view and drag client-uploaded images directly into Elementor widgets.</p>' +
          '<a href="https://plugin.usepreviu.com" target="_blank" class="ccfe-ep-pro-btn">Unlock Media Library</a>' +
        '</div>';
      return;
    }

    // Apply filters
    var filteredAnns = sessionAnns.filter(function(a) {
      if (currentFilter !== 'all' && a.status !== currentFilter) return false;
      if (currentDeviceFilter !== 'all') {
        var meta = a.meta_data;
        if (typeof meta === 'string') { try { meta = JSON.parse(meta); } catch(e) { meta = {}; } }
        var d = (meta && meta.device) ? meta.device : 'desktop';
        if (d !== currentDeviceFilter) return false;
      }
      return true;
    });

    if (!filteredAnns.length) {
      body.innerHTML = '<div class="ccfe-ep-empty">' + (currentFilter === 'all' && currentDeviceFilter === 'all' ? 'No client feedback for this page yet.' : 'No feedback matches this filter.') + '</div>';
      return;
    }

    // Sort by created_at
    filteredAnns.sort(function(a, b) {
      var ta = new Date(a.created_at).getTime();
      var tb = new Date(b.created_at).getTime();
      return currentSort === 'newest' ? tb - ta : ta - tb;
    });

    var typeIcons = {
      pin:   '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
      rect:  '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>',
      arrow: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
      draw:  '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg>',
      text:  '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>'
    };

    var deviceColors = {
      desktop: 'background:rgba(99,102,241,0.15);color:#818cf8;',
      tablet:  'background:rgba(139,92,246,0.15);color:#a78bfa;',
      mobile:  'background:rgba(236,72,153,0.15);color:#f472b6;'
    };

    var html = filteredAnns.map(function(a) {
      var origIdx = annotations.indexOf(a);
      var isHidden = hiddenAnnotations.has(String(a.id));
      var meta = a.meta_data;
      if (typeof meta === 'string') { try { meta = JSON.parse(meta); } catch(e) { meta = {}; } }
      var device = (meta && meta.device) ? meta.device : 'desktop';

      // Element tag chip
      var tagChip = '';
      var tag = (a.element_tag || '').toUpperCase();
      var skipTags = ['DIV','SECTION','ARTICLE','MAIN','ASIDE','FIGURE','HEADER','FOOTER',''];
      if (skipTags.indexOf(tag) === -1) {
        var tagColorMap = { H1:'#f59e0b',H2:'#f59e0b',H3:'#f59e0b',H4:'#f59e0b',H5:'#f59e0b',H6:'#f59e0b',P:'#60a5fa',SPAN:'#60a5fa',A:'#34d399',BUTTON:'#a78bfa',INPUT:'#a78bfa',IMG:'#f472b6' };
        var tc = tagColorMap[tag] || 'rgba(255,255,255,0.4)';
        tagChip = '<span style="font-size:9px;font-weight:800;padding:1px 4px;border-radius:3px;background:' + tc + '22;color:' + tc + ';font-family:monospace;margin-left:4px;">' + tag + '</span>';
      }

      var deviceColorMap = {
        desktop: { bg:'rgba(99,102,241,0.15)', color:'#818cf8' },
        tablet:  { bg:'rgba(139,92,246,0.15)', color:'#a78bfa' },
        mobile:  { bg:'rgba(236,72,153,0.15)', color:'#f472b6' }
      };
      var dc = deviceColorMap[device] || deviceColorMap.desktop;
      var itemColor = a.color || '#6366f1';

      // Comment with truncation
      var comment = a.comment_text || '';
      var commentHtml = comment.length > 120
        ? '<div class="ccfe-ep-comment-excerpt collapsed"><p class="ccfe-ep-comment">' + esc(comment) + '</p></div><button class="ccfe-ep-read-more">Read more</button>'
        : '<p class="ccfe-ep-comment">' + esc(comment) + '</p>';

      // Attachments — fire event so Pro plugin can render audio players, maximize, send-to-media
      var attHtml = '';
      if (meta && meta.attachments && meta.attachments.length) {
        var attEvent = new CustomEvent('ccfe_render_elementor_attachments', {
          detail: { annotation: a, attachments: meta.attachments, html: '' }
        });
        document.dispatchEvent(attEvent);
        attHtml = attEvent.detail.html || '';

        // Fallback: simple thumbnail grid if Pro didn't fill in HTML
        if (!attHtml) {
          attHtml = '<div class="ccfe-ep-attachments">';
          meta.attachments.forEach(function(f) {
            attHtml += '<div class="ccfe-ep-att-thumb"><img src="' + f.url + '" title="' + f.name + '"></div>';
          });
          attHtml += '</div>';
        }
      }

      var deviceColors2 = { desktop:'background:rgba(99,102,241,0.12);color:#818cf8;', tablet:'background:rgba(139,92,246,0.12);color:#a78bfa;', mobile:'background:rgba(236,72,153,0.12);color:#f472b6;' };
      var devicePillHtml = '<span style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:100px;text-transform:uppercase;letter-spacing:0.5px;' + (deviceColors2[device] || deviceColors2.desktop) + '">' + device + '</span>';

      // Dots menu actions
      var dotsMenu =
        '<div class="ccfe-ep-dots-trigger" style="padding:4px;opacity:0.4;cursor:pointer;">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>' +
        '</div>';

      // Element tag chip — same as client side
      var tagChipHtml = (function() {
        // Tool type tag for shapes
        var toolIcons = {
          rect: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:middle"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>',
          arrow: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:middle"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
          draw: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:middle"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg>'
        };
        var toolLabels = { rect: 'Rectangle', arrow: 'Arrow', draw: 'Freehand' };
        if (toolLabels[a.type]) {
          return '<span style="display:inline-flex;align-items:center;gap:4px;margin-left:6px;vertical-align:middle;font-size:11px;font-weight:600;color:rgba(255,255,255,0.5);">' + (toolIcons[a.type] || '') + ' ' + toolLabels[a.type] + '</span>';
        }
        if (a.type !== 'pin' && a.type !== 'text') return '';
        var t = (a.element_tag || '').toUpperCase();
        var skip = ['DIV','SECTION','ARTICLE','MAIN','ASIDE','FIGURE','HEADER','FOOTER',''];
        if (skip.indexOf(t) > -1) return '';
        var txt = a.context_title || a.element_text || '';
        txt = txt.replace(/\s+/g, ' ').trim();
        txt = txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
        var prev = txt.length > 22 ? txt.substring(0, 22) + '\u2026' : txt;
        var tcMap = { H1:'#f59e0b',H2:'#f59e0b',H3:'#f59e0b',H4:'#f59e0b',H5:'#f59e0b',H6:'#f59e0b',P:'#60a5fa',SPAN:'#60a5fa',LABEL:'#60a5fa',A:'#34d399',BUTTON:'#a78bfa',INPUT:'#a78bfa',TEXTAREA:'#a78bfa',SELECT:'#a78bfa',IMG:'#f472b6',VIDEO:'#f472b6',SVG:'#f472b6',LI:'rgba(255,255,255,0.5)' };
        var tc = tcMap[t] || 'rgba(255,255,255,0.4)';
        return '<span style="display:inline-flex;align-items:center;gap:5px;margin-left:6px;vertical-align:middle;">' +
          '<span style="font-size:9px;font-weight:800;padding:1px 5px;border-radius:3px;background:' + tc + '22;color:' + tc + ';font-family:monospace;letter-spacing:0.3px;flex-shrink:0;">' + t + '</span>' +
          (prev ? '<span style="font-size:11px;color:rgba(255,255,255,0.35);font-weight:400;max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + esc(prev) + '</span>' : '') +
        '</span>';
      })();

      return '<div class="ccfe-ep-item ccfe-ep-' + a.status + '" data-id="' + a.id + '" data-idx="' + origIdx + '" style="opacity:' + (isHidden ? '0.35' : '1') + '; transition: all 0.2s; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin-bottom: 16px; cursor: pointer; position: relative;">' +
        '<div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">' +
          '<div style="display:flex; align-items:center; gap:8px;">' +
            '<div style="width:24px; height:24px; border-radius:50%; background:' + itemColor + '; color:#fff; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800; flex-shrink:0;">' + (origIdx + 1) + '</div>' +
            devicePillHtml +
          '</div>' +
          dotsMenu +
        '</div>' +
        '<div style="margin-bottom:16px;">' +
          '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">' +
            '<div style="font-size:14px; font-weight:700; color:#fff;">' + esc(a.client_name || 'Client') + '</div>' +
            tagChipHtml +
          '</div>' +
          '<div style="font-size:11px; opacity:0.3; font-weight:500;">' + timeAgo(a.created_at) + '</div>' +
        '</div>' +
        '<div style="font-size:14px; color:rgba(255,255,255,0.8); line-height:1.6; margin-bottom:20px; word-wrap: break-word;">' + commentHtml + '</div>' +
        attHtml +
        (a.type === 'pin' && a.element_selector ?
          '<button class="ccfe-ep-reveal-btn" data-idx="' + origIdx + '" style="display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:500;color:rgba(255,255,255,0.25);background:transparent;border:none;padding:0;cursor:pointer;transition:color 0.2s;margin-top:8px;margin-bottom:4px;" title="Highlight element in preview">' +
            '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;"><circle cx="11" cy="11" r="8" style="fill:none!important;stroke:currentColor;"/><line x1="21" y1="21" x2="16.65" y2="16.65" style="fill:none!important;stroke:currentColor;"/></svg>' +
            'Reveal in preview' +
          '</button>' : '') +
      '</div>';
    }).join('');

    body.innerHTML = html;

    // Click card → locate + pulse
    body.querySelectorAll('.ccfe-ep-item').forEach(function(item) {
      item.addEventListener('click', function(e) {
        if (e.target.closest('.ccfe-ep-dots-trigger') || e.target.closest('.ccfe-ep-context-menu') || e.target.closest('.ccfe-ep-read-more')) return;
        var idx = parseInt(this.dataset.idx);
        scrollToAnnotationInPreview(annotations[idx]);
      });
    });

    // Dots menu
    body.querySelectorAll('.ccfe-ep-dots-trigger').forEach(function(trigger) {
      trigger.addEventListener('click', function(e) {
        e.stopPropagation();
        document.querySelectorAll('.ccfe-ep-context-menu').forEach(function(m) { m.remove(); });
        var item = this.closest('.ccfe-ep-item');
        var id = item.dataset.id;
        var idx = parseInt(item.dataset.idx);
        var a = annotations[idx];
        var isHid = hiddenAnnotations.has(String(id));

        var menu = document.createElement('div');
        menu.className = 'ccfe-ep-context-menu';
        menu.style.cssText = 'position:absolute;right:12px;top:36px;background:#1a1a1a;border:1px solid rgba(255,255,255,0.1);border-radius:8px;box-shadow:0 10px 30px rgba(0,0,0,0.5);z-index:99999;width:150px;padding:4px;';

        var menuItems = [
          { label: 'Locate', icon: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>', action: 'locate' },
          { label: isHid ? 'Show' : 'Hide', icon: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>', action: 'toggle' },
          { label: a.status !== 'resolved' ? 'Mark Resolved' : 'Reopen', icon: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>', action: 'resolve', color: '#10b981' },
          { label: 'Delete', icon: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>', action: 'delete', color: '#f87171' }
        ];

        menuItems.forEach(function(opt) {
          var row = document.createElement('div');
          row.style.cssText = 'padding:9px 12px;display:flex;align-items:center;gap:9px;font-size:12px;font-weight:600;cursor:pointer;border-radius:5px;color:' + (opt.color || '#fff') + ';';
          row.innerHTML = opt.icon + '<span>' + opt.label + '</span>';
          row.addEventListener('mouseover', function() { row.style.background = 'rgba(255,255,255,0.06)'; });
          row.addEventListener('mouseout', function() { row.style.background = 'transparent'; });
          row.addEventListener('click', function(ev) {
            ev.stopPropagation();
            menu.remove();
            if (opt.action === 'locate') { scrollToAnnotationInPreview(a); }
            if (opt.action === 'toggle') {
              if (hiddenAnnotations.has(String(id))) hiddenAnnotations.delete(String(id)); else hiddenAnnotations.add(String(id));
              saveHiddenState(); renderPanelContent(); syncOverlay();
            }
            if (opt.action === 'resolve') {
              var newStatus = a.status !== 'resolved' ? 'resolved' : 'pending';
              var sep = cfg.restUrl.indexOf('?') > -1 ? '&' : '?';
              api('PUT', '/annotations/' + id + sep + '_t=' + Date.now(), { status: newStatus }).then(loadAnnotations);
            }
            if (opt.action === 'delete') {
              if (confirm('Delete this annotation?')) {
                var sep2 = cfg.restUrl.indexOf('?') > -1 ? '&' : '?';
                api('DELETE', '/annotations/' + id + sep2 + '_t=' + Date.now()).then(loadAnnotations);
              }
            }
          });
          menu.appendChild(row);
        });

        item.style.position = 'relative';
        item.appendChild(menu);
        setTimeout(function() {
          var close = function(ev) { if (!menu.contains(ev.target)) { menu.remove(); document.removeEventListener('click', close); } };
          document.addEventListener('click', close);
        }, 10);
      });
    });

    body.querySelectorAll('.ccfe-ep-read-more').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var wrap = this.previousElementSibling;
        var collapsed = wrap.classList.toggle('collapsed');
        this.textContent = collapsed ? 'Read more' : 'Show less';
      });
    });

    body.querySelectorAll('.ccfe-ep-reveal-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var idx = parseInt(this.dataset.idx);
        scrollToAnnotationInPreview(annotations[idx]);
      });
    });
  }

  function timeAgo(date) {
    if (!date) return '';
    var s = Math.floor((new Date() - new Date(date)) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s/60) + 'm ago';
    if (s < 86400) return Math.floor(s/3600) + 'h ago';
    return Math.floor(s/86400) + 'd ago';
  }

  /* ── Preview overlay ── */
  function getPreviewIframe() { return document.getElementById('elementor-preview-iframe'); }

  function syncOverlay() {
    var iframe = getPreviewIframe();
    if (!iframe || !iframe.contentDocument) return;
    var win = iframe.contentWindow;
    if (!overlayVisible) { if (win.AnnotationRenderer) win.AnnotationRenderer.setAnnotations([]); return; }
    if (!win.ElementDNA || !win.AnnotationRenderer) {
      injectScript(iframe, cfg.pluginUrl + 'assets/js/element-dna.js', function() {
        injectScript(iframe, cfg.pluginUrl + 'assets/js/annotation-renderer.js', function() { win.AnnotationRenderer.init(); doSync(); });
      });
    } else { doSync(); }
    function doSync() {
      var projectFiltered = annotations.filter(function(a) {
        if (currentProjectFilter && String(a.project_id) !== currentProjectFilter) return false;
        if (hiddenAnnotations.has(String(a.id))) return false;
        return true;
      });
      win.AnnotationRenderer.setFilter(currentFilter);
      win.AnnotationRenderer.setDeviceFilter(currentDeviceFilter);
      win.AnnotationRenderer.setAnnotations(projectFiltered);
    }
  }

  function injectScript(iframe, src, cb) {
    var doc = iframe.contentDocument;
    var s = doc.createElement('script');
    s.src = src; s.onload = cb;
    doc.head.appendChild(s);
  }

  function scrollToAnnotationInPreview(a) {
    var iframe = getPreviewIframe();
    if (!iframe || !iframe.contentWindow) return;
    var win = iframe.contentWindow;

    // Ensure overlay scripts are injected
    if (!win.ElementDNA || !win.AnnotationRenderer) {
      injectScript(iframe, cfg.pluginUrl + 'assets/js/element-dna.js', function() {
        injectScript(iframe, cfg.pluginUrl + 'assets/js/annotation-renderer.js', function() {
          win.AnnotationRenderer.init();
          doLocate();
        });
      });
    } else {
      doLocate();
    }

    function doLocate() {
      var DNA = win.ElementDNA;
      var Renderer = win.AnnotationRenderer;

      // Make sure the overlay is showing so the pulse is visible
      if (!overlayVisible) {
        overlayVisible = true;
        var overlayBtn = document.getElementById('ccfe-toggle-overlay');
        if (overlayBtn) overlayBtn.classList.add('active');
        // Use syncOverlay so device/status filters are respected
        var iframe = getPreviewIframe();
        var win2 = iframe && iframe.contentWindow;
        if (win2 && win2.AnnotationRenderer) {
          var projectFiltered = annotations.filter(function(ann) {
            if (currentProjectFilter && String(ann.project_id) !== currentProjectFilter) return false;
            if (hiddenAnnotations.has(String(ann.id))) return false;
            return true;
          });
          win2.AnnotationRenderer.setFilter(currentFilter);
          win2.AnnotationRenderer.setDeviceFilter(currentDeviceFilter);
          win2.AnnotationRenderer.setAnnotations(projectFiltered);
        }
      }

      // Scroll to the element
      var el = DNA.find({
        elementorId: a.elementor_data_id,
        selector: a.element_selector,
        tag: a.element_tag,
        text: a.element_text,
        fingerprint: a.element_fingerprint
      });
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Trigger the heartbeat pulse on the badge — same as client side
      setTimeout(function() {
        Renderer.setSelected(a.id);
      }, el ? 300 : 0);

      // Dashed border flash on the element — same as client side
      if (el) {
        var semanticTags = ['H1','H2','H3','H4','H5','H6','P','A','BUTTON','INPUT','TEXTAREA','IMG','SPAN','LABEL'];
        var revealEl = el;
        if (a.element_tag && semanticTags.indexOf(a.element_tag.toUpperCase()) > -1) {
          var inner = el.querySelector(a.element_tag.toLowerCase());
          if (inner) revealEl = inner;
        }

        var prev = { outline: revealEl.style.outline, outlineOffset: revealEl.style.outlineOffset, transition: revealEl.style.transition };
        revealEl.style.transition = 'outline 0.15s';
        revealEl.style.outline = '2px dashed #818cf8';
        revealEl.style.outlineOffset = '4px';

        var count = 0;
        var pulse = setInterval(function() {
          count++;
          revealEl.style.outline = count % 2 === 0 ? '2px dashed #818cf8' : '2px dashed transparent';
          if (count >= 6) {
            clearInterval(pulse);
            revealEl.style.outline = prev.outline;
            revealEl.style.outlineOffset = prev.outlineOffset;
            revealEl.style.transition = prev.transition;
          }
        }, 300);
      }
    }
  }

  function esc(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }

  var _epCloseMenuHandler = null;
  function showSessionFilterMenu(btn) {
    var existing = document.querySelector('.ccfe-session-menu');
    if (existing) { existing.remove(); if (_epCloseMenuHandler) { document.removeEventListener('click', _epCloseMenuHandler); _epCloseMenuHandler = null; } return; }
    var menu = document.createElement('div');
    menu.className = 'ccfe-session-menu';
    var rect = btn.getBoundingClientRect();
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    var posLeft = Math.max(10, rect.left + scrollLeft - 180);
    menu.style.cssText = 'position:absolute;left:' + posLeft + 'px;top:' + (rect.bottom + scrollTop + 4) + 'px;background:#383838 !important;border:1px solid #555 !important;border-radius:8px;z-index:2147483647 !important;min-width:160px;padding:4px;opacity:1 !important;display:block !important;';
    function addItem(label, value) {
      var isActive = String(currentProjectFilter) === String(value);
      var item = document.createElement('div');
      item.dataset.value = value;
      item.style.cssText = 'padding:9px 14px;display:flex;align-items:center;gap:9px;font-size:12px;font-weight:600;cursor:pointer;border-radius:5px;' + (isActive ? 'color:#fff !important;background:rgba(255,255,255,0.08);' : 'color:rgba(255,255,255,0.7) !important;');
      item.innerHTML = (isActive ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="flex-shrink:0;"><polyline points="20 6 9 17 4 12"/></svg>' : '') + label;
      item.addEventListener('mouseenter', function() { if (!isActive) this.style.background = 'rgba(255,255,255,0.06)'; });
      item.addEventListener('mouseleave', function() { if (!isActive) this.style.background = 'transparent'; });
      item.addEventListener('click', function(e) {
        e.stopPropagation(); menu.remove(); if (_epCloseMenuHandler) { document.removeEventListener('click', _epCloseMenuHandler); _epCloseMenuHandler = null; }
        currentProjectFilter = value;
        btn.title = value ? label : 'Filter by session';
        try { localStorage.setItem('ccfe_ep_project_filter', currentProjectFilter); } catch(e) {}
        renderPanelContent();
        if (overlayVisible) syncOverlay();
      });
      menu.appendChild(item);
    }
    addItem('All sessions', '');
    projects.forEach(function(p) { addItem(p.title || 'Session #' + p.id, p.id); });
    document.body.appendChild(menu);
    if (_epCloseMenuHandler) { document.removeEventListener('click', _epCloseMenuHandler); _epCloseMenuHandler = null; }
    _epCloseMenuHandler = function(e) {
      if (!menu.contains(e.target) && e.target !== btn) { menu.remove(); document.removeEventListener('click', _epCloseMenuHandler); _epCloseMenuHandler = null; }
    };
    setTimeout(function() { document.addEventListener('click', _epCloseMenuHandler); }, 10);
  }

  addTopBarButton();
  loadAnnotations();
})();
