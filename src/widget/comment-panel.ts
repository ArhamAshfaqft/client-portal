import type { Annotation } from './types';

export interface PanelCallbacks {
  onSubmit: (content: string, files: File[]) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onDeleteRecording: () => void;
  isRecording: boolean;
}

export class CommentPanel {
  private root: HTMLElement | null = null;
  private overlay: HTMLElement | null = null;
  private callbacks: PanelCallbacks | null = null;
  private annotation: Annotation | null = null;
  private files: File[] = [];
  private inputEl: HTMLTextAreaElement | null = null;
  private onClose: (() => void) | null = null;

  open(
    annotation: Annotation | null,
    callbacks: PanelCallbacks,
    onClose: () => void
  ): void {
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

  private render(): void {
    this.close();

    this.overlay = document.createElement('div');
    this.overlay.className = 'feedspace-panel-overlay';
    this.overlay.addEventListener('click', () => this.close());
    document.body.appendChild(this.overlay);

    this.root = document.createElement('div');
    this.root.className = 'feedspace-panel';

    const isNew = !this.annotation;
    const title = isNew ? 'Add Feedback' : 'Feedback Details';

    const header = document.createElement('div');
    header.className = 'feedspace-panel-header';
    header.innerHTML = `
      <span class="feedspace-panel-title">${title}</span>
      <button class="feedspace-panel-close" id="feedspace-panel-close">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `;
    this.root.appendChild(header);

    header.querySelector('#feedspace-panel-close')!.addEventListener('click', () => this.close());

    const body = document.createElement('div');
    body.className = 'feedspace-panel-body';

    if (!isNew && this.annotation) {
      const info = document.createElement('div');
      info.className = 'feedspace-feedback-item';
      info.style.cursor = 'default';
      info.innerHTML = `
        <div class="feedspace-feedback-item-header">
          <span class="feedspace-feedback-type">${this.annotation.type}</span>
          <span class="feedspace-feedback-status ${this.annotation.status}">${this.annotation.status.replace('_', ' ')}</span>
        </div>
        <div class="feedspace-feedback-content">${escHtml(this.annotation.content)}</div>
        <div class="feedspace-feedback-meta">${escHtml(this.annotation.createdBy)} · ${new Date(this.annotation.createdAt).toLocaleString()}</div>
      `;
      body.appendChild(info);

      if (this.annotation.replies && this.annotation.replies.length > 0) {
        const repliesTitle = document.createElement('div');
        repliesTitle.style.cssText = 'font-size:13px;font-weight:600;color:#374151;margin:12px 0 8px;';
        repliesTitle.textContent = 'Replies';
        body.appendChild(repliesTitle);

        for (const reply of this.annotation.replies) {
          const r = document.createElement('div');
          r.className = 'feedspace-reply';
          r.innerHTML = `
            <div class="feedspace-reply-text">${escHtml(reply.content)}</div>
            <div class="feedspace-reply-meta">${escHtml(reply.createdBy)} · ${new Date(reply.createdAt).toLocaleString()}</div>
          `;
          body.appendChild(r);
        }
      }
    }

    const replyTitle = document.createElement('div');
    replyTitle.style.cssText = 'font-size:13px;font-weight:600;color:#374151;margin-top:16px;margin-bottom:8px;';
    replyTitle.textContent = isNew ? 'Add Comment' : 'Reply';
    body.appendChild(replyTitle);

    const input = document.createElement('textarea');
    input.className = 'feedspace-comment-input';
    input.placeholder = 'Type your feedback here...';
    input.rows = 3;
    input.style.width = '100%';
    body.appendChild(input);
    this.inputEl = input;

    const mediaActions = document.createElement('div');
    mediaActions.style.cssText = 'display:flex;gap:8px;margin-top:12px;';
    mediaActions.innerHTML = `
      <button class="feedspace-icon-btn" id="feedspace-attach-btn" title="Attach file">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
      </button>
      <button class="feedspace-icon-btn" id="feedspace-record-btn" title="Record voice">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
      </button>
    `;
    body.appendChild(mediaActions);

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.style.display = 'none';
    fileInput.accept = 'image/*,video/*,audio/*,.pdf,.doc,.docx';
    body.appendChild(fileInput);

    const filePreviewContainer = document.createElement('div');
    filePreviewContainer.id = 'feedspace-file-previews';
    body.appendChild(filePreviewContainer);

    const recordingIndicator = document.createElement('div');
    recordingIndicator.id = 'feedspace-recording-indicator';
    recordingIndicator.style.display = 'none';
    recordingIndicator.className = 'feedspace-recording-indicator';
    recordingIndicator.innerHTML = `
      <span class="feedspace-recording-dot"></span>
      <span class="feedspace-recording-time">0:00</span>
      <button class="feedspace-icon-btn" id="feedspace-stop-recording" style="margin-left:auto;color:#ef4444;border-color:#ef4444;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
      </button>
    `;
    body.appendChild(recordingIndicator);

    this.root.appendChild(body);

    const footer = document.createElement('div');
    footer.className = 'feedspace-panel-footer';

    const submitBtn = document.createElement('button');
    submitBtn.className = 'feedspace-submit-btn';
    submitBtn.style.width = '100%';
    submitBtn.style.justifyContent = 'center';
    submitBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      ${isNew ? 'Submit Feedback' : 'Send Reply'}
    `;
    submitBtn.addEventListener('click', () => this.handleSubmit());
    footer.appendChild(submitBtn);
    this.root.appendChild(footer);

    document.body.appendChild(this.root);

    mediaActions.querySelector('#feedspace-attach-btn')!.addEventListener('click', () => fileInput.click());
    mediaActions.querySelector('#feedspace-record-btn')!.addEventListener('click', () => {
      if (this.callbacks?.isRecording) {
        this.callbacks?.onStopRecording();
      } else {
        this.callbacks?.onStartRecording();
      }
    });

    fileInput.addEventListener('change', () => {
      const selected = Array.from(fileInput.files || []);
      this.files = [...this.files, ...selected];
      this.updateFilePreviews(filePreviewContainer, fileInput);
      fileInput.value = '';
    });

    setTimeout(() => input.focus(), 100);
  }

  private updateFilePreviews(container: HTMLElement, fileInput: HTMLInputElement): void {
    container.innerHTML = '';
    for (let i = 0; i < this.files.length; i++) {
      const f = this.files[i];
      const div = document.createElement('div');
      div.className = 'feedspace-file-preview';
      div.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
        <span>${escHtml(f.name)} (${(f.size / 1024).toFixed(0)} KB)</span>
        <span class="remove" data-idx="${i}">&times;</span>
      `;
      div.querySelector('.remove')!.addEventListener('click', () => {
        this.files.splice(i, 1);
        this.updateFilePreviews(container, fileInput);
      });
      container.appendChild(div);
    }
  }

  private handleSubmit(): void {
    const content = this.inputEl?.value.trim() || '';
    if (!content && this.files.length === 0) return;
    this.callbacks?.onSubmit(content, this.files);
    if (this.inputEl) this.inputEl.value = '';
    this.files = [];
  }
}

function escHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
