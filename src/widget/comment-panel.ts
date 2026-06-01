import type { Annotation } from './types';

export interface PanelCallbacks {
  onSubmit: (content: string, files: File[]) => void;
  onToggleRecording: () => void;
  onDeleteRecording: () => void;
  isRecording: () => boolean;
}

function escHtml(str: string): string {
  const d = document.createElement('div'); d.textContent = str; return d.innerHTML;
}

function posPopup(anchorX: number, anchorY: number, w: number, h: number): { top: number; left: number } {
  const pad = 12;
  let left = anchorX + pad;
  let top = anchorY + pad;
  if (left + w > window.innerWidth - pad) left = anchorX - w - pad;
  if (top + h > window.innerHeight - pad) top = anchorY - h - pad;
  if (left < pad) left = pad;
  if (top < pad) top = pad;
  return { top, left };
}

const SVG_ICONS = {
  mic: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>',
  paperclip: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>',
  file: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>',
  send: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
  close: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
};

export class CommentPanel {
  private root: HTMLElement | null = null;
  private overlay: HTMLElement | null = null;
  private callbacks: PanelCallbacks | null = null;
  private annotation: Annotation | null = null;
  private files: File[] = [];
  private inputEl: HTMLTextAreaElement | null = null;
  private onClose: (() => void) | null = null;
  private anchorX = 0;
  private anchorY = 0;

  open(
    anchorX: number,
    anchorY: number,
    annotation: Annotation | null,
    callbacks: PanelCallbacks,
    onClose: () => void
  ): void {
    this.anchorX = anchorX;
    this.anchorY = anchorY;
    this.annotation = annotation;
    this.callbacks = callbacks;
    this.onClose = onClose;
    this.files = [];
    this.render();
  }

  close(): void {
    if (this.overlay && this.overlay.parentNode) this.overlay.parentNode.removeChild(this.overlay);
    if (this.root && this.root.parentNode) this.root.parentNode.removeChild(this.root);
    this.overlay = null;
    this.root = null;
  }

  addFile(file: File): void {
    this.files.push(file);
    const previews = this.root?.querySelector('#fs-popup-previews');
    if (previews) this.updatePreviews(previews);
  }

  updateRecordingState(): void {
    if (!this.root) return;
    const isRec = this.callbacks?.isRecording() || false;
    const indicator = this.root.querySelector('#fs-popup-rec-indicator') as HTMLElement;
    const micBtn = this.root.querySelector('#fs-popup-mic-btn') as HTMLElement;
    if (indicator) indicator.style.display = isRec ? 'flex' : 'none';
    if (micBtn) micBtn.style.color = isRec ? '#ef4444' : '';
  }

  private render(): void {
    this.close();

    const isNew = !this.annotation;

    // Transparent overlay
    this.overlay = document.createElement('div');
    this.overlay.style.cssText = 'position:fixed;inset:0;z-index:99998;background:transparent;';
    this.overlay.addEventListener('click', () => this.close());
    document.body.appendChild(this.overlay);

    // Build HTML
    let bodyHtml = '';

    if (!isNew && this.annotation) {
      const initial = (this.annotation.createdBy || 'A').charAt(0).toUpperCase();
      const dateStr = new Date(this.annotation.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const statusLabels: Record<string, string> = { open: 'Open', in_progress: 'In Progress', resolved: 'Resolved', closed: 'Closed' };
      const statusLabel = statusLabels[this.annotation.status] || this.annotation.status;

      bodyHtml += `<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
        <div style="width:32px;height:32px;border-radius:50%;background:#2563eb;color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;flex-shrink:0;">${initial}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:13px;font-weight:600;color:#0f172a;">${escHtml(this.annotation.createdBy)}</div>
          <div style="font-size:10px;color:#94a3b8;">${dateStr}</div>
        </div>
        <span style="display:inline-flex;align-items:center;font-size:10px;font-weight:500;padding:2px 7px;border-radius:999px;background:rgba(37,99,235,0.1);color:#2563eb;">${statusLabel}</span>
      </div>`;
      bodyHtml += `<div style="font-size:13px;color:#334155;line-height:1.6;margin-bottom:12px;word-wrap:break-word;">${escHtml(this.annotation.content)}</div>`;

      if (this.annotation.replies && this.annotation.replies.length > 0) {
        for (const r of this.annotation.replies) {
          const rInit = (r.createdBy || 'A').charAt(0).toUpperCase();
          const rDate = new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
          bodyHtml += `<div style="margin-top:8px;padding:10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
              <div style="width:24px;height:24px;border-radius:50%;background:#3b82f6;color:#fff;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:600;flex-shrink:0;">${rInit}</div>
              <div style="font-size:12px;font-weight:600;color:#0f172a;">${escHtml(r.createdBy)}</div>
              <div style="font-size:10px;color:#94a3b8;">${rDate}</div>
            </div>
            <div style="font-size:12px;color:#475569;line-height:1.5;">${escHtml(r.content)}</div>
          </div>`;
        }
        bodyHtml += `<div style="height:1px;background:#e2e8f0;margin:12px 0;"></div>`;
      }
    }

    // Input
    bodyHtml += `<textarea id="fs-popup-input" placeholder="${isNew ? 'Describe your feedback...' : 'Write a reply...'}" style="display:block;width:100%;border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px;font-size:13px;font-family:'Poppins',sans-serif;outline:none;resize:none;min-height:44px;max-height:100px;line-height:1.5;background:#fff;color:#0f172a;box-sizing:border-box;margin:0;"></textarea>`;

    // Media actions
    bodyHtml += `<div style="display:flex;gap:4px;margin-top:8px;">
      <button id="fs-popup-mic-btn" style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;cursor:pointer;color:#64748b;padding:0;line-height:1;flex-shrink:0;transition:all 0.15s;" title="Record voice">${SVG_ICONS.mic}</button>
      <button id="fs-popup-media-btn" style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;cursor:pointer;color:#64748b;padding:0;line-height:1;flex-shrink:0;" title="Attach media">${SVG_ICONS.paperclip}</button>
      <button id="fs-popup-doc-btn" style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;cursor:pointer;color:#64748b;padding:0;line-height:1;flex-shrink:0;" title="Attach document">${SVG_ICONS.file}</button>
    </div>`;

    // File previews
    bodyHtml += `<div id="fs-popup-previews" style="margin-top:8px;"></div>`;

    // Recording indicator
    bodyHtml += `<div id="fs-popup-rec-indicator" style="display:none;align-items:center;gap:8px;color:#ef4444;font-size:12px;font-weight:500;padding:8px 10px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;margin-top:8px;">
      <span style="width:6px;height:6px;border-radius:50%;background:#ef4444;flex-shrink:0;"></span>
      <span id="fs-popup-rec-time" style="font-variant-numeric:tabular-nums;">0:00</span>
      <button id="fs-popup-stop-rec" style="margin-left:auto;display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border:1px solid #ef4444;border-radius:6px;background:transparent;cursor:pointer;color:#ef4444;padding:0;line-height:1;flex-shrink:0;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
      </button>
    </div>`;

    // Submit
    bodyHtml += `<button id="fs-popup-submit" style="display:inline-flex;align-items:center;justify-content:center;gap:6px;width:100%;padding:9px 16px;border:none;border-radius:8px;background:#2563eb;color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:'Poppins',sans-serif;line-height:1.4;margin-top:10px;transition:background 0.15s;">
      ${SVG_ICONS.send} ${isNew ? 'Submit Feedback' : 'Send Reply'}
    </button>`;

    // Hidden file inputs
    bodyHtml += `<input type="file" id="fs-popup-media-input" multiple accept="image/*,video/*,audio/*" style="display:none;">`;
    bodyHtml += `<input type="file" id="fs-popup-doc-input" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip,.rar,.json,.xml,.md" style="display:none;">`;

    // Create popup
    this.root = document.createElement('div');
    this.root.id = 'fs-popup-root';
    this.root.style.cssText = 'position:fixed;z-index:99999;background:#fff;border:1px solid #e2e8f0;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.12);padding:16px;width:340px;max-width:90vw;font-family:\'Poppins\',-apple-system,sans-serif;font-size:14px;line-height:1.5;color:#0f172a;';
    this.root.innerHTML = bodyHtml;

    // Position
    document.body.appendChild(this.root);
    const pw = this.root.offsetWidth;
    const ph = this.root.offsetHeight;
    const pos = posPopup(this.anchorX, this.anchorY, pw, ph);
    this.root.style.top = pos.top + 'px';
    this.root.style.left = pos.left + 'px';

    // Elements
    this.inputEl = this.root.querySelector('#fs-popup-input') as HTMLTextAreaElement;
    const micBtn = this.root.querySelector('#fs-popup-mic-btn') as HTMLElement;
    const mediaBtn = this.root.querySelector('#fs-popup-media-btn') as HTMLElement;
    const docBtn = this.root.querySelector('#fs-popup-doc-btn') as HTMLElement;
    const submitBtn = this.root.querySelector('#fs-popup-submit') as HTMLElement;
    const mediaInput = this.root.querySelector('#fs-popup-media-input') as HTMLInputElement;
    const docInput = this.root.querySelector('#fs-popup-doc-input') as HTMLInputElement;
    const previews = this.root.querySelector('#fs-popup-previews') as HTMLElement;
    const stopRecBtn = this.root.querySelector('#fs-popup-stop-rec') as HTMLElement;

    this.inputEl.focus();

    micBtn.addEventListener('click', () => this.callbacks?.onToggleRecording());
    mediaBtn.addEventListener('click', () => mediaInput.click());
    docBtn.addEventListener('click', () => docInput.click());
    stopRecBtn.addEventListener('click', () => this.callbacks?.onToggleRecording());

    submitBtn.addEventListener('click', () => this.handleSubmit());

    mediaInput.addEventListener('change', () => {
      const selected = Array.from(mediaInput.files || []);
      this.files = [...this.files, ...selected];
      this.updatePreviews(previews);
      mediaInput.value = '';
    });

    docInput.addEventListener('change', () => {
      const selected = Array.from(docInput.files || []);
      this.files = [...this.files, ...selected];
      this.updatePreviews(previews);
      docInput.value = '';
    });

    this.inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSubmit();
      }
    });

    // Sync recording state
    this.updateRecordingState();
  }

  private updatePreviews(container: HTMLElement): void {
    container.innerHTML = '';
    for (let i = 0; i < this.files.length; i++) {
      const f = this.files[i];
      const url = URL.createObjectURL(f);
      let inner = '';

      if (f.type.startsWith('image/')) {
        inner = `<img src="${url}" style="width:36px;height:36px;border-radius:6px;object-fit:cover;flex-shrink:0;">`;
      } else if (f.type.startsWith('audio/')) {
        inner = `<audio controls style="flex:1;height:32px;min-width:0;" src="${url}" preload="metadata"></audio>`;
      } else if (f.type.startsWith('video/')) {
        inner = `<video controls style="flex:1;height:36px;min-width:0;border-radius:4px;" src="${url}" preload="metadata"></video>`;
      } else {
        const ext = f.name.split('.').pop()?.toUpperCase() || 'FILE';
        inner = `<span style="font-size:9px;font-weight:700;color:#94a3b8;flex-shrink:0;">${ext}</span>`;
      }

      const div = document.createElement('div');
      div.style.cssText = 'display:flex;align-items:center;gap:8px;padding:6px 8px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-top:6px;';
      div.innerHTML = inner +
        `<span style="flex:1;font-size:11px;color:#334155;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;">${escHtml(f.name)}</span>` +
        `<button class="fs-preview-remove" data-idx="${i}" style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border:none;border-radius:4px;background:transparent;cursor:pointer;color:#94a3b8;padding:0;flex-shrink:0;">${SVG_ICONS.close}</button>`;
      container.appendChild(div);

      div.querySelector('.fs-preview-remove')!.addEventListener('click', () => {
        URL.revokeObjectURL(url);
        this.files.splice(i, 1);
        this.updatePreviews(container);
      });
    }
  }

  private handleSubmit(): void {
    const content = this.inputEl?.value.trim() || '';
    if (!content && this.files.length === 0) return;
    this.callbacks?.onSubmit(content, this.files);
    if (this.inputEl) this.inputEl.value = '';
    this.files = [];
    const previews = this.root?.querySelector('#fs-popup-previews');
    if (previews) previews.innerHTML = '';
  }
}
