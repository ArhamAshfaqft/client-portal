import type { Annotation, FilterMode } from './types';

export interface FeedbackListCallbacks {
  onSelectAnnotation: (id: string) => void;
  onFilterChange: (filter: FilterMode) => void;
}

export class FeedbackListPanel {
  private root: HTMLElement | null = null;
  private overlay: HTMLElement | null = null;
  private callbacks: FeedbackListCallbacks | null = null;
  private annotations: Annotation[] = [];
  private currentFilter: FilterMode = 'all';
  private onClose: (() => void) | null = null;

  open(
    annotations: Annotation[],
    callbacks: FeedbackListCallbacks,
    onClose: () => void
  ): void {
    this.annotations = annotations;
    this.callbacks = callbacks;
    this.onClose = onClose;
    this.render();
  }

  close(): void {
    if (this.overlay && this.overlay.parentNode) this.overlay.parentNode.removeChild(this.overlay);
    if (this.root && this.root.parentNode) this.root.parentNode.removeChild(this.root);
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

    const filters = document.createElement('div');
    filters.className = 'feedspace-filter-tabs';
    const filterOptions: Array<{ value: FilterMode; label: string }> = [
      { value: 'all', label: 'All' },
      { value: 'open', label: 'Open' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'resolved', label: 'Resolved' },
    ];
    for (const opt of filterOptions) {
      const btn = document.createElement('button');
      btn.className = `feedspace-filter-tab${this.currentFilter === opt.value ? ' active' : ''}`;
      btn.textContent = opt.label;
      btn.dataset.filter = opt.value;
      btn.addEventListener('click', () => {
        this.currentFilter = opt.value;
        filters.querySelectorAll('.feedspace-filter-tab').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.callbacks?.onFilterChange(opt.value);
      });
      filters.appendChild(btn);
    }
    this.root.appendChild(filters);

    const body = document.createElement('div');
    body.className = 'feedspace-panel-body';
    body.id = 'feedback-list-body';
    this.root.appendChild(body);

    document.body.appendChild(this.root);
    this.renderList();
  }

  private renderList(): void {
    const body = this.root?.querySelector('#feedback-list-body');
    if (!body) return;

    body.innerHTML = '';

    const filtered = this.currentFilter === 'all'
      ? this.annotations
      : this.annotations.filter((a) => a.status === this.currentFilter);

    if (filtered.length === 0) {
      body.innerHTML = `
        <div class="feedspace-empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          <p>No feedback items yet</p>
        </div>
      `;
      return;
    }

    for (const annotation of filtered) {
      const item = document.createElement('div');
      item.className = 'feedspace-feedback-item';
      item.dataset.annotationId = annotation.id;
      item.innerHTML = `
        <div class="feedspace-feedback-item-header">
          <span class="feedspace-feedback-type">${annotation.type}</span>
          <span class="feedspace-feedback-status ${annotation.status}">${annotation.status.replace('_', ' ')}</span>
        </div>
        <div class="feedspace-feedback-content">${escHtml(annotation.content)}</div>
        <div class="feedspace-feedback-meta">${escHtml(annotation.createdBy)} · ${new Date(annotation.createdAt).toLocaleString()}</div>
      `;
      item.addEventListener('click', () => {
        body.querySelectorAll('.feedspace-feedback-item').forEach((el) => el.classList.remove('highlight'));
        item.classList.add('highlight');
        this.callbacks?.onSelectAnnotation(annotation.id);
      });
      body.appendChild(item);
    }
  }
}

function escHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
