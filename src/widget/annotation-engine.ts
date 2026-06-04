import type { Annotation, AnnotationMedia, CreateAnnotationPayload, ToolMode, DeviceMode, FilterMode, WidgetConfig, ElementDNA } from './types';
import type { ApiClient } from './api';
import { AnnotationRenderer } from './annotation-renderer';
import { CommentPanel } from './comment-panel';
import { FeedbackListPanel } from './feedback-list';
import { getElementDNA, closestTargetable, toRelative, findElement } from './element-dna';
import { uploadToWordPress } from './uploader';

function dbg(msg: string, data?: unknown): void {
  const arr = (window as any).__feedspaceDebug;
  if (arr && Array.isArray(arr)) {
    arr.push({ msg, data, time: Date.now() });
  }
  console.log('[Feedspace]', msg, data || '');
}

const SVG_ICONS = {
  select: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3l14 8-7 2-3 7z"/></svg>',
  pin: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>',
  arrow: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="19" x2="19" y2="5"/><polyline points="12 5 19 5 19 12"/></svg>',
  rect: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>',
  list: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
  desktop: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
  tablet: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
  mobile: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
  submit: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
  mic: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>',
  paperclip: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>',
  file: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>',
};

export class AnnotationEngine {
  private config: WidgetConfig;
  private api: ApiClient;
  private renderer: AnnotationRenderer;
  private commentPanel: CommentPanel;
  private feedbackList: FeedbackListPanel;
  private annotations: Annotation[] = [];

  private currentTool: ToolMode = 'select';
  private deviceMode: DeviceMode = 'desktop';
  private filterMode: FilterMode = 'all';
  private clientName: string = '';

  private isDrawing = false;
  private drawStart: { x: number; y: number; el: Element; dna: ElementDNA } | null = null;
  private drawPoints: Array<{ x: number; y: number }> = [];
  private tempSvgEl: SVGElement | null = null;
  private isRecording = false;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private recordingStartTime: number = 0;
  private recordingTimer: number | null = null;

  private toolbarRoot: HTMLElement | null = null;
  private nameModal: HTMLElement | null = null;
  private hoverHighlightEl: HTMLElement | null = null;

  constructor(config: WidgetConfig, api: ApiClient) {
    this.config = config;
    this.api = api;
    this.renderer = new AnnotationRenderer();
    this.commentPanel = new CommentPanel();
    this.feedbackList = new FeedbackListPanel();
  }

  async init(): Promise<void> {
    dbg('AnnotationEngine.init() called');
    this.clientName = localStorage.getItem('feedspace_client_name') || '';
    dbg('clientName from localStorage:', this.clientName || '(empty)');
    if (!this.clientName) {
      dbg('No client name — showing name modal');
      this.showNameModal();
      return;
    }
    dbg('Client name found — booting directly');
    this.boot();
  }

  private showNameModal(): void {
    dbg('showNameModal() called');
    if (this.nameModal) {
      dbg('nameModal already exists — skipping');
      return;
    }
    const modal = document.createElement('div');
    modal.className = 'feedspace-name-modal';
    modal.innerHTML = `
      <div class="feedspace-name-modal-card">
        <h3>What is your name?</h3>
        <p>This will be shown with your feedback.</p>
        <input type="text" id="feedspace-name-input" placeholder="Your name..." maxlength="50" autocomplete="off">
        <div class="actions">
          <button class="cancel" id="feedspace-name-skip">Skip</button>
          <button class="confirm" id="feedspace-name-continue">Continue</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    this.nameModal = modal;
    dbg('Name modal appended to body');

    const input = modal.querySelector('#feedspace-name-input') as HTMLInputElement;
    input.focus();

    modal.querySelector('#feedspace-name-skip')!.addEventListener('click', () => {
      this.clientName = 'Anonymous';
      localStorage.setItem('feedspace_client_name', this.clientName);
      this.destroyNameModal();
      this.boot();
    });

    modal.querySelector('#feedspace-name-continue')!.addEventListener('click', () => {
      this.clientName = input.value.trim() || 'Anonymous';
      localStorage.setItem('feedspace_client_name', this.clientName);
      this.destroyNameModal();
      this.boot();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        (modal.querySelector('#feedspace-name-continue') as HTMLButtonElement)?.click();
      }
    });
  }

  private destroyNameModal(): void {
    if (this.nameModal && this.nameModal.parentNode) {
      this.nameModal.parentNode.removeChild(this.nameModal);
    }
    this.nameModal = null;
  }

  private boot(): void {
    dbg('boot() called — initializing renderer, toolbar, drawing, annotations');
    this.renderer.init({
      onAnnotationClick: (id) => this.onAnnotationClick(id),
    });
    this.buildToolbar();
    this.attachDrawingListeners();
    this.loadAnnotations();
    dbg('boot() complete');
  }

  private buildToolbar(): void {
    const dev = !!this.config.devMode;
    this.toolbarRoot = document.createElement('div');
    this.toolbarRoot.id = 'feedspace-widget-root';
    this.toolbarRoot.innerHTML = `
      <div class="feedspace-toolbar">
        ${dev ? '' : `<button class="feedspace-tool-btn active" data-tool="select" title="Select">${SVG_ICONS.select}</button>
        <button class="feedspace-tool-btn" data-tool="pin" title="Add Pin">${SVG_ICONS.pin}</button>
        <button class="feedspace-tool-btn" data-tool="arrow" title="Add Arrow">${SVG_ICONS.arrow}</button>
        <button class="feedspace-tool-btn" data-tool="rect" title="Add Rectangle">${SVG_ICONS.rect}</button>
        <div class="feedspace-toolbar-divider"></div>`}
        <button class="feedspace-tool-btn" data-action="list" title="Feedback List" id="feedspace-list-btn">
          ${SVG_ICONS.list}
          <span class="badge" id="feedspace-list-count" style="display:none">0</span>
        </button>
        ${dev ? '' : `<div class="feedspace-toolbar-divider"></div>
        <button class="feedspace-submit-btn" data-action="submit" title="Finish reviewing">
          ${SVG_ICONS.submit}
          Finish Review
        </button>`}
      </div>
    `;

    document.body.appendChild(this.toolbarRoot);

    if (!dev) {
      this.toolbarRoot.querySelectorAll('[data-tool]').forEach((btn) => {
        btn.addEventListener('click', () => this.setTool(btn.getAttribute('data-tool') as ToolMode));
      });
      this.toolbarRoot.querySelectorAll('[data-device]').forEach((btn) => {
        btn.addEventListener('click', () => this.setDevice(btn.getAttribute('data-device') as DeviceMode));
      });
    }

    this.toolbarRoot.querySelector('[data-action="list"]')?.addEventListener('click', () => {
      if (this.feedbackList.isOpen()) {
        this.feedbackList.close();
        return;
      }
      this.feedbackList.open(this.annotations, {
        onSelectAnnotation: (id) => this.focusAnnotation(id),
        onFilterChange: (filter) => {
          this.filterMode = filter;
          this.renderer.setFilter(filter);
        },
        onProjectFilterChange: (projectId) => {
          this.renderer.setProjectFilter(projectId);
        },
        onDeleteAnnotation: (id) => this.deleteAnnotation(id),
        onDeviceFilterChange: (device) => {
          this.renderer.setDeviceFilter(device);
        },
        onStatusChange: (id, status) => this.changeAnnotationStatus(id, status),
        onSaveToLibrary: (fileUrl, fileName) => this.saveToLibrary(fileUrl, fileName),
      }, () => { }, this.config.siteName, this.config.projectId);
    });

    if (dev) {
      setTimeout(() => {
        (this.toolbarRoot?.querySelector('[data-action="list"]') as HTMLElement)?.click();
      }, 500);
    } else {
      this.toolbarRoot.querySelector('[data-action="submit"]')?.addEventListener('click', () => {
        this.showToast('Feedback saved! Thanks for your input.');
      });
    }
  }

  private setTool(tool: ToolMode): void {
    this.currentTool = this.currentTool === tool ? 'select' : tool;

    this.toolbarRoot?.querySelectorAll('[data-tool]').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-tool') === this.currentTool);
    });

    document.body.setAttribute('data-feedspace-tool', this.currentTool);
    if (this.currentTool === 'select') this.clearHoverHighlight();

    const overlay = document.getElementById('feedspace-overlay');
    if (overlay) {
      overlay.classList.toggle('feedspace-active', this.currentTool === 'select');
    }

    this.cleanupDrawState();
  }

  private setDevice(device: DeviceMode): void {
    this.deviceMode = device;

    this.toolbarRoot?.querySelectorAll('[data-device]').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-device') === device);
    });

    const body = document.body;

    let wrapper = document.getElementById('feedspace-viewport-wrapper');
    if (wrapper) {
      wrapper.parentNode?.removeChild(wrapper);
    }

    if (device === 'desktop') {
      body.style.maxWidth = '';
      body.style.margin = '';
      body.style.boxShadow = '';
    } else {
      const width = device === 'tablet' ? '768px' : '375px';
      body.style.maxWidth = width;
      body.style.margin = '0 auto';
      body.style.boxShadow = '0 0 0 1px rgba(0,0,0,0.05), 0 8px 32px rgba(0,0,0,0.1)';
    }

    document.documentElement.style.background = device !== 'desktop' ? '#e5e7eb' : '';

    this.renderer.renderAll();
  }

  private attachDrawingListeners(): void {
    document.addEventListener('mousedown', (e) => this.onMouseDown(e));
    document.addEventListener('mousemove', (e) => this.onMouseMove(e));
    document.addEventListener('mouseup', (e) => this.onMouseUp(e));
    document.addEventListener('mouseleave', () => this.clearHoverHighlight());
  }

  private updateHoverHighlight(e: MouseEvent): void {
    if (this.currentTool === 'select') {
      this.clearHoverHighlight();
      return;
    }
    const target = closestTargetable(e.target as Element) as HTMLElement | null;
    if (target === this.hoverHighlightEl) return;
    this.clearHoverHighlight();
    if (target && target !== document.body) {
      target.classList.add('feedspace-hover-highlight');
      this.hoverHighlightEl = target;
    }
  }

  private clearHoverHighlight(): void {
    if (this.hoverHighlightEl) {
      this.hoverHighlightEl.classList.remove('feedspace-hover-highlight');
      this.hoverHighlightEl = null;
    }
  }

  private onMouseDown(e: MouseEvent): void {
    if (this.currentTool === 'select') return;
    if (e.button !== 0) return;
    if ((e.target as HTMLElement)?.closest('#feedspace-widget-root, #feedspace-overlay, .feedspace-panel, .feedspace-panel-overlay, .feedspace-name-modal')) return;

    e.preventDefault();
    this.isDrawing = true;

    const el = closestTargetable(e.target as Element);
    const dna = getElementDNA(el);
    const rel = toRelative(el, e.pageX, e.pageY);

    this.drawStart = { x: e.pageX, y: e.pageY, el, dna };
    this.drawPoints = [{ x: rel.x, y: rel.y }];

    if (this.currentTool === 'pin' || this.currentTool === 'arrow' || this.currentTool === 'rect') {
      this.finishDrawing(el, dna, [{ x: rel.x, y: rel.y }]);
    }
  }

  private onMouseMove(e: MouseEvent): void {
    if (!this.isDrawing || !this.drawStart) {
      this.updateHoverHighlight(e);
      return;
    }
  }

  private onMouseUp(e: MouseEvent): void {
    if (!this.isDrawing || !this.drawStart) return;
    if (this.currentTool === 'pin') {
      this.isDrawing = false;
      return;
    }

    this.isDrawing = false;

    const overlay = document.getElementById('feedspace-overlay') as unknown as SVGSVGElement;
    if (overlay) this.removeTempPreview(overlay);

    const { el, dna } = this.drawStart;
    this.finishDrawing(el, dna, this.drawPoints.length > 1 ? this.drawPoints : 
      [{ x: 50, y: 50 }]);
  }

  private removeTempPreview(overlay: SVGSVGElement): void {
    if (this.tempSvgEl && overlay.contains(this.tempSvgEl)) {
      overlay.removeChild(this.tempSvgEl);
    }
    this.tempSvgEl = null;
  }

  private finishDrawing(el: Element, startDna: ElementDNA, points: Array<{ x: number; y: number }>): void {
    const firstPoint = points[0];
    const rel = toRelative(el, this.drawStart!.x, this.drawStart!.y);

    this.commentPanel.open(this.drawStart!.x, this.drawStart!.y, null, {
      onSubmit: (content, files) => this.saveAnnotation(content, files, el, startDna, firstPoint, points),
      onToggleRecording: () => this.toggleRecording(),
      onDeleteRecording: () => this.deleteRecording(),
      isRecording: () => this.isRecording,
    }, () => { });

    this.setTool('select');
    this.cleanupDrawState();
  }

  private cleanupDrawState(): void {
    this.isDrawing = false;
    this.drawStart = null;
    this.drawPoints = [];
    this.tempSvgEl = null;
  }

  private async saveAnnotation(
    content: string,
    files: File[],
    el: Element,
    startDna: ElementDNA,
    firstPoint: { x: number; y: number },
    _points: Array<{ x: number; y: number }>
  ): Promise<void> {
    const metaData: Record<string, unknown> = {
      device: this.deviceMode,
      elementTag: startDna.tag,
      elementText: startDna.text,
      projectName: this.config.siteName || '',
    };

    const payload: CreateAnnotationPayload = {
      projectId: this.config.projectId,
      previewToken: this.config.token,
      type: this.currentTool as 'pin' | 'arrow' | 'rect',
      content,
      pageUrl: this.config.pageUrl,
      selector: startDna.selector,
      elementDna: startDna,
      coordinatesX: firstPoint.x,
      coordinatesY: firstPoint.y,
      coordinatesXEnd: null,
      coordinatesYEnd: null,
      width: null,
      height: null,
      drawData: null,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      device: this.deviceMode,
      createdBy: this.clientName,
      metaData,
    };

    try {
      const media: AnnotationMedia[] = [];
      if (files.length > 0) {
        for (const file of files) {
          try {
            const result = await uploadToWordPress(this.config.wpApiUrl, this.config.wpApiKey, file, this.config.projectId);
            media.push({
              id: result.id || '',
              fileUrl: result.url,
              fileType: file.type || '',
              fileName: file.name || '',
            });
          } catch (err) {
            console.error('Upload failed', err);
            this.showToast('File upload failed. Pin saved without media.');
          }
        }
      }

      if (media.length > 0) {
        payload.media = media;
      }

      const annotation = await this.api.createAnnotation(payload);
      annotation._num = this.annotations.length + 1;
      this.annotations.push(annotation);
      this.renderer.setAnnotations(this.annotations);
      this.updateBadge();
      this.commentPanel.close();
      this.setTool('select');
      this.showToast('Feedback saved!');
    } catch (err) {
      console.error('Failed to save annotation', err);
      this.showToast('Failed to save feedback. Please try again.');
    }
  }

  private async changeAnnotationStatus(id: string, status: string): Promise<void> {
    try {
      console.log('[Feedspace] changeAnnotationStatus:', { id, status });
      const updated = await this.api.updateAnnotation(id, { status: status as any });
      console.log('[Feedspace] changeAnnotationStatus response:', updated);
      const idx = this.annotations.findIndex(a => a.id === id);
      if (idx >= 0) {
        this.annotations[idx] = { ...this.annotations[idx], ...updated, status: status as any };
      }
      this.renderer.setAnnotations(this.annotations);
      this.feedbackList.updateAnnotations(this.annotations);
      this.updateBadge();
      this.showToast(status === 'resolved' ? 'Marked as resolved' : 'Reopened');
    } catch (err) {
      console.error('Failed to update annotation status', err);
      this.showToast('Failed to update status');
    }
  }

  private async saveToLibrary(fileUrl: string, fileName: string): Promise<boolean> {
    try {
      const wpUrl = this.config.wpApiUrl.replace(/\/+$/, '');
      const res = await fetch(`${wpUrl}/wp-json/feedspace/v1/media/save-to-library`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Feedspace-Key': this.config.wpApiKey,
        },
        body: JSON.stringify({ url: fileUrl }),
      });
      const data = await res.json();
      if (data.attachment_id) {
        dbg('save_to_library_ok', data);
        return true;
      } else {
        dbg('save_to_library_failed', data);
        return false;
      }
    } catch (err) {
      dbg('save_to_library_error', err);
      return false;
    }
  }

  private async deleteAnnotation(id: string): Promise<void> {
    try {
      await this.api.deleteAnnotation(id);
      this.annotations = this.annotations.filter(a => a.id !== id);
      this.renderer.setAnnotations(this.annotations);
      this.updateBadge();
      this.showToast('Annotation deleted');
    } catch (err) {
      console.error('Failed to delete annotation', err);
      this.showToast('Failed to delete');
    }
  }

  private async loadAnnotations(): Promise<void> {
    try {
      this.annotations = await this.api.getAnnotations(this.config.pageUrl, this.config.projectId);
      this.annotations.forEach((a, i) => a._num = i + 1);
      dbg('loadAnnotations: fetched ' + this.annotations.length + ' annotations');
      await this.backfillProjectNames();
      this.renderer.setAnnotations(this.annotations);
      this.updateBadge();
    } catch (err) {
      console.error('Failed to load annotations', err);
      dbg('loadAnnotations: FAILED', String(err));
    }
  }

  private projectNameCache: Record<string, string> = {};

  private async backfillProjectNames(): Promise<void> {
    const seen = new Set<string>();
    const missing: { pid: string; token: string }[] = [];
    for (const a of this.annotations) {
      if (a.projectId && !a.projectName && !seen.has(a.projectId)) {
        seen.add(a.projectId);
        if (this.projectNameCache[a.projectId]) {
          a.projectName = this.projectNameCache[a.projectId];
        } else {
          missing.push({ pid: a.projectId, token: a.previewToken || '' });
        }
      }
    }
    if (missing.length === 0) return;
    const apiUrl = this.config.apiUrl.replace(/\/+$/, '');
    for (const { pid, token } of missing) {
      try {
        const res = await fetch(`${apiUrl}/api/widget/verify-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId: pid }),
        });
        const data = await res.json();
        console.log('[Feedspace] Project name lookup:', { projectId: pid, status: res.status, response: data });
        if (res.ok && data.name) {
          this.projectNameCache[pid] = data.name;
          for (const a of this.annotations) {
            if (a.projectId === pid && !a.projectName) a.projectName = data.name;
          }
          continue;
        }
        // Fallback: try token-based lookup if projectId returned no name
        if (token) {
          console.log('[Feedspace] Falling back to token lookup for', pid);
          const tres = await fetch(`${apiUrl}/api/widget/verify-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          });
          const tdata = await tres.json();
          console.log('[Feedspace] Token lookup result:', { token, status: tres.status, response: tdata });
          if (tres.ok && tdata.valid && tdata.siteName) {
            this.projectNameCache[pid] = tdata.siteName;
            for (const a of this.annotations) {
              if (a.projectId === pid && !a.projectName) a.projectName = tdata.siteName;
            }
            console.log('[Feedspace] Set projectName from token fallback:', pid, '->', tdata.siteName);
            continue;
          }
        }
        console.log('[Feedspace] No name found for project', pid, '- using fallback');
      } catch (e) { /* ignore fetch errors */ }
    }
  }

  private onAnnotationClick(id: string): void {
    const annotation = this.annotations.find((a) => a.id === id);
    if (!annotation) return;

    this.renderer.setSelected(id);

    // Compute popup anchor from pin position
    let px = window.innerWidth / 2, py = 100;
    if (annotation.elementDna) {
      const el = findElement(annotation.elementDna);
      if (el) {
        const rect = el.getBoundingClientRect();
        px = rect.left + window.scrollX + (rect.width * annotation.anchorXPct) / 100;
        py = rect.top + window.scrollY + (rect.height * annotation.anchorYPct) / 100;
      }
    }

    this.commentPanel.open(px, py, annotation, {
      onSubmit: async (content, files) => {
        try {
          const mediaUrls: string[] = [];
          for (const file of files) {
            try {
              const result = await uploadToWordPress(this.config.wpApiUrl, this.config.wpApiKey, file, this.config.projectId);
              mediaUrls.push(result.url);
            } catch { }
          }

          const updated = await this.api.updateAnnotation(id, {
            ...annotation,
            replies: [...(annotation.replies || []), {
              id: '',
              content,
              createdBy: this.clientName,
              createdAt: new Date().toISOString(),
            }],
          } as any);
          await this.loadAnnotations();
          this.renderer.setSelected(null);
          this.commentPanel.close();
        } catch (err) {
          console.error('Failed to add reply', err);
        }
      },
      onToggleRecording: () => this.toggleRecording(),
      onDeleteRecording: () => this.deleteRecording(),
      isRecording: () => this.isRecording,
    }, () => {
      this.renderer.setSelected(null);
    });
  }

  private focusAnnotation(id: string): void {
    this.renderer.setSelected(id);
    const annotation = this.annotations.find((a) => a.id === id);
    if (!annotation?.elementDna) return;
    const el = findElement(annotation.elementDna);
    if (!el) { this.showToast('Element not found on page'); return; }

    // Auto-resize viewport to match original device
    const device = annotation.device || 'desktop';
    const widths: Record<string, string> = { desktop: '', tablet: '768px', mobile: '375px' };
    document.body.style.maxWidth = widths[device] || '';
    document.body.style.margin = device === 'desktop' ? '' : '0 auto';
    document.body.style.boxShadow = device === 'desktop' ? '' : '0 0 60px rgba(0,0,0,0.3)';
    document.documentElement.style.background = device !== 'desktop' ? '#e5e7eb' : '';

    // Find the specific semantic element within the widget
    let revealEl: Element = el;
    const semanticTags = ['H1','H2','H3','H4','H5','H6','P','A','BUTTON','INPUT','TEXTAREA','IMG','SPAN','LABEL'];
    if (annotation.elementDna.tag && semanticTags.includes(annotation.elementDna.tag.toUpperCase())) {
      const inner = el.querySelector(annotation.elementDna.tag.toLowerCase());
      if (inner) revealEl = inner;
    }

    window.dispatchEvent(new Event('resize'));
    revealEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Flash dashed highlight on the specific element
    const htmlEl = revealEl as HTMLElement;
    const prev = {
      outline: htmlEl.style.outline,
      outlineOffset: htmlEl.style.outlineOffset,
      transition: htmlEl.style.transition,
    };
    htmlEl.style.transition = 'outline 0.15s';
    htmlEl.style.outline = '2px dashed #6366f1';
    htmlEl.style.outlineOffset = '4px';

    let count = 0;
    const pulse = setInterval(() => {
      count++;
      htmlEl.style.outline = count % 2 === 0 ? '2px dashed #6366f1' : '2px dashed transparent';
      if (count >= 6) {
        clearInterval(pulse);
        htmlEl.style.outline = prev.outline;
        htmlEl.style.outlineOffset = prev.outlineOffset;
        htmlEl.style.transition = prev.transition;
      }
    }, 300);
  }

  private updateBadge(): void {
    const badge = document.getElementById('feedspace-list-count');
    if (!badge) return;
    const count = this.annotations.length;
    badge.textContent = String(count);
    badge.style.display = count > 0 ? '' : 'none';
  }

  private toggleRecording(): void {
    if (this.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  private startRecording(): void {
    if (this.isRecording) return;
    if (!navigator.mediaDevices?.getUserMedia) return;
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      this.isRecording = true;
      this.recordingStartTime = Date.now();

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.audioChunks.push(e.data);
      };

      this.mediaRecorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
      };

      this.mediaRecorder.start(100);

      if (this.recordingTimer) clearInterval(this.recordingTimer);
      this.recordingTimer = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - this.recordingStartTime) / 1000);
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        const indicator = document.getElementById('fs-popup-rec-indicator');
        if (indicator) {
          indicator.style.display = 'flex';
          const timeEl = document.getElementById('fs-popup-rec-time');
          if (timeEl) timeEl.textContent = `${mins}:${String(secs).padStart(2, '0')}`;
        }
      }, 1000);
    }).catch(() => {
      this.showToast('Microphone access denied');
    });
  }

  private stopRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    this.isRecording = false;
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
      this.recordingTimer = null;
    }

    const indicator = document.getElementById('fs-popup-rec-indicator');
    if (indicator) indicator.style.display = 'none';

    const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
    if (blob.size === 0) {
      this.showToast('Recording is empty');
      return;
    }
    const file = new File([blob], `recording-${Date.now()}.weba`, { type: 'audio/webm' });

    this.commentPanel.addFile(file);
  }

  private deleteRecording(): void {
    this.isRecording = false;
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
      this.recordingTimer = null;
    }
    this.audioChunks = [];
    const indicator = document.getElementById('fs-popup-rec-indicator');
    if (indicator) indicator.style.display = 'none';
  }

  private showToast(message: string): void {
    const existing = document.getElementById('feedspace-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'feedspace-toast';
    toast.style.cssText = `
      position:fixed;bottom:80px;left:50%;transform:translateX(-50%);
      background:#1f2937;color:#fff;padding:10px 20px;border-radius:8px;
      font-size:13px;font-family:'Poppins',sans-serif;z-index:100001;
      box-shadow:0 4px 16px rgba(0,0,0,0.2);animation:feedspace-fade-in 0.15s;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 3000);
  }

  destroy(): void {
    this.clearHoverHighlight();
    this.renderer.destroy();
    this.commentPanel.close();
    this.feedbackList.close();
    this.destroyNameModal();
    if (this.toolbarRoot && this.toolbarRoot.parentNode) {
      this.toolbarRoot.parentNode.removeChild(this.toolbarRoot);
    }
    if (this.recordingTimer) clearInterval(this.recordingTimer);
    document.body.removeAttribute('data-feedspace-tool');
    const wrapper = document.getElementById('feedspace-viewport-wrapper');
    if (wrapper) wrapper.parentNode?.removeChild(wrapper);
    document.body.style.maxWidth = '';
    document.body.style.margin = '';
    document.body.style.boxShadow = '';
    document.documentElement.style.background = '';
  }
}
