import type { Annotation, FilterMode } from './types';
import { findElement, toAbsolute } from './element-dna';

export interface RendererCallbacks {
  onAnnotationClick: (id: string) => void;
}

export class AnnotationRenderer {
  private svg: SVGSVGElement | null = null;
  private annotations: Annotation[] = [];
  private callbacks: RendererCallbacks | null = null;
  private filter: FilterMode = 'all';
  private deviceFilter: string = 'desktop';
  private projectFilter: string = '';
  private selectedId: string | null = null;

  init(callbacks: RendererCallbacks): void {
    this.callbacks = callbacks;
    this.createSVG();
  }

  private createSVG(): void {
    let svg = document.getElementById('feedspace-overlay') as SVGSVGElement | null;
    if (!svg) {
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.id = 'feedspace-overlay';
      document.body.appendChild(svg);
    }
    this.svg = svg;
  }

  setAnnotations(annotations: Annotation[]): void {
    this.annotations = annotations;
    this.renderAll();
  }

  setFilter(filter: FilterMode): void {
    this.filter = filter;
    this.renderAll();
  }

  setDeviceFilter(device: string): void {
    this.deviceFilter = device;
    this.renderAll();
  }

  setProjectFilter(projectId: string): void {
    this.projectFilter = projectId;
    this.renderAll();
  }

  setSelected(id: string | null): void {
    this.selectedId = id;
    this.renderAll();
  }

  private getFiltered(): Annotation[] {
    let result = this.filter === 'all'
      ? this.annotations
      : this.annotations.filter((a) => a.status === this.filter);
    if (this.deviceFilter && this.deviceFilter !== 'all') {
      result = result.filter((a) => (a.device || 'desktop') === this.deviceFilter);
    }
    if (this.projectFilter) {
      result = result.filter((a) => a.projectId === this.projectFilter);
    }
    return result;
  }

  renderAll(): void {
    if (!this.svg) return;
    while (this.svg.firstChild) this.svg.removeChild(this.svg.firstChild);

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'feedspace-arrowhead');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '7');
    marker.setAttribute('refX', '10');
    marker.setAttribute('refY', '3.5');
    marker.setAttribute('orient', 'auto');
    const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    arrowPath.setAttribute('points', '0 0, 10 3.5, 0 7');
    arrowPath.setAttribute('fill', '#6366f1');
    marker.appendChild(arrowPath);
    defs.appendChild(marker);
    this.svg.appendChild(defs);

    const filtered = this.getFiltered();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    this.svg.setAttribute(
      'style',
      `position:absolute;top:0;left:0;width:${document.documentElement.scrollWidth}px;height:${document.documentElement.scrollHeight}px;pointer-events:none;z-index:99998;`
    );

    for (let i = 0; i < filtered.length; i++) {
      this.renderOne(filtered[i], i, scrollX, scrollY);
    }
  }

  private renderOne(annotation: Annotation, index: number, scrollX: number, scrollY: number): void {
    const num = annotation._num || index + 1;

    // Free-form arrow: no element DNA needed, use absolute coordinates
    if (annotation.type === 'arrow' && !annotation.elementDna) {
      const startPos = { x: annotation.anchorXPct, y: annotation.anchorYPct };
      const endPos = {
        x: annotation.endAnchorXPct ?? startPos.x + 100,
        y: annotation.endAnchorYPct ?? startPos.y + 50,
      };
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(startPos.x));
      line.setAttribute('y1', String(startPos.y));
      line.setAttribute('x2', String(endPos.x));
      line.setAttribute('y2', String(endPos.y));
      line.setAttribute('stroke', '#6366f1');
      line.setAttribute('stroke-width', '2.5');
      line.setAttribute('marker-end', 'url(#feedspace-arrowhead)');
      g.appendChild(line);
      const badge = this.createBadge(num, annotation.id, annotation.status, 'arrow');
      badge.setAttribute('transform', `translate(${startPos.x - 10}, ${startPos.y - 10})`);
      g.appendChild(badge);
      g.style.pointerEvents = 'auto';
      this.svg!.appendChild(g);
      return;
    }

    const el = annotation.elementDna ? findElement(annotation.elementDna) : null;
    if (!el) return;

    if (annotation.type === 'rect') {
      const rect = el.getBoundingClientRect();
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

      const box = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      box.setAttribute('x', String(rect.left + scrollX));
      box.setAttribute('y', String(rect.top + scrollY));
      box.setAttribute('width', String(rect.width));
      box.setAttribute('height', String(rect.height));
      box.setAttribute('fill', 'rgba(99,102,241,0.08)');
      box.setAttribute('stroke', '#6366f1');
      box.setAttribute('stroke-width', '2');
      box.setAttribute('stroke-dasharray', '6,3');
      box.setAttribute('rx', '4');

      const badge = this.createBadge(num, annotation.id, annotation.status, 'rect');
      badge.setAttribute('transform', `translate(${rect.left + scrollX - 10}, ${rect.top + scrollY - 10})`);

      g.appendChild(box);
      g.appendChild(badge);
      g.style.pointerEvents = 'auto';
      this.svg!.appendChild(g);
      return;
    }

    // Element-snapped arrow (legacy, pre free-form)
    if (annotation.type === 'arrow') {
      const startPos = toAbsolute(el, annotation.anchorXPct, annotation.anchorYPct);
      let endPos: { x: number; y: number };
      if (annotation.endElementDna) {
        const endEl = findElement(annotation.endElementDna);
        endPos = endEl
          ? toAbsolute(endEl, annotation.endAnchorXPct ?? 50, annotation.endAnchorYPct ?? 50)
          : { x: startPos.x + 100, y: startPos.y + 50 };
      } else {
        endPos = { x: startPos.x + 100, y: startPos.y + 50 };
      }
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(startPos.x));
      line.setAttribute('y1', String(startPos.y));
      line.setAttribute('x2', String(endPos.x));
      line.setAttribute('y2', String(endPos.y));
      line.setAttribute('stroke', '#6366f1');
      line.setAttribute('stroke-width', '2.5');
      line.setAttribute('marker-end', 'url(#feedspace-arrowhead)');
      g.appendChild(line);
      const badge = this.createBadge(num, annotation.id, annotation.status, 'arrow');
      badge.setAttribute('transform', `translate(${startPos.x - 10}, ${startPos.y - 10})`);
      g.appendChild(badge);
      g.style.pointerEvents = 'auto';
      this.svg!.appendChild(g);
      return;
    }

    const anchor = toAbsolute(el, annotation.anchorXPct, annotation.anchorYPct);

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const badge = this.createBadge(num, annotation.id, annotation.status);
    badge.setAttribute('transform', `translate(${anchor.x - 10}, ${anchor.y - 10})`);
    g.appendChild(badge);
    g.style.pointerEvents = 'auto';
    this.svg!.appendChild(g);
  }

  private createBadge(num: number, id: string, status: string, type?: string): SVGGElement {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('data-annotation-id', id);
    g.classList.add('feedspace-annotation-pin');
    g.style.cursor = 'pointer';

    let color = '#6366f1';
    if (status === 'resolved' || status === 'closed') color = '#10b981';
    if (status === 'in_progress') color = '#f59e0b';

    const shape = document.createElementNS('http://www.w3.org/2000/svg', type === 'rect' ? 'rect' : 'circle');
    if (type === 'rect') {
      shape.setAttribute('x', '1');
      shape.setAttribute('y', '1');
      shape.setAttribute('width', '18');
      shape.setAttribute('height', '18');
      shape.setAttribute('rx', '3');
    } else {
      shape.setAttribute('cx', '10');
      shape.setAttribute('cy', '10');
      shape.setAttribute('r', '10');
    }
    shape.setAttribute('fill', color);
    shape.setAttribute('stroke', '#fff');
    shape.setAttribute('stroke-width', '2');

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', '10');
    text.setAttribute('y', '10');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'central');
    text.setAttribute('fill', '#fff');
    text.setAttribute('font-size', '11');
    text.setAttribute('font-weight', '600');
    text.textContent = String(num);

    if (this.selectedId === id) {
      const pulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      pulse.setAttribute('cx', '10');
      pulse.setAttribute('cy', '10');
      pulse.setAttribute('r', '10');
      pulse.setAttribute('fill', 'none');
      pulse.setAttribute('stroke', color);
      pulse.setAttribute('stroke-width', '2');
      const anim = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
      anim.setAttribute('attributeName', 'r');
      anim.setAttribute('values', '10;20;10');
      anim.setAttribute('dur', '1.5s');
      anim.setAttribute('repeatCount', 'indefinite');
      pulse.appendChild(anim);
      const animOpacity = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
      animOpacity.setAttribute('attributeName', 'opacity');
      animOpacity.setAttribute('values', '1;0;1');
      animOpacity.setAttribute('dur', '1.5s');
      animOpacity.setAttribute('repeatCount', 'indefinite');
      pulse.appendChild(animOpacity);
      g.appendChild(pulse);
    }

    g.appendChild(shape);
    g.appendChild(text);

    g.addEventListener('click', (e) => {
      e.stopPropagation();
      this.callbacks?.onAnnotationClick(id);
    });

    return g;
  }

  destroy(): void {
    if (this.svg && this.svg.parentNode) {
      this.svg.parentNode.removeChild(this.svg);
    }
    this.svg = null;
    this.annotations = [];
  }
}
