/**
 * Previu Admin Dashboard — SPA for managing projects & annotations.
 */
(function () {
  'use strict';
  if (!window.ccfeAdmin) return;
  var cfg = window.ccfeAdmin;
  var root = document.getElementById('ccfe-admin-root');
  if (!root) return;
  var currentPageFilter = '';
  var _project = null;
  var _annCache = [];
  var _dashSearch = '';
  var _dashStatus = '';
  var _dashSort = 'newest';
  var _annSort = 'newest';
  var _annStatusFilter = '';
  var _editUrls = {};

  function api(method, path, body) {
    var opts = {
      method: method,
      cache: 'no-store',
      headers: { 
        'Content-Type': 'application/json', 
        'X-WP-Nonce': cfg.nonce
      }
    };
    if (body) opts.body = JSON.stringify(body);
    
    var baseRestUrl = cfg.restUrl;
    try {
      var urlObj = new URL(baseRestUrl);
      urlObj.host = window.location.host;
      urlObj.protocol = window.location.protocol;
      baseRestUrl = urlObj.toString();
    } catch(e) {}

    var url = baseRestUrl.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
    var sep = url.indexOf('?') > -1 ? '&' : '?';
    url += sep + '_t=' + Date.now();
    return fetch(url, opts)
      .then(function (r) {
        return r.text().then(function(text) {
          var data;
          try { data = JSON.parse(text); } catch(e) { console.error('API raw response:', text.substring(0, 500)); throw new Error('Invalid JSON response from server.'); }
          if (!r.ok) throw new Error(data.message || 'API Error: ' + r.status);
          return data;
        });
      });
  }

  /* ── Router ──────────────────────────────────────────────── */
  function route() {
    var page = cfg.page;
    var projectId = parseInt(cfg.projectId, 10);
    if (page === 'ccfe_clientmark-new') return renderNewProject();
    if (page === 'ccfe_clientmark-clients') return renderClients();
    if (page === 'ccfe_clientmark-settings') return renderSettings();
    if (projectId && projectId > 0) { currentPageFilter = ''; return loadProject(projectId); }
    renderDashboard();
  }

  /* ── Dashboard ───────────────────────────────────────────── */
  function renderDashboard() {
    root.innerHTML = '<div class="ccfe-loading">Loading...</div>';
    Promise.all([api('GET', '/projects'), api('GET', '/stats')]).then(function (res) {
      var projects = res[0] || [];
      var stats = res[1] || {};
      // Filter
      if (_dashStatus) projects = projects.filter(function (p) { return p.status === _dashStatus; });
      if (_dashSearch) {
        var q = _dashSearch.toLowerCase();
        projects = projects.filter(function (p) { return (p.title || '').toLowerCase().indexOf(q) > -1; });
      }
      // Sort
      projects.sort(function (a, b) {
        if (_dashSort === 'alpha') return (a.title || '').localeCompare(b.title || '');
        var da = a.created_at ? new Date(a.created_at).getTime() : 0;
        var db = b.created_at ? new Date(b.created_at).getTime() : 0;
        return _dashSort === 'oldest' ? da - db : db - da;
      });
      root.innerHTML = dashboardHTML(projects, stats);
      bindDashboardEvents(projects);
    }).catch(function(err) {
      root.innerHTML = '<div class="ccfe-dash"><div class="ccfe-empty" style="color:var(--pv-danger);border-color:rgba(220,38,38,.2);background:#fef2f2;">' +
        '<strong>Error:</strong> ' + err.message + '</div></div>';
    });
  }

  function dashboardHTML(projects, stats) {
    return '<div class="ccfe-dash">' +
      '<div class="ccfe-dash-header">' +
        '<div><h1 class="ccfe-title">Previu</h1><p class="ccfe-subtitle">Review sessions for Elementor</p></div>' +
        '<a href="' + cfg.adminUrl + 'admin.php?page=ccfe_clientmark-new" class="ccfe-btn-new">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> New Session' +
        '</a>' +
      '</div>' +
        '<div class="ccfe-stats-row">' +
        statCard('Total', stats.total || 0, '#6366f1') +
        statCard('Pending', stats.pending || 0, '#ef4444') +
        statCard('Resolved', stats.resolved || 0, '#10b981') +
        '</div>' +
      '<div class="ccfe-dash-toolbar">' +
        '<input type="text" class="ccfe-dash-search" placeholder="Search sessions\u2026" value="' + esc(_dashSearch) + '">' +
        '<select class="ccfe-dash-status-filter">' +
          '<option value="">All status</option>' +
          '<option value="active"' + (_dashStatus === 'active' ? ' selected' : '') + '>Active</option>' +
          '<option value="completed"' + (_dashStatus === 'completed' ? ' selected' : '') + '>Completed</option>' +
          '<option value="archived"' + (_dashStatus === 'archived' ? ' selected' : '') + '>Archived</option>' +
        '</select>' +
        '<select class="ccfe-dash-sort">' +
          '<option value="newest"' + (_dashSort === 'newest' ? ' selected' : '') + '>Newest</option>' +
          '<option value="oldest"' + (_dashSort === 'oldest' ? ' selected' : '') + '>Oldest</option>' +
          '<option value="alpha"' + (_dashSort === 'alpha' ? ' selected' : '') + '>A\u2013Z</option>' +
        '</select>' +
      '</div>' +
      '<div class="ccfe-projects-header"><h2>Sessions \u00b7 ' + projects.length + '</h2></div>' +
      (projects.length ? '<div class="ccfe-projects-list">' + projects.map(projectCard).join('') + '</div>' :
        '<div class="ccfe-empty">' +
          '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:16px;color:var(--pv-gray-300);"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
          '<h3 style="color:var(--pv-gray-700);margin:0 0 6px;font-size:16px;font-weight:600;">No sessions yet</h3>' +
          '<p style="color:var(--pv-gray-500);margin:0 0 20px;font-size:13px;">Create a session and share the link. No account needed \u2014 they click and start reviewing.</p>' +
          '<a href="' + cfg.adminUrl + 'admin.php?page=ccfe_clientmark-new" class="ccfe-btn-primary">Create your first session</a>' +
        '</div>') +
      '<div class="ccfe-pro-card">' +
        '<div style="display:flex; width:100%; justify-content:space-between; align-items:center; gap:24px;">' +
          '<div>' +
            '<h3>Previu Pro</h3>' +
            '<p style="margin-bottom:0;">White-label, Slack notifications, image attachments and more for your agency.</p>' +
          '</div>' +
          '<a href="https://plugin.usepreviu.com" target="_blank" class="ccfe-btn-pro">Upgrade</a>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function statCard(label, count, color) {
    return '<div class="ccfe-stat-card">' +
      '<div class="ccfe-stat-num" style="color:' + color + '">' + count + '</div>' +
      '<div class="ccfe-stat-label">' + label + '</div>' +
    '</div>';
  }

  function projectCard(p) {
    var s = p.stats || {};
    return '<div class="ccfe-project-card" data-id="' + p.id + '">' +
      '<div class="ccfe-pc-main">' +
        '<div class="ccfe-pc-info">' +
          '<h3>' + esc(p.title) + '</h3>' +
          '<div style="display:flex;align-items:center;gap:8px;">' +
            '<span class="ccfe-pc-status ccfe-status-' + p.status + '">' + p.status + '</span>' +
            '<span class="ccfe-pc-date">' + formatDate(p.created_at) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="ccfe-pc-stats">' +
          '<span title="Pending" style="color:var(--pv-warning)">' + (s.pending || 0) + ' pending</span>' +
          '<span title="Resolved" style="color:var(--pv-success)">' + (s.resolved || 0) + ' resolved</span>' +
        '</div>' +
      '</div>' +
      '<div class="ccfe-pc-actions">' +
        '<button class="ccfe-pc-copy" data-url="' + esc(p.share_url || '') + '" title="Copy share link"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy Link</button>' +
        '<a href="' + cfg.adminUrl + 'admin.php?page=ccfe_clientmark&project_id=' + p.id + '" class="ccfe-pc-view">View <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></a>' +
        '<button class="ccfe-pc-delete" data-id="' + p.id + '" title="Delete"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>' +
      '</div>' +
    '</div>';
  }

  function bindDashboardEvents(projects) {
    root.querySelectorAll('.ccfe-pc-copy').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        copyToClipboard(btn.dataset.url, btn);
      });
    });

    root.querySelectorAll('.ccfe-pc-delete').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (confirm('Delete this session and all its feedback?')) {
          api('DELETE', '/projects/' + btn.dataset.id).then(renderDashboard);
        }
      });
    });
  }

  function copyToClipboard(url, btn) {
    var originalHtml = btn.innerHTML;
    var done = function() {
      btn.textContent = 'Copied';
      setTimeout(function () { btn.innerHTML = originalHtml; }, 2000);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(done);
    } else {
      var ta = document.createElement('textarea');
      ta.value = url;
      ta.style.position = 'fixed';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try { document.execCommand('copy'); done(); } catch (err) {}
      document.body.removeChild(ta);
    }
  }

  /* ── New Project ─────────────────────────────────────────── */
  function renderNewProject() {
    root.innerHTML = '<div class="ccfe-dash">' +
      '<a href="' + cfg.adminUrl + 'admin.php?page=ccfe_clientmark" class="ccfe-breadcrumb" style="margin-bottom:28px;">← Back to sessions</a>' +
      '<div class="ccfe-dash-header ccfe-text-center" style="display:block;margin-bottom:28px;">' +
        '<h1 class="ccfe-title">New session</h1>' +
      '</div>' +
      '<div class="ccfe-form-card">' +
        '<div class="ccfe-form-group">' +
          '<label for="ccfe-f-title">Session name</label>' +
          '<input type="text" id="ccfe-f-title" placeholder="e.g. Homepage redesign v2" autofocus />' +
        '</div>' +
        '<button class="ccfe-btn-create" id="ccfe-create-btn">Create session</button>' +
        '<div id="ccfe-created-msg" class="ccfe-created-msg ccfe-hidden"></div>' +
      '</div>' +
    '</div>';

    document.getElementById('ccfe-create-btn').addEventListener('click', function () {
      var title = document.getElementById('ccfe-f-title').value.trim();
      if (!title) {
        document.getElementById('ccfe-f-title').focus();
        return;
      }
      
      var btn = this;
      btn.disabled = true;
      btn.textContent = 'Creating...';
      
      api('POST', '/projects', { title: title }).then(function (p) {
        if (p && p.share_url) {
          var msg = document.getElementById('ccfe-created-msg');
          msg.classList.remove('ccfe-hidden');
          msg.innerHTML = '<div>' +
            '<strong>Session created</strong>' +
            '<span style="font-size:13px;color:var(--pv-gray-500);">Share this link — no login required:</span>' +
            '<div class="ccfe-share-link-box">' +
              '<input type="text" readonly value="' + esc(p.share_url) + '" id="ccfe-share-url" />' +
              '<button id="ccfe-copy-share" class="ccfe-btn-primary" style="flex-shrink:0;">Copy</button>' +
            '</div></div>';
          
          document.getElementById('ccfe-copy-share').addEventListener('click', function () {
            var url = p.share_url;
            copyToClipboard(url, this);
            this.textContent = 'Copied';
          });
          btn.textContent = 'Done';
        }
      }).catch(function(err) {
        btn.disabled = false;
        btn.textContent = 'Create session';
        alert('Failed: ' + err.message);
      });
    });
  }

  /* ── Single Project View ────────────────────────────────── */
  function loadProject(id) {
    root.innerHTML = '<div class="ccfe-loading">Loading...</div>';
    _editUrls = {};
    Promise.all([
      api('GET', '/projects/' + id),
      api('GET', '/projects/' + id + '/annotations')
    ]).then(function (res) {
      _project = res[0];
      _annCache = res[1] || [];
      if (!_project || _project.code) { root.innerHTML = '<div class="ccfe-dash"><div class="ccfe-empty">Session not found.</div></div>'; return; }
      // Resolve Elementor edit URLs for unique page paths
      var paths = {};
      _annCache.forEach(function (a) { if (a.page_path) paths[a.page_path] = true; });
      var uniquePaths = Object.keys(paths);
      if (uniquePaths.length) {
        api('GET', '/resolve-paths?paths[]=' + uniquePaths.map(encodeURIComponent).join('&paths[]='))
          .then(function (urls) { _editUrls = urls || {}; renderProjectView(); })
          .catch(function () { renderProjectView(); });
      }
      renderProjectView();
    }).catch(function(err) {
      root.innerHTML = '<div class="ccfe-dash"><div class="ccfe-empty" style="color:var(--pv-danger);border-color:rgba(220,38,38,.2);background:#fef2f2;">' +
        '<strong>Error:</strong> ' + err.message + '</div></div>';
    });
  }

  function renderProjectView() {
    root.innerHTML = projectDetailHTML(_project, _annCache);
    bindProjectEvents();
  }

  function syncAnnotations(id) {
    api('GET', '/projects/' + id + '/annotations').then(function (anns) {
      _annCache = anns || [];
      _editUrls = {};
      var paths = {};
      _annCache.forEach(function (a) { if (a.page_path) paths[a.page_path] = true; });
      var uniquePaths = Object.keys(paths);
      if (uniquePaths.length) {
        api('GET', '/resolve-paths?paths[]=' + uniquePaths.map(encodeURIComponent).join('&paths[]='))
          .then(function (urls) { _editUrls = urls || {}; renderProjectView(); })
          .catch(function () { renderProjectView(); });
      }
      renderProjectView();
    }).catch(function (err) {
      console.error('Sync failed:', err);
    });
  }

  function projectDetailHTML(p, anns) {
    var s = p.stats || {};

    // Build unique page list from annotations
    var pageMap = {};
    anns.forEach(function (a) {
      var path = a.page_path || '/';
      if (!pageMap[path]) pageMap[path] = 0;
      pageMap[path]++;
    });
    var pageEntries = Object.keys(pageMap).map(function (path) {
      return { path: path, count: pageMap[path], label: path === '/' ? 'Homepage' : path };
    });
    pageEntries.sort(function (a, b) { return a.path.localeCompare(b.path); });

    var totalPages = pageEntries.length;
    var showAllCount = anns.length;

    // Page filter tabs
    var tabsHtml = '';
    if (totalPages > 1) {
      tabsHtml = '<div class="ccfe-page-tabs-wrap">' +
        '<button class="ccfe-page-tab' + (!currentPageFilter ? ' active' : '') + '" data-page="">All <span class="ccfe-page-tab-count">' + showAllCount + '</span></button>';
      pageEntries.forEach(function (entry) {
        var active = currentPageFilter === entry.path;
        tabsHtml += '<button class="ccfe-page-tab' + (active ? ' active' : '') + '" data-page="' + esc(entry.path) + '">' + esc(entry.label) + ' <span class="ccfe-page-tab-count">' + entry.count + '</span></button>';
      });
      tabsHtml += '</div>';
    }

    // Filter annotations by selected page
    var filteredAnns = currentPageFilter ? anns.filter(function (a) { return (a.page_path || '/') === currentPageFilter; }) : anns;

    // Status filter
    if (_annStatusFilter) {
      filteredAnns = filteredAnns.filter(function (a) { return a.status === _annStatusFilter; });
    }

    // Sort
    filteredAnns.sort(function (a, b) {
      var da = a.created_at ? new Date(a.created_at).getTime() : 0;
      var db = b.created_at ? new Date(b.created_at).getTime() : 0;
      return _annSort === 'oldest' ? da - db : db - da;
    });

    return '<div class="ccfe-dash">' +
      '<div class="ccfe-dash-header">' +
        '<div>' +
          '<a href="' + cfg.adminUrl + 'admin.php?page=ccfe_clientmark" class="ccfe-breadcrumb">← Sessions</a>' +
          '<h1 class="ccfe-title">' + esc(p.title) + '</h1>' +
        '</div>' +
        '<div class="ccfe-header-actions">' +
          '<button class="ccfe-btn-sync" data-id="' + p.id + '" title="Refresh annotations"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> Sync</button>' +
      '<button class="ccfe-btn-copy-link" data-url="' + esc(p.share_url || '') + '"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy Link</button>' +
          '<select class="ccfe-status-select" data-id="' + p.id + '">' +
            '<option value="active"' + (p.status === 'active' ? ' selected' : '') + '>Active</option>' +
            '<option value="completed"' + (p.status === 'completed' ? ' selected' : '') + '>Completed</option>' +
            '<option value="archived"' + (p.status === 'archived' ? ' selected' : '') + '>Archived</option>' +
          '</select>' +
        '</div>' +
      '</div>' +
      '<div class="ccfe-stats-row">' +
        statCard('Total', s.total || 0, '#1d4ed8') +
        statCard('Pending', s.pending || 0, '#c2410c') +
        statCard('Resolved', s.resolved || 0, '#15803d') +
      '</div>' +
      tabsHtml +
      '<div class="ccfe-dash-toolbar">' +
        '<select class="ccfe-ann-status-filter">' +
          '<option value="">All status</option>' +
          '<option value="pending"' + (_annStatusFilter === 'pending' ? ' selected' : '') + '>Pending</option>' +
          '<option value="resolved"' + (_annStatusFilter === 'resolved' ? ' selected' : '') + '>Resolved</option>' +
        '</select>' +
        '<select class="ccfe-ann-sort">' +
          '<option value="newest"' + (_annSort === 'newest' ? ' selected' : '') + '>Newest</option>' +
          '<option value="oldest"' + (_annSort === 'oldest' ? ' selected' : '') + '>Oldest</option>' +
        '</select>' +
      '</div>' +
      '<div class="ccfe-projects-header"><h2>Feedback <span style="font-weight:400;color:var(--pv-gray-400);">' + filteredAnns.length + '</span></h2></div>' +
      (filteredAnns.length ? '<div class="ccfe-annotations-list">' + filteredAnns.map(function (a, i) { return annotationCard(a, i); }).join('') + '</div>' :
        '<div class="ccfe-empty"><p style="margin:0;">No feedback for this page.</p></div>') +
    '</div>';
  }

  function annotationCard(a, i) {
    var typeIcons = { 
      pin: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>', 
      rect: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>', 
      arrow: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="12" x2="20" y2="12"/><polyline points="14 6 20 12 14 18"/></svg>', 
      draw: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg>', 
      text: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' 
    };
    var iconHtml = typeIcons[a.type] || typeIcons.pin;

    var attachmentsHtml = renderAdminAttachments(a.meta_data);

    return '<div class="ccfe-ann-card ccfe-ann-' + a.status + '" data-id="' + a.id + '">' +
      '<div class="ccfe-ann-header">' +
        '<span class="ccfe-ann-num">#' + (i + 1) + '</span>' +
        '<span class="ccfe-ann-type">' + iconHtml + ' ' + a.type + '</span>' +
        '<span class="ccfe-ann-by">' + esc(a.client_name || 'Client') + '</span>' +
        '<span class="ccfe-ann-date">' + formatDate(a.created_at) + '</span>' +
        '<span class="ccfe-ann-status ccfe-status-' + a.status + '">' + a.status.replace('_', ' ') + '</span>' +
      '</div>' +
      '<p class="ccfe-ann-comment">' + esc(a.comment_text || 'No comment') + '</p>' +
      attachmentsHtml +
      '<div class="ccfe-ann-meta">' +
        '<span>Page: ' + (a.page_path === '/' ? 'Homepage' : esc(a.page_path || '/')) + '</span>' +
        (_editUrls[a.page_path] ? ' <a href="' + _editUrls[a.page_path] + '" target="_blank" class="ccfe-edit-elementor" onclick="event.stopPropagation();">Edit with Elementor ↗</a>' : '') +
      '</div>' +
      '<div class="ccfe-ann-actions">' +
        (a.status !== 'resolved' ?
          '<button class="ccfe-btn-resolve" data-id="' + a.id + '"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Resolve</button>' :
          '<button class="ccfe-btn-reopen" data-id="' + a.id + '"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg> Reopen</button>') +
        '<button class="ccfe-btn-del-ann" data-id="' + a.id + '">Delete</button>' +
      '</div>' +
    '</div>';
  }

  function bindProjectEvents() {
    var copyBtn = root.querySelector('.ccfe-btn-copy-link');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        copyToClipboard(this.dataset.url, this);
      });
    }

    var statusSelect = root.querySelector('.ccfe-status-select');
    if (statusSelect) {
      statusSelect.addEventListener('change', function () {
        api('PUT', '/projects/' + this.dataset.id, { status: this.value });
      });
    }
  }

  // One-time delegated handlers — added once, never duplicated
  (function setupDelegated() {
    // Page filter tabs — re-render from cache, no server call
    root.addEventListener('click', function (e) {
      var tab = e.target.closest('.ccfe-page-tab');
      if (tab) {
        currentPageFilter = tab.dataset.page || '';
        renderProjectView();
        return;
      }
    });

    // Sync button, Resolve / Reopen / Delete
    root.addEventListener('click', function (e) {
      var syncBtn = e.target.closest('.ccfe-btn-sync');
      if (syncBtn) { syncAnnotations(syncBtn.dataset.id); return; }
      var btn = e.target.closest('.ccfe-btn-resolve, .ccfe-btn-reopen, .ccfe-btn-del-ann');
      if (!btn) return;
      var id = btn.dataset.id;
      if (btn.classList.contains('ccfe-btn-resolve')) {
        api('PUT', '/annotations/' + id, { status: 'resolved' }).then(function () {
          for (var i = 0; i < _annCache.length; i++) {
            if (_annCache[i].id === id) { _annCache[i].status = 'resolved'; break; }
          }
          renderProjectView();
        }).catch(function (err) { console.error('Resolve failed:', err); });
      } else if (btn.classList.contains('ccfe-btn-reopen')) {
        api('PUT', '/annotations/' + id, { status: 'pending' }).then(function () {
          for (var i = 0; i < _annCache.length; i++) {
            if (_annCache[i].id === id) { _annCache[i].status = 'pending'; break; }
          }
          renderProjectView();
        }).catch(function (err) { console.error('Reopen failed:', err); });
      } else if (btn.classList.contains('ccfe-btn-del-ann')) {
        if (confirm('Delete this annotation?')) {
          api('DELETE', '/annotations/' + id).then(function () {
            _annCache = _annCache.filter(function (a) { return a.id !== id; });
            renderProjectView();
          }).catch(function (err) { console.error('Delete failed:', err); });
        }
      }
    });

    // Dashboard toolbar — search, status filter, sort
    root.addEventListener('input', function (e) {
      var inp = e.target.closest('.ccfe-dash-search');
      if (!inp) return;
      _dashSearch = inp.value;
      renderDashboard();
    });

    root.addEventListener('change', function (e) {
      var sel = e.target.closest('.ccfe-dash-status-filter');
      if (sel) { _dashStatus = sel.value; renderDashboard(); return; }
      sel = e.target.closest('.ccfe-dash-sort');
      if (sel) { _dashSort = sel.value; renderDashboard(); return; }
      sel = e.target.closest('.ccfe-ann-status-filter');
      if (sel) { _annStatusFilter = sel.value; renderProjectView(); return; }
      sel = e.target.closest('.ccfe-ann-sort');
      if (sel) { _annSort = sel.value; renderProjectView(); }
    });
  })();

  /* ── Clients View — removed, redirect to dashboard ──────── */
  function renderClients() {
    window.location.href = cfg.adminUrl + 'admin.php?page=ccfe_clientmark';
  }

  /* ── Attachments (media from meta_data) ──────────────────── */
  function renderAdminAttachments(meta) {
    if (!meta || !meta.attachments || !meta.attachments.length) return '';

    var html = '<div class="ccfe-admin-attachments">';

    meta.attachments.forEach(function (att, i) {
      if (att.type === 'image') {
        html +=
          '<div class="ccfe-admin-att-img-wrap">' +
            '<img src="' + esc(att.url) + '" data-full="' + esc(att.url) + '" ' +
              'class="ccfe-admin-att-img" loading="lazy" ' +
              'title="Click to preview">' +
            '<button class="ccfe-admin-att-max" data-url="' + esc(att.url) + '" ' +
              'title="Maximize">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>' +
            '</button>' +
          '</div>';
      } else if (att.type === 'audio') {
        html +=
          '<div class="ccfe-admin-att-audio">' +
            '<div class="ccfe-admin-att-audio-header">' +
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>' +
              '<span>Voice Note ' + (i + 1) + '</span>' +
            '</div>' +
            '<audio controls style="width:100%;height:36px;" src="' + esc(att.url) + '" preload="metadata"></audio>' +
          '</div>';
      } else if (att.type === 'video') {
        html +=
          '<div class="ccfe-admin-att-video">' +
            '<video controls style="width:100%;max-height:240px;" src="' + esc(att.url) + '" preload="metadata"></video>' +
          '</div>';
      } else {
        html +=
          '<div class="ccfe-admin-att-doc">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>' +
            '<a href="' + esc(att.url) + '" target="_blank" rel="noopener">' + esc(att.name || 'Download') + '</a>' +
          '</div>';
      }
    });

    html += '</div>';
    return html;
  }

  function openAdminLightbox(url) {
    var existing = document.querySelector('.ccfe-admin-lightbox');
    if (existing) existing.remove();

    var lb = document.createElement('div');
    lb.className = 'ccfe-admin-lightbox';
    lb.innerHTML =
      '<img src="' + esc(url) + '" alt="">' +
      '<button class="ccfe-admin-lb-close">&times;</button>' +
      '<a class="ccfe-admin-lb-dl" href="' + esc(url) + '" download>' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download' +
      '</a>';

    document.body.appendChild(lb);
    lb.querySelector('.ccfe-admin-lb-close').onclick = function () { lb.remove(); };
    lb.addEventListener('click', function (ev) { if (ev.target === lb) lb.remove(); });
    document.addEventListener('keydown', function escClose(ev) {
      if (ev.key === 'Escape') { lb.remove(); document.removeEventListener('keydown', escClose); }
    });
  }

  document.addEventListener('click', function (ev) {
    var img = ev.target.closest('.ccfe-admin-att-img');
    if (img) { openAdminLightbox(img.dataset.full || img.src); return; }
    var maxBtn = ev.target.closest('.ccfe-admin-att-max');
    if (maxBtn) { ev.stopPropagation(); openAdminLightbox(maxBtn.dataset.url); }
  });

  /* ── Settings ────────────────────────────────────────────── */
  function renderSettings() {
    var adminEmail = cfg.adminEmail || '';
    var isPro = !!(cfg.proSettings && cfg.proSettings.agency_name !== undefined);
    var ps = cfg.proSettings || {};
    var proSectionsHtml;
    if (isPro) {
      proSectionsHtml =
        '<div class="ccfe-form-card" style="margin-bottom:20px;">' +
          '<h2>White-label <span class="ccfe-pro-badge-2">Active</span></h2>' +
          '<p class="ccfe-form-desc">Replace Previu branding with your own agency identity.</p>' +
          '<div class="ccfe-form-group">' +
            '<label for="ccfe-s-agency-name">Agency name</label>' +
            '<input type="text" id="ccfe-s-agency-name" placeholder="Your Agency" value="' + esc(ps.agency_name || '') + '">' +
          '</div>' +
          '<div class="ccfe-form-group">' +
            '<label>Portal logo</label>' +
            '<div class="ccfe-icon-upload" id="ccfe-portal-logo-dropzone">' +
              '<div class="ccfe-icon-upload-header">' +
                '<div class="ccfe-icon-upload-preview">' +
                  (ps.portal_logo ? '<img id="ccfe-portal-logo-preview" src="' + esc(ps.portal_logo) + '">' : '<svg id="ccfe-portal-logo-preview" style="display:none;" viewBox="0 0 24 24" fill="none" stroke="#9d9da3" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>') +
                '</div>' +
                '<div class="ccfe-icon-upload-info">' +
                  '<div class="ccfe-icon-upload-title">' + (ps.portal_logo ? 'Logo uploaded' : 'No logo set') + '</div>' +
                  '<div class="ccfe-icon-upload-sub">Shown to clients during review sessions</div>' +
                '</div>' +
              '</div>' +
              '<div class="ccfe-icon-upload-actions">' +
                '<button class="ccfe-icon-upload-btn" id="ccfe-portal-logo-upload">' +
                  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>' +
                  'Upload image' +
                '</button>' +
                '<button class="ccfe-icon-upload-btn ccfe-icon-upload-btn-remove" id="ccfe-portal-logo-remove"' + (ps.portal_logo ? '' : ' style="display:none;"') + '>Remove</button>' +
              '</div>' +
              '<div class="ccfe-icon-upload-notice">' +
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' +
                'Upload a square image for best results' +
              '</div>' +
              '<input type="hidden" id="ccfe-s-logo" value="' + esc(ps.portal_logo || '') + '">' +
            '</div>' +
          '</div>' +
          '<div class="ccfe-form-group">' +
            '<label for="ccfe-s-logo-radius">Logo border radius (px)</label>' +
            '<input type="number" id="ccfe-s-logo-radius" min="0" max="50" placeholder="0" value="' + (ps.logo_border_radius || 0) + '" style="width:80px;">' +
          '</div>' +
          '<div class="ccfe-form-group">' +
            '<label>Brand visibility</label>' +
            '<div class="ccfe-flex-row">' +
              '<label class="ccfe-switch"><input type="checkbox" id="ccfe-s-branding"' + (ps.remove_branding ? ' checked' : '') + '><span class="ccfe-slider"></span></label>' +
              '<span>Hide brand area (logo + name)</span>' +
            '</div>' +
            '<div class="ccfe-flex-row" style="margin-top:8px;">' +
              '<label class="ccfe-switch"><input type="checkbox" id="ccfe-s-hide-logo"' + (ps.remove_logo ? ' checked' : '') + '><span class="ccfe-slider"></span></label>' +
              '<span>Hide logo image only</span>' +
            '</div>' +
          '</div>' +
          '<div class="ccfe-form-group">' +
            '<label>Admin sidebar icon</label>' +
            '<div class="ccfe-icon-upload" id="ccfe-menu-icon-dropzone">' +
              '<div class="ccfe-icon-upload-header">' +
                '<div class="ccfe-icon-upload-preview">' +
                  (ps.menu_icon ? '<img id="ccfe-menu-icon-preview" src="' + esc(ps.menu_icon) + '">' : '<svg id="ccfe-menu-icon-preview" style="display:none;" viewBox="0 0 24 24" fill="none" stroke="#9d9da3" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>') +
                '</div>' +
                '<div class="ccfe-icon-upload-info">' +
                  '<div class="ccfe-icon-upload-title">' + (ps.menu_icon ? 'Icon uploaded' : 'No icon set') + '</div>' +
                  '<div class="ccfe-icon-upload-sub">Shows in WordPress admin sidebar</div>' +
                '</div>' +
              '</div>' +
              '<div class="ccfe-icon-upload-actions">' +
                '<button class="ccfe-icon-upload-btn" id="ccfe-menu-icon-upload">' +
                  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>' +
                  'Upload image' +
                '</button>' +
                '<button class="ccfe-icon-upload-btn ccfe-icon-upload-btn-remove" id="ccfe-menu-icon-remove"' + (ps.menu_icon ? '' : ' style="display:none;"') + '>Remove</button>' +
              '</div>' +
              '<div class="ccfe-icon-upload-notice">' +
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' +
                'Upload a 20\u00d720px image for best results \u2014 larger images will be rejected' +
              '</div>' +
              '<input type="hidden" id="ccfe-s-menu-icon" value="' + esc(ps.menu_icon || '') + '">' +
            '</div>' +
          '</div>' +
          '<button class="ccfe-btn-create" id="ccfe-save-whitelabel" style="margin-top:12px;">Save</button>' +
        '</div>' +
        '<div class="ccfe-form-card" style="margin-bottom:20px;">' +
          '<h2>File uploads <span class="ccfe-pro-badge-2">Active</span></h2>' +
          '<p class="ccfe-form-desc">Let clients attach images, videos, PDFs and documents to their feedback.</p>' +
          '<div class="ccfe-form-group">' +
            '<label>Enable file uploads</label>' +
            '<div class="ccfe-flex-row">' +
              '<label class="ccfe-switch"><input type="checkbox" id="ccfe-s-uploads"' + (ps.file_uploads ? ' checked' : '') + '><span class="ccfe-slider"></span></label>' +
              '<span>Clients can attach files to annotations</span>' +
            '</div>' +
          '</div>' +
          '<div class="ccfe-form-group" style="margin-top:12px;">' +
            '<label>Max file size (MB)</label>' +
            '<input type="number" id="ccfe-s-max-size" min="1" max="500" placeholder="10" value="' + (ps.max_upload_size || 10) + '" style="width:80px;">' +
          '</div>' +
          '<div class="ccfe-form-group" style="margin-top:8px;">' +
            '<label>Allowed file types</label>' +
            '<div class="ccfe-file-types-grid">' +
              '<label class="ccfe-file-type-item' + (ps.uploads_images !== false ? ' checked' : '') + '">' +
                '<span class="ccfe-switch"><input type="checkbox" id="ccfe-s-img"' + (ps.uploads_images !== false ? ' checked' : '') + '><span class="ccfe-slider"></span></span>' +
                '<span class="ccfe-file-type-label">Images</span>' +
              '</label>' +
              '<label class="ccfe-file-type-item' + (ps.uploads_video !== false ? ' checked' : '') + '">' +
                '<span class="ccfe-switch"><input type="checkbox" id="ccfe-s-vid"' + (ps.uploads_video !== false ? ' checked' : '') + '><span class="ccfe-slider"></span></span>' +
                '<span class="ccfe-file-type-label">Video</span>' +
              '</label>' +
              '<label class="ccfe-file-type-item' + (ps.uploads_audio !== false ? ' checked' : '') + '">' +
                '<span class="ccfe-switch"><input type="checkbox" id="ccfe-s-aud"' + (ps.uploads_audio !== false ? ' checked' : '') + '><span class="ccfe-slider"></span></span>' +
                '<span class="ccfe-file-type-label">Audio</span>' +
              '</label>' +
              '<label class="ccfe-file-type-item' + (ps.uploads_docs !== false ? ' checked' : '') + '">' +
                '<span class="ccfe-switch"><input type="checkbox" id="ccfe-s-docs"' + (ps.uploads_docs !== false ? ' checked' : '') + '><span class="ccfe-slider"></span></span>' +
                '<span class="ccfe-file-type-label">Docs</span>' +
              '</label>' +
            '</div>' +
          '</div>' +
          '<button class="ccfe-btn-create" id="ccfe-save-uploads" style="margin-top:12px;">Save</button>' +
        '</div>' +
        '<div class="ccfe-form-card" style="margin-bottom:20px;">' +
          '<h2>Integrations <span class="ccfe-pro-badge-2">Active</span></h2>' +
          '<p class="ccfe-form-desc">Connect Previu to your existing workflow tools.</p>' +
          '<div class="ccfe-form-group">' +
            '<label for="ccfe-s-slack">Slack webhook URL</label>' +
            '<input type="text" id="ccfe-s-slack" placeholder="https://hooks.slack.com/services/..." value="' + esc(ps.slack_webhook || '') + '">' +
          '</div>' +
          '<button class="ccfe-btn-create" id="ccfe-save-integrations" style="margin-top:12px;">Save</button>' +
        '</div>';
    } else {
      proSectionsHtml =
        '<div class="ccfe-form-card" style="margin-bottom:20px;">' +
          '<h2>Upgrade to Previu Pro</h2>' +
          '<p class="ccfe-form-desc">Unlock white-label branding, file uploads, voice notes, Slack integration, unlimited pins, and more.</p>' +
          '<ul class="ccfe-pro-features-list">' +
            '<li><strong>White-label branding</strong> \u2014 replace "Previu" with your agency name and logo</li>' +
            '<li><strong>File uploads</strong> \u2014 let clients attach images, videos, PDFs, and documents</li>' +
            '<li><strong>Voice notes</strong> \u2014 clients can record and attach voice messages</li>' +
            '<li><strong>Slack integration</strong> \u2014 get notified when clients leave feedback</li>' +
            '<li><strong>Unlimited pins</strong> \u2014 no annotation limits per project</li>' +
          '</ul>' +
          '<a href="https://plugin.usepreviu.com" target="_blank" class="ccfe-btn-primary" style="display:inline-flex;align-items:center;gap:6px;">Upgrade Now <span style="font-size:1.1em;">\u2197</span></a>' +
        '</div>';
    }

    root.innerHTML = '<div class="ccfe-dash">' +
      '<div class="ccfe-dash-header ccfe-text-center" style="display:block;margin-bottom:32px;">' +
        '<h1 class="ccfe-title">Settings</h1>' +
      '</div>' +

      // Email
      '<div class="ccfe-form-card" style="margin-bottom:20px;">' +
        '<h2>Email notifications</h2>' +
        '<p class="ccfe-form-desc">Get notified when a client leaves feedback on any session.</p>' +
        '<div class="ccfe-form-group">' +
          '<label for="ccfe-s-email">Notification email</label>' +
          '<input type="email" id="ccfe-s-email" placeholder="you@agency.com" value="' + esc(adminEmail) + '" />' +
        '</div>' +
        '<button class="ccfe-btn-create" id="ccfe-save-settings">Save</button>' +
        '<div id="ccfe-settings-msg" class="ccfe-created-msg ccfe-hidden"></div>' +
      '</div>' +

      // Welcome message
      '<div class="ccfe-form-card" style="margin-bottom:20px;">' +
        '<h2>Client welcome message</h2>' +
        '<p class="ccfe-form-desc">What your clients see when they open a review link for the first time.</p>' +
        '<div class="ccfe-form-group">' +
          '<label for="ccfe-s-welcome-title">Title</label>' +
          '<input type="text" id="ccfe-s-welcome-title" placeholder="Hi there!" value="' + esc(cfg.welcomeTitle || '') + '" />' +
        '</div>' +
        '<div class="ccfe-form-group">' +
          '<label for="ccfe-s-welcome-msg">Message</label>' +
          '<input type="text" id="ccfe-s-welcome-msg" placeholder="What should we call you?" value="' + esc(cfg.welcomeMessage || '') + '" />' +
        '</div>' +
        '<button class="ccfe-btn-create" id="ccfe-save-welcome">Save</button>' +
        '<div id="ccfe-welcome-msg-status" class="ccfe-created-msg ccfe-hidden"></div>' +
      '</div>' +

      proSectionsHtml +

    '</div>';

    bindSettingsEvents();
  }

  function bindSettingsEvents() {
    // Email
    var saveEmailBtn = document.getElementById('ccfe-save-settings');
    if (saveEmailBtn) {
      saveEmailBtn.addEventListener('click', function() {
        var email = document.getElementById('ccfe-s-email').value.trim();
        var btn = this;
        btn.disabled = true;
        btn.textContent = 'Saving...';
        api('POST', '/settings', { admin_email: email })
          .then(function() { showSuccess('ccfe-settings-msg', 'Saved.', btn, 'Save'); })
          .catch(function(err) { resetBtn(btn, 'Save', err.message); });
      });
    }

    // Welcome
    var saveWelcomeBtn = document.getElementById('ccfe-save-welcome');
    if (saveWelcomeBtn) {
      saveWelcomeBtn.addEventListener('click', function() {
        var title = document.getElementById('ccfe-s-welcome-title').value.trim();
        var msg   = document.getElementById('ccfe-s-welcome-msg').value.trim();
        var btn   = this;
        btn.disabled = true;
        btn.textContent = 'Saving...';
        api('POST', '/settings', { welcome_title: title, welcome_message: msg })
          .then(function() { showSuccess('ccfe-welcome-msg-status', 'Saved.', btn, 'Save'); })
          .catch(function(err) { resetBtn(btn, 'Save', err.message); });
      });
    }

    // White-label
    var wlBtn = document.getElementById('ccfe-save-whitelabel');
    if (wlBtn) {
      wlBtn.addEventListener('click', function() {
        var btn = this;
        btn.disabled = true;
        btn.textContent = 'Saving...';
        api('POST', '/settings', {
          agency_name: document.getElementById('ccfe-s-agency-name').value.trim(),
          portal_logo: document.getElementById('ccfe-s-logo').value.trim(),
          logo_border_radius: parseInt(document.getElementById('ccfe-s-logo-radius').value) || 0,
          remove_branding: document.getElementById('ccfe-s-branding').checked,
          remove_logo: document.getElementById('ccfe-s-hide-logo').checked,
          menu_icon: document.getElementById('ccfe-s-menu-icon').value.trim()
        }).then(function() { showInstant(btn, 'Saved'); })
          .catch(function(err) { resetBtn(btn, 'Save', err.message); });
      });
    }

    // Admin sidebar icon — media uploader
    var uploadBtn = document.getElementById('ccfe-menu-icon-upload');
    var removeBtn = document.getElementById('ccfe-menu-icon-remove');
    var iconInput = document.getElementById('ccfe-s-menu-icon');
    var preview = document.getElementById('ccfe-menu-icon-preview');
    if (uploadBtn && typeof wp !== 'undefined' && wp.media) {
      var frame;
      uploadBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (frame) { frame.open(); return; }
        frame = wp.media({
          title: 'Select Admin Sidebar Icon',
          button: { text: 'Use as icon' },
          multiple: false,
          library: { type: 'image' }
        });
        frame.on('select', function() {
          var attachment = frame.state().get('selection').first().toJSON();
          var url = attachment.url;
          iconInput.value = url;
          preview.src = url;
          preview.style.display = 'block';
          removeBtn.style.display = '';
        });
        frame.open();
      });
    }
    if (removeBtn) {
      removeBtn.addEventListener('click', function() {
        iconInput.value = '';
        preview.style.display = 'none';
        removeBtn.style.display = 'none';
      });
    }

    // Drag & drop for sidebar icon with dimension validation
    var dropZone = document.getElementById('ccfe-menu-icon-dropzone');
    if (dropZone && uploadBtn && !uploadBtn.disabled) {
      ['dragenter', 'dragover'].forEach(function(evt) {
        dropZone.addEventListener(evt, function(e) {
          e.preventDefault();
          e.stopPropagation();
          dropZone.classList.add('drag-over');
        });
      });
      ['dragleave', 'drop'].forEach(function(evt) {
        dropZone.addEventListener(evt, function(e) {
          e.preventDefault();
          e.stopPropagation();
          dropZone.classList.remove('drag-over');
        });
      });
      dropZone.addEventListener('drop', function(e) {
        var file = e.dataTransfer.files[0];
        if (!file) return;
        if (file.type.indexOf('image/') !== 0) { alert('Please drop an image file.'); return; }

        var reader = new FileReader();
        reader.onload = function(ev) {
          var img = new Image();
          img.onload = function() {
            if (img.naturalWidth > 20 || img.naturalHeight > 20) {
              alert('Icon must be 20×20px or smaller. This image is ' + img.naturalWidth + '×' + img.naturalHeight + 'px.');
              return;
            }
            var formData = new FormData();
            formData.append('file', file);
            formData.append('title', 'Previu Sidebar Icon');
            fetch(ccfeAdmin.restUrl.replace('/ccfe/v1', '/wp/v2/media'), {
              method: 'POST',
              headers: { 'X-WP-Nonce': ccfeAdmin.nonce },
              body: formData
            })
            .then(function(r) { return r.json(); })
            .then(function(data) {
              if (data.source_url) {
                iconInput.value = data.source_url;
                preview.src = data.source_url;
                preview.style.display = 'block';
                removeBtn.style.display = '';
              } else {
                alert('Upload failed: ' + (data.message || 'Unknown error'));
              }
            })
            .catch(function() { alert('Upload failed. Try the Upload button instead.'); });
          };
          img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
      });
    }

    // Portal logo — media uploader
    var plUploadBtn = document.getElementById('ccfe-portal-logo-upload');
    var plRemoveBtn = document.getElementById('ccfe-portal-logo-remove');
    var plInput = document.getElementById('ccfe-s-logo');
    var plPreview = document.getElementById('ccfe-portal-logo-preview');
    if (plUploadBtn && typeof wp !== 'undefined' && wp.media) {
      var plFrame;
      plUploadBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (plFrame) { plFrame.open(); return; }
        plFrame = wp.media({
          title: 'Select Portal Logo',
          button: { text: 'Use as logo' },
          multiple: false,
          library: { type: 'image' }
        });
        plFrame.on('select', function() {
          var attachment = plFrame.state().get('selection').first().toJSON();
          var url = attachment.url;
          plInput.value = url;
          if (plPreview.tagName.toLowerCase() === 'svg') {
            var img = document.createElement('img');
            img.id = 'ccfe-portal-logo-preview';
            img.src = url;
            img.style.display = 'block';
            plPreview.parentNode.replaceChild(img, plPreview);
            plPreview = img;
          } else {
            plPreview.src = url;
            plPreview.style.display = 'block';
          }
          plRemoveBtn.style.display = '';
          var title = plRemoveBtn.closest('.ccfe-icon-upload').querySelector('.ccfe-icon-upload-title');
          if (title) title.textContent = 'Logo uploaded';
        });
        plFrame.open();
      });
    }
    if (plRemoveBtn) {
      plRemoveBtn.addEventListener('click', function() {
        plInput.value = '';
        plPreview.style.display = 'none';
        plRemoveBtn.style.display = 'none';
        var title = plRemoveBtn.closest('.ccfe-icon-upload').querySelector('.ccfe-icon-upload-title');
        if (title) title.textContent = 'No logo set';
      });
    }

    // Drag & drop for portal logo
    var plDropZone = document.getElementById('ccfe-portal-logo-dropzone');
    if (plDropZone && plUploadBtn && !plUploadBtn.disabled) {
      ['dragenter', 'dragover'].forEach(function(evt) {
        plDropZone.addEventListener(evt, function(e) {
          e.preventDefault();
          e.stopPropagation();
          plDropZone.classList.add('drag-over');
        });
      });
      ['dragleave', 'drop'].forEach(function(evt) {
        plDropZone.addEventListener(evt, function(e) {
          e.preventDefault();
          e.stopPropagation();
          plDropZone.classList.remove('drag-over');
        });
      });
      plDropZone.addEventListener('drop', function(e) {
        var file = e.dataTransfer.files[0];
        if (!file) return;
        if (file.type.indexOf('image/') !== 0) { alert('Please drop an image file.'); return; }
        var reader = new FileReader();
        reader.onload = function(ev) {
          var formData = new FormData();
          formData.append('file', file);
          formData.append('title', 'Previu Portal Logo');
          fetch(ccfeAdmin.restUrl.replace('/ccfe/v1', '/wp/v2/media'), {
            method: 'POST',
            headers: { 'X-WP-Nonce': ccfeAdmin.nonce },
            body: formData
          })
          .then(function(r) { return r.json(); })
          .then(function(data) {
            if (data.source_url) {
              plInput.value = data.source_url;
              if (plPreview.tagName.toLowerCase() === 'svg') {
                var img = document.createElement('img');
                img.id = 'ccfe-portal-logo-preview';
                img.src = data.source_url;
                img.style.display = 'block';
                plPreview.parentNode.replaceChild(img, plPreview);
                plPreview = img;
              } else {
                plPreview.src = data.source_url;
                plPreview.style.display = 'block';
              }
              plRemoveBtn.style.display = '';
              var title = plRemoveBtn.closest('.ccfe-icon-upload').querySelector('.ccfe-icon-upload-title');
              if (title) title.textContent = 'Logo uploaded';
            } else {
              alert('Upload failed: ' + (data.message || 'Unknown error'));
            }
          })
          .catch(function() { alert('Upload failed. Try the Upload button instead.'); });
        };
        reader.readAsDataURL(file);
      });
    }

    // File uploads
    var ulBtn = document.getElementById('ccfe-save-uploads');
    if (ulBtn) {
      ulBtn.addEventListener('click', function() {
        var btn = this;
        btn.disabled = true;
        btn.textContent = 'Saving...';
        api('POST', '/settings', {
          file_uploads: document.getElementById('ccfe-s-uploads').checked,
          max_upload_size: parseInt(document.getElementById('ccfe-s-max-size').value) || 10,
          uploads_images: document.getElementById('ccfe-s-img').checked,
          uploads_video: document.getElementById('ccfe-s-vid').checked,
          uploads_audio: document.getElementById('ccfe-s-aud').checked,
          uploads_docs: document.getElementById('ccfe-s-docs').checked
        }).then(function() { showInstant(btn, 'Saved'); })
          .catch(function(err) { resetBtn(btn, 'Save', err.message); });
      });
    }

    // Integrations
    var intBtn = document.getElementById('ccfe-save-integrations');
    if (intBtn) {
      intBtn.addEventListener('click', function() {
        var btn = this;
        btn.disabled = true;
        btn.textContent = 'Saving...';
        api('POST', '/settings', {
          slack_webhook: document.getElementById('ccfe-s-slack').value.trim()
        }).then(function() { showInstant(btn, 'Saved'); })
          .catch(function(err) { resetBtn(btn, 'Save', err.message); });
      });
    }
  }

  function showSuccess(msgId, text, btn, resetLabel) {
    btn.textContent = 'Done';
    var msg = document.getElementById(msgId);
    if (!msg) return;
    msg.classList.remove('ccfe-hidden');
    msg.innerHTML = '<div><strong>' + text + '</strong></div>';
    setTimeout(function() {
      msg.classList.add('ccfe-hidden');
      btn.disabled = false;
      btn.textContent = resetLabel;
    }, 2500);
  }

  function showInstant(btn, text) {
    btn.textContent = text;
    setTimeout(function() { btn.disabled = false; btn.textContent = 'Save'; }, 2000);
  }

  function resetBtn(btn, label, errMsg) {
    btn.disabled = false;
    btn.textContent = label;
    alert('Failed: ' + errMsg);
  }

  /* ── Helpers ─────────────────────────────────────────────── */
  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
  }

  function formatDate(d) {
    if (!d) return '';
    var dt = new Date(d);
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  /* ── Boot ────────────────────────────────────────────────── */
  route();
})();
