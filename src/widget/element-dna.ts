import type { ElementDNA } from './types';

export function getDataId(el: Element): string | null {
  const widget = el.closest('[data-feedspace-widget-id]');
  if (widget) return widget.getAttribute('data-feedspace-widget-id');
  const elWidget = el.closest('[data-id]');
  if (elWidget) return elWidget.getAttribute('data-id');
  return null;
}

export function getSelector(el: Element): string {
  if (el.id) return `#${CSS.escape(el.id)}`;
  const dataId = getDataId(el);
  if (dataId) return `[data-id="${dataId}"]`;
  const path: string[] = [];
  let current: Element | null = el;
  while (current && current !== document.body) {
    const tag = current.tagName.toLowerCase();
    const parent: Element | null = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        (s) => s.tagName === current!.tagName
      );
      const idx = siblings.indexOf(current) + 1;
      path.unshift(`${tag}:nth-of-type(${idx})`);
    } else {
      path.unshift(tag);
    }
    current = parent;
  }
  return path.join(' > ');
}

export function getTextContent(el: Element): string {
  return (el.textContent || '').trim().slice(0, 80);
}

export function getFingerprint(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const text = getTextContent(el);
  const attrs = Array.from(el.attributes)
    .filter((a) => ['class', 'style', 'src', 'href', 'alt', 'title'].includes(a.name))
    .map((a) => `${a.name}=${a.value}`)
    .join('|');
  const raw = `${tag}|${text}|${attrs}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const chr = raw.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export function getElementDNA(el: Element): ElementDNA {
  let target: Element = el;
  const widget = el.closest('[data-feedspace-widget-id],[data-id]');
  if (widget) target = widget;
  return {
    selector: getSelector(target),
    tag: target.tagName.toLowerCase(),
    text: getTextContent(target),
    fingerprint: getFingerprint(target),
    dataId: getDataId(target),
  };
}

export function findElement(dna: ElementDNA): Element | null {
  if (dna.selector) {
    try {
      const match = document.querySelector(dna.selector);
      if (match) return match;
    } catch { }
  }

  if (dna.dataId) {
    const match = document.querySelector(`[data-id="${dna.dataId}"]`);
    if (match) return match;
  }

  const allTag = document.querySelectorAll(dna.tag);
  for (const el of allTag) {
    const text = getTextContent(el);
    if (text === dna.text) return el;
    if (text.includes(dna.text)) return el;
  }

  for (const el of allTag) {
    if (getFingerprint(el) === dna.fingerprint) return el;
  }

  return null;
}

export function closestTargetable(el: Element): Element {
  const widget = el.closest('[data-feedspace-widget-id],[data-id]');
  if (widget) return widget;
  const semantic = el.closest('h1,h2,h3,h4,h5,h6,p,a,button,img,section,article,figure');
  if (semantic) return semantic;
  return el;
}

export function toRelative(el: Element, pageX: number, pageY: number): { x: number; y: number } {
  const rect = el.getBoundingClientRect();
  return {
    x: ((pageX - rect.left - window.scrollX) / rect.width) * 100,
    y: ((pageY - rect.top - window.scrollY) / rect.height) * 100,
  };
}

export function toAbsolute(el: Element, xPct: number, yPct: number): { x: number; y: number } {
  const rect = el.getBoundingClientRect();
  return {
    x: rect.left + window.scrollX + (rect.width * xPct) / 100,
    y: rect.top + window.scrollY + (rect.height * yPct) / 100,
  };
}
