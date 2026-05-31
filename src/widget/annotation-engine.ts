import type { Annotation, CreateAnnotationPayload, ToolMode, DeviceMode, FilterMode, WidgetConfig, ElementDNA } from './types';
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
  rect: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>',
  arrow: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="19" x2="19" y2="5"/><polyline points="12 5 19 5 19 12"/></svg>',
  draw: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>',
  list: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
  desktop: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
  tablet: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
  mobile: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
  submit: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
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
    this.toolbarRoot = document.createElement('div');
    this.toolbarRoot.id = 'feedspace-widget-root';
    this.toolbarRoot.innerHTML = `
      <div class="feedspace-toolbar">
        <div class="feedspace-toolbar-group">
          <div class="feedspace-toolbar-label">Tools</div>
          <button class="feedspace-tool-btn active" data-tool="select" title="Select">${SVG_ICONS.select}</button>
          <button class="feedspace-tool-btn" data-tool="pin" title="Add Pin">${SVG_ICONS.pin}</button>
          <button class="feedspace-tool-btn" data-tool="rect" title="Add Rectangle">${SVG_ICONS.rect}</button>
          <button class="feedspace-tool-btn" data-tool="arrow" title="Add Arrow">${SVG_ICONS.arrow}</button>
          <button class="feedspace-tool-btn" data-tool="draw" title="Freehand Draw">${SVG_ICONS.draw}</button>
        </div>
        <div class="feedspace-toolbar-divider"></div>
        <div class="feedspace-toolbar-group">
          <div class="feedspace-toolbar-label">View</div>
          <button class="feedspace-device-btn active" data-device="desktop" title="Desktop">${SVG_ICONS.desktop}</button>
          <button class="feedspace-device-btn" data-device="tablet" title="Tablet">${SVG_ICONS.tablet}</button>
          <button class="feedspace-device-btn" data-device="mobile" title="Mobile">${SVG_ICONS.mobile}</button>
        </div>
        <div class="feedspace-toolbar-divider"></div>
        <div class="feedspace-toolbar-group">
          <button class="feedspace-tool-btn" data-action="list" title="Feedback List" id="feedspace-list-btn">
            ${SVG_ICONS.list}
            <span class="badge" id="feedspace-list-count" style="display:none">0</span>
          </button>
        </div>
        <div class="feedspace-toolbar-divider"></div>
        <button class="feedspace-submit-btn" data-action="submit" title="Finish reviewing">
          ${SVG_ICONS.submit}
          Finish Review
        </button>
      </div>
    `;

    document.body.appendChild(this.toolbarRoot);

    this.toolbarRoot.querySelectorAll('[data-tool]').forEach((btn) => {
      btn.addEventListener('click', () => this.setTool(btn.getAttribute('data-tool') as ToolMode));
    });

    this.toolbarRoot.querySelectorAll('[data-device]').forEach((btn) => {
      btn.addEventListener('click', () => this.setDevice(btn.getAttribute('data-device') as DeviceMode));
    });

    this.toolbarRoot.querySelector('[data-action="list"]')?.addEventListener('click', () => {
      this.feedbackList.open(this.annotations, {
        onSelectAnnotation: (id) => this.focusAnnotation(id),
        onFilterChange: (filter) => {
          this.filterMode = filter;
          this.renderer.setFilter(filter);
        },
      }, () => { });
    });

    this.toolbarRoot.querySelector('[data-action="submit"]')?.addEventListener('click', () => {
      this.showToast('Feedback saved! Thanks for your input.');
    });
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

    if (this.currentTool === 'pin') {
      this.finishDrawing(el, dna, [{ x: rel.x, y: rel.y }]);
    }
  }

  private onMouseMove(e: MouseEvent): void {
    if (!this.isDrawing || !this.drawStart) {
      this.updateHoverHighlight(e);
      return;
    }

    const overlay = document.getElementById('feedspace-overlay') as unknown as SVGSVGElement;
    if (!overlay) return;

    this.removeTempPreview(overlay);

    const el = this.drawStart.el;
    const startRel = this.drawStart.dna;
    const currentRel = toRelative(el, e.pageX, e.pageY);

    if (this.currentTool === 'rect') {
      const rect = el.getBoundingClientRect();
      const x1 = this.drawStart.x - window.scrollX;
      const y1 = this.drawStart.y - window.scrollY;
      const x2 = e.pageX - window.scrollX;
      const y2 = e.pageY - window.scrollY;

      const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      r.setAttribute('x', String(Math.min(x1, x2)));
      r.setAttribute('y', String(Math.min(y1, y2)));
      r.setAttribute('width', String(Math.abs(x2 - x1)));
      r.setAttribute('height', String(Math.abs(y2 - y1)));
      r.setAttribute('fill', 'rgba(99, 102, 241, 0.1)');
      r.setAttribute('stroke', '#6366f1');
      r.setAttribute('stroke-width', '2');
      r.setAttribute('stroke-dasharray', '6,3');
      r.setAttribute('rx', '4');
      overlay.appendChild(r);
      this.tempSvgEl = r;
    }

    if (this.currentTool === 'arrow') {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(this.drawStart.x));
      line.setAttribute('y1', String(this.drawStart.y));
      line.setAttribute('x2', String(e.pageX));
      line.setAttribute('y2', String(e.pageY));
      line.setAttribute('stroke', '#6366f1');
      line.setAttribute('stroke-width', '2');
      line.setAttribute('stroke-dasharray', '5,3');
      line.setAttribute('marker-end', 'url(#feedspace-arrowhead)');
      overlay.appendChild(line);
      this.tempSvgEl = line;
    }

    if (this.currentTool === 'draw') {
      const rel = toRelative(el, e.pageX, e.pageY);
      this.drawPoints.push({ x: rel.x, y: rel.y });

      const rect = el.getBoundingClientRect();
      const pl = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      const ptsStr = this.drawPoints
        .map((p) => {
          const absX = rect.left + window.scrollX + (rect.width * p.x) / 100;
          const absY = rect.top + window.scrollY + (rect.height * p.y) / 100;
          return `${absX},${absY}`;
        })
        .join(' ');
      pl.setAttribute('points', ptsStr);
      pl.setAttribute('fill', 'none');
      pl.setAttribute('stroke', '#6366f1');
      pl.setAttribute('stroke-width', '2');
      pl.setAttribute('stroke-linecap', 'round');
      pl.setAttribute('stroke-linejoin', 'round');
      overlay.appendChild(pl);
      this.tempSvgEl = pl;
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

    this.commentPanel.open(null, {
      onSubmit: (content, files) => this.saveAnnotation(content, files, el, startDna, firstPoint, points),
      onStartRecording: () => this.startRecording(),
      onStopRecording: () => this.stopRecording(),
      onDeleteRecording: () => this.deleteRecording(),
      isRecording: this.isRecording,
    }, () => { });

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
    points: Array<{ x: number; y: number }>
  ): Promise<void> {
    const rect = el.getBoundingClientRect();
    const lastPoint = points[points.length - 1];
    const endDna = this.currentTool === 'arrow' ? getElementDNA(document.elementFromPoint(
      this.drawStart?.x || 0, this.drawStart?.y || 0
    ) || el) : null;

    let drawDataStr: string | null = null;
    if (this.currentTool === 'draw' && points.length > 1) {
      drawDataStr = JSON.stringify({
        pathD: '',
        points: points.map((p) => ({
          x: p.x,
          y: p.y,
        })),
      });
    }

    const metaData: Record<string, unknown> = {
      device: this.deviceMode,
      elementTag: startDna.tag,
      elementText: startDna.text,
    };

    const annotationType = this.currentTool === 'select' ? 'pin' : this.currentTool;
    const payload: CreateAnnotationPayload = {
      projectId: this.config.projectId,
      previewToken: this.config.token,
      type: annotationType,
      content,
      pageUrl: this.config.pageUrl,
      selector: startDna.selector,
      elementDna: startDna,
      coordinatesX: firstPoint.x,
      coordinatesY: firstPoint.y,
      coordinatesXEnd: endDna && lastPoint ? lastPoint.x : null,
      coordinatesYEnd: endDna && lastPoint ? lastPoint.y : null,
      width: this.currentTool === 'rect' ? Math.abs(lastPoint.x - firstPoint.x) : null,
      height: this.currentTool === 'rect' ? Math.abs(lastPoint.y - firstPoint.y) : null,
      drawData: drawDataStr,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      device: this.deviceMode,
      createdBy: this.clientName,
      metaData,
    };

    try {
      const mediaUrls: string[] = [];
      if (files.length > 0) {
        for (const file of files) {
          try {
            const result = await uploadToWordPress(this.config.wpApiUrl, this.config.wpApiKey, file, this.config.projectId);
            mediaUrls.push(result.url);
          } catch (err) {
            console.error('Upload failed', err);
          }
        }
      }

      const annotation = await this.api.createAnnotation(payload);
      this.annotations.push(annotation);
      this.renderer.setAnnotations(this.annotations);
      this.updateBadge();
      this.commentPanel.close();
      this.showToast('Feedback saved!');
    } catch (err) {
      console.error('Failed to save annotation', err);
      this.showToast('Failed to save feedback. Please try again.');
    }
  }

  private async loadAnnotations(): Promise<void> {
    try {
      this.annotations = await this.api.getAnnotations(this.config.pageUrl, this.config.projectId);
      dbg('loadAnnotations: fetched ' + this.annotations.length + ' annotations');
      this.renderer.setAnnotations(this.annotations);
      this.updateBadge();
    } catch (err) {
      console.error('Failed to load annotations', err);
      dbg('loadAnnotations: FAILED', String(err));
    }
  }

  private onAnnotationClick(id: string): void {
    const annotation = this.annotations.find((a) => a.id === id);
    if (!annotation) return;

    this.renderer.setSelected(id);

    this.commentPanel.open(annotation, {
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
      onStartRecording: () => this.startRecording(),
      onStopRecording: () => this.stopRecording(),
      onDeleteRecording: () => this.deleteRecording(),
      isRecording: this.isRecording,
    }, () => {
      this.renderer.setSelected(null);
    });
  }

  private focusAnnotation(id: string): void {
    this.renderer.setSelected(id);
    const annotation = this.annotations.find((a) => a.id === id);
    if (annotation?.elementDna) {
      const el = findElement(annotation.elementDna);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  private updateBadge(): void {
    const badge = document.getElementById('feedspace-list-count');
    if (!badge) return;
    const count = this.annotations.length;
    badge.textContent = String(count);
    badge.style.display = count > 0 ? '' : 'none';
  }

  private startRecording(): void {
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

      this.mediaRecorder.start();

      if (this.recordingTimer) clearInterval(this.recordingTimer);
      this.recordingTimer = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - this.recordingStartTime) / 1000);
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        const indicator = document.getElementById('feedspace-recording-indicator');
        if (indicator) {
          indicator.style.display = 'flex';
          const timeEl = indicator.querySelector('.feedspace-recording-time');
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

    const indicator = document.getElementById('feedspace-recording-indicator');
    if (indicator) indicator.style.display = 'none';

    const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
    const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });

    const previewContainer = document.getElementById('feedspace-file-previews');
    if (previewContainer) {
      const div = document.createElement('div');
      div.className = 'feedspace-file-preview';
      div.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/></svg>
        <span>Voice recording (${(file.size / 1024).toFixed(0)} KB)</span>
      `;
      previewContainer.appendChild(div);
    }
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
    const indicator = document.getElementById('feedspace-recording-indicator');
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
