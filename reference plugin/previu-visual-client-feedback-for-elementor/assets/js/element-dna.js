/**
 * ElementDNA — Screen-size-independent element targeting system.
 * Generates unique identifiers for DOM elements and relocates them reliably.
 */
window.ElementDNA = (function () {
  'use strict';

  function getElementorId(el) {
    var node = el.closest('[data-id]');
    return node ? node.getAttribute('data-id') : '';
  }

  function getSelector(el) {
    if (el.id) return '#' + CSS.escape(el.id);
    var parts = [];
    var cur = el;
    while (cur && cur !== document.body && cur !== document.documentElement) {
      var seg = cur.tagName.toLowerCase();
      if (cur.id) { parts.unshift('#' + CSS.escape(cur.id)); break; }
      var eId = cur.getAttribute('data-id');
      if (eId) { parts.unshift('[data-id="' + eId + '"]'); break; }
      var parent = cur.parentElement;
      if (parent) {
        var sibs = Array.from(parent.children).filter(function (c) { return c.tagName === cur.tagName; });
        if (sibs.length > 1) seg += ':nth-of-type(' + (sibs.indexOf(cur) + 1) + ')';
      }
      parts.unshift(seg);
      cur = cur.parentElement;
    }
    return parts.join(' > ');
  }

  function fingerprint(el) {
    var str = el.tagName + '|' + (el.textContent || '').substring(0, 80).trim();
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return hash.toString(36);
  }

  function getDocRect(el) {
    var r = el.getBoundingClientRect();
    var sx = window.pageXOffset || document.documentElement.scrollLeft;
    var sy = window.pageYOffset || document.documentElement.scrollTop;
    return { left: r.left + sx, top: r.top + sy, width: r.width, height: r.height };
  }

  function getDNA(el) {
    return {
      elementorId: getElementorId(el),
      selector: getSelector(el),
      tag: el.tagName.toLowerCase(),
      text: (el.textContent || '').substring(0, 200).trim(),
      fingerprint: fingerprint(el)
    };
  }

  function find(dna) {
    // 1. Elementor data-id is the MOST stable identifier across all contexts (editor + live)
    if (dna.elementorId) {
      var e = document.querySelector('[data-id="' + dna.elementorId + '"]');
      if (e) return e;
    }
    // 2. CSS selector fallback (may differ between editor/live - use carefully)
    if (dna.selector) {
      try { var e2 = document.querySelector(dna.selector); if (e2) return e2; } catch (x) {}
    }
    // 3. Fuzzy: tag + text match
    if (dna.tag && dna.text) {
      var els = document.querySelectorAll(dna.tag);
      var best = null, bestScore = 0;
      els.forEach(function (el) {
        var t = (el.textContent || '').substring(0, 200).trim();
        if (t === dna.text) { best = el; bestScore = 1; return; }
        if (bestScore < 0.5 && t.indexOf(dna.text.substring(0, 40)) !== -1) { best = el; bestScore = 0.5; }
      });
      if (best) return best;
    }
    // 4. Fingerprint scan
    if (dna.fingerprint && dna.tag) {
      var all = document.querySelectorAll(dna.tag);
      for (var i = 0; i < all.length; i++) {
        if (fingerprint(all[i]) === dna.fingerprint) return all[i];
      }
    }
    return null;
  }

  function toRelative(el, pageX, pageY) {
    var r = getDocRect(el);
    return {
      xPct: r.width ? ((pageX - r.left) / r.width) * 100 : 0,
      yPct: r.height ? ((pageY - r.top) / r.height) * 100 : 0
    };
  }

  function toAbsolute(el, xPct, yPct) {
    var r = getDocRect(el);
    return {
      x: r.left + (xPct / 100) * r.width,
      y: r.top + (yPct / 100) * r.height
    };
  }

  function closestTargetable(el) {
    var cur = el;
    // First: walk UP and try to find the nearest Elementor widget wrapper [data-id]
    // This is the most stable reference — same in editor AND on live site
    while (cur && cur !== document.body) {
      if (cur.getAttribute('data-id')) return cur;
      cur = cur.parentElement;
    }
    // Fallback: walk from original element and grab any meaningful semantic tag
    cur = el;
    while (cur && cur !== document.body) {
      if (cur.id || cur.tagName.match(/^(SECTION|HEADER|FOOTER|MAIN|ARTICLE|NAV|ASIDE|H[1-6]|P|A|BUTTON|IMG|UL|OL|FORM|INPUT|TEXTAREA|TABLE)$/i)) {
        return cur;
      }
      cur = cur.parentElement;
    }
    return document.body;
  }


  return {
    generate: getDNA,
    getDNA: getDNA,
    find: find,
    toRelative: toRelative,
    toAbsolute: toAbsolute,
    getDocRect: getDocRect,
    closestTargetable: closestTargetable,
    fingerprint: fingerprint
  };
})();
