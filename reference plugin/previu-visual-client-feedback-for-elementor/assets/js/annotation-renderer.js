/**
 * Annotation Renderer — Renders pins, rects, arrows, drawings as SVG overlays.
 * All positions are recalculated from ElementDNA on every render/resize.
 */
window.AnnotationRenderer = (function () {
  'use strict';
  var DNA = window.ElementDNA;
  var NS = 'http://www.w3.org/2000/svg';
  var overlay = null;
  var annotations = [];
  var onClickCb = null;
  var selectedId = null;
  var tooltipEl = null;

  function initTooltip() {
    if (tooltipEl) return;
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'ccfe-pin-tooltip';
    tooltipEl.style.cssText = 'position:fixed; z-index:9999999; pointer-events:none; opacity:0; transition: opacity 0.2s, transform 0.2s; background:rgba(30,30,30,0.95); backdrop-filter:blur(8px); border:1px solid rgba(255,255,255,0.1); color:#fff; padding:10px 14px; border-radius:8px; font-size:12px; font-weight:500; line-height:1.5; max-width:200px; box-shadow:0 10px 30px rgba(0,0,0,0.4); transform:translate(-50%, -10px);';
    document.body.appendChild(tooltipEl);
  }

  function truncate(str, n) {
    return (str.length > n) ? str.substr(0, n - 1) + '&hellip;' : str;
  }
  var selectedAt = 0;
  var currentFilter = 'all';
  var currentDeviceFilter = 'all';

  function setSelected(id) { 
    selectedId = id; 
    selectedAt = Date.now();
    renderAll(); 
  }
  function getSelected() { return selectedId; }

  var COLORS = {
    pin: '#6366f1',
    rect: '#f87171',
    arrow: '#fbbf24',
    draw: '#10b981',
    text: '#38bdf8'
  };
  function getColor(a) {
    if (a.color) return a.color;
    if (a.meta_data && a.meta_data.color) return a.meta_data.color;
    return COLORS[a.type] || COLORS.pin;
  }

  function init() {
    if (overlay) return;
    overlay = document.createElementNS(NS, 'svg');
    overlay.setAttribute('id', 'ccfe-overlay');
    overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;pointer-events:none;z-index:999990;overflow:visible;';
    document.body.appendChild(overlay);
    updateSize();
    initTooltip();
    window.addEventListener('resize', debounce(function () { updateSize(); renderAll(); }, 150));
    
    // CSS HEARTBEAT ENGINE - Refined & Stable
    var style = document.createElement('style');
    style.innerHTML = '@keyframes ccfeHeartbeat { ' +
      '0%, 100% { transform: scale(1); } ' +
      '20% { transform: scale(1.4); } ' +
      '40% { transform: scale(1); } ' +
      '60% { transform: scale(1.4); } ' +
    '} ' +
    '.ccfe-heartbeat { animation: ccfeHeartbeat 1.5s ease-in-out 1; transform-origin: center; transform-box: fill-box; }';
    document.head.appendChild(style);
  }

  function updateSize() {
    var h = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    overlay.setAttribute('height', h);
    overlay.style.height = h + 'px';
  }

  function setAnnotations(list) { annotations = list; renderAll(); }
  function getAnnotations() { return annotations; }
  function addAnnotation(a) { annotations.push(a); renderAll(); }
  function removeAnnotation(id) { annotations = annotations.filter(function (a) { return a.id !== id; }); renderAll(); }
  function setClickCallback(fn) { onClickCb = fn; }
  function setFilter(filter) { currentFilter = filter; renderAll(); }
  function setDeviceFilter(filter) { currentDeviceFilter = filter; renderAll(); }

  function renderAll() {
    if (!overlay) init();
    updateSize();
    while (overlay.firstChild) overlay.removeChild(overlay.firstChild);

    // Defs will be populated dynamically by renderOne if needed
    var defs = document.createElementNS(NS, 'defs');
    overlay.appendChild(defs);

    annotations.forEach(function (a, idx) {
      if (currentFilter !== 'all' && a.status !== currentFilter) return;
      if (currentDeviceFilter !== 'all') {
        var meta = a.meta_data;
        if (typeof meta === 'string') { try { meta = JSON.parse(meta); } catch(e) { meta = {}; } }
        var d = (meta && meta.device) ? meta.device : 'desktop';
        if (d !== currentDeviceFilter) return;
      }
      var g = renderOne(a, idx);
      if (g) {
        g.style.pointerEvents = 'auto';
        overlay.appendChild(g);
      }
    });
  }

  function renderOne(a, idx) {
    var el = DNA.find({
      elementorId: a.elementor_data_id,
      selector: a.element_selector,
      tag: a.element_tag,
      text: a.element_text,
      fingerprint: a.element_fingerprint
    });
    if (!el) return null;

    var pos = DNA.toAbsolute(el, parseFloat(a.anchor_x_pct), parseFloat(a.anchor_y_pct));
    var isHeartbeat = String(a.id) === String(selectedId);
    var g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'ccfe-badge-group' + (isHeartbeat ? ' ccfe-heartbeat' : ''));
    g.style.cursor = 'pointer';
    g.style.pointerEvents = 'auto';
    g.setAttribute('data-ccfe-id', a.id || idx);
    g.addEventListener('click', function (e) {
      e.stopPropagation();
      if (onClickCb) onClickCb(a, idx);
    });
    g.addEventListener('mousedown', function (e) {
      // Allow dragging the whole group
      if (e.target.classList.contains('ccfe-handle')) return;
      var ev = new CustomEvent('ccfe-drag-start', { detail: { annotation: a, event: e }, bubbles: true });
      this.dispatchEvent(ev);
    });

    if (String(a.id) === String(selectedId)) {
      // Logic handled in renderBadge via class
    }

    switch (a.type) {
      case 'pin':
        renderPin(g, pos, idx, a);
        break;
      case 'rect':
        renderRect(g, el, a, idx);
        break;
      case 'arrow':
        renderArrow(g, el, pos, a, idx);
        break;
      case 'draw':
        renderDraw(g, el, a, idx);
        break;
      default:
        renderPin(g, pos, idx, a);
    }
    return g;
  }

  function renderPin(g, pos, idx, a) {
    var c = getColor(a);
    var resolved = a.status === 'resolved';
    if (resolved) c = '#10b981';

    // Badge
    renderBadge(g, pos.x, pos.y, idx + 1, c, a);

    // Pulse animation for pending ONLY (subtle)
    if (!resolved && a.id !== selectedId) {
      var pulse = document.createElementNS(NS, 'circle');
      pulse.setAttribute('cx', pos.x);
      pulse.setAttribute('cy', pos.y);
      pulse.setAttribute('r', '15');
      pulse.setAttribute('fill', 'none');
      pulse.setAttribute('stroke', c);
      pulse.setAttribute('stroke-width', '1.5');
      pulse.setAttribute('opacity', '0.4');
      pulse.setAttribute('pointer-events', 'none');
      var anim = document.createElementNS(NS, 'animate');
      anim.setAttribute('attributeName', 'r');
      anim.setAttribute('from', '15');
      anim.setAttribute('to', '25');
      anim.setAttribute('dur', '2s');
      anim.setAttribute('repeatCount', 'indefinite');
      pulse.appendChild(anim);
      var anim2 = document.createElementNS(NS, 'animate');
      anim2.setAttribute('attributeName', 'opacity');
      anim2.setAttribute('from', '0.4');
      anim2.setAttribute('to', '0');
      anim2.setAttribute('dur', '2s');
      anim2.setAttribute('repeatCount', 'indefinite');
      pulse.appendChild(anim2);
      g.appendChild(pulse);
    }
  }
  function renderRect(g, el, a, idx) {
    var r = DNA.getDocRect(el);
    var x = r.left + (parseFloat(a.anchor_x_pct) / 100) * r.width;
    var y = r.top + (parseFloat(a.anchor_y_pct) / 100) * r.height;
    var w = (parseFloat(a.width_pct) / 100) * r.width;
    var h = (parseFloat(a.height_pct) / 100) * r.height;
    var c = a.status === 'resolved' ? '#10b981' : getColor(a);

    var rect = document.createElementNS(NS, 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', Math.abs(w));
    rect.setAttribute('height', Math.abs(h));
    rect.setAttribute('fill', 'rgba(' + hexToRgb(c) + ',0.15)');
    rect.setAttribute('stroke', c);
    rect.setAttribute('stroke-width', '2.5');
    rect.setAttribute('stroke-dasharray', '6,3');
    rect.setAttribute('rx', '4');
    rect.setAttribute('pointer-events', 'none');
    g.appendChild(rect);

    // Badge
    renderBadge(g, x, y - 10, idx + 1, c, a);
  }

  function renderArrow(g, startEl, startPos, a, idx) {
    var endEl = DNA.find({
      elementorId: a.end_elementor_data_id,
      selector: a.end_element_selector,
      tag: '', text: '', fingerprint: ''
    });
    var endPos;
    if (endEl) {
      endPos = DNA.toAbsolute(endEl, parseFloat(a.end_anchor_x_pct), parseFloat(a.end_anchor_y_pct));
    } else {
      endPos = { x: startPos.x + 100, y: startPos.y + 50 };
    }
    var c = a.status === 'resolved' ? '#10b981' : getColor(a);

    var line = document.createElementNS(NS, 'line');
    line.setAttribute('x1', startPos.x);
    line.setAttribute('y1', startPos.y);
    line.setAttribute('x2', endPos.x);
    line.setAttribute('y2', endPos.y);
    line.setAttribute('stroke', c);
    line.setAttribute('stroke-width', '3');
    
    // Create unique marker for this color
    var markerId = 'ccfe-arrowhead-' + c.replace('#', '');
    if (!overlay.querySelector('#' + markerId)) {
        var defs = overlay.querySelector('defs');
        var marker = document.createElementNS(NS, 'marker');
        marker.setAttribute('id', markerId);
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '7');
        marker.setAttribute('refX', '10');
        marker.setAttribute('refY', '3.5');
        marker.setAttribute('orient', 'auto');
        var poly = document.createElementNS(NS, 'polygon');
        poly.setAttribute('points', '0 0, 10 3.5, 0 7');
        poly.setAttribute('fill', c);
        marker.appendChild(poly);
        defs.appendChild(marker);
    }
    
    line.setAttribute('marker-end', 'url(#' + markerId + ')');
    line.setAttribute('pointer-events', 'none');
    g.appendChild(line);

    renderBadge(g, startPos.x - 12, startPos.y - 24, idx + 1, c, a);
    
  }

  function renderDraw(g, el, a, idx) {
    if (!a.draw_data) return;
    var data;
    try { data = typeof a.draw_data === 'string' ? JSON.parse(a.draw_data) : a.draw_data; } catch (e) { return; }
    var r = DNA.getDocRect(el);
    var c = a.status === 'resolved' ? '#10b981' : getColor(a);
    if (data.pathD) {
      // SVG path stored relative to element — transform to absolute
      var path = document.createElementNS(NS, 'path');
      path.setAttribute('d', transformPath(data.pathD, r));
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', c);
      path.setAttribute('stroke-width', '3');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
      path.setAttribute('pointer-events', 'none');
      g.appendChild(path);
    }

    if (data.points && data.points.length > 1) {
      var d = 'M';
      data.points.forEach(function (p, i) {
        var ax = r.left + (p[0] / 100) * r.width;
        var ay = r.top + (p[1] / 100) * r.height;
        d += (i === 0 ? '' : ' L') + ax + ' ' + ay;
      });
      var path2 = document.createElementNS(NS, 'path');
      path2.setAttribute('d', d);
      path2.setAttribute('fill', 'none');
      path2.setAttribute('stroke', c);
      path2.setAttribute('stroke-width', '3');
      path2.setAttribute('stroke-linecap', 'round');
      path2.setAttribute('pointer-events', 'none');
      g.appendChild(path2);
    }

    var pos = DNA.toAbsolute(el, parseFloat(a.anchor_x_pct), parseFloat(a.anchor_y_pct));
    renderBadge(g, pos.x, pos.y - 20, idx + 1, c, a);
  }

  function renderBadge(g, x, y, num, color, a) {
    var bg = document.createElementNS(NS, 'rect');
    bg.setAttribute('x', x - 11);
    bg.setAttribute('y', y - 11);
    bg.setAttribute('width', '22');
    bg.setAttribute('height', '22');
    bg.setAttribute('rx', '11');
    bg.setAttribute('fill', color);
    bg.setAttribute('stroke', '#fff');
    bg.setAttribute('stroke-width', '2');
    
    if (a && String(a.id) === String(selectedId)) {
      bg.setAttribute('class', 'ccfe-heartbeat');
    }
    
    g.appendChild(bg);

    // Number — let mouse events pass through to the circle behind
    var t = document.createElementNS(NS, 'text');
    t.setAttribute('x', x);
    t.setAttribute('y', y);
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('dominant-baseline', 'central');
    t.setAttribute('fill', '#fff');
    t.setAttribute('font-size', '11');
    t.setAttribute('font-weight', '700');
    t.setAttribute('font-family', 'Inter, system-ui, sans-serif');
    t.setAttribute('pointer-events', 'none');
    t.textContent = num.toString();
    g.appendChild(t);

    // Hover Tooltip Logic — attach to the entire group and track the cursor
    g.addEventListener('mouseenter', function(e) {
      if (!a) return;
      var m = a.meta_data;
      var mediaParts = [];
      if (m) {
        if (m.aud_count > 0) mediaParts.push('<span style="display:inline-flex;align-items:center;gap:3px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg> x' + m.aud_count + '</span>');
        if (m.vid_count > 0) mediaParts.push('<span style="display:inline-flex;align-items:center;gap:3px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg> x' + m.vid_count + '</span>');
        if (m.img_count > 0) mediaParts.push('<span style="display:inline-flex;align-items:center;gap:3px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> x' + m.img_count + '</span>');
        if (m.att_count > 0) mediaParts.push('<span style="display:inline-flex;align-items:center;gap:3px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg> x' + m.att_count + '</span>');
      }
      var tipText = a.comment_text ? truncate(String(a.comment_text), 80) : '';
      if (mediaParts.length) {
        if (tipText) tipText += '<br>';
        tipText += '<span style="opacity:0.7;white-space:nowrap;display:inline-flex;align-items:center;gap:10px;">' + mediaParts.join('') + '</span>';
      }
      if (!tipText) return;
      initTooltip();
      if (!tooltipEl) return;
      tooltipEl.innerHTML = tipText;
      tooltipEl.style.left = e.clientX + 'px';
      tooltipEl.style.top = (e.clientY - 15) + 'px';
      tooltipEl.style.transform = 'translate(-50%, -100%)';
      tooltipEl.style.opacity = '1';
    });
    
    g.addEventListener('mousemove', function(e) {
      if (tooltipEl && tooltipEl.style.opacity === '1') {
        tooltipEl.style.left = e.clientX + 'px';
        tooltipEl.style.top = (e.clientY - 15) + 'px';
      }
    });
    
    g.addEventListener('mouseleave', function() {
      if (tooltipEl) {
        tooltipEl.style.opacity = '0';
      }
    });
  }

  function renderHandle(g, x, y, action) {
    var h = document.createElementNS(NS, 'circle');
    h.setAttribute('cx', x);
    h.setAttribute('cy', y);
    h.setAttribute('r', '7');
    h.setAttribute('fill', '#fff');
    h.setAttribute('stroke', '#6C5CE7');
    h.setAttribute('stroke-width', '2.5');
    h.setAttribute('class', 'ccfe-handle');
    h.setAttribute('data-action', action);
    h.style.cursor = action.indexOf('resize') > -1 ? 'nwse-resize' : 'move';
    g.appendChild(h);
  }

  function transformPath(pathD, rect) {
    // pathD has coordinates as percentages — convert to absolute pixel coordinates
    var i = 0;
    return pathD.replace(/(-?\d+\.?\d*)/g, function(match) {
      var val = parseFloat(match);
      var result = (i % 2 === 0) ? (rect.left + (val / 100) * rect.width) : (rect.top + (val / 100) * rect.height);
      i++;
      return result;
    });
  }

  function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    var r = parseInt(hex.substring(0, 2), 16) || 0;
    var g = parseInt(hex.substring(2, 4), 16) || 0;
    var b = parseInt(hex.substring(4, 6), 16) || 0;
    return r + ',' + g + ',' + b;
  }

  function debounce(fn, ms) {
    var t;
    return function () {
      clearTimeout(t);
      var args = arguments, ctx = this;
      t = setTimeout(function () { fn.apply(ctx, args); }, ms);
    };
  }

  function scrollTo(a) {
    var el = DNA.find({
      elementorId: a.elementor_data_id,
      selector: a.element_selector,
      tag: a.element_tag,
      text: a.element_text,
      fingerprint: a.element_fingerprint
    });
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  return {
    init: init,
    setAnnotations: setAnnotations,
    getAnnotations: getAnnotations,
    addAnnotation: addAnnotation,
    removeAnnotation: removeAnnotation,
    renderAll: renderAll,
    setClickCallback: setClickCallback,
    setFilter: setFilter,
    setDeviceFilter: setDeviceFilter,
    setSelected: setSelected,
    getSelected: getSelected,
    scrollTo: scrollTo,
    updateSize: updateSize,
    COLORS: COLORS
  };
})();
