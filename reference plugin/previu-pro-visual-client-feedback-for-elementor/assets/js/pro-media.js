/**
 * Previu Pro — Media Library admin page.
 * Shows all client-uploaded media with filters, delete, and backfill.
 */
(function () {
  'use strict';

  if ( ! document.getElementById( 'ccfe-media-admin' ) ) return;

  var cfg = window.ccfeProMedia || {};
  var root = document.getElementById( 'ccfe-media-admin' );
  if ( ! cfg.restUrl || ! cfg.nonce ) {
    root.innerHTML = '<div class="ccfe-empty"><h3>Configuration error</h3><p>Media library config not loaded. Try refreshing the page.</p></div>';
    return;
  }
  var currentFilter = '';
  var currentWpStatus = '';
  var currentPage = 1;
  var loading = false;

  /* ── API helper ──────────────────────────────────────────── */
  function api( method, path, body ) {
    var url = cfg.restUrl.replace( /\/+$/, '' ) + path;
    url += ( url.indexOf( '?' ) > -1 ? '&' : '?' ) + '_t=' + Date.now();
    return fetch( url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': cfg.nonce,
      },
      body: body ? JSON.stringify( body ) : undefined,
    } ).then( function ( r ) { return r.json(); } );
  }

  /* ── Esc ──────────────────────────────────────────────────── */
  function esc( s ) {
    var d = document.createElement( 'div' );
    d.textContent = s || '';
    return d.innerHTML;
  }

  /* ── Format file size ─────────────────────────────────────── */
  function formatSize( bytes ) {
    if ( ! bytes ) return '';
    if ( bytes < 1024 ) return bytes + ' B';
    if ( bytes < 1048576 ) return ( bytes / 1024 ).toFixed( 1 ) + ' KB';
    return ( bytes / 1048576 ).toFixed( 1 ) + ' MB';
  }

  /* ── Load media ───────────────────────────────────────────── */
  function loadMedia( append ) {
    if ( loading ) return;
    loading = true;
    if ( ! append ) currentPage = 1;

    var path = '/media/admin?per_page=50&page=' + currentPage;
    if ( currentFilter ) path += '&type=' + encodeURIComponent( currentFilter );
    if ( currentWpStatus ) path += '&wp_status=' + encodeURIComponent( currentWpStatus );

    root.classList.add( 'ccfe-media-loading' );

    api( 'GET', path ).then( function ( data ) {
      loading = false;
      root.classList.remove( 'ccfe-media-loading' );
      if ( data.code ) {
        root.innerHTML = '<div class="ccfe-empty"><h3>Error</h3><p>' + esc( data.message || 'Could not load media.' ) + '</p></div>';
        return;
      }
      renderPage( data, append );
    } ).catch( function ( err ) {
      loading = false;
      root.classList.remove( 'ccfe-media-loading' );
      root.innerHTML = '<div class="ccfe-empty"><h3>Failed to load media</h3><p>' + esc( ( err && err.message ) || 'Network error. The media table may need to be created. Try saving a session first or contact support.' ) + '</p></div>';
    } );
  }

  /* ── Render page ──────────────────────────────────────────── */
  function renderPage( data, append ) {
    var items = data.items || [];
    var total = data.total || 0;

    var headerHtml =
      '<div class="ccfe-dash-header">' +
        '<div>' +
          '<a href="' + esc( cfg.adminUrl || 'admin.php?page=ccfe_clientmark' ) + '" class="ccfe-breadcrumb">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg> Sessions' +
          '</a>' +
          '<h1 class="ccfe-title">Media Library</h1>' +
          '<p class="ccfe-subtitle">' + total + ' file' + ( total !== 1 ? 's' : '' ) + ' from client feedback</p>' +
        '</div>' +
        '<div class="ccfe-header-actions">' +
          '<button class="ccfe-btn-back ccfe-btn-backfill" id="ccfe-media-backfill">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg> Scan annotations' +
          '</button>' +
          ( data.total_unsent > 0 ? '<button class="ccfe-btn-back ccfe-btn-delete-unsent" id="ccfe-media-delete-unsent" data-count="' + data.total_unsent + '">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Delete unsent' +
          '</button>' : '' ) +
          ( total > 0 ? '<button class="ccfe-btn-back ccfe-btn-delete-all" id="ccfe-media-delete-all" data-count="' + total + '">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Delete All' +
          '</button>' : '' ) +
        '</div>' +
      '</div>';

    var filtersHtml =
      '<div class="ccfe-media-filters">' +
        '<button class="ccfe-media-filter' + ( !currentFilter && !currentWpStatus ? ' active' : '' ) + '" data-filter="" data-wp="">All</button>' +
        '<button class="ccfe-media-filter' + ( currentFilter === 'image' ? ' active' : '' ) + '" data-filter="image" data-wp="">Images</button>' +
        '<button class="ccfe-media-filter' + ( currentFilter === 'video' ? ' active' : '' ) + '" data-filter="video" data-wp="">Videos</button>' +
        '<button class="ccfe-media-filter' + ( currentFilter === 'audio_only' ? ' active' : '' ) + '" data-filter="audio_only" data-wp="">Audio</button>' +
        '<button class="ccfe-media-filter' + ( currentFilter === 'voice_note' ? ' active' : '' ) + '" data-filter="voice_note" data-wp="">Voice Notes</button>' +
        '<button class="ccfe-media-filter' + ( currentFilter === 'document' || currentFilter === 'archive' ? ' active' : '' ) + '" data-filter="document" data-wp="">Documents</button>' +
        '<button class="ccfe-media-filter' + ( currentWpStatus === 'sent' ? ' active' : '' ) + '" data-filter="" data-wp="sent">Sent to WP Media</button>' +
        '<button class="ccfe-media-filter ccfe-media-filter-orphan' + ( currentWpStatus === 'orphan' ? ' active' : '' ) + '" data-filter="" data-wp="orphan">Orphans</button>' +
      '</div>';

    var gridHtml = '';
    if ( items.length ) {
      gridHtml = '<div class="ccfe-media-grid">';
      items.forEach( function ( f ) {
        gridHtml += renderCard( f );
      } );
      gridHtml += '</div>';
    } else {
      gridHtml = '<div class="ccfe-empty"><h3>No media found</h3><p>' +
        ( currentWpStatus === 'orphan' ? 'No orphan files. Files linked to deleted annotations will appear here.' :
          currentWpStatus === 'sent' ? 'No files have been sent to the WordPress media library yet.' :
          'No ' + ( currentFilter || '' ) + ' files found.' ) +
        '</p></div>';
    }

    var moreHtml = '';
    if ( currentPage < data.pages ) {
      moreHtml = '<div class="ccfe-media-more-wrap"><button class="ccfe-btn-primary ccfe-media-more">Load more</button></div>';
    }

    if ( append ) {
      var grid = root.querySelector( '.ccfe-media-grid' );
      if ( grid ) {
        items.forEach( function ( f ) { grid.insertAdjacentHTML( 'beforeend', renderCard( f ) ); } );
      }
      var moreWrap = root.querySelector( '.ccfe-media-more-wrap' );
      if ( moreWrap ) moreWrap.remove();
      if ( moreHtml ) root.insertAdjacentHTML( 'beforeend', moreHtml );
    } else {
      root.innerHTML = '<div class="ccfe-dash">' + headerHtml + filtersHtml + gridHtml + moreHtml + '</div>';
    }

    bindPageEvents( data );
  }

  /* ── Render a single file card ─────────────────────────────── */
  function renderCard( f ) {
    var isImage = f.file_type === 'image';
    var isAudio = f.file_type === 'audio';
    var isVideo = f.file_type === 'video';
    var isOrphan = ! f.annotation_id;
    var isSent = !! f.wp_attachment_id;

    var badgeHtml = '';
    if ( isSent ) {
      badgeHtml = '<span class="ccfe-media-badge ccfe-media-badge-sent">In WP Media</span>';
    } else if ( isOrphan ) {
      badgeHtml = '<span class="ccfe-media-badge ccfe-media-badge-orphan">Not linked</span>';
    }

    var annotationLink = '';
    if ( ! isOrphan && f.annotation_id ) {
      annotationLink = '<div class="ccfe-media-ann-link">' +
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ' +
        esc( f.client_name || 'Client' ) +
        ( f.project_title ? ' &middot; ' + esc( f.project_title ) : '' ) +
      '</div>';
    }

    var playerHtml = '';
    if ( isAudio ) {
      playerHtml = '<audio controls src="' + esc( f.file_url ) + '" preload="metadata" class="ccfe-media-audio-player"></audio>';
    }

    var ext = ( f.file_name || '' ).split( '.' ).pop().toUpperCase();
    if ( ext === ( f.file_name || '' ).toUpperCase() ) ext = '';
    var extBadge = ext ? '<span class="ccfe-media-ext">' + ext + '</span>' : '';

    var thumbnailHtml = '';
    if ( isImage ) {
      thumbnailHtml = '<img src="' + esc( f.file_url ) + '" alt="" loading="lazy" class="ccfe-media-thumb">';
    } else if ( isVideo ) {
      thumbnailHtml = '<div class="ccfe-media-thumb ccfe-media-thumb-video">' +
        '<video src="' + esc( f.file_url ) + '" preload="metadata"></video>' +
        '<div class="ccfe-media-play-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><polygon points="8 5 19 12 8 19 8 5"/></svg></div>' +
      '</div>';
    } else if ( isAudio ) {
      thumbnailHtml = '<div class="ccfe-media-thumb ccfe-media-thumb-audio">' +
        '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>' +
        extBadge +
      '</div>';
    } else {
      thumbnailHtml = '<div class="ccfe-media-thumb ccfe-media-thumb-doc">' +
        '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' +
        extBadge +
      '</div>';
    }

    var deleteHtml = '<button class="ccfe-media-delete" data-id="' + f.id + '" data-name="' + esc( f.file_name ) + '" title="Delete file"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>';

    return '<div class="ccfe-media-card' + ( isOrphan ? ' ccfe-media-card-orphan' : '' ) + '" data-id="' + f.id + '">' +
      thumbnailHtml +
      '<div class="ccfe-media-card-body">' +
        '<div class="ccfe-media-card-name" title="' + esc( f.file_name ) + '">' + esc( f.file_name ) + '</div>' +
        '<div class="ccfe-media-card-meta">' +
          '<span>' + formatSize( f.file_size ) + '</span>' +
          badgeHtml +
        '</div>' +
        annotationLink +
        playerHtml +
        '<div class="ccfe-media-card-footer">' +
          deleteHtml +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /* ── Bind events ──────────────────────────────────────────── */
  function bindPageEvents( data ) {
    root.querySelectorAll( '.ccfe-media-filter' ).forEach( function ( btn ) {
      btn.addEventListener( 'click', function () {
        currentFilter = this.dataset.filter;
        currentWpStatus = this.dataset.wp;
        loadMedia( false );
      } );
    } );

    var moreBtn = root.querySelector( '.ccfe-media-more' );
    if ( moreBtn ) {
      moreBtn.addEventListener( 'click', function () {
        currentPage++;
        loadMedia( true );
      } );
    }

    var backfillBtn = root.querySelector( '#ccfe-media-backfill' );
    if ( backfillBtn ) {
      backfillBtn.addEventListener( 'click', function () {
        var btn = this;
        btn.disabled = true;
        btn.innerHTML = 'Scanning...';
        api( 'POST', '/media/admin/backfill' ).then( function ( res ) {
          btn.innerHTML = 'Inserted ' + ( res.inserted || 0 ) + ', skipped ' + ( res.skipped || 0 );
          setTimeout( function () {
            btn.disabled = false;
            btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg> Scan annotations';
            loadMedia( false );
          }, 2000 );
        } ).catch( function () {
          btn.disabled = false;
          btn.innerHTML = 'Failed';
          setTimeout( function () {
            btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg> Scan annotations';
          }, 2000 );
        } );
      } );
    }

    var deleteAllBtn = root.querySelector( '#ccfe-media-delete-all' );
    if ( deleteAllBtn ) {
      deleteAllBtn.addEventListener( 'click', function () {
        var count = parseInt( this.dataset.count ) || 0;
        if ( ! confirm( 'Delete all ' + count + ' file' + ( count !== 1 ? 's' : '' ) + ' from the current filter?\n\nThis will remove them from disk and from the WordPress media library if imported. This action cannot be undone.' ) ) return;
        var btn = this;
        btn.disabled = true;
        btn.innerHTML = 'Deleting...';
        api( 'POST', '/media/admin/bulk-delete', {
          type: currentFilter,
          wp_status: currentWpStatus,
        } ).then( function ( res ) {
          loadMedia( false );
        } ).catch( function () {
          btn.disabled = false;
          btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Delete All';
          alert( 'Failed to delete files.' );
        } );
      } );
    }

    var deleteUnsentBtn = root.querySelector( '#ccfe-media-delete-unsent' );
    if ( deleteUnsentBtn ) {
      deleteUnsentBtn.addEventListener( 'click', function () {
        var count = parseInt( this.dataset.count ) || 0;
        if ( ! confirm( 'Delete ' + count + ' unsent file' + ( count !== 1 ? 's' : '' ) + '? Files already sent to the WordPress media library will be kept.' ) ) return;
        var btn = this;
        btn.disabled = true;
        btn.innerHTML = 'Deleting...';
        api( 'POST', '/media/admin/bulk-delete', {
          type: currentFilter,
          wp_status: 'unsent',
        } ).then( function ( res ) {
          loadMedia( false );
        } ).catch( function () {
          btn.disabled = false;
          btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Delete unsent';
          alert( 'Failed to delete files.' );
        } );
      } );
    }

    root.querySelectorAll( '.ccfe-media-thumb' ).forEach( function ( thumb ) {
      if ( thumb._bound ) return;
      thumb._bound = true;
      var card = thumb.closest( '.ccfe-media-card' );
      if ( ! card ) return;
      var img = card.querySelector( 'img' );
      if ( img ) {
        thumb.style.cursor = 'pointer';
        thumb.addEventListener( 'click', function () {
          openLightbox( img.src );
        } );
      }
    } );

    root.querySelectorAll( '.ccfe-media-delete' ).forEach( function ( btn ) {
      if ( btn._bound ) return;
      btn._bound = true;
      btn.addEventListener( 'click', function ( e ) {
        e.stopPropagation();
        var id = this.dataset.id;
        var name = this.dataset.name;
        if ( ! confirm( 'Delete "' + name + '"?\n\nThis will remove the file from disk and from the WordPress media library if it was imported there. This action cannot be undone.' ) ) return;
        var card = this.closest( '.ccfe-media-card' );
        api( 'DELETE', '/media/admin/delete/' + id ).then( function ( res ) {
          if ( res.deleted ) {
            if ( card ) card.remove();
            var countEl = root.querySelector( '.ccfe-subtitle' );
            if ( countEl ) {
              var current = parseInt( countEl.textContent ) || 0;
              countEl.textContent = ( current - 1 ) + ' file' + ( current - 1 !== 1 ? 's' : '' ) + ' from client feedback';
            }
          }
        } ).catch( function () {
          alert( 'Failed to delete file.' );
        } );
      } );
    } );
  }

  /* ── Lightbox ──────────────────────────────────────────────── */
  function openLightbox( url ) {
    var existing = document.querySelector( '.ccfe-media-lb' );
    if ( existing ) existing.remove();
    var lb = document.createElement( 'div' );
    lb.className = 'ccfe-media-lb';
    lb.innerHTML =
      '<img src="' + esc( url ) + '" alt="">' +
      '<button class="ccfe-media-lb-close">&times;</button>' +
      '<a class="ccfe-media-lb-dl" href="' + esc( url ) + '" download>' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download' +
      '</a>';
    document.body.appendChild( lb );
    lb.querySelector( '.ccfe-media-lb-close' ).onclick = function () { lb.remove(); };
    lb.addEventListener( 'click', function ( e ) { if ( e.target === lb ) lb.remove(); } );
    document.addEventListener( 'keydown', function escClose( e ) {
      if ( e.key === 'Escape' ) { lb.remove(); document.removeEventListener( 'keydown', escClose ); }
    });
  }

  /* ── Boot ──────────────────────────────────────────────────── */
  loadMedia( false );
})();
