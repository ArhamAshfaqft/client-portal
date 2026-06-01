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
  private deviceFilter: string = 'all';
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
    const el = annotation.elementDna ? findElement(annotation.elementDna) : null;
    if (!el) return;

    const anchor = toAbsolute(el, annotation.anchorXPct, annotation.anchorYPct);
    const badge = this.createBadge(index + 1, annotation.id, annotation.status);

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.appendChild(badge);
    g.setAttribute('transform', `translate(${anchor.x}, ${anchor.y})`);
    g.style.pointerEvents = 'auto';
    this.svg!.appendChild(g);
  }

  private createBadge(num: number, id: string, status: string): SVGGElement {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('data-annotation-id', id);
    g.classList.add('feedspace-annotation-pin');
    g.style.cursor = 'pointer';

    let color = '#6366f1';
    if (status === 'resolved' || status === 'closed') color = '#10b981';
    if (status === 'in_progress') color = '#f59e0b';

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '10');
    circle.setAttribute('cy', '10');
    circle.setAttribute('r', '10');
    circle.setAttribute('fill', color);
    circle.setAttribute('stroke', '#fff');
    circle.setAttribute('stroke-width', '2');

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

    g.appendChild(circle);
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
