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

  setSelected(id: string | null): void {
    this.selectedId = id;
    this.renderAll();
  }

  private getFiltered(): Annotation[] {
    if (this.filter === 'all') return this.annotations;
    return this.annotations.filter((a) => a.status === this.filter);
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

    switch (annotation.type) {
      case 'pin':
        this.renderPin(anchor.x, anchor.y, badge);
        break;
      case 'rect':
        this.renderRect(annotation, el, anchor, badge);
        break;
      case 'arrow':
        this.renderArrow(annotation, el, anchor, badge);
        break;
      case 'draw':
        this.renderDraw(annotation, el, anchor, badge);
        break;
    }
  }

  private renderPin(x: number, y: number, badge: SVGGElement): void {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.appendChild(badge);
    g.setAttribute('transform', `translate(${x}, ${y})`);
    g.style.pointerEvents = 'auto';
    this.svg!.appendChild(g);
  }

  private renderRect(
    annotation: Annotation,
    el: Element,
    anchor: { x: number; y: number },
    badge: SVGGElement
  ): void {
    const rect = el.getBoundingClientRect();
    const w = annotation.widthPct ? (rect.width * annotation.widthPct) / 100 : 80;
    const h = annotation.heightPct ? (rect.height * annotation.heightPct) / 100 : 60;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    r.setAttribute('x', String(anchor.x));
    r.setAttribute('y', String(anchor.y));
    r.setAttribute('width', String(w));
    r.setAttribute('height', String(h));
    r.setAttribute('fill', 'rgba(99, 102, 241, 0.08)');
    r.setAttribute('stroke', '#6366f1');
    r.setAttribute('stroke-width', '2');
    r.setAttribute('stroke-dasharray', '6,3');
    r.setAttribute('rx', '4');
    g.appendChild(r);

    badge.setAttribute('transform', `translate(${anchor.x - 8}, ${anchor.y - 8})`);
    g.appendChild(badge);
    g.style.pointerEvents = 'auto';
    this.svg!.appendChild(g);
  }

  private renderArrow(
    annotation: Annotation,
    el: Element,
    anchor: { x: number; y: number },
    badge: SVGGElement
  ): void {
    let endX = anchor.x + 100;
    let endY = anchor.y + 100;
    if (annotation.endElementDna) {
      const endEl = findElement(annotation.endElementDna);
      if (endEl && annotation.endAnchorXPct != null && annotation.endAnchorYPct != null) {
        const endPos = toAbsolute(endEl, annotation.endAnchorXPct, annotation.endAnchorYPct);
        endX = endPos.x;
        endY = endPos.y;
      }
    }

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', String(anchor.x));
    line.setAttribute('y1', String(anchor.y));
    line.setAttribute('x2', String(endX));
    line.setAttribute('y2', String(endY));
    line.setAttribute('stroke', '#6366f1');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('marker-end', 'url(#feedspace-arrowhead)');
    g.appendChild(line);

    badge.setAttribute('transform', `translate(${anchor.x - 8}, ${anchor.y - 8})`);
    g.appendChild(badge);
    g.style.pointerEvents = 'auto';
    this.svg!.appendChild(g);
  }

  private renderDraw(
    annotation: Annotation,
    el: Element,
    anchor: { x: number; y: number },
    badge: SVGGElement
  ): void {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    if (annotation.drawData?.pathD) {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', annotation.drawData.pathD);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', '#6366f1');
      path.setAttribute('stroke-width', '2');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
      g.appendChild(path);
    }

    if (annotation.drawData?.points && annotation.drawData.points.length > 1) {
      const points = annotation.drawData.points;
      const rect = el.getBoundingClientRect();
      const pl = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      const ptsStr = points
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
      g.appendChild(pl);
    }

    badge.setAttribute('transform', `translate(${anchor.x - 8}, ${anchor.y - 8})`);
    g.appendChild(badge);
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
