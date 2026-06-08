import type { Annotation, FilterMode } from './types';

export interface FeedbackListCallbacks {
  onSelectAnnotation: (id: string) => void;
  onFilterChange: (filter: FilterMode) => void;
  onDeleteAnnotation: (id: string) => void;
  onDeviceFilterChange: (device: string) => void;
  onStatusChange: (id: string, status: string) => void;
  onSaveToLibrary?: (fileUrl: string, fileName: string) => Promise<boolean>;
}

function timeAgo(date: string): string {
  if (!date) return '';
  // WP returns UTC timestamps as "YYYY-MM-DD HH:MM:SS" with no timezone marker.
  // new Date() would treat that as LOCAL time → constant offset (e.g. +5h in PKT).
  // Normalize to an explicit UTC ISO string before parsing.
  let iso = date.trim();
  const hasTz = /[zZ]$/.test(iso) || /[+-]\d{2}:?\d{2}$/.test(iso);
  if (!hasTz) {
    iso = iso.replace(' ', 'T') + 'Z';
  } else if (iso.includes(' ') && !iso.includes('T')) {
    iso = iso.replace(' ', 'T');
  }
  const t = new Date(iso).getTime();
  if (isNaN(t)) return '';
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 0) return 'Just now';
  const ints: [number, string][] = [[31536000,'y'],[2592000,'mo'],[86400,'d'],[3600,'h'],[60,'m']];
  for (const [sec, l] of ints) { const v = s / sec; if (v > 1) return Math.floor(v) + l + ' ago'; }
  return 'Just now';
}

function fmtSize(bytes: number): string {
  if (!bytes) return '';
  const u = ['B','KB','MB','GB']; let i = 0, s = bytes;
  while (s >= 1024 && i < 3) { s /= 1024; i++; }
  return s.toFixed(i > 0 ? 1 : 0) + ' ' + u[i];
}

function escHtml(str: string): string {
  const d = document.createElement('div'); d.textContent = str; return d.innerHTML;
}

function lightbox(atts: Array<{url:string;type:string;name:string;size:number}>, start: number, onSave?: (url: string) => Promise<boolean>): void {
  document.querySelectorAll('.fs-lb').forEach(el => el.remove());
  let cur = start;
  const ov = document.createElement('div');
  ov.className = 'fs-lb';
  ov.style.cssText = 'position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,0.94);display:flex;flex-direction:column;';

  function formatSize(bytes: number): string {
    if (!bytes || bytes === 0) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0, s = bytes;
    while (s >= 1024 && i < 3) { s /= 1024; i++; }
    return s.toFixed(i > 0 ? 1 : 0) + ' ' + units[i];
  }

  const render = () => {
    const a = atts[cur];
    const ext = (a.name||'').split('.').pop()?.toUpperCase() || '';
    let c = '';
    if (a.type.startsWith('image/')) {
      c = `<img src="${escHtml(a.url)}" style="max-width:100%;max-height:100%;object-fit:contain;border-radius:4px;">`;
    } else if (a.type.startsWith('video/')) {
      c = `<video controls style="max-width:100%;max-height:100%;border-radius:4px;" src="${escHtml(a.url)}" preload="metadata"></video>`;
    } else if (a.type.startsWith('audio/')) {
      c = `<div style="display:flex;flex-direction:column;align-items:center;gap:24px;padding:20px;"><div style="width:48px;height:48px;color:rgba(255,255,255,0.3);">${SVG_ICONS.music}</div><div style="font-size:14px;color:rgba(255,255,255,0.5);">${escHtml(a.name||'Audio')}</div><audio controls style="width:420px;max-width:85vw;" src="${escHtml(a.url)}" preload="metadata"></audio></div>`;
    } else {
      c = `<div style="display:flex;flex-direction:column;align-items:center;gap:20px;padding:20px;"><div style="width:80px;height:80px;border-radius:12px;background:rgba(255,255,255,0.04);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;color:rgba(255,255,255,0.5);border:1px solid rgba(255,255,255,0.08);">${escHtml(ext)}</div><a href="${escHtml(a.url)}" target="_blank" style="color:#818cf8;font-size:14px;text-decoration:none;font-weight:600;">${escHtml(a.name||'Download')}</a></div>`;
    }
    const pag = atts.length > 1 ? `<span style="color:rgba(255,255,255,0.35);font-size:12px;">${cur+1} / ${atts.length}</span>` : '';
    ov.innerHTML =
      `<button class="fs-lb-close" style="position:fixed;top:14px;right:14px;width:34px;height:34px;border-radius:50%;border:none;background:rgba(255,255,255,0.08);color:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:10;">&times;</button>` +
      (atts.length>1?`<button class="fs-lb-prev" style="position:fixed;left:14px;top:50%;transform:translateY(-50%);width:38px;height:38px;border-radius:50%;border:none;background:rgba(255,255,255,0.08);color:#fff;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:10;">‹</button>`:'') +
      (atts.length>1?`<button class="fs-lb-next" style="position:fixed;right:14px;top:50%;transform:translateY(-50%);width:38px;height:38px;border-radius:50%;border:none;background:rgba(255,255,255,0.08);color:#fff;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:10;">›</button>`:'') +
      `<div class="fs-lb-content" style="flex:1;display:flex;align-items:center;justify-content:center;padding:70px 70px 80px;overflow:hidden;">${c}</div>` +
      `<div style="position:fixed;bottom:0;left:0;right:0;height:52px;background:rgba(0,0,0,0.7);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:space-between;padding:0 20px;z-index:10;border-top:1px solid rgba(255,255,255,0.06);">` +
      `<div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0;"><span style="color:rgba(255,255,255,0.85);font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escHtml(a.name||'')}</span>${a.size?`<span style="color:rgba(255,255,255,0.35);font-size:11px;">${formatSize(a.size)}</span>`:''}<span style="background:rgba(255,255,255,0.08);padding:1px 7px;border-radius:4px;color:rgba(255,255,255,0.5);font-size:10px;font-weight:700;">${escHtml(ext.substring(0,6))}</span></div>` +
      `<div style="display:flex;align-items:center;gap:12px;">${pag}${onSave?`<button class="fs-lb-send" data-url="${escHtml(a.url)}" style="padding:6px 14px;border-radius:6px;border:none;background:rgba(99,102,241,0.8);color:#fff;font-size:12px;font-weight:600;cursor:pointer;">Save to Media</button>`:''}<a href="${escHtml(a.url)}" download style="text-decoration:none;padding:6px 14px;border-radius:6px;background:#6366f1;color:#fff;font-size:12px;font-weight:600;">Download</a></div></div>`;
  };
  render();
  document.body.appendChild(ov);
  ov.addEventListener('click', e => {
    const t = e.target as HTMLElement;
    if (t.classList.contains('fs-lb-close')) ov.remove();
    else if (t.classList.contains('fs-lb-prev') && cur > 0) { cur--; render(); }
    else if (t.classList.contains('fs-lb-next') && cur < atts.length-1) { cur++; render(); }
    else if (t.classList.contains('fs-lb-send') && onSave) {
      const btn = t as HTMLButtonElement;
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '<span style="display:inline-block;width:12px;height:12px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:fs-spin 0.6s linear infinite;"></span>';
      btn.disabled = true;
      onSave(atts[cur].url).then(ok => {
        if (ok) {
          btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>';
          btn.title = 'Saved to Media Library';
        } else {
          btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
          btn.title = 'Save failed';
        }
        setTimeout(() => { btn.innerHTML = originalHTML; btn.disabled = false; btn.title = 'Save to Media Library'; }, 2500);
      });
    }
    else if (t === ov) ov.remove();
  });
  const kd = (e: KeyboardEvent) => {
    if (!document.body.contains(ov)) { document.removeEventListener('keydown', kd); return; }
    if (e.key === 'Escape') ov.remove();
    if (e.key === 'ArrowLeft' && cur > 0) { cur--; render(); e.preventDefault(); }
    if (e.key === 'ArrowRight' && cur < atts.length-1) { cur++; render(); e.preventDefault(); }
  };
  document.addEventListener('keydown', kd);
}

const SVG_ICONS = {
  mic: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15 8a5 5 0 0 1 0 8"/></svg>',
  desktop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
  tablet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="2" width="18" height="20" rx="2"/><circle cx="12" cy="18.5" r="1.2" fill="currentColor" stroke="none"/></svg>',
  mobile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="2" width="12" height="20" rx="2"/><circle cx="12" cy="18.5" r="1.2" fill="currentColor" stroke="none"/></svg>',
  file: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>',
  music: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
  play: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
  pin: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  rect: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/></svg>',
  arrow: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
};

export class FeedbackListPanel {
  private root: HTMLElement | null = null;
  private overlay: HTMLElement | null = null;
  private callbacks: FeedbackListCallbacks | null = null;
  private annotations: Annotation[] = [];
  private currentFilter: FilterMode = 'all';
  private currentDeviceFilter: string = 'desktop';
  private currentSort: 'newest' | 'oldest' = 'newest';
  private onClose: (() => void) | null = null;
  private siteName: string = '';

  open(annotations: Annotation[], callbacks: FeedbackListCallbacks, onClose: () => void, siteName?: string): void {
    this.annotations = annotations;
    this.callbacks = callbacks;
    this.onClose = onClose;
    if (siteName) this.siteName = siteName;
    this.render();
  }

  isOpen(): boolean {
    return this.root !== null;
  }

  close(): void {
    if (this.overlay && this.overlay.parentNode) this.overlay.parentNode.removeChild(this.overlay);
    if (this.root && this.root.parentNode) this.root.parentNode.removeChild(this.root);
    document.querySelectorAll('.fs-lb').forEach(el => el.remove());
    this.overlay = null;
    this.root = null;
  }

  updateAnnotations(annotations: Annotation[]): void {
    this.annotations = annotations;
    if (this.root) {
      this.renderList();
    }
  }

  private render(): void {
    this.close();

    this.overlay = document.createElement('div');
    this.overlay.className = 'feedspace-panel-overlay';
    this.overlay.addEventListener('click', () => this.close());
    document.body.appendChild(this.overlay);

    this.root = document.createElement('div');
    this.root.className = 'feedspace-panel';

    // Header
    const header = document.createElement('div');
    header.className = 'feedspace-panel-header';
    header.innerHTML = `
      <span class="feedspace-panel-title">Feedback List</span>
      <button class="feedspace-panel-close" id="feedback-list-close">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `;
    this.root.appendChild(header);
    header.querySelector('#feedback-list-close')!.addEventListener('click', () => this.close());

    // Status filter tabs
    const filters = document.createElement('div');
    filters.className = 'feedspace-filter-tabs';
    const filterOptions: Array<{ value: FilterMode; label: string }> = [
      { value: 'all', label: 'All' },
      { value: 'pending', label: 'Pending' },
      { value: 'resolved', label: 'Resolved' },
    ];
    const filtersRoot = filters;
    for (const opt of filterOptions) {
      const btn = document.createElement('button');
      btn.className = `feedspace-filter-tab${this.currentFilter === opt.value ? ' active' : ''}`;
      btn.textContent = opt.label;
      btn.dataset.filter = opt.value;
      btn.addEventListener('click', () => {
        this.currentFilter = opt.value;
        filtersRoot.querySelectorAll('.feedspace-filter-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.callbacks?.onFilterChange(opt.value);
        this.renderList();
      });
      filters.appendChild(btn);
    }
    this.root.appendChild(filters);

    // Device filter + sort
    const deviceRow = document.createElement('div');
    deviceRow.className = 'feedspace-device-filter';
    const deviceIcons: Record<string, string> = { desktop: SVG_ICONS.desktop, tablet: SVG_ICONS.tablet, mobile: SVG_ICONS.mobile };
    const deviceBtnHtml = (dv: string, label: string) => {
      const active = dv === this.currentDeviceFilter;
      const icon = `<span style="width:12px;height:12px;display:inline-flex;align-items:center;">${deviceIcons[dv] || ''}</span>`;
      return `<button class="fs-df-btn${active?' active':''}" data-device="${dv}" style="flex:1;display:inline-flex;align-items:center;justify-content:center;gap:4px;padding:5px 4px;border:none;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;transition:all 0.2s;background:${active?'#2563eb':'transparent'};color:${active?'#fff':'#64748b'};">${icon}${label} <span class="fs-df-count" style="background:${active?'rgba(255,255,255,0.2)':'#f1f5f9'};border-radius:10px;padding:0 5px;font-size:10px;line-height:18px;">0</span></button>`;
    };
    deviceRow.innerHTML =
      `<span class="fs-total-badge" style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:6px;background:#f8fafc;color:#475569;font-size:11px;font-weight:700;white-space:nowrap;margin-right:2px;"><span style="font-weight:400;color:#94a3b8;">Total</span><span id="feedspace-total-count">0</span></span>` +
      deviceBtnHtml('desktop', 'Desktop') +
      deviceBtnHtml('tablet', 'Tablet') +
      deviceBtnHtml('mobile', 'Mobile') +
      `<button class="fs-sort-btn" title="${this.currentSort === 'newest' ? 'Newest first' : 'Oldest first'}" style="flex:0 0 26px;display:flex;align-items:center;justify-content:center;border:none;border-radius:4px;background:transparent;color:#94a3b8;cursor:pointer;font-size:9px;font-weight:700;padding:0;">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
      </button>`;
    this.root.appendChild(deviceRow);

    // Body
    const body = document.createElement('div');
    body.className = 'feedspace-panel-body';
    body.id = 'feedback-list-body';
    this.root.appendChild(body);

    document.body.appendChild(this.root);

    // Wire device filter buttons
    deviceRow.querySelectorAll('.fs-df-btn').forEach(el => {
      const btn = el as HTMLElement;
      btn.addEventListener('click', () => {
        deviceRow.querySelectorAll('.fs-df-btn').forEach(e => {
          const b = e as HTMLElement;
          b.classList.remove('active');
          b.style.background = 'transparent';
          b.style.color = '#64748b';
          const cnt = b.querySelector('.fs-df-count') as HTMLElement | null;
          if (cnt) cnt.style.background = '#f1f5f9';
        });
        btn.classList.add('active');
        btn.style.background = '#2563eb';
        btn.style.color = '#fff';
        const cnt = btn.querySelector('.fs-df-count') as HTMLElement | null;
        if (cnt) cnt.style.background = 'rgba(255,255,255,0.2)';
        this.currentDeviceFilter = btn.dataset.device || 'desktop';
        this.callbacks?.onDeviceFilterChange(this.currentDeviceFilter);
        this.renderList();
      });
    });

    // Wire sort button
    const sortBtn = deviceRow.querySelector('.fs-sort-btn') as HTMLElement;
    sortBtn.addEventListener('click', () => {
      this.currentSort = this.currentSort === 'newest' ? 'oldest' : 'newest';
      sortBtn.title = this.currentSort === 'newest' ? 'Newest first' : 'Oldest first';
      this.renderList();
    });

    this.renderList();
  }

  private renderList(): void {
    const body = this.root?.querySelector('#feedback-list-body');
    if (!body) return;

    body.innerHTML = '';

    // Filter by status
    let filtered = this.currentFilter === 'all'
      ? this.annotations
      : this.currentFilter === 'pending'
        ? this.annotations.filter(a => a.status === 'open' || a.status === 'in_progress')
        : this.annotations.filter(a => a.status === this.currentFilter);

    // Filter by device
    filtered = filtered.filter(a => (a.device || 'desktop') === this.currentDeviceFilter);

    // Count per device
    const deviceCounts: Record<string, number> = { desktop: 0, tablet: 0, mobile: 0 };
    let baseForCounts = this.currentFilter === 'all' ? this.annotations :
      this.currentFilter === 'pending' ? this.annotations.filter(a => a.status === 'open' || a.status === 'in_progress') :
      this.annotations.filter(a => a.status === this.currentFilter);
    baseForCounts.forEach(a => { const d = a.device || 'desktop'; if (deviceCounts[d] !== undefined) deviceCounts[d]++; });

    // Update device filter counts
    const deviceRow = this.root?.querySelector('.feedspace-device-filter');
    if (deviceRow) {
      deviceRow.querySelectorAll('.fs-df-btn').forEach(btn => {
        const dv = (btn as HTMLElement).dataset.device || 'desktop';
        const countEl = btn.querySelector('.fs-df-count');
        if (countEl) countEl.textContent = String(deviceCounts[dv] || 0);
      });
      // Update total count indicator
      const totalEl = deviceRow.querySelector('#feedspace-total-count');
      if (totalEl) {
        const total = Object.values(deviceCounts).reduce((s, v) => s + v, 0);
        totalEl.textContent = String(total);
      }
    }

    // Sort
    filtered.sort((a, b) => {
      const ta = new Date(a.createdAt).getTime();
      const tb = new Date(b.createdAt).getTime();
      return this.currentSort === 'newest' ? tb - ta : ta - tb;
    });

    if (filtered.length === 0) {
      body.innerHTML = `<div class="feedspace-empty-state"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg><p>No feedback items yet</p></div>`;
      return;
    }

    const statusLabels: Record<string, string> = { open: 'Pending', in_progress: 'Pending', resolved: 'Resolved', closed: 'Closed' };

    const html = filtered.map((a, idx) => {
      const initial = (a.createdBy || 'A').charAt(0).toUpperCase();
      const timeStr = timeAgo(a.createdAt);
      const replyCount = a.replies?.length || 0;
          const d = a.device || 'desktop';
      let comment = a.content;
      if (!comment && a.media && a.media.length > 0) {
        const hasAudio = a.media.some(m => m.fileType.startsWith('audio/'));
        const hasVideo = a.media.some(m => m.fileType.startsWith('video/'));
        const hasImage = a.media.some(m => m.fileType.startsWith('image/'));
        if (hasAudio) comment = 'Voice note';
        else if (hasVideo) comment = 'Video note';
        else if (hasImage) comment = 'Image feedback';
        else comment = 'Attachment';
      }
      if (!comment) comment = 'No comment';
      const needsReadMore = comment.length > 160;
      const shortComment = needsReadMore ? comment.slice(0, 157) + '...' : comment;

      // Media strip
      let mediaHtml = '';
      if (a.media && a.media.length > 0) {
        const items = a.media.map((m, mi) => {
          const ext = (m.fileName || m.fileUrl).split('.').pop()?.toUpperCase() || '';
          let inner = '';
          if (m.fileType.startsWith('image/')) {
            inner = `<img src="${escHtml(m.fileUrl)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;" alt="">`;
          } else if (m.fileType.startsWith('video/')) {
            inner = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:12px;color:#94a3b8;">▶</div>`;
          } else if (m.fileType.startsWith('audio/')) {
            inner = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;">${SVG_ICONS.mic}</div>`;
          } else {
            inner = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#94a3b8;">${escHtml(ext.substring(0, 4))}</div>`;
          }
          return `<div class="fs-att-thumb" data-index="${mi}" style="flex-shrink:0;width:44px;height:44px;border-radius:6px;overflow:hidden;border:1px solid #e2e8f0;cursor:pointer;position:relative;background:#f8fafc;">${inner}</div>`;
        }).join('');
        mediaHtml = `<div class="fs-att-strip" style="display:flex;gap:4px;overflow-x:auto;padding:4px 0 2px;margin-top:8px;scrollbar-width:thin;">${items}</div>`;
      }

      // Tag chip
      const tag = a.elementDna?.tag || '';
      const tagText = (a.elementDna?.text || '').slice(0, 22);
      const skipTags = ['div', 'section', 'article', 'main', 'aside', 'figure', 'header', 'footer'];
      let tagChip = '';
      if (tag && !skipTags.includes(tag.toLowerCase())) {
        tagChip = `<span class="fs-tag-chip">${escHtml(tag.toUpperCase())}${tagText ? ' ' + escHtml(tagText) : ''}</span>`;
      }

      // Type tag (like reference plugin)
      const typeLabels: Record<string, string> = {
        pin: 'Pin', rect: 'Rectangle', arrow: 'Arrow', draw: 'Freehand',
        comment: 'Comment', voice: 'Voice Note', media: 'Media',
      };
      const typeIcons: Record<string, string> = {
        pin: SVG_ICONS.pin, rect: SVG_ICONS.rect, arrow: SVG_ICONS.arrow,
        draw: SVG_ICONS.pin, comment: SVG_ICONS.file, voice: SVG_ICONS.mic, media: SVG_ICONS.file,
      };
      const typeTag = typeLabels[a.type]
        ? `<span class="fs-type-tag"><span style="width:10px;height:10px;display:inline-flex;align-items:center;">${typeIcons[a.type] || ''}</span>${typeLabels[a.type]}</span>`
        : '';

      return `<div class="feedspace-feedback-item" data-id="${a.id}" data-idx="${idx}">
        <div class="fs-card-header">
          <div style="display:flex;align-items:center;gap:8px;min-width:0;">
            <span class="fs-number-badge">${a._num || idx + 1}</span>
            <span class="fs-device-pill ${d}">${d.charAt(0).toUpperCase() + d.slice(1)}</span>
            ${typeTag}
            ${a.type === 'pin' ? tagChip : ''}
          </div>
          <div class="fs-dots-trigger" style="padding:4px;cursor:pointer;opacity:0.4;flex-shrink:0;line-height:1;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;margin-top:10px;">
          <div class="feedspace-avatar-sm" style="width:28px;height:28px;font-size:11px;">${initial}</div>
          <div style="min-width:0;flex:1;">
            <div class="feedspace-feedback-author" style="font-size:13px;">${escHtml(a.createdBy)}</div>
            <div style="font-size:10px;color:#94a3b8;">${timeStr}</div>
          </div>
          <span class="feedspace-feedback-status ${a.status}" style="font-size:10px;">${statusLabels[a.status] || a.status}</span>
        </div>
        <div class="feedspace-feedback-content" style="margin-top:8px;font-size:13px;">
          <span class="fs-comment-text">${escHtml(needsReadMore ? shortComment : comment)}</span>
          ${needsReadMore ? `<button class="fs-read-more" style="background:none;border:none;color:#2563eb;cursor:pointer;font-size:12px;font-weight:600;padding:0;margin-left:4px;">Read More</button>` : ''}
        </div>
        ${mediaHtml}
        <div style="display:flex;align-items:center;gap:12px;margin-top:10px;">
          ${a.elementDna && a.type === 'pin' ? `<button class="fs-reveal-btn" data-id="${a.id}" style="display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:500;color:#94a3b8;background:none;border:none;cursor:pointer;padding:0;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>Reveal</button>` : ''}
          ${replyCount > 0 ? `<span style="display:flex;align-items:center;gap:4px;font-size:11px;color:#94a3b8;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> ${replyCount}</span>` : ''}
        </div>
      </div>`;
    }).join('');

    body.innerHTML = html;

    // Click card — select annotation + scroll to element
    body.querySelectorAll('.feedspace-feedback-item').forEach(item => {
      item.addEventListener('click', e => {
        if ((e.target as HTMLElement).closest('.fs-dots-trigger, .fs-dot-menu, .fs-reveal-btn, .fs-read-more, .fs-att-thumb')) return;
        const id = (item as HTMLElement).dataset.id;
        body.querySelectorAll('.feedspace-feedback-item').forEach(el => el.classList.remove('highlight'));
        item.classList.add('highlight');
        if (id) this.callbacks?.onSelectAnnotation(id);
      });
    });

    // Read more
    body.querySelectorAll('.fs-read-more').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const parent = (e.target as HTMLElement).closest('.feedspace-feedback-content');
        if (!parent) return;
        const textEl = parent.querySelector('.fs-comment-text') as HTMLElement;
        if (!textEl) return;
        const full = (e.target as HTMLElement).dataset.fullText || textEl.textContent || '';
        if ((e.target as HTMLElement).textContent === 'Read More') {
          (e.target as HTMLElement).dataset.fullText = textEl.textContent || '';
          textEl.textContent = full;
          (e.target as HTMLElement).textContent = 'Show Less';
        } else {
          textEl.textContent = (e.target as HTMLElement).dataset.fullText?.slice(0, 157) + '...';
          (e.target as HTMLElement).textContent = 'Read More';
        }
      });
    });

    // Reveal button
    body.querySelectorAll('.fs-reveal-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = (e.target as HTMLElement).dataset.id;
        if (id) this.callbacks?.onSelectAnnotation(id);
      });
    });

    // 3-dot context menu
    body.querySelectorAll('.fs-dots-trigger').forEach(trigger => {
      trigger.addEventListener('click', e => {
        e.stopPropagation();
        document.querySelectorAll('.fs-dot-menu').forEach(m => m.remove());

        const item = (e.target as HTMLElement).closest('.feedspace-feedback-item') as HTMLElement;
        const id = item?.dataset.id;

        const menu = document.createElement('div');
        menu.className = 'fs-dot-menu';
        menu.style.cssText = 'position:absolute;top:36px;right:8px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;box-shadow:0 10px 30px rgba(0,0,0,0.12);z-index:100;width:130px;overflow:hidden;padding:4px;';

        menu.innerHTML =
          `<div class="fs-menu-item" data-action="locate" style="padding:8px 10px;display:flex;align-items:center;gap:8px;font-size:12px;font-weight:600;cursor:pointer;border-radius:6px;color:#334155;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span>Locate</span>
          </div>
          <div class="fs-menu-item" data-action="delete" style="padding:8px 10px;display:flex;align-items:center;gap:8px;font-size:12px;font-weight:600;cursor:pointer;border-radius:6px;color:#ef4444;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            <span>Delete</span>
          </div>`;

        // Append menu to item
        item.style.position = 'relative';
        item.appendChild(menu);

        // Close on outside click
        setTimeout(() => {
          const close = (ev: MouseEvent) => { if (!menu.contains(ev.target as Node)) { menu.remove(); document.removeEventListener('click', close); } };
          document.addEventListener('click', close);
        }, 10);

        // Menu item actions
        menu.querySelectorAll('.fs-menu-item').forEach(el => {
          el.addEventListener('click', ev => {
            ev.stopPropagation();
            const action = (ev.currentTarget as HTMLElement).dataset.action;
            menu.remove();
            if (action === 'locate' && id) this.callbacks?.onSelectAnnotation(id);
            if (action === 'delete' && id && confirm('Delete this annotation?')) this.callbacks?.onDeleteAnnotation(id);
          });
        });
      });
    });

    // Attachment thumb lightbox
    body.querySelectorAll('.fs-att-thumb').forEach(thumb => {
      thumb.addEventListener('click', e => {
        e.stopPropagation();
        const item = (e.target as HTMLElement).closest('.feedspace-feedback-item') as HTMLElement;
        const id = item?.dataset.id;
        if (!id) return;
        const a = this.annotations.find(ann => ann.id === id);
        if (!a || !a.media || !a.media.length) return;
        const atts = a.media.map(m => ({ url: m.fileUrl, type: m.fileType, name: m.fileName, size: 0 }));
        const idx = parseInt((thumb as HTMLElement).dataset.index || '0');
        lightbox(atts, idx, this.callbacks?.onSaveToLibrary ? (url: string) => this.callbacks!.onSaveToLibrary!(url, '') : undefined);
      });
    });
  }
}
